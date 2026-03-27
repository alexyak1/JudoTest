import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiCheck, FiX } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';

const Card = styled.div`
    background: rgba(245, 158, 11, 0.05);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
        padding: 1rem;
        border-radius: 12px;
    }
`;

const Title = styled.h3`
    color: #f59e0b;
    font-family: 'Inter', sans-serif;
    margin: 0 0 1rem 0;
    font-size: 1rem;
`;

const RequestItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.8rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    margin-bottom: 0.5rem;

    @media (max-width: 768px) {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }
`;

const RequestName = styled.span`
    color: #ffffff;
    font-size: 0.9rem;
`;

const RequestRole = styled.span`
    color: #a0a0a0;
    font-size: 0.8rem;
    margin-left: 0.5rem;
`;

const ActionBtns = styled.div`
    display: flex;
    gap: 0.4rem;
`;

const ApproveBtn = styled.button`
    background: rgba(74, 222, 128, 0.15);
    border: 1px solid rgba(74, 222, 128, 0.3);
    color: #4ade80;
    border-radius: 6px;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    &:hover { background: rgba(74, 222, 128, 0.25); }
`;

const RejectBtn = styled.button`
    background: rgba(255, 107, 107, 0.15);
    border: 1px solid rgba(255, 107, 107, 0.3);
    color: #ff6b6b;
    border-radius: 6px;
    padding: 0.3rem 0.7rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    &:hover { background: rgba(255, 107, 107, 0.25); }
`;

const PendingRequests = () => {
    const [requests, setRequests] = useState([]);

    useEffect(() => {
        apiRequest('/coach/club-requests')
            .then(data => setRequests(data || []))
            .catch(() => {});
    }, []);

    const approve = async (id) => {
        try {
            await apiRequest(`/coach/approve-coach/${id}`, { method: 'PUT' });
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch {
            // ignore
        }
    };

    const reject = async (id) => {
        try {
            await apiRequest(`/coach/reject-coach/${id}`, { method: 'PUT' });
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch {
            // ignore
        }
    };

    if (requests.length === 0) return null;

    return (
        <Card>
            <Title>Pending Club Requests ({requests.length})</Title>
            {requests.map(req => (
                <RequestItem key={req.id}>
                    <div>
                        <RequestName>{req.name}</RequestName>
                        <RequestRole>{req.role}</RequestRole>
                    </div>
                    <ActionBtns>
                        <ApproveBtn onClick={() => approve(req.id)}>
                            <FiCheck size={14} /> Approve
                        </ApproveBtn>
                        <RejectBtn onClick={() => reject(req.id)}>
                            <FiX size={14} /> Decline
                        </RejectBtn>
                    </ActionBtns>
                </RequestItem>
            ))}
        </Card>
    );
};

export default PendingRequests;
