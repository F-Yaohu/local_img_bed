import React, { useState, useEffect } from 'react';
import { Modal, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';
import api from '../services/api';

function CategoryNode({ category, onSelect }) {
    const [expanded, setExpanded] = useState(false);

    const handleExpand = (e) => {
        e.stopPropagation();
        setExpanded(!expanded);
    };

    const handleSelect = (e) => {
        e.stopPropagation();
        onSelect(category);
    };

    return (
        <>
            <ListGroup.Item style={{ paddingLeft: `${category.level * 20}px`, display: 'flex', alignItems: 'center' }}>
                {category.subCategories && category.subCategories.length > 0 && (
                    <span
                        style={{ marginRight: 5, cursor: 'pointer' }}
                        onClick={handleExpand}
                    >
                        {expanded ? '▼' : '▶'}
                    </span>
                )}
                <span style={{ flex: 1, cursor: 'pointer' }} onClick={handleSelect}>
                    {category.name}
                </span>
            </ListGroup.Item>
            {expanded && category.subCategories && category.subCategories.map(sub => (
                <CategoryNode
                    key={sub.id}
                    category={sub}
                    onSelect={onSelect}
                />
            ))}
        </>
    );
}

function CategorySelectModal({ show, onHide, onSelectCategory }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const setCategoryLevels = (cats, level) => {
        return cats.map(cat => {
            const newCat = { ...cat, level };
            if (newCat.subCategories && newCat.subCategories.length > 0) {
                newCat.subCategories = setCategoryLevels(newCat.subCategories, level + 1);
            }
            return newCat;
        });
    };

    const fetchCategoryTree = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.getCategoryTree();
            const categoriesWithLevels = setCategoryLevels(res.data || [], 1);
            setCategories(categoriesWithLevels);
        } catch (err) {
            console.error("Failed to load categories:", err);
            setError('Failed to load categories. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (show) {
            fetchCategoryTree();
        }
    }, [show]);

    const handleCategoryClick = (category) => {
        onSelectCategory(category);
        onHide();
    };

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title>选择目标分类</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center"><Spinner animation="border" /> 加载分类中...</div>
                ) : error ? (
                    <Alert variant="danger">{error}</Alert>
                ) : (
                    <ListGroup>
                        <ListGroup.Item style={{ cursor: 'pointer' }} onClick={() => handleCategoryClick({ id: 1, name: 'Root', level: 0 })}> 
                            Root
                        </ListGroup.Item>
                        {categories.map(cat => (
                            <CategoryNode
                                key={cat.id}
                                category={cat}
                                onSelect={handleCategoryClick}
                            />
                        ))}
                    </ListGroup>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    取消
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CategorySelectModal;