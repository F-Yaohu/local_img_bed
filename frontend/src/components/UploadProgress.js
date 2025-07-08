import React, { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import './UploadProgress.css';

const UploadProgress = ({ uploads, onRetry, onClear }) => {
    const [isMinimized, setIsMinimized] = useState(false);

    if (uploads.length === 0) {
        return null;
    }

    const handleClear = (type) => {
        onClear(type);
    };
    
    const activeUploads = uploads.filter(u => u.status === 'uploading' || u.status === 'pending').length;

    return (
        <div className={`upload-progress-container ${isMinimized ? 'minimized' : ''}`}>
            <div className="upload-progress-header">
                <h5>
                    上传任务
                    {activeUploads > 0 && <span className="active-uploads-badge">{activeUploads}</span>}
                </h5>
                <div className="header-actions">
                    <Dropdown>
                        <Dropdown.Toggle variant="light" size="sm" id="dropdown-basic">
                            清空
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => handleClear('completed')}>清空已完成</Dropdown.Item>
                            <Dropdown.Item onClick={() => handleClear('all')}>清空全部</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Button variant="light" size="sm" onClick={() => setIsMinimized(!isMinimized)}>
                        {isMinimized ? '展开' : '最小化'}
                    </Button>
                    <Button variant="light" size="sm" onClick={() => handleClear('all')}>
                        &times;
                    </Button>
                </div>
            </div>
            {!isMinimized && (
                <ul className="upload-list">
                    {uploads.map(upload => (
                        <li key={upload.id} className="upload-item">
                            <div className="file-info">
                                <span className="file-name">{upload.file.name}</span>
                                <span className="file-size">{(upload.file.size / 1024).toFixed(2)} KB</span>
                            </div>
                            <div className="progress-info">
                                {upload.status === 'uploading' && (
                                    <div className="progress">
                                        <div
                                            className="progress-bar"
                                            style={{ width: `${upload.progress}%` }}
                                        ></div>
                                    </div>
                                )}
                                <span className={`status ${upload.status}`}>{upload.status}</span>
                                {upload.status === 'error' && (
                                    <Button variant="link" size="sm" onClick={() => onRetry(upload.id)}>
                                        重试
                                    </Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default UploadProgress;
