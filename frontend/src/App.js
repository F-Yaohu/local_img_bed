import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import MainPage from './pages/MainPage';
import ErrorBoundary from './components/ErrorBoundary';
import api from './services/api';

const defaultConfig = {
    pageTitle: 'Local Image Bed',
    logoUrl: '/logo192.png',
    imgBaseUrl: '',
    loginBgUrl: '',
    mainBgUrl: '',
};

function App() {
    const [config, setConfig] = useState(defaultConfig);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await api.getBaseConfig();
                if (response.data) {
                    // Merge fetched config with defaults, giving precedence to fetched values
                    setConfig(prevConfig => ({
                        ...prevConfig,
                        ...Object.entries(response.data).reduce((acc, [key, value]) => {
                            if (value) { // Only override if the new value is not null/empty
                                acc[key] = value;
                            }
                            return acc;
                        }, {})
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch base config:', error);
                // Keep default config on error
            }
        };

        fetchConfig();
    }, []);

    useEffect(() => {
        if (config.pageTitle) {
            document.title = config.pageTitle;
        }
        const favicon = document.querySelector("link[rel~='icon']");
        if (favicon && config.logoUrl) {
            favicon.href = config.logoUrl;
        }
    }, [config]);
    
    const handleConfigSave = (newConfig) => {
        setConfig(newConfig);
    };

    return (
        <Router>
            <ErrorBoundary>
                <Routes>
                    <Route path="/login" element={<LoginPage config={config} />} />
                    <Route path="/" element={<PrivateRoute config={config} onConfigSave={handleConfigSave} />} />
                </Routes>
            </ErrorBoundary>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
        </Router>
    );
}

const PrivateRoute = ({ config, onConfigSave }) => {
    const isAuthenticated = !!localStorage.getItem('token');
    return isAuthenticated ? <MainPage config={config} onConfigSave={onConfigSave} /> : <Navigate to="/login" />;
};

export default App;