import React, { useState } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import './UploadProgress.css'; // Reusing the same CSS for consistency

const DeletionProgress = ({ deletions, onClear }) => {
    const [isMinimized, setIsMinimized] = useState(false);

    if (deletions.length === 0) {
        return null;
    }

    const handleClear = (type) => {
        onClear(type);
    };

    const activeDeletions = deletions.filter(d => d.status === 'deleting').length;

    return (
        <div className={`upload-progress-container ${isMinimized ? 'minimized' : ''}`}>
            <div className="upload-progress-header">
                <h5>
                    删除任务
                    {activeDeletions > 0 && <span className="active-uploads-badge">{activeDeletions}</span>}
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
                    {deletions.map(deletion => (
                        <li key={deletion.id} className="upload-item">
                            <div className="file-info">
                                <span className="file-name">Image ID: {deletion.id}</span>
                            </div>
                            <div className="progress-info">
                                <span className={`status ${deletion.status}`}>{deletion.status}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default DeletionProgress;
