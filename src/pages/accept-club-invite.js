import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
    color: ${p => p.error ? '#ff6b6b' : p.declined ? '#f59e0b' : '#4ade80'};
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

export default function AcceptClubInvite() {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const token = searchParams.get('token');
    const action = searchParams.get('action') || 'accept';

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Invalid invitation link');
            return;
        }

        const API_BASE = `http://${window.location.hostname}:8787`;

        fetch(`${API_BASE}/auth/accept-club-invite?token=${token}&action=${action}`)
            .then(async res => {
                if (res.ok) {
                    if (action === 'deny') {
                        setStatus('declined');
                        setMessage('Invitation declined. The admin has been notified.');
                    } else {
                        setStatus('success');
                        setMessage('You have joined the club!');
                    }
                } else {
                    const data = await res.json().catch(() => ({}));
                    setStatus('error');
                    setMessage(data.error || 'Invalid or expired invitation');
                }
            })
            .catch(() => {
                setStatus('error');
                setMessage('Something went wrong. Please try again.');
            });
    }, [token, action]);

    return (
        <Container>
            <Card>
                {status === 'loading' && <Spinner>{action === 'deny' ? 'Declining...' : 'Accepting invitation...'}</Spinner>}
                {status === 'success' && (
                    <>
                        <Title>Welcome!</Title>
                        <Message>{message}</Message>
                        <Button onClick={() => navigate('/account')}>Go to Account</Button>
                    </>
                )}
                {status === 'declined' && (
                    <>
                        <Title>Declined</Title>
                        <Message declined>{message}</Message>
                        <Button onClick={() => navigate('/')}>Go to Home</Button>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <Title>Invitation Failed</Title>
                        <Message error>{message}</Message>
                        <Button onClick={() => navigate('/login')}>Go to Login</Button>
                    </>
                )}
            </Card>
        </Container>
    );
}
