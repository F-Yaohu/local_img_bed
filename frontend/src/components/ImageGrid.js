import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Row, Col, Card, Button, Spinner, Alert, Modal, Pagination } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';
import './ImageGrid.css';

function ImageGrid({ categoryId, config }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [confirmShow, setConfirmShow] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [imageResolution, setImageResolution] = useState(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [categoryId]);

    useEffect(() => {
        const fetchImages = async () => {
            if (categoryId === null || categoryId === 0) {
                setLoading(false);
                setImages([]);
                setError(null);
                setTotalPages(1);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await api.getCategoryImages(categoryId, currentPage);
                if (response.data && Array.isArray(response.data.records)) {
                    setImages(response.data.records);
                    setTotalPages(response.data.pages || 1);
                } else {
                    setImages([]);
                    setTotalPages(1);
                }
            } catch (err) {
                setError('Failed to load images. Please select a category or try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchImages();
    }, [categoryId, currentPage]);

    const handleDeleteClick = (image) => {
        setImageToDelete(image);
        setConfirmShow(true);
    };

    const handleDelete = async () => {
        if (!imageToDelete) return;

        const originalImages = [...images];
        setImages(images.filter(img => img.id !== imageToDelete.id));
        setConfirmShow(false);

        try {
            await api.deleteImage(imageToDelete.id);
            toast.success('图片删除成功！');
            // Optionally refetch data
            // fetchImages();
        } catch (err) {
            setImages(originalImages);
            toast.error('删除图片失败。请再试一次。');
            console.error(err);
        } finally {
            setImageToDelete(null);
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setShowModal(true);
        setImageResolution(null); // 重置分辨率
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedImage(null);
        setImageResolution(null); // Reset resolution on close
    };

    const handleImageLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        setImageResolution(`${naturalWidth} x ${naturalHeight}`);
    };

    const toMB = (bit) => (bit / 1024 / 1024).toFixed(2);

    const getImageUrl = (image, type) => {
        const base = config.imgBaseUrl || '';
        let url = `${base}/api/images/view/${image.id}?path=${encodeURIComponent(image.storagePath)}`;
        if (type) {
            url += `&type=${type}`;
        }
        return url;
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        let items = [];
        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item key={number} active={number === currentPage} onClick={() => setCurrentPage(number)}>
                    {number}
                </Pagination.Item>,
            );
        }

        return (
            <div className="d-flex justify-content-center mt-4">
                <Pagination>
                    <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1} />
                    {items}
                    <Pagination.Next onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} />
                </Pagination>
            </div>
        );
    };

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /> Loading images...</div>;
    }

    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    if (images.length === 0) {
        return <p>在此类别中找不到图像，试着上传一些吧！</p>;
    }

    return (
        <>
            <Row>
                {images.map(img => (
                    <Col md={4} key={img.id} className="mb-3">
                        <Card>
                            <Card.Img
                                variant="top"
                                src={getImageUrl(img, 'medium')}
                                alt={img.originalName}
                                className="image-grid-card-img"
                                onClick={() => handleImageClick(img)}
                            />
                            <Card.Body>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteClick(img)}>删除</Button>
                                <span
                                    style={{
                                        position: 'absolute',
                                        right: 8,
                                        bottom: 8,
                                        fontSize: '0.85em',
                                        color: '#888'
                                    }}
                                >
                                    {img.createTime ? new Date(img.createTime).toLocaleString() : ''}
                                </span>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {renderPagination()}

            <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>图片预览</Modal.Title>
                </Modal.Header>
                <Modal.Body className="image-modal-body">
                    {selectedImage && (
                        <div className="image-container">
                            <img
                                src={getImageUrl(selectedImage)}
                                alt={selectedImage.originalName}
                                className="image-modal-img"
                                onLoad={handleImageLoad}
                            />
                        </div>
                    )}
                    {selectedImage && (
                        <div className="image-details">
                            <h5>图片详情</h5>
                            <p><strong>名称:</strong> {selectedImage.originalName}</p>
                            <p><strong>类型:</strong> {selectedImage.fileType}</p>
                            <p><strong>大小:</strong> {toMB(selectedImage.fileSize)} MB</p>
                            <p><strong>分辨率:</strong> {imageResolution || '加载中...'}</p>
                            <p><strong>上传时间:</strong> {new Date(selectedImage.createTime).toLocaleString()}</p>
                            <a
                                href={getImageUrl(selectedImage) + (selectedImage.originalName ? `&dFileName=${selectedImage.originalName}` : '')}
                                download={selectedImage.originalName}
                                className="btn btn-primary w-100 mt-3"
                            >
                                下载原图
                            </a>
                            <div className="link-container">
                                <strong>原图:</strong>
                                <input
                                    type="text"
                                    readOnly
                                    value={getImageUrl(selectedImage)}
                                    className="form-control form-control-sm mt-1"
                                    onClick={e => e.target.select()}
                                />
                                <strong>头像:</strong>
                                <input
                                    type="text"
                                    readOnly
                                    value={getImageUrl(selectedImage, 'small')}
                                    className="form-control form-control-sm mt-1"
                                    onClick={e => e.target.select()}
                                />
                                <strong>中等:</strong>
                                <input
                                    type="text"
                                    readOnly
                                    value={getImageUrl(selectedImage, 'medium')}
                                    className="form-control form-control-sm mt-1"
                                    onClick={e => e.target.select()}
                                />
                                <strong>大图:</strong>
                                <input
                                    type="text"
                                    readOnly
                                    value={getImageUrl(selectedImage, 'large')}
                                    className="form-control form-control-sm mt-1"
                                    onClick={e => e.target.select()}
                                />
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            <ConfirmModal
                show={confirmShow}
                onHide={() => setConfirmShow(false)}
                onConfirm={handleDelete}
                title="确认删除"
                message="您确定要删除此图像吗？此操作无法撤消。"
            />
        </>
    );
}

export default ImageGrid;

