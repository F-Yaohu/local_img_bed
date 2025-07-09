import React from 'react';
import { Modal, Button, Row, Col, Card } from 'react-bootstrap';

function SimilarImagesModal({ show, onHide, similarImages, config }) {
    const getImageUrl = (image, type) => {
        const base = config.imgBaseUrl || '';
        let url = `${base}/api/images/view/${image.id}?path=${encodeURIComponent(image.storagePath)}`;
        if (type) {
            url += `&type=${type}`;
        }
        return url;
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" centered>
            <Modal.Header closeButton>
                <Modal.Title>相似图片</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {similarImages && similarImages.length > 0 ? (
                    <Row>
                        {similarImages.map(img => (
                            <Col md={3} key={img.id} className="mb-3">
                                <Card>
                                    <Card.Img
                                        variant="top"
                                        src={getImageUrl(img, 'medium')}
                                        alt={img.originalName}
                                        style={{ height: '150px', objectFit: 'cover' }}
                                    />
                                    <Card.Body>
                                        <Card.Text className="text-truncate">{img.originalName}</Card.Text>
                                        <Button 
                                            variant="primary" 
                                            size="sm" 
                                            href={getImageUrl(img)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                        >
                                            查看原图
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <p>没有找到相似图片。</p>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    关闭
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SimilarImagesModal;
