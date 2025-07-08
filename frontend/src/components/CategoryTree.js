import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ListGroup, Spinner, Alert, Button } from 'react-bootstrap';
import CategoryModal from './CategoryModal';

function CategoryNode({ category, parent, onSelect, loadChildren, onUpdate }) {
    const [expanded, setExpanded] = useState(false);

    const handleExpand = async (e) => {
        e.stopPropagation();
        if (!expanded) {
            await loadChildren(category);
        }
        setExpanded(!expanded);
    };

    const handleSelect = (e) => {
        e.stopPropagation();
        onSelect(category);
    };

    return (
        <>
            <ListGroup.Item style={{ paddingLeft: `${category.level * 20}px`, display: 'flex', alignItems: 'center' }}>
                {category.hasChildren && (
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
                <Button variant="outline-primary" size="sm" onClick={(e) => { e.stopPropagation(); onUpdate(category, 'add', category); }}>+</Button>
                <Button variant="outline-secondary" size="sm" className="ml-2" onClick={(e) => { e.stopPropagation(); onUpdate(category, 'edit', parent); }}>编辑</Button>
                <Button variant="outline-danger" size="sm" className="ml-2" onClick={(e) => { e.stopPropagation(); onUpdate(category, 'delete'); }}>删除</Button>
            </ListGroup.Item>
            {expanded && category.subCategories && category.subCategories.map(sub => (
                <CategoryNode
                    key={sub.id}
                    category={sub}
                    parent={category}
                    onSelect={onSelect}
                    loadChildren={loadChildren}
                    onUpdate={onUpdate}
                />
            ))}
        </>
    );
}

function CategoryTree({ onSelect }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [parentCategory, setParentCategory] = useState(null);

    const fetchRoot = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.getCategorySub(1);
            const rootSubs = (res.data || []).map(sub => ({
                ...sub,
                level: 1,
                hasChildren: true
            }));
            setCategories(rootSubs);
        } catch (err) {
            setError('Failed to load categories. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoot();
    }, []);

    const loadChildren = async (category) => {
        if (category.subCategories && category.subCategories.length > 0) return;
        try {
            const res = await api.getCategorySub(category.id);
            const subs = (res.data || []).map(sub => ({
                ...sub,
                level: (category.level || 0) + 1,
                hasChildren: true
            }));
            setCategories(prev => {
                const update = (cats) => cats.map(cat => {
                    if (cat.id === category.id) {
                        return { ...cat, subCategories: subs };
                    }
                    if (cat.subCategories) {
                        return { ...cat, subCategories: update(cat.subCategories) };
                    }
                    return cat;
                });
                return update(prev);
            });
        } catch (e) {
            console.error(e);
        }
    };

    const handleUpdate = (category, mode, parent) => {
        if (mode === 'add') {
            setCurrentCategory(category); // 当前为父分类
            setParentCategory(category);
            setIsEdit(false);
            setModalShow(true);
        } else if (mode === 'edit') {
            setCurrentCategory(category); // 当前为要编辑的分类
            setParentCategory(parent || null); // 传递父分类
            setIsEdit(true);
            setModalShow(true);
        } else if (mode === 'delete') {
            if (window.confirm(`Are you sure you want to delete ${category.name}?`)) {
                api.deleteCategory(category.id).then(() => {
                    fetchRoot(); // Refresh the tree
                }).catch(err => {
                    alert('Error deleting category');
                });
            }
        }
    };

    const handleSave = (categoryData) => {
        console.log('Saving category:', categoryData);
        const promise = isEdit
            ? api.updateCategory(categoryData.id, { name: categoryData.name })
            : api.createCategory({ name: categoryData.name, parentId: categoryData.parentId });

        promise.then(() => {
            setModalShow(false);
            fetchRoot(); // Refresh the tree
        }).catch(err => {
            alert('Error saving category');
        });
    };

    if (loading) {
        return <div className="text-center"><Spinner animation="border" /> Loading categories...</div>;
    }
    if (error) {
        return <Alert variant="danger">{error}</Alert>;
    }

    return (
        <>
            <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <span style={{ cursor: 'pointer' }} onClick={() => onSelect({ id: 1, name: 'Root', level: 0 })}>
                        Root
                    </span>
                    <Button variant="outline-primary" size="sm" onClick={(e) => { e.stopPropagation(); handleUpdate({ id: 1 }, 'add', { id: 1, name: 'Root', level: 0 }); }}>+</Button>
                </ListGroup.Item>
                {categories.map(cat => (
                    <CategoryNode
                        key={cat.id}
                        category={cat}
                        parent={{ id: 1, name: 'Root', level: 0 }}
                        onSelect={onSelect}
                        loadChildren={loadChildren}
                        onUpdate={handleUpdate}
                    />
                ))}
            </ListGroup>
            <CategoryModal
                show={modalShow}
                onHide={() => setModalShow(false)}
                onSave={handleSave}
                category={isEdit ? currentCategory : null}
                parentCategory={parentCategory}
            />
        </>
    );
}

export default CategoryTree;