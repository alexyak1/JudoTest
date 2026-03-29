import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';
import StudentProfile from './StudentProfile';

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

const Th = styled.th`
    color: #a0a0a0;
    font-weight: 500;
    text-align: left;
    padding: 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.85rem;
`;

const Td = styled.td`
    color: #ffffff;
    padding: 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.9rem;
`;

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

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
`;

const SectionTitle = styled.h3`
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    margin: 0;
`;

const RoleSelect = styled.select`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    padding: 0.4rem 0.6rem;
    color: #ffffff;
    font-size: 0.85rem;
    outline: none;
    cursor: pointer;
    &:focus { border-color: #667eea; }
    option { background: #1a1a2e; }
`;

const ClubSelect = styled(RoleSelect)``;

const ViewBtn = styled.button`
    background: rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.3);
    color: #667eea;
    border-radius: 6px;
    padding: 0.3rem 0.7rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s;
    &:hover { background: rgba(102, 126, 234, 0.25); }
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

const EmptyState = styled.p`
    color: #666;
    font-style: italic;
`;

const ClubRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const ClubName = styled.span`
    color: #ffffff;
    font-size: 0.95rem;
`;

const ClubCount = styled.span`
    color: #a0a0a0;
    font-size: 0.8rem;
    margin-left: 0.5rem;
`;

const DeleteBtn = styled.button`
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0.3rem;
    display: flex;
    align-items: center;
    transition: color 0.3s;
    &:hover { color: #ff6b6b; }
`;

const AddRow = styled.div`
    display: flex;
    gap: 0.6rem;
    margin-top: 1rem;
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

const AddBtn = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: #fff;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    &:hover { opacity: 0.85; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newClubName, setNewClubName] = useState('');

    const fetchData = async () => {
        try {
            const [usersData, clubsData] = await Promise.all([
                apiRequest('/admin/users'),
                apiRequest('/admin/clubs'),
            ]);
            setUsers(usersData);
            setClubs(clubsData);
        } catch {
            // ignore
        }
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await apiRequest(`/admin/users/${userId}/role`, {
                method: 'PUT',
                body: JSON.stringify({ role: newRole }),
            });
            fetchData();
        } catch {
            // ignore
        }
    };

    const handleClubChange = async (userId, clubId) => {
        try {
            await apiRequest(`/admin/users/${userId}/club`, {
                method: 'PUT',
                body: JSON.stringify({ club_id: clubId ? parseInt(clubId) : null }),
            });
            fetchData();
        } catch {
            // ignore
        }
    };

    const viewUserProfile = async (userId) => {
        try {
            const data = await apiRequest(`/coach/students/${userId}`);
            setSelectedUser(data);
        } catch {
            // ignore
        }
    };

    const createClub = async () => {
        if (!newClubName.trim()) return;
        try {
            await apiRequest('/admin/clubs', {
                method: 'POST',
                body: JSON.stringify({ name: newClubName.trim() }),
            });
            setNewClubName('');
            fetchData();
        } catch {
            // ignore
        }
    };

    const deleteClub = async (clubId) => {
        try {
            await apiRequest(`/admin/clubs/${clubId}`, { method: 'DELETE' });
            fetchData();
        } catch {
            // ignore
        }
    };

    if (selectedUser) {
        return (
            <>
                <BackBtn onClick={() => setSelectedUser(null)}>Back to Users</BackBtn>
                <StudentProfile user={selectedUser} isOwnProfile={false} canEdit={true} />
            </>
        );
    }

    if (loading) return <EmptyState>Loading...</EmptyState>;

    const getUserCountForClub = (clubId) => users.filter(u => u.club_id === clubId).length;

    return (
        <>
            <Card>
                <SectionHeader>
                    <SectionTitle>Clubs</SectionTitle>
                </SectionHeader>
                {clubs.map(club => (
                    <ClubRow key={club.id}>
                        <div>
                            <ClubName>{club.name}</ClubName>
                            <ClubCount>({getUserCountForClub(club.id)} members)</ClubCount>
                        </div>
                        <DeleteBtn onClick={() => deleteClub(club.id)} title="Delete club">
                            <FiTrash2 size={14} />
                        </DeleteBtn>
                    </ClubRow>
                ))}
                <AddRow>
                    <Input
                        value={newClubName}
                        onChange={e => setNewClubName(e.target.value)}
                        placeholder="New club name"
                        onKeyDown={e => e.key === 'Enter' && createClub()}
                    />
                    <AddBtn onClick={createClub} disabled={!newClubName.trim()}>
                        <FiPlus size={14} /> Add Club
                    </AddBtn>
                </AddRow>
            </Card>

            <Card>
                <SectionTitle>All Users</SectionTitle>
                <div style={{ overflowX: 'auto' }}>
                    <Table>
                        <thead>
                            <tr>
                                <Th>Name</Th>
                                <Th>Email</Th>
                                <Th>Club</Th>
                                <Th>Role</Th>
                                <Th></Th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <Td>{user.name}</Td>
                                    <Td>{user.email || '-'}</Td>
                                    <Td>
                                        <ClubSelect
                                            value={user.club_id || ''}
                                            onChange={e => handleClubChange(user.id, e.target.value)}
                                        >
                                            <option value="">No club</option>
                                            {clubs.map(c => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </ClubSelect>
                                    </Td>
                                    <Td>
                                        <RoleSelect
                                            value={user.role}
                                            onChange={e => handleRoleChange(user.id, e.target.value)}
                                        >
                                            <option value="student">Student</option>
                                            <option value="coach">Coach</option>
                                            <option value="admin">Admin</option>
                                        </RoleSelect>
                                    </Td>
                                    <Td>
                                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                                            <ViewBtn onClick={() => viewUserProfile(user.id)}>View</ViewBtn>
                                            <ViewBtn onClick={async () => {
                                                if (!window.confirm(`Delete ${user.name}? This removes all their data permanently.`)) return;
                                                try {
                                                    await apiRequest(`/admin/users/${user.id}`, { method: 'DELETE' });
                                                    fetchData();
                                                } catch {}
                                            }} style={{ background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff6b6b' }}>
                                                Delete
                                            </ViewBtn>
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            </Card>
        </>
    );
};

export default AdminDashboard;
