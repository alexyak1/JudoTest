import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiTrash2, FiPlus, FiUserPlus } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import StudentProfile from './StudentProfile';

const Card = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
        padding: 1.2rem;
        border-radius: 12px;
    }
`;

const SectionTitle = styled.h3`
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    margin: 0 0 1rem 0;
`;

const CoachGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const CoachCard = styled.div`
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 1.2rem;
    cursor: pointer;
    transition: all 0.3s;
    &:hover { border-color: #667eea; background: rgba(102, 126, 234, 0.05); }
`;

const CardHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const Avatar = styled.div`
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 600;
    flex-shrink: 0;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const CoachName = styled.div`
    color: #ffffff;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
`;

const CoachEmail = styled.div`
    color: #a0a0a0;
    font-size: 0.8rem;
`;

const RoleBadge = styled.span`
    background: ${p => p.role === 'admin' ? '#764ba2' : '#667eea'};
    color: #fff;
    padding: 0.15rem 0.5rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-left: 0.4rem;
`;

const BackBtn = styled.button`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #a0a0a0;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    transition: all 0.3s;
    &:hover { border-color: #667eea; color: #fff; }
`;

const DeleteBtn = styled.button`
    background: rgba(255, 107, 107, 0.15);
    border: 1px solid rgba(255, 107, 107, 0.3);
    color: #ff6b6b;
    border-radius: 6px;
    padding: 0.3rem 0.7rem;
    font-size: 0.8rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-top: 0.8rem;
    &:hover { background: rgba(255, 107, 107, 0.25); }
`;

const EmptyState = styled.p`
    color: #666;
    font-style: italic;
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const AddBtn = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: #fff;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    font-weight: 500;
    &:hover { opacity: 0.85; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const CreateRow = styled.div`
    display: flex;
    gap: 0.6rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const Input = styled.input`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 0.6rem 1rem;
    color: #ffffff;
    font-size: 0.9rem;
    outline: none;
    flex: 1;
    &:focus { border-color: #667eea; }
    &::placeholder { color: #555; }
`;

const CoachesList = () => {
    const { user, isAdmin } = useAuth();
    const [coaches, setCoaches] = useState([]);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);

    const fetchCoaches = async () => {
        try {
            const data = await apiRequest('/coach/club-coaches');
            setCoaches(data);
        } catch {
            // ignore
        }
        setLoading(false);
    };

    useEffect(() => { fetchCoaches(); }, []);

    const viewCoach = async (id) => {
        try {
            const data = await apiRequest(`/coach/club-coaches/${id}`);
            setSelectedCoach(data);
        } catch {
            // ignore
        }
    };

    const createCoach = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            await apiRequest('/admin/create-coach', {
                method: 'POST',
                body: JSON.stringify({ name: newName.trim() }),
            });
            setNewName('');
            setShowCreate(false);
            fetchCoaches();
        } catch {}
        setCreating(false);
    };

    const removeCoach = async (id) => {
        if (!window.confirm('Are you sure you want to remove this coach from the club?')) return;
        try {
            await apiRequest(`/admin/users/${id}/club`, {
                method: 'PUT',
                body: JSON.stringify({ club_id: null }),
            });
            setCoaches(prev => prev.filter(c => c.id !== id));
        } catch {
            // ignore
        }
    };

    if (selectedCoach) {
        return (
            <>
                <BackBtn onClick={() => setSelectedCoach(null)}>Back to Coaches</BackBtn>
                <StudentProfile user={selectedCoach} isOwnProfile={false} canEdit={isAdmin} />
            </>
        );
    }

    if (loading) return <EmptyState>Loading coaches...</EmptyState>;

    const clubName = user?.club?.name;

    return (
        <Card>
            <SectionHeader>
                <SectionTitle>Coaches{clubName ? ` in ${clubName}` : ''}</SectionTitle>
                {isAdmin && (
                    <AddBtn onClick={() => setShowCreate(!showCreate)}>
                        <FiPlus size={14} /> Add Coach
                    </AddBtn>
                )}
            </SectionHeader>
            {showCreate && isAdmin && (
                <CreateRow>
                    <Input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Coach name"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), createCoach())}
                    />
                    <AddBtn onClick={createCoach} disabled={creating || !newName.trim()}>
                        <FiUserPlus size={14} /> {creating ? 'Creating...' : 'Create'}
                    </AddBtn>
                </CreateRow>
            )}
            {coaches.length > 0 ? (
                <CoachGrid>
                    {coaches.map(coach => (
                        <CoachCard key={coach.id} onClick={() => viewCoach(coach.id)}>
                            <CardHeader>
                                <Avatar>
                                    {coach.photo_url
                                        ? <img src={coach.photo_url.startsWith('http') ? coach.photo_url : `http://${window.location.hostname}:8787${coach.photo_url}`} alt={coach.name} />
                                        : coach.name?.charAt(0)?.toUpperCase()
                                    }
                                </Avatar>
                                <div>
                                    <CoachName>
                                        {coach.name}
                                        <RoleBadge role={coach.role}>{coach.role}</RoleBadge>
                                    </CoachName>
                                    {coach.email && <CoachEmail>{coach.email}</CoachEmail>}
                                </div>
                            </CardHeader>
                            {isAdmin && coach.id !== user?.id && (
                                <DeleteBtn onClick={(e) => { e.stopPropagation(); removeCoach(coach.id); }}>
                                    <FiTrash2 size={13} /> Remove from club
                                </DeleteBtn>
                            )}
                        </CoachCard>
                    ))}
                </CoachGrid>
            ) : (
                <EmptyState>No coaches in this club yet</EmptyState>
            )}
        </Card>
    );
};

export default CoachesList;
