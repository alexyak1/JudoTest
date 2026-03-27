import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '../utils/api';
import styled from 'styled-components';

const Container = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 170px);
    padding: 2rem;
`;

const Card = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2.5rem;
    width: 100%;
    max-width: 420px;
    text-align: center;
    backdrop-filter: blur(10px);
`;

const Title = styled.h1`
    color: #ffffff;
    font-size: 1.5rem;
    margin-bottom: 1rem;
    font-family: 'Inter', sans-serif;
`;

const Message = styled.p`
    color: ${p => p.error ? '#ff6b6b' : '#4ade80'};
    font-size: 1rem;
    margin-bottom: 1.5rem;
`;

const Spinner = styled.div`
    color: #667eea;
    font-size: 1rem;
    margin-bottom: 1rem;
`;

const Button = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #ffffff;
    border: none;
    border-radius: 10px;
    padding: 0.8rem 2rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    &:hover { opacity: 0.9; }
`;

export default function Verify() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const { login: setAuthState } = useAuth();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid verification link');
            return;
        }

        // Try email verification first
        const API_BASE = `http://${window.location.hostname}:8787`;

        fetch(`${API_BASE}/auth/verify-email?token=${token}`)
            .then(async res => {
                if (res.ok) {
                    const data = await res.json();
                    if (data.token) {
                        // Registration verification - auto login
                        localStorage.setItem('token', data.token);
                        setStatus('success');
                        setMessage('Email verified! Redirecting...');
                        setTimeout(() => {
                            window.location.href = '/account';
                        }, 1500);
                    }
                    return;
                }

                // Try password change confirmation
                const passRes = await fetch(`${API_BASE}/auth/confirm-password?token=${token}`);
                if (passRes.ok) {
                    setStatus('success');
                    setMessage('Password changed successfully!');
                    return;
                }

                setStatus('error');
                setMessage('Invalid or expired link');
            })
            .catch(() => {
                setStatus('error');
                setMessage('Something went wrong. Please try again.');
            });
    }, [token]);

    return (
        <Container>
            <Card>
                {status === 'loading' && (
                    <>
                        <Spinner>Verifying...</Spinner>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <Title>Done!</Title>
                        <Message>{message}</Message>
                        <Button onClick={() => navigate('/account')}>Go to Account</Button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <Title>Verification Failed</Title>
                        <Message error>{message}</Message>
                        <Button onClick={() => navigate('/login')}>Go to Login</Button>
                    </>
                )}
            </Card>
        </Container>
    );
}
