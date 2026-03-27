import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 170px);
    padding: 2rem;

    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const Card = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2.5rem;
    width: 100%;
    max-width: 420px;
    backdrop-filter: blur(10px);
`;

const Title = styled.h1`
    color: #ffffff;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    text-align: center;
    font-family: 'Inter', sans-serif;
`;

const Subtitle = styled.p`
    color: #a0a0a0;
    text-align: center;
    margin-bottom: 2rem;
    font-family: 'Inter', sans-serif;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
`;

const Input = styled.input`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 0.9rem 1rem;
    color: #ffffff;
    font-size: 1rem;
    font-family: 'Inter', sans-serif;
    outline: none;
    transition: border-color 0.3s;

    &:focus {
        border-color: #667eea;
    }

    &::placeholder {
        color: #666;
    }
`;

const Button = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border: none;
    border-radius: 10px;
    padding: 0.9rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.3s;
    font-family: 'Inter', sans-serif;
    margin-top: 0.5rem;

    &:hover {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const ErrorMsg = styled.div`
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.2);
    border-radius: 8px;
    padding: 0.8rem;
    font-size: 0.9rem;
    text-align: center;
`;

const BottomLink = styled.p`
    color: #a0a0a0;
    text-align: center;
    margin-top: 1.5rem;
    font-family: 'Inter', sans-serif;

    a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        &:hover { text-decoration: underline; }
    }
`;

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await login(email, password);
            navigate('/account');
        } catch (err) {
            setError(err.message || 'Login failed');
        }
        setSubmitting(false);
    };

    return (
        <Container>
            <title>Judo Quiz | Login</title>
            <Card>
                <Title>Welcome Back</Title>
                <Subtitle>Sign in to your account</Subtitle>
                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Signing in...' : 'Sign In'}
                    </Button>
                </Form>
                <BottomLink>
                    <Link to="/forgot-password">Forgot password?</Link>
                </BottomLink>
                <BottomLink>
                    Don't have an account? <Link to="/register">Sign Up</Link>
                </BottomLink>
            </Card>
        </Container>
    );
}
