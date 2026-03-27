import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiCheck, FiX, FiClock } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';

const Card = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 1.5rem;
`;

const Title = styled.h3`
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    margin: 0 0 1rem 0;
`;

const Subtitle = styled.p`
    color: #a0a0a0;
    font-size: 0.9rem;
    margin: 0 0 1.5rem 0;
`;

const Input = styled.input`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 0.8rem 1rem;
    color: #ffffff;
    font-size: 1rem;
    outline: none;
    width: 100%;
    box-sizing: border-box;
    &:focus { border-color: #667eea; }
    &::placeholder { color: #555; }
`;

const Btn = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: #fff;
    border-radius: 10px;
    padding: 0.7rem 1.2rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.9rem;
    transition: opacity 0.3s;
    &:hover { opacity: 0.85; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SecondaryBtn = styled.button`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #a0a0a0;
    border-radius: 8px;
    padding: 0.5rem 0.8rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s;
    &:hover { border-color: #667eea; color: #fff; }
`;

const Row = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-bottom: 1rem;
`;

const Divider = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0;
    color: #555;
    font-size: 0.85rem;

    &::before, &::after {
        content: '';
        flex: 1;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
`;

const ClubList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 250px;
    overflow-y: auto;
`;

const ClubItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.7rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { border-color: #667eea; }
`;

const ClubItemName = styled.span`
    color: #ffffff;
    font-weight: 500;
`;

const JoinBtn = styled.button`
    background: rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.3);
    color: #667eea;
    border-radius: 6px;
    padding: 0.3rem 0.7rem;
    font-size: 0.85rem;
    cursor: pointer;
    &:hover { background: rgba(102, 126, 234, 0.25); }
`;

const PendingBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #f59e0b;
    font-size: 0.9rem;
    padding: 0.8rem 1rem;
    background: rgba(245, 158, 11, 0.1);
    border: 1px solid rgba(245, 158, 11, 0.2);
    border-radius: 10px;
`;

const ApprovedBadge = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #4ade80;
    font-size: 0.9rem;
    padding: 0.8rem 1rem;
    background: rgba(74, 222, 128, 0.1);
    border: 1px solid rgba(74, 222, 128, 0.2);
    border-radius: 10px;
    margin-bottom: 1rem;
`;

const ClubName = styled.span`
    color: #ffffff;
    font-weight: 600;
    font-size: 1.1rem;
`;

const RequestItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.7rem 1rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    margin-bottom: 0.5rem;
`;

const RequestName = styled.span`
    color: #ffffff;
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
    padding: 0.3rem 0.6rem;
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
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    &:hover { background: rgba(255, 107, 107, 0.25); }
`;

const ClubSection = ({ user, onClubChanged }) => {
    const [clubs, setClubs] = useState([]);
    const [requests, setRequests] = useState([]);
    const [newClubName, setNewClubName] = useState('');
    const [creating, setCreating] = useState(false);

    const hasClub = user.club_id != null;
    const isApproved = user.club_status === 'approved';
    const isPending = user.club_status === 'pending';

    useEffect(() => {
        if (!hasClub) {
            apiRequest('/coach/clubs').then(setClubs).catch(() => {});
        }
        if (isApproved) {
            apiRequest('/coach/club-requests').then(setRequests).catch(() => {});
        }
    }, [hasClub, isApproved]);

    const createClub = async () => {
        if (!newClubName.trim()) return;
        setCreating(true);
        try {
            await apiRequest('/coach/create-club', {
                method: 'POST',
                body: JSON.stringify({ name: newClubName.trim() }),
            });
            onClubChanged();
        } catch {
            // ignore
        }
        setCreating(false);
    };

    const joinClub = async (clubId) => {
        try {
            await apiRequest('/coach/join-club', {
                method: 'POST',
                body: JSON.stringify({ club_id: clubId }),
            });
            onClubChanged();
        } catch {
            // ignore
        }
    };

    const approveCoach = async (id) => {
        try {
            await apiRequest(`/coach/approve-coach/${id}`, { method: 'PUT' });
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch {
            // ignore
        }
    };

    const rejectCoach = async (id) => {
        try {
            await apiRequest(`/coach/reject-coach/${id}`, { method: 'PUT' });
            setRequests(prev => prev.filter(r => r.id !== id));
        } catch {
            // ignore
        }
    };

    // No club - show setup
    if (!hasClub) {
        return (
            <Card>
                <Title>Join or Create a Club</Title>
                <Subtitle>You need a club to manage students. Create a new one or join an existing club.</Subtitle>

                <Row>
                    <Input
                        value={newClubName}
                        onChange={e => setNewClubName(e.target.value)}
                        placeholder="New club name (e.g. Alingsas Judo Klubb)"
                        onKeyDown={e => e.key === 'Enter' && createClub()}
                        style={{ flex: 1 }}
                    />
                    <Btn onClick={createClub} disabled={creating || !newClubName.trim()}>
                        <FiPlus size={16} /> Create
                    </Btn>
                </Row>

                {clubs.length > 0 && (
                    <>
                        <Divider>or join existing</Divider>
                        <ClubList>
                            {clubs.map(club => (
                                <ClubItem key={club.id}>
                                    <ClubItemName>{club.name}</ClubItemName>
                                    <JoinBtn onClick={() => joinClub(club.id)}>Join</JoinBtn>
                                </ClubItem>
                            ))}
                        </ClubList>
                    </>
                )}
            </Card>
        );
    }

    // Pending approval
    if (isPending) {
        return (
            <Card>
                <Title>Club Membership</Title>
                <PendingBadge>
                    <FiClock size={18} />
                    Waiting for approval to join <strong style={{ marginLeft: '0.3rem' }}>{user.club?.name || 'club'}</strong>
                </PendingBadge>
            </Card>
        );
    }

    // Approved - show club info + pending requests
    return (
        <>
            <Card>
                <Title>Your Club</Title>
                <ApprovedBadge>
                    <FiCheck size={18} />
                    <ClubName>{user.club?.name}</ClubName>
                </ApprovedBadge>

                {requests.length > 0 && (
                    <>
                        <Title style={{ fontSize: '1rem', marginTop: '1rem' }}>Pending Requests</Title>
                        {requests.map(req => (
                            <RequestItem key={req.id}>
                                <RequestName>{req.name} ({req.role})</RequestName>
                                <ActionBtns>
                                    <ApproveBtn onClick={() => approveCoach(req.id)}>
                                        <FiCheck size={14} /> Approve
                                    </ApproveBtn>
                                    <RejectBtn onClick={() => rejectCoach(req.id)}>
                                        <FiX size={14} />
                                    </RejectBtn>
                                </ActionBtns>
                            </RequestItem>
                        ))}
                    </>
                )}
            </Card>
        </>
    );
};

export default ClubSection;
