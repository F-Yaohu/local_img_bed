import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Row, Col, Card, Button, Spinner, Alert, Modal, Pagination, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import ConfirmModal from './ConfirmModal';
import SimilarImagesModal from './SimilarImagesModal';
import CategorySelectModal from './CategorySelectModal';
import './ImageGrid.css';

function ImageGrid({ categoryId, config, setDeletions, selectedImageIds, onSelectedImagesChange }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [confirmShow, setConfirmShow] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [showBatchConfirm, setShowBatchConfirm] = useState(false);
    const [imageResolution, setImageResolution] = useState(null);
    const [showSimilarModal, setShowSimilarModal] = useState(false);
    const [similarImages, setSimilarImages] = useState([]);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [imageToMove, setImageToMove] = useState(null);

    // Use selectedImageIds from props, and manage internal state for UI selection
    const [internalSelectedImages, setInternalSelectedImages] = useState(new Set(selectedImageIds));

    useEffect(() => {
        setCurrentPage(1);
        // When category changes, clear internal selection and notify parent
        setInternalSelectedImages(new Set());
        onSelectedImagesChange([]);
    }, [categoryId]);

    // Sync internal selection with prop changes (e.g., when parent clears selection)
    useEffect(() => {
        setInternalSelectedImages(new Set(selectedImageIds));
    }, [selectedImageIds]);

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
                setError('加载图片失败，请换一个类别或重新尝试。');
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
            toast.success('图片删除成功���');
            // Also update parent's selected images if the deleted image was selected
            onSelectedImagesChange(Array.from(selectedImageIds).filter(id => id !== imageToDelete.id));
        } catch (err) {
            setImages(originalImages);
            toast.error('删除图片失败。请再试一次。');
            console.error(err);
        } finally {
            setImageToDelete(null);
        }
    };

    const handleFindSimilarClick = async (image) => {
        try {
            const response = await api.findSimilarImages(image.id);
            setSimilarImages(response.data);
            setShowSimilarModal(true);
            if (response.data.length === 0) {
                toast.info('没有找到相似图片。');
            } else {
                toast.success(`找到 ${response.data.length} 张相似图片。`);
            }
        } catch (err) {
            toast.error('查找相似图片失败。');
            console.error(err);
        }
    };

    const handleCloseSimilarModal = () => {
        setShowSimilarModal(false);
        setSimilarImages([]);
    };

    const handleMoveClick = (image) => {
        setImageToMove(image);
        setShowMoveModal(true);
    };

    const handleConfirmMove = async (newCategoryId) => {
        if (!imageToMove) return;

        try {
            await api.moveImage(imageToMove.id, newCategoryId);
            toast.success(`图片 '${imageToMove.originalName}' 移动成功！`);
            // Remove the moved image from the current grid if it's no longer in this category
            if (imageToMove.categoryId === categoryId) { // Only remove if it was in the current category
                setImages(prevImages => prevImages.filter(img => img.id !== imageToMove.id));
            }
            handleCloseModal(); // Close the preview modal
            setShowMoveModal(false); // Close the move modal
            setImageToMove(null); // Clear image to move
        } catch (err) {
            toast.error('移动图片失败。');
            console.error(err);
        }
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setShowModal(true);
        setImageResolution(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedImage(null);
        setImageResolution(null);
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

    const handleSelectImage = (id) => {
        const newSelection = new Set(internalSelectedImages);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setInternalSelectedImages(newSelection);
        onSelectedImagesChange(Array.from(newSelection)); // Notify parent
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const allImageIds = images.map(img => img.id);
            setInternalSelectedImages(new Set(allImageIds));
            onSelectedImagesChange(allImageIds); // Notify parent
        } else {
            setInternalSelectedImages(new Set());
            onSelectedImagesChange([]); // Notify parent
        }
    };

    const handleDeleteSelected = () => {
        if (internalSelectedImages.size === 0) {
            toast.info('没有选中需要删除的图片。');
            return;
        }
        setShowBatchConfirm(true);
    };

    const handleConfirmBatchDelete = async () => {
        const imageIds = Array.from(internalSelectedImages);
        setShowBatchConfirm(false);

        const newDeletions = imageIds.map(id => ({
            id,
            status: 'deleting',
        }));
        setDeletions(prev => [...prev, ...newDeletions]);

        try {
            await api.deleteImages(imageIds);
            toast.success(`${imageIds.length} 图片删除成功。`);
            setImages(images.filter(img => !internalSelectedImages.has(img.id)));
            setInternalSelectedImages(new Set()); // Clear internal selection
            onSelectedImagesChange([]); // Notify parent to clear selection
            setDeletions(prev => prev.map(d => 
                imageIds.includes(d.id) ? { ...d, status: 'success' } : d
            ));
        } catch (err) {
            toast.error('无法删除某些图片。');
            console.error(err);
            setDeletions(prev => prev.map(d => 
                imageIds.includes(d.id) ? { ...d, status: 'error' } : d
            ));
        }
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
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <Form.Check 
                        type="checkbox"
                        label="全部选中"
                        onChange={handleSelectAll}
                        checked={internalSelectedImages.size === images.length && images.length > 0}
                    />
                </div>
                <Button 
                    variant="danger" 
                    disabled={internalSelectedImages.size === 0}
                    onClick={handleDeleteSelected}
                >
                    批量删除 ({internalSelectedImages.size})
                </Button>
            </div>
            <Row>
                {images.map(img => (
                    <Col md={4} key={img.id} className="mb-3">
                        <Card className={internalSelectedImages.has(img.id) ? 'selected' : ''}>
                            <div className="card-img-container">
                                <Card.Img
                                    variant="top"
                                    src={getImageUrl(img, 'medium')}
                                    alt={img.originalName}
                                    className="image-grid-card-img"
                                    onClick={() => handleImageClick(img)}
                                />
                                <Form.Check 
                                    type="checkbox"
                                    className="image-checkbox"
                                    checked={internalSelectedImages.has(img.id)}
                                    onChange={() => handleSelectImage(img.id)}
                                />
                            </div>
                            <Card.Body>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteClick(img)}>删除</Button>
                                <Button variant="info" size="sm" className="ms-2" onClick={() => handleFindSimilarClick(img)}>查找相似</Button>
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
                <Modal.Footer>
                    {selectedImage && (
                        <>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="me-2"
                                onClick={() => handleMoveClick(selectedImage)}
                            >
                                移动
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                className="me-2"
                                onClick={() => {
                                    handleDeleteClick(selectedImage);
                                    // handleCloseModal(); // Removed as per user request
                                }}
                            >
                                删除
                            </Button>
                            <Button
                                variant="info"
                                size="sm"
                                onClick={() => {
                                    handleFindSimilarClick(selectedImage);
                                    // handleCloseModal(); // Removed as per user request
                                }}
                            >
                                查找相似
                            </Button>
                        </>
                    )}
                </Modal.Footer>
            </Modal>

            <ConfirmModal
                show={confirmShow}
                onHide={() => setConfirmShow(false)}
                onConfirm={handleDelete}
                title="确认删除"
                message="您确定要删除此图像吗？此操作无法撤消。"
            />

            <ConfirmModal
                show={showBatchConfirm}
                onHide={() => setShowBatchConfirm(false)}
                onConfirm={handleConfirmBatchDelete}
                title="确认批量删除"
                message={`您确定要删除选中的 ${internalSelectedImages.size} 张图片吗？此操作无法撤消。`}
            />

            <SimilarImagesModal
                show={showSimilarModal}
                onHide={handleCloseSimilarModal}
                similarImages={similarImages}
                config={config}
            />

            <CategorySelectModal
                show={showMoveModal}
                onHide={() => setShowMoveModal(false)}
                onSelectCategory={handleConfirmMove}
                currentCategoryId={imageToMove?.categoryId}
            />
        </>
    );
}

export default ImageGrid;

