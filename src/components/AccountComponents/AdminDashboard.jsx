import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTrash2, FiGitMerge, FiMail } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';
import StudentProfile from './StudentProfile';
import MergeModal from './MergeModal';

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

const StatRow = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;
`;

const StatCard = styled.div`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 0.6rem;
    text-align: center;
`;

const StatValue = styled.div`
    color: ${p => p.color || '#fff'};
    font-size: 1.5rem;
    font-weight: 700;
`;

const StatLabel = styled.div`
    color: #888;
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 0.1rem;
`;

const ActivityTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
`;

const ActivityTh = styled.th`
    color: #666;
    font-weight: 500;
    text-align: left;
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.7rem;
    text-transform: uppercase;
`;

const ActivityTd = styled.td`
    color: #ddd;
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
`;

const InviteOverlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const InviteModal = styled.div`
    background: #1a1a2e;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 2rem;
    max-width: 450px;
    width: 90%;
`;

const InviteTitle = styled.h3`
    color: #fff;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const InviteLabel = styled.label`
    color: #ccc;
    font-size: 0.85rem;
    display: block;
    margin-bottom: 0.4rem;
`;

const InviteBtnRow = styled.div`
    display: flex;
    gap: 0.6rem;
    justify-content: flex-end;
    margin-top: 1rem;
`;

const InviteConfirmBtn = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: #fff;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    &:hover { opacity: 0.85; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const InviteCancelBtn = styled.button`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #a0a0a0;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    cursor: pointer;
    font-size: 0.9rem;
    &:hover { border-color: #667eea; color: #fff; }
`;

const MergeBtn = styled.button`
    background: rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.3);
    color: #667eea;
    border-radius: 8px;
    padding: 0.6rem 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    font-weight: 500;
    white-space: nowrap;
    transition: all 0.3s;
    &:hover { background: rgba(102, 126, 234, 0.25); }
`;

const MergeDesc = styled.p`
    color: #a0a0a0;
    font-size: 0.85rem;
    margin: 0;
    line-height: 1.5;
`;

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [clubs, setClubs] = useState([]);
    const [dashboard, setDashboard] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newClubName, setNewClubName] = useState('');
    const [mergeOpen, setMergeOpen] = useState(false);
    const [inviteUser, setInviteUser] = useState(null);
    const [inviteClubId, setInviteClubId] = useState('');
    const [inviteStatus, setInviteStatus] = useState(null);
    const [inviteSending, setInviteSending] = useState(false);

    const fetchData = async () => {
        try {
            const [usersData, clubsData, dashData] = await Promise.all([
                apiRequest('/admin/users'),
                apiRequest('/admin/clubs'),
                apiRequest('/admin/dashboard'),
            ]);
            setUsers(usersData);
            setClubs(clubsData);
            setDashboard(dashData);
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

    const sendClubInvite = async () => {
        if (!inviteUser || !inviteClubId) return;
        const club = clubs.find(c => c.id === parseInt(inviteClubId));
        setInviteSending(true);
        setInviteStatus(null);
        try {
            await apiRequest('/admin/invite-to-club', {
                method: 'POST',
                body: JSON.stringify({ user_id: inviteUser.id, club_id: parseInt(inviteClubId) }),
            });
            setInviteStatus({ ok: true, msg: `Invite sent to ${inviteUser.name} for "${club?.name}"` });
        } catch (err) {
            setInviteStatus({ ok: false, msg: err.message || 'Failed to send invite' });
        }
        setInviteSending(false);
    };

    const closeInvite = () => {
        setInviteUser(null);
        setInviteClubId('');
        setInviteStatus(null);
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

    const formatDate = (d) => {
        if (!d) return 'Never';
        const date = new Date(d);
        const now = new Date();
        const diff = now - date;
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <>
            {dashboard && (
                <Card>
                    <SectionHeader>
                        <SectionTitle>User Activity</SectionTitle>
                    </SectionHeader>
                    <StatRow>
                        <StatCard>
                            <StatValue>{dashboard.total_users}</StatValue>
                            <StatLabel>Total Users</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#4a9eff">{dashboard.total_students}</StatValue>
                            <StatLabel>Students</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#667eea">{dashboard.total_coaches}</StatValue>
                            <StatLabel>Coaches</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#4ade80">{dashboard.active_this_week}</StatValue>
                            <StatLabel>Active 7d</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#f59e0b">{dashboard.active_this_month}</StatValue>
                            <StatLabel>Active 30d</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#ff6b6b">{dashboard.never_logged_in}</StatValue>
                            <StatLabel>Never Logged In</StatLabel>
                        </StatCard>
                    </StatRow>
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                        <ActivityTable>
                            <thead>
                                <tr>
                                    <ActivityTh>Name</ActivityTh>
                                    <ActivityTh>Role</ActivityTh>
                                    <ActivityTh>Club</ActivityTh>
                                    <ActivityTh>Last Login</ActivityTh>
                                    <ActivityTh>Joined</ActivityTh>
                                </tr>
                            </thead>
                            <tbody>
                                {(dashboard.users || []).map(u => (
                                    <tr key={u.id}>
                                        <ActivityTd>
                                            <a href={`/account?tab=students&student=${u.id}`} style={{ color: '#667eea', textDecoration: 'none' }}
                                                onMouseOver={e => e.target.style.textDecoration = 'underline'}
                                                onMouseOut={e => e.target.style.textDecoration = 'none'}
                                            >{u.name}</a>
                                        </ActivityTd>
                                        <ActivityTd style={{ textTransform: 'capitalize' }}>{u.role}</ActivityTd>
                                        <ActivityTd>{u.club_name || '-'}</ActivityTd>
                                        <ActivityTd style={{ color: u.last_login_at ? '#4ade80' : '#ff6b6b' }}>
                                            {formatDate(u.last_login_at)}
                                        </ActivityTd>
                                        <ActivityTd style={{ color: '#888' }}>{new Date(u.created_at).toLocaleDateString()}</ActivityTd>
                                    </tr>
                                ))}
                            </tbody>
                        </ActivityTable>
                    </div>
                </Card>
            )}

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
                <SectionHeader>
                    <SectionTitle>Merge Accounts</SectionTitle>
                    <MergeBtn onClick={() => setMergeOpen(true)}>
                        <FiGitMerge size={14} /> Merge Users
                    </MergeBtn>
                </SectionHeader>
                <MergeDesc>
                    When a coach created a profile and the person later registered themselves, merge them here. The user-created account keeps its name, email, photo, and login. You pick which belts and competitions to keep.
                </MergeDesc>
            </Card>

            {mergeOpen && (
                <MergeModal
                    users={users}
                    onClose={() => setMergeOpen(false)}
                    onMerged={fetchData}
                />
            )}

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
                                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                            <ViewBtn onClick={() => viewUserProfile(user.id)}>View</ViewBtn>
                                            {user.email && (
                                                <ViewBtn onClick={() => { setInviteUser(user); setInviteClubId(''); }} title="Invite to club">
                                                    <FiMail size={12} /> Invite
                                                </ViewBtn>
                                            )}
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

            {inviteUser && (
                <InviteOverlay onClick={closeInvite}>
                    <InviteModal onClick={e => e.stopPropagation()}>
                        {inviteStatus?.ok ? (
                            <>
                                <InviteTitle style={{ color: '#4ade80' }}><FiMail size={18} /> Invite Sent</InviteTitle>
                                <p style={{ color: '#4ade80', margin: '1rem 0', fontSize: '0.95rem' }}>{inviteStatus.msg}</p>
                                <InviteBtnRow>
                                    <InviteConfirmBtn onClick={closeInvite}>Done</InviteConfirmBtn>
                                </InviteBtnRow>
                            </>
                        ) : (
                            <>
                                <InviteTitle><FiMail size={18} /> Invite to Club</InviteTitle>
                                <MergeDesc style={{ marginBottom: '1rem' }}>
                                    Send a club invitation email to <strong style={{ color: '#fff' }}>{inviteUser.name}</strong> ({inviteUser.email}).
                                    When they click the link, they'll automatically join the selected club.
                                </MergeDesc>
                                <InviteLabel>Select club:</InviteLabel>
                                <ClubSelect
                                    value={inviteClubId}
                                    onChange={e => setInviteClubId(e.target.value)}
                                    style={{ width: '100%', marginBottom: '1rem' }}
                                >
                                    <option value="">Choose a club...</option>
                                    {clubs.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </ClubSelect>
                                {inviteStatus && !inviteStatus.ok && (
                                    <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: '0 0 1rem' }}>{inviteStatus.msg}</p>
                                )}
                                <InviteBtnRow>
                                    <InviteCancelBtn onClick={closeInvite}>Cancel</InviteCancelBtn>
                                    <InviteConfirmBtn disabled={!inviteClubId || inviteSending} onClick={sendClubInvite}>
                                        {inviteSending ? 'Sending...' : 'Send Invite'}
                                    </InviteConfirmBtn>
                                </InviteBtnRow>
                            </>
                        )}
                    </InviteModal>
                </InviteOverlay>
            )}
        </>
    );
};

export default AdminDashboard;
