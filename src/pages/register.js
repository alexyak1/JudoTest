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
    transition: opacity 0.3s;
    font-family: 'Inter', sans-serif;
    margin-top: 0.5rem;
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

const ResendLink = styled.span`
    color: #667eea;
    cursor: pointer;
    text-decoration: underline;
    &:hover { opacity: 0.8; }
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

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [resending, setResending] = useState(false);

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
            await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ email, password, name }),
            });
            setSubmitted(true);
        } catch (err) {
            setError(err.message || 'Registration failed');
        }
        setSubmitting(false);
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await apiRequest('/auth/resend-verification', {
                method: 'POST',
                body: JSON.stringify({ email }),
            });
        } catch {
            // ignore
        }
        setResending(false);
    };

    if (submitted) {
        return (
            <Container>
                <Card>
                    <Title>Check Your Email</Title>
                    <SuccessMsg>
                        We sent a verification link to <strong>{email}</strong>.
                        <br /><br />
                        Click the link in the email to verify your account.
                    </SuccessMsg>
                    <p style={{ color: '#666', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
                        Didn't receive it?{' '}
                        <ResendLink onClick={handleResend}>
                            {resending ? 'Sending...' : 'Resend email'}
                        </ResendLink>
                    </p>
                </Card>
            </Container>
        );
    }

    return (
        <Container>
            <title>Judo Quiz | Register</title>
            <Card>
                <Title>Create Account</Title>
                <Subtitle>Join the judo community</Subtitle>
                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <Input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
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
                    <Input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <Button type="submit" disabled={submitting}>
                        {submitting ? 'Creating account...' : 'Sign Up'}
                    </Button>
                </Form>
                <BottomLink>
                    Already have an account? <Link to="/login">Sign In</Link>
                </BottomLink>
            </Card>
        </Container>
    );
}
