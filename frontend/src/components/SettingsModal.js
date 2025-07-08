import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

function SettingsModal({ show, onHide, config, onSave }) {
    const [formData, setFormData] = useState(config);

    useEffect(() => {
        setFormData(config);
    }, [config]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>系统设置</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>页面标题</Form.Label>
                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                name="pageTitle"
                                value={formData?.pageTitle || ''}
                                onChange={handleChange}
                                placeholder="例如：我的图床"
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>Logo图标URL</Form.Label>
                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                name="logoUrl"
                                value={formData?.logoUrl || ''}
                                onChange={handleChange}
                                placeholder="网站Logo的URL"
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>图片查看路径</Form.Label>
                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                name="imgBaseUrl"
                                value={formData?.imgBaseUrl || ''}
                                onChange={handleChange}
                                placeholder="例如：https://your-domain.com"
                            />
                             <Form.Text className="text-muted">
                                用于拼接图片链接，留空则使用当前域名。
                            </Form.Text>
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>登录页面背景URL</Form.Label>
                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                name="loginBgUrl"
                                value={formData?.loginBgUrl || ''}
                                onChange={handleChange}
                                placeholder="登录页背景图的URL"
                            />
                        </Col>
                    </Form.Group>
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>主页面背景URL</Form.Label>
                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                name="mainBgUrl"
                                value={formData?.mainBgUrl || ''}
                                onChange={handleChange}
                                placeholder="主页背景图的URL"
                            />
                        </Col>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    取消
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    保存
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SettingsModal;
