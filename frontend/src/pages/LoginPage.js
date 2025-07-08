import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Container, Form, Button, Card, Alert } from 'react-bootstrap';

function LoginPage({ config }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await api.login(username, password);
            localStorage.setItem('token', response.data);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    const loginPageStyle = {
        minHeight: '100vh',
        backgroundImage: config.loginBgUrl ? `url(${config.loginBgUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    return (
        <div style={loginPageStyle}>
            <Container>
                <Card style={{ width: '30rem', margin: 'auto' }}>
                    <Card.Body>
                        <Card.Title className="text-center">{config.pageTitle || 'Login'}</Card.Title>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Form onSubmit={handleLogin}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username</Form.Label>
                                <Form.Control type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Password</Form.Label>
                                <Form.Control type="password" value={password}
                                    onChange={(e) => setPassword(e.target.value)} />
                            </Form.Group>
                            <Button variant="primary" type="submit" className="w-100">
                                Login
                            </Button>
                        </Form>
                    </Card.Body>
                </Card>
            </Container>
        </div>
    );
}

export default LoginPage;
