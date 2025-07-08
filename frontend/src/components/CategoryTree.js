import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ListGroup, Spinner, Alert, Button } from 'react-bootstrap';
import CategoryModal from './CategoryModal';
import ConfirmModal from './ConfirmModal';

function CategoryNode({ category, parent, onSelect, onUpdate }) {
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
                    onUpdate={onUpdate}
                />
            ))}
        </>
    );
}

function CategoryTree({ onSelect, refreshKey }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [parentCategory, setParentCategory] = useState(null);
    const [confirmShow, setConfirmShow] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState(null);

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
            // Assuming root categories are returned directly, set their level to 1
            const categoriesWithLevels = setCategoryLevels(res.data || [], 1);
            setCategories(categoriesWithLevels);
        } catch (err) {
            setError('Failed to load categories. Please try again later.');
            console.error('Error fetching category tree:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategoryTree();
    }, [refreshKey]); // Re-fetch when refreshKey changes

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
            setCategoryToDelete(category);
            setConfirmShow(true);
        }
    };

    const handleDeleteConfirm = () => {
        if (!categoryToDelete) return;
        api.deleteCategory(categoryToDelete.id).then(() => {
            fetchCategoryTree(); // Refresh the tree
            setConfirmShow(false);
            setCategoryToDelete(null);
        }).catch(err => {
            alert('Error deleting category');
            setConfirmShow(false);
            setCategoryToDelete(null);
        });
    };

    const handleSave = (categoryData) => {
        console.log('Saving category:', categoryData);
        const promise = isEdit
            ? api.updateCategory(categoryData.id, { name: categoryData.name })
            : api.createCategory({ name: categoryData.name, parentId: categoryData.parentId });

        promise.then(() => {
            setModalShow(false);
            fetchCategoryTree(); // Refresh the tree
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
            <ConfirmModal
                show={confirmShow}
                onHide={() => setConfirmShow(false)}
                onConfirm={handleDeleteConfirm}
                title="确认删除"
                message={`您确定要删除类别 "${categoryToDelete?.name}" 吗? 此操作不能撤消。`}
            />
        </>
    );
}

export default CategoryTree;