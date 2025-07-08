import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import CategoryTree from '../components/CategoryTree';
import ImageGrid from '../components/ImageGrid';
import UploadModal from '../components/UploadModal';
import UploadProgress from '../components/UploadProgress';
import Dashboard from '../components/Dashboard';
import SettingsModal from '../components/SettingsModal';
import api from '../services/api';

function MainPage({ config, onConfigSave }) {
    const [selectedCategory, setSelectedCategory] = useState({ id: 1, name: 'Root' });
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [dashboardData, setDashboardData] = useState({ stats: { totalImages: 0, totalCategories: 0 }, recentUploads: [] });
    const [uploads, setUploads] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (selectedCategory.id === 1) {
            const fetchData = async () => {
                try {
                    const statsResponse = await api.getStats();
                    const recentUploadsResponse = await api.getRecentUploads();
                    setDashboardData({ stats: statsResponse.data, recentUploads: recentUploadsResponse.data });
                } catch (error) {
                    console.error('Error fetching dashboard data:', error);
                    setDashboardData({ stats: { totalImages: 0, totalCategories: 0 }, recentUploads: [] });
                }
            };
            fetchData();
        }
    }, [selectedCategory.id, refreshKey]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    const handleUploadSuccess = () => {
        setRefreshKey(oldKey => oldKey + 1);
    };

    const handleSaveSettings = async (newConfig) => {
        try {
            await api.updateBaseConfig(newConfig);
            onConfigSave(newConfig);
            toast.success('设置已保存！');
            setShowSettingsModal(false);
        } catch (error) {
            toast.error('保存设置失败。');
            console.error('Failed to save settings:', error);
        }
    };

    const uploadFile = async (uploadId, file, categoryId) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('categoryId', categoryId);

        try {
            await api.uploadImage(formData, (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploads(prevUploads =>
                    prevUploads.map(u => (u.id === uploadId ? { ...u, progress, status: 'uploading' } : u))
                );
            });
            setUploads(prevUploads =>
                prevUploads.map(u => (u.id === uploadId ? { ...u, status: 'success', progress: 100 } : u))
            );
            toast.success(`'${file.name}' 上传成功!`);
            handleUploadSuccess();
        } catch (err) {
            setUploads(prevUploads =>
                prevUploads.map(u => (u.id === uploadId ? { ...u, status: 'error', error: '上传失败' } : u))
            );
            toast.error(`'${file.name}' 上传失败。`);
            console.error(err);
        }
    };

    const handleStartUpload = (files) => {
        const newUploads = files.map(file => ({
            id: uuidv4(),
            file,
            status: 'pending',
            progress: 0,
        }));

        setUploads(prevUploads => [...prevUploads, ...newUploads]);

        newUploads.forEach(upload => {
            uploadFile(upload.id, upload.file, selectedCategory.id);
        });
    };

    const handleRetryUpload = (uploadId) => {
        const uploadToRetry = uploads.find(u => u.id === uploadId);
        if (uploadToRetry) {
            setUploads(prevUploads =>
                prevUploads.map(u =>
                    u.id === uploadId ? { ...u, status: 'pending', progress: 0, error: null } : u
                )
            );
            uploadFile(uploadToRetry.id, uploadToRetry.file, selectedCategory.id);
        }
    };

    const handleClearUploads = (type) => {
        if (type === 'all') {
            setUploads([]);
        } else if (type === 'completed') {
            setUploads(prevUploads => prevUploads.filter(u => u.status !== 'success'));
        }
    };

    const mainStyle = {
        backgroundImage: config.mainBgUrl ? `url(${config.mainBgUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
    };

    return (
        <div style={mainStyle}>
            <Container fluid>
                <Row>
                    <Col md={3} className="bg-light vh-100 p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h2>目 录</h2>
                            <Button variant="secondary" size="sm" onClick={() => setShowSettingsModal(true)}>设置</Button>
                        </div>
                        <CategoryTree onSelect={handleCategorySelect} refreshKey={refreshKey} />
                        <Button variant="danger" onClick={handleLogout} className="mt-3">登 出</Button>
                    </Col>
                    <Col md={9} className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            {selectedCategory.id !== 1 ? (
                                <h3>{selectedCategory.name}</h3>
                            ) : (
                                <div></div> // 不需要显示，太占空间了
                            )}
                            {selectedCategory.id !== 1 && (
                                <Button onClick={() => setShowUploadModal(true)} disabled={!selectedCategory.id}>上传图片</Button>
                            )}
                        </div>
                        {selectedCategory.id === 1 ? (
                            <Dashboard stats={dashboardData.stats} recentUploads={dashboardData.recentUploads} config={config} />
                        ) : (
                            <ImageGrid key={refreshKey} categoryId={selectedCategory.id} config={config} />
                        )}
                    </Col>
                </Row>
                <UploadModal
                    show={showUploadModal}
                    onHide={() => setShowUploadModal(false)}
                    categoryId={selectedCategory.id}
                    onUpload={handleStartUpload}
                />
                <UploadProgress uploads={uploads} onRetry={handleRetryUpload} onClear={handleClearUploads} />
                <SettingsModal
                    show={showSettingsModal}
                    onHide={() => setShowSettingsModal(false)}
                    config={config}
                    onSave={handleSaveSettings}
                />
            </Container>
        </div>
    );
}

export default MainPage;