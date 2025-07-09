import React from 'react';
import { Modal, Button } from 'react-bootstrap';

function ConfirmModal({ show, onHide, onConfirm, title, message, showCancelButton = true, confirmButtonText = '确认' }) {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{message}</p>
            </Modal.Body>
            <Modal.Footer>
                {showCancelButton && (
                    <Button variant="secondary" onClick={onHide}>
                        取消
                    </Button>
                )}
                <Button variant="danger" onClick={onConfirm}>
                    {confirmButtonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmModal;