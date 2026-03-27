import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
    line-height: 1.5;
`;

const BottomLink = styled.p`
    color: #a0a0a0;
    text-align: center;
    margin-top: 1.5rem;
    font-family: 'Inter', sans-serif;
    a { color: #667eea; text-decoration: none; font-weight: 600; &:hover { text-decoration: underline; } }
`;

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            await apiRequest('/auth/forgot-password', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
            setSent(true);
        } catch (err) {
            setError(err.message || 'Failed to send reset email');
        }
        setSubmitting(false);
    };

    if (sent) {
        return (
            <Container>
                <Card>
                    <Title>Check Your Email</Title>
                    <SuccessMsg>
                        If an account exists for <strong>{email}</strong>, we sent a password reset link.
                        <br /><br />
                        Click the link in the email to set a new password.
                    </SuccessMsg>
                    <BottomLink>
                        <Link to="/login">Back to Login</Link>
                    </BottomLink>
                </Card>
            </Container>
        );
    }

    return (
        <Container>
            <title>Judo Quiz | Forgot Password</title>
            <Card>
                <Title>Forgot Password</Title>
                <Subtitle>Enter your email and we'll send you a reset link</Subtitle>
                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </Form>
                <BottomLink>
                    Remember your password? <Link to="/login">Sign In</Link>
                </BottomLink>
            </Card>
        </Container>
    );
}
