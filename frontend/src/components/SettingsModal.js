import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import api from '../services/api';

// Helper function to flatten the category tree
const flattenCategories = (categories, level = 0, prefix = '') => {
    let flatList = [];
    categories.forEach(category => {
        const categoryName = prefix + ' '.repeat(level * 2) + category.name;
        flatList.push({ id: category.id, name: categoryName });
        if (category.children && category.children.length > 0) {
            flatList = flatList.concat(flattenCategories(category.children, level + 1, prefix));
        }
    });
    return flatList;
};

function SettingsModal({ show, onHide, config, onSave }) {
    const [formData, setFormData] = useState(config);
    const [syncing, setSyncing] = useState(false);
    const [syncStatus, setSyncStatus] = useState('');
    const [categories, setCategories] = useState([]); // New state for categories
    const [selectedCategoryId, setSelectedCategoryId] = useState(''); // New state for selected category ID
    const [randomImageUrl, setRandomImageUrl] = useState(''); // New state for random image URL

    useEffect(() => {
        setFormData(config);
    }, [config]);

    // Effect to fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.getCategoryTree();
                // Flatten the tree for the dropdown
                const flatCategories = flattenCategories(response.data);
                setCategories(flatCategories);
            } catch (error) {
                console.error('获取分类失败:', error);
            }
        };
        if (show) { // Fetch categories only when modal is shown
            fetchCategories();
        }
    }, [show]);

    // Effect to update random image URL
    useEffect(() => {
        let baseUrl = formData?.imgBaseUrl || window.location.origin; // Use current origin if imgBaseUrl is empty
        // Ensure baseUrl doesn't end with a slash if it's not just a domain
        if (baseUrl.endsWith('/') && baseUrl !== window.location.origin) {
            baseUrl = baseUrl.slice(0, -1);
        }

        let url = `${baseUrl}/api/images/random`;
        if (selectedCategoryId) {
            url += `?categoryId=${selectedCategoryId}`;
        }
        setRandomImageUrl(url);
    }, [selectedCategoryId, formData?.imgBaseUrl]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData);
    };

    const handleSyncImages = async () => {
        setSyncing(true);
        setSyncStatus('同步中...');
        try {
            const response = await api.syncImagesFromOriginalFolder();
            setSyncStatus(response.data);
        } catch (error) {
            console.error('图片同步失败:', error);
            setSyncStatus('同步失败: ' + (error.response?.data || error.message));
        } finally {
            setSyncing(false);
        }
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

                    {/* New: Random Image URL Display */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>随机图片地址</Form.Label>
                        <Col sm={9}>
                            <Form.Control
                                type="text"
                                readOnly
                                value={randomImageUrl}
                            />
                            <Form.Text className="text-muted">
                                此地址将随机返回一张图片，可用于外部引用。
                            </Form.Text>
                        </Col>
                    </Form.Group>

                    {/* New: Category Selection for Random Image */}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>选择分类</Form.Label>
                        <Col sm={9}>
                            <Form.Select
                                name="selectedCategoryId"
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                            >
                                <option value="">所有分类</option> {/* Option for no category filter */}
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-muted">
                                选择分类后，随机图片地址将只返回该分类下的图片。
                            </Form.Text>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm={3}>图片同步</Form.Label>
                        <Col sm={9}>
                            <Button
                                variant="info"
                                onClick={handleSyncImages}
                                disabled={syncing}
                            >
                                {syncing ? '同步中...' : '手动同步图片'}
                            </Button>
                            {syncStatus && <Form.Text className="ms-3">{syncStatus}</Form.Text>}
                            <Form.Text className="text-muted d-block mt-2">
                                扫描服务器上 'original' 文件夹下的图片，并同步到数据库中。
                            </Form.Text>
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