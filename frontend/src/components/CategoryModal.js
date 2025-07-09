import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

function CategoryModal({ show, onHide, onSave, category, parentCategory }) {
    const [name, setName] = useState('');

    useEffect(() => {
        if (category) {
            setName(category.name);
        } else {
            setName('');
        }
    }, [category]);

    const handleSave = () => {
        let data = { ...category, name };
        // 新增时带上 parentId
        if (!category && parentCategory) {
            data.parentId = parentCategory.id;
        }
        onSave(data);
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>{category ? '编辑分类' : '新增分类'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {parentCategory && (
                        <Form.Group>
                            <Form.Label>父分类</Form.Label>
                            <Form.Control plaintext readOnly defaultValue={parentCategory.name || 'Root'} />
                        </Form.Group>
                    )}
                    <Form.Group>
                        <Form.Label>名称</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    关闭
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    保存
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CategoryModal;
