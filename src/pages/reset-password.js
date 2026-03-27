import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 170px);
    padding: 2rem;
    @media (max-width: 768px) { padding: 1rem; }
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
    font-size: 1.8rem;
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
    font-size: 0.9rem;
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
    &:focus { border-color: #667eea; }
    &::placeholder { color: #666; }
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
    font-family: 'Inter', sans-serif;
    &:hover { opacity: 0.9; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
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

const SuccessMsg = styled.div`
    color: #4ade80;
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.2);
    border-radius: 8px;
    padding: 1.2rem;
    text-align: center;
    font-size: 0.95rem;
`;

const BottomLink = styled.p`
    color: #a0a0a0;
    text-align: center;
    margin-top: 1.5rem;
    font-family: 'Inter', sans-serif;
    a { color: #667eea; text-decoration: none; font-weight: 600; &:hover { text-decoration: underline; } }
`;

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    const token = searchParams.get('token');

    if (!token) {
        return (
            <Container>
                <Card>
                    <Title>Invalid Link</Title>
                    <ErrorMsg>This password reset link is invalid.</ErrorMsg>
                    <BottomLink><Link to="/forgot-password">Request a new link</Link></BottomLink>
                </Card>
            </Container>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setSubmitting(true);
        try {
            await apiRequest('/auth/reset-password', {
                method: 'POST',
                body: JSON.stringify({ token, new_password: password }),
            });
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Failed to reset password');
        }
        setSubmitting(false);
    };

    if (success) {
        return (
            <Container>
                <Card>
                    <Title>Password Reset</Title>
                    <SuccessMsg>Your password has been changed successfully.</SuccessMsg>
                    <BottomLink>
                        <Button onClick={() => navigate('/login')} style={{ width: '100%', marginTop: '1rem' }}>
                            Go to Login
                        </Button>
                    </BottomLink>
                </Card>
            </Container>
        );
    }

    return (
        <Container>
            <title>Judo Quiz | Reset Password</title>
            <Card>
                <Title>Set New Password</Title>
                <Subtitle>Enter your new password below</Subtitle>
                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <Input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
}
