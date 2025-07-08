import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';

function UploadModal({ show, onHide, categoryId, onUpload }) {
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUploadClick = () => {
        if (files.length === 0) {
            toast.warn('请选择要上传的文件。');
            return;
        }
        if (!categoryId) {
            toast.error('未选择上传类别。');
            return;
        }
        onUpload(files);
        onHide();
        setFiles([]); // Reset after starting upload
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>上传图片</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Group>
                    <Form.Label>选择图片 (可多选)</Form.Label>
                    <Form.Control type="file" multiple onChange={handleFileChange} />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>关闭</Button>
                <Button variant="primary" onClick={handleUploadClick}>
                    开始上传
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UploadModal;
