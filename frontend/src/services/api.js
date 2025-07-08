import axios from 'axios';

const apiClient = axios.create({
    baseURL: '/api', // Proxied to the Spring Boot backend
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default {
    login(username, password) {
        return apiClient.post('/auth/login', {username, password});
    },
    getCategorySub(id) {
        return apiClient.get(`/categories/${id}/sub`);
    },
    // 获取图片分页（分页时调用）
    getCategoryImages(id, page = 1, size = 9) {
        return apiClient.get(`/images/page/${id}?page=${page}&size=${size}`);
    },
    createCategory(category) {
        return apiClient.post('/categories', category);
    },
    updateCategory(id, category) {
        return apiClient.put(`/categories/${id}`, category);
    },
    deleteCategory(id) {
        return apiClient.delete(`/categories/${id}`);
    },
    uploadImage(data, onUploadProgress) {
        return apiClient.post('/images/upload', data, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress,
        });
    },
    deleteImage(id) {
        return apiClient.delete(`/images/${id}`);
    },
    moveImage(id, newCategoryId) {
        return apiClient.put(`/images/${id}/move`, {newCategoryId});
    },
    getStats() {
        return apiClient.get('/images/stats');
    },
    getRecentUploads(size = 50) {
        return apiClient.get(`/images/recent?size=${size}`);
    },
    getBaseConfig() {
        return apiClient.get('/base/config');
    },
    updateBaseConfig(data) {
        return apiClient.put('/base/config/save', data);
    }
};