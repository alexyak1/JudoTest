import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import ProfileEditForm from './ProfileEditForm';
import AddBeltForm from './AddBeltForm';
import AddCompetitionForm from './AddCompetitionForm';
import AddLicenseForm from './AddLicenseForm';
import { apiRequest } from '../../utils/api';

const API_BASE = `http://${window.location.hostname}:8787`;

const getFullPhotoURL = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
};

const ProfileCard = styled.div`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    margin-bottom: 0.8rem;

    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const TwoCol = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const ProfileHeader = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;

    @media (max-width: 768px) {
        flex-direction: column;
        text-align: center;
    }
`;

const Avatar = styled.div`
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.4rem;
    color: #fff;
    flex-shrink: 0;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const ProfileInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

const Name = styled.h2`
    color: #ffffff;
    margin: 0;
    font-family: 'Inter', sans-serif;
    font-size: 1.2rem;
`;

const RoleBadge = styled.span`
    background: ${p => p.role === 'admin' ? '#764ba2' : p.role === 'coach' ? '#667eea' : '#4a9eff'};
    color: #fff;
    padding: 0.15rem 0.5rem;
    border-radius: 20px;
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: uppercase;
    vertical-align: middle;
    margin-left: 0.4rem;
`;

const Bio = styled.p`
    color: #a0a0a0;
    margin: 0.2rem 0 0 0;
    font-family: 'Inter', sans-serif;
    font-size: 0.85rem;
`;

const EditBtn = styled.button`
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #888;
    border-radius: 6px;
    padding: 0.35rem 0.6rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.8rem;
    transition: all 0.2s;

    &:hover {
        border-color: #667eea;
        color: #667eea;
    }
`;

const Section = styled.div``;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
`;

const SectionTitle = styled.h3`
    color: #999;
    font-family: 'Inter', sans-serif;
    margin: 0;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const AddBtn = styled.button`
    background: rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.25);
    color: #667eea;
    border-radius: 6px;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    transition: all 0.2s;

    &:hover { background: rgba(102, 126, 234, 0.25); }
`;

const DeleteBtn = styled.button`
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    padding: 0.15rem;
    display: flex;
    align-items: center;
    transition: color 0.2s;

    &:hover { color: #ff6b6b; }
`;

const BeltList = styled.div`
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

const BELT_COLORS = {
    white: '#e0e0e0', yellow: '#ffd700', orange: '#ff8c00',
    green: '#228b22', blue: '#4169e1', brown: '#8b4513', black: '#333333',
};

const BeltItem = styled.div`
    background: rgba(255, 255, 255, 0.04);
    border-left: 3px solid ${p => BELT_COLORS[p.color] || '#444'};
    border-radius: 6px;
    padding: 0.5rem 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    min-width: 120px;
    &:hover { background: rgba(255, 255, 255, 0.08); }
`;

const BeltDot = styled.div`
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: ${p => BELT_COLORS[p.color] || '#444'};
`;

const BeltText = styled.span`
    color: #ffffff;
    font-weight: 600;
    text-transform: capitalize;
    font-size: 0.85rem;
    display: block;
`;

const BeltDate = styled.span`
    color: #888;
    font-size: 0.75rem;
`;

const TableWrap = styled.div`
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 350px;
`;

const Th = styled.th`
    color: #666;
    font-weight: 500;
    text-align: left;
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.03em;
`;

const Td = styled.td`
    color: #ddd;
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    font-size: 0.85rem;
`;

const ResultBadge = styled.span`
    padding: 0.15rem 0.45rem;
    border-radius: 10px;
    font-size: 0.75rem;
    font-weight: 500;
    background: ${p => {
        switch (p.result) {
            case 'gold': return 'rgba(255, 215, 0, 0.2)';
            case 'silver': return 'rgba(192, 192, 192, 0.2)';
            case 'bronze': return 'rgba(205, 127, 50, 0.2)';
            default: return 'rgba(255, 255, 255, 0.1)';
        }
    }};
    color: ${p => {
        switch (p.result) {
            case 'gold': return '#ffd700';
            case 'silver': return '#c0c0c0';
            case 'bronze': return '#cd7f32';
            default: return '#a0a0a0';
        }
    }};
`;

const EmptyState = styled.p`
    color: #555;
    font-style: italic;
    font-size: 0.8rem;
    margin: 0.3rem 0;
`;

const StudentProfile = ({ user, isOwnProfile, canEdit, onUpdate, onUpdateUser }) => {
    const [editingProfile, setEditingProfile] = useState(false);
    const [addingBelt, setAddingBelt] = useState(false);
    const [editingBelt, setEditingBelt] = useState(null);
    const [addingCompetition, setAddingCompetition] = useState(false);
    const [addingLicense, setAddingLicense] = useState(false);
    const [localUser, setLocalUser] = useState(user);
    const [clubs, setClubs] = useState([]);
    const [joiningClub, setJoiningClub] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviting, setInviting] = useState(false);
    const [inviteMsg, setInviteMsg] = useState('');

    // For coach-viewed profiles, use local state
    const displayUser = isOwnProfile ? user : localUser;
    const editable = isOwnProfile || canEdit;

    // API prefix: own profile uses /user/, coach uses /coach/students/{id}/
    const apiPrefix = isOwnProfile ? '/user' : `/coach/students/${user.id}`;

    const showClubPicker = isOwnProfile && !displayUser.club_id;

    useEffect(() => {
        if (showClubPicker) {
            apiRequest('/user/clubs').then(setClubs).catch(() => {});
        }
    }, [showClubPicker]);

    const handleDelete = async (type, id) => {
        // Instant UI update
        const updateFn = prev => ({
            ...prev,
            [type]: (prev[type] || []).filter(item => item.id !== id),
        });

        if (isOwnProfile && onUpdateUser) {
            onUpdateUser(updateFn);
        } else {
            setLocalUser(updateFn);
        }

        try {
            let deletePrefix = apiPrefix;
            if (type === 'licenses' && !isOwnProfile) {
                deletePrefix = `/coach/coaches/${user.id}`;
            }
            await apiRequest(`${deletePrefix}/${type}/${id}`, { method: 'DELETE' });
        } catch {
            if (onUpdate) onUpdate();
        }
    };

    const handleBeltAdded = (newBelt) => {
        setAddingBelt(false);
        if (isOwnProfile && onUpdateUser) {
            onUpdateUser(prev => ({ ...prev, belts: [...(prev.belts || []), newBelt] }));
        } else {
            setLocalUser(prev => ({ ...prev, belts: [...(prev.belts || []), newBelt] }));
        }
    };

    const handleBeltUpdated = (updatedBelt) => {
        setEditingBelt(null);
        const updateFn = prev => ({
            ...prev,
            belts: (prev.belts || []).map(b => b.id === updatedBelt.id ? updatedBelt : b),
        });
        if (isOwnProfile && onUpdateUser) {
            onUpdateUser(updateFn);
        } else {
            setLocalUser(updateFn);
        }
    };

    const handleCompetitionAdded = (newComp) => {
        setAddingCompetition(false);
        if (isOwnProfile && onUpdateUser) {
            onUpdateUser(prev => ({ ...prev, competitions: [...(prev.competitions || []), newComp] }));
        } else {
            setLocalUser(prev => ({ ...prev, competitions: [...(prev.competitions || []), newComp] }));
        }
    };

    const BELT_ORDER = { yellow: 1, orange: 2, green: 3, blue: 4, brown: 5, black: 6 };
    const belts = [...(displayUser.belts || [])].sort((a, b) => (BELT_ORDER[a.color] || 99) - (BELT_ORDER[b.color] || 99));
    const licenses = displayUser.licenses || [];
    const showLicenses = displayUser.role === 'coach' || displayUser.role === 'admin';
    const licenseApiPrefix = isOwnProfile ? '/user' : `/coach/coaches/${user.id}`;
    const competitions = displayUser.competitions || [];
    const quizResults = displayUser.quiz_results || [];

    return (
        <>
            <ProfileCard>
                <ProfileHeader>
                    <Avatar>
                        {displayUser.photo_url
                            ? <img src={getFullPhotoURL(displayUser.photo_url)} alt={displayUser.name} />
                            : displayUser.name?.charAt(0)?.toUpperCase()
                        }
                    </Avatar>
                    <ProfileInfo>
                        <Name>{displayUser.name} <RoleBadge role={displayUser.role}>{displayUser.role}</RoleBadge></Name>
                        {displayUser.club && (
                            <Bio style={{ color: displayUser.club_status === 'pending' ? '#f59e0b' : '#667eea', fontSize: '0.85rem', margin: '0.2rem 0' }}>
                                <a href="/account?tab=club" style={{ color: 'inherit', textDecoration: 'none' }}
                                    onMouseOver={e => e.target.style.textDecoration = 'underline'}
                                    onMouseOut={e => e.target.style.textDecoration = 'none'}
                                >{displayUser.club.name}</a>
                                {displayUser.club_status === 'pending' && ' — waiting for approval'}
                            </Bio>
                        )}
                    </ProfileInfo>
                    {editable && (
                        <EditBtn onClick={() => setEditingProfile(true)}>
                            <FiEdit2 size={14} /> Edit
                        </EditBtn>
                    )}
                </ProfileHeader>

                {canEdit && !displayUser.has_password && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                        {inviteMsg ? (
                            <span style={{ color: inviteMsg === 'Invite sent!' ? '#4ade80' : '#ff6b6b', fontSize: '0.85rem' }}>{inviteMsg}</span>
                        ) : !showInvite ? (
                            <span
                                onClick={() => { setShowInvite(true); setInviteEmail(displayUser.email || ''); }}
                                style={{ color: '#667eea', fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                                Invite to JudoQuiz
                            </span>
                        ) : (
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    placeholder="Enter student's email"
                                    autoFocus
                                    style={{
                                        flex: 1, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: '8px', padding: '0.6rem 0.8rem', color: '#fff', fontSize: '0.9rem', outline: 'none',
                                    }}
                                />
                                <AddBtn onClick={async () => {
                                    if (!inviteEmail) return;
                                    setInviting(true);
                                    try {
                                        await apiRequest(`/coach/students/${user.id}/invite`, {
                                            method: 'POST',
                                            body: JSON.stringify({ email: inviteEmail }),
                                        });
                                        setInviteMsg('Invite sent!');
                                    } catch (err) {
                                        setInviteMsg(err.message || 'Failed');
                                    }
                                    setInviting(false);
                                }} disabled={inviting || !inviteEmail} style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                    {inviting ? 'Sending...' : 'Send Invite'}
                                </AddBtn>
                            </div>
                        )}
                    </div>
                )}
            </ProfileCard>

            {showClubPicker && clubs.length > 0 && (
                <ProfileCard>
                    <Section>
                        <SectionHeader>
                            <SectionTitle>Join a Club</SectionTitle>
                        </SectionHeader>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                id="club-select"
                                style={{
                                    flex: 1, background: 'rgba(255,255,255,0.08)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '10px', padding: '0.8rem 1rem',
                                    color: '#fff', fontSize: '1rem', outline: 'none',
                                }}
                                defaultValue=""
                            >
                                <option value="" disabled style={{ background: '#1a1a2e' }}>Select a club...</option>
                                {clubs.map(club => (
                                    <option key={club.id} value={club.id} style={{ background: '#1a1a2e' }}>{club.name}</option>
                                ))}
                            </select>
                            <AddBtn onClick={async () => {
                                const sel = document.getElementById('club-select');
                                if (!sel.value) return;
                                setJoiningClub(true);
                                try {
                                    await apiRequest('/user/join-club', {
                                        method: 'POST',
                                        body: JSON.stringify({ club_id: parseInt(sel.value) }),
                                    });
                                    if (onUpdate) onUpdate();
                                } catch {}
                                setJoiningClub(false);
                            }} disabled={joiningClub} style={{ padding: '0.8rem 1.2rem', whiteSpace: 'nowrap' }}>
                                {joiningClub ? 'Joining...' : 'Join'}
                            </AddBtn>
                        </div>
                    </Section>
                </ProfileCard>
            )}

            {editingProfile && (
                <ProfileEditForm
                    user={displayUser}
                    apiPrefix={isOwnProfile ? '/user' : `/coach/students/${user.id}`}
                    isOwnProfile={isOwnProfile}
                    onClose={() => setEditingProfile(false)}
                    onSave={(updatedFields) => {
                        setEditingProfile(false);
                        if (isOwnProfile && onUpdateUser && updatedFields) {
                            onUpdateUser(prev => ({ ...prev, ...updatedFields }));
                        } else if (updatedFields) {
                            setLocalUser(prev => ({ ...prev, ...updatedFields }));
                        } else if (onUpdate) {
                            onUpdate();
                        }
                    }}
                />
            )}

            <ProfileCard>
                <Section>
                    <SectionHeader>
                        <SectionTitle>Competitions</SectionTitle>
                        {editable && (
                            <AddBtn onClick={() => setAddingCompetition(true)}>
                                <FiPlus size={14} /> Add
                            </AddBtn>
                        )}
                    </SectionHeader>
                    {competitions.length > 0 ? (
                        <TableWrap>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Competition</Th>
                                    <Th>Date</Th>
                                    <Th>Result</Th>
                                    {editable && <Th></Th>}
                                </tr>
                            </thead>
                            <tbody>
                                {competitions.map(comp => (
                                    <tr key={comp.id}>
                                        <Td>
                                            {comp.link
                                                ? <a href={comp.link} target="_blank" rel="noopener noreferrer" style={{color: '#667eea', textDecoration: 'none'}}>{comp.name}</a>
                                                : comp.name
                                            }
                                        </Td>
                                        <Td>{comp.date}</Td>
                                        <Td><ResultBadge result={comp.result}>{comp.result}</ResultBadge></Td>
                                        {editable && (
                                            <Td>
                                                <DeleteBtn onClick={() => handleDelete('competitions', comp.id)}>
                                                    <FiTrash2 size={13} />
                                                </DeleteBtn>
                                            </Td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        </TableWrap>
                    ) : (
                        <EmptyState>No competitions recorded yet</EmptyState>
                    )}
                </Section>
            </ProfileCard>

            {addingCompetition && (
                <AddCompetitionForm
                    apiPrefix={apiPrefix}
                    onClose={() => setAddingCompetition(false)}
                    onSave={handleCompetitionAdded}
                />
            )}

            {showLicenses && (
                <ProfileCard>
                    <Section>
                        <SectionHeader>
                            <SectionTitle>Licenses</SectionTitle>
                            {editable && (
                                <AddBtn onClick={() => setAddingLicense(true)}>
                                    <FiPlus size={14} /> Add License
                                </AddBtn>
                            )}
                        </SectionHeader>
                        {licenses.length > 0 ? (
                            <TableWrap>
                            <Table>
                                <thead>
                                    <tr>
                                        <Th>License</Th>
                                        <Th>Issued</Th>
                                        <Th>Expires</Th>
                                        {editable && <Th></Th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {licenses.map(lic => {
                                        const isExpired = lic.expires_at && new Date(lic.expires_at) < new Date();
                                        return (
                                            <tr key={lic.id}>
                                                <Td>{lic.name}</Td>
                                                <Td>{lic.issued_at}</Td>
                                                <Td style={{ color: isExpired ? '#ff6b6b' : undefined }}>
                                                    {lic.expires_at || 'No expiry'}
                                                    {isExpired && ' (expired)'}
                                                </Td>
                                                {editable && (
                                                    <Td>
                                                        <DeleteBtn onClick={() => handleDelete('licenses', lic.id)}>
                                                            <FiTrash2 size={13} />
                                                        </DeleteBtn>
                                                    </Td>
                                                )}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                            </TableWrap>
                        ) : (
                            <EmptyState>No licenses yet</EmptyState>
                        )}
                    </Section>
                </ProfileCard>
            )}

            {addingLicense && (
                <AddLicenseForm
                    apiPrefix={licenseApiPrefix}
                    onClose={() => setAddingLicense(false)}
                    onSave={(newLic) => {
                        setAddingLicense(false);
                        const updateFn = prev => ({ ...prev, licenses: [...(prev.licenses || []), newLic] });
                        if (isOwnProfile && onUpdateUser) onUpdateUser(updateFn);
                        else setLocalUser(updateFn);
                    }}
                />
            )}

            <ProfileCard>
                <Section>
                    <SectionHeader>
                        <SectionTitle>Belts</SectionTitle>
                        {editable && (
                            <AddBtn onClick={() => setAddingBelt(true)}>
                                <FiPlus size={14} /> Add Belt
                            </AddBtn>
                        )}
                    </SectionHeader>
                    {belts.length > 0 ? (
                        <BeltList>
                            {belts.map(belt => (
                                <BeltItem key={belt.id} color={belt.color} onClick={() => setEditingBelt(belt)}>
                                    <BeltText>{belt.color}</BeltText>
                                    <BeltDate style={{ display: 'block' }}>{belt.graduation_date}</BeltDate>
                                    {belt.examiner_name && <BeltDate style={{ display: 'block', fontSize: '0.7rem', opacity: 0.6 }}>by {belt.examiner_name}</BeltDate>}
                                </BeltItem>
                            ))}
                        </BeltList>
                    ) : (
                        <EmptyState>No belts recorded yet</EmptyState>
                    )}
                </Section>
            </ProfileCard>

            {addingBelt && (
                <AddBeltForm
                    apiPrefix={apiPrefix}
                    onClose={() => setAddingBelt(false)}
                    onSave={handleBeltAdded}
                />
            )}

            {editingBelt && (
                <EditBeltModal
                    belt={editingBelt}
                    editable={editable}
                    apiPrefix={apiPrefix}
                    onClose={() => setEditingBelt(null)}
                    onSave={handleBeltUpdated}
                    onDelete={(id) => { setEditingBelt(null); handleDelete('belts', id); }}
                />
            )}

            <ProfileCard>
                <Section>
                    <SectionHeader>
                        <SectionTitle>Quiz Results</SectionTitle>
                    </SectionHeader>
                    {quizResults.length > 0 ? (
                        <TableWrap>
                        <Table>
                            <thead>
                                <tr>
                                    <Th>Date</Th>
                                    <Th>Belt</Th>
                                    <Th>Score</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {quizResults.map(qr => (
                                    <tr key={qr.id}>
                                        <Td>{new Date(qr.created_at).toLocaleDateString()}</Td>
                                        <Td style={{ textTransform: 'capitalize' }}>{qr.belt}</Td>
                                        <Td>{qr.correct_answers}/{qr.total_questions}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        </TableWrap>
                    ) : (
                        <EmptyState>No quiz results yet. Take a quiz to see your results here!</EmptyState>
                    )}
                </Section>
            </ProfileCard>

        </>
    );
};

const Overlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    padding: 1rem;
`;

const Modal = styled.div`
    background: #1a1a2e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 16px;
    padding: 2rem;
    width: 100%;
    max-width: 420px;
`;

const ModalTitle = styled.h3`
    color: #ffffff;
    margin: 0 0 1.5rem 0;
    font-family: 'Inter', sans-serif;
`;

const ModalLabel = styled.label`
    color: #a0a0a0;
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
    display: block;
`;

const ModalInput = styled.input`
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
    &::-webkit-calendar-picker-indicator { filter: invert(1); }
`;

const ModalSelect = styled.select`
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
    option { background: #1a1a2e; }
`;

const ModalForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const ModalBtnRow = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-top: 0.5rem;
`;

const ModalSaveBtn = styled.button`
    flex: 1;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    &:hover { opacity: 0.9; }
    &:disabled { opacity: 0.5; }
`;

const ModalCancelBtn = styled.button`
    flex: 1;
    background: rgba(255, 255, 255, 0.08);
    color: #a0a0a0;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 0.8rem;
    cursor: pointer;
    &:hover { border-color: #667eea; color: #fff; }
`;

const ModalDeleteBtn = styled.button`
    background: rgba(255, 107, 107, 0.15);
    border: 1px solid rgba(255, 107, 107, 0.3);
    color: #ff6b6b;
    border-radius: 10px;
    padding: 0.8rem;
    cursor: pointer;
    font-weight: 500;
    &:hover { background: rgba(255, 107, 107, 0.25); }
`;

const BeltBig = styled.div`
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: ${p => BELT_COLORS[p.color] || '#444'};
    margin: 0 auto 1rem;
    border: 3px solid rgba(255, 255, 255, 0.2);
`;

const InfoRow = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const InfoLabel = styled.span`
    color: #a0a0a0;
    font-size: 0.9rem;
`;

const InfoValue = styled.span`
    color: #ffffff;
    font-size: 0.9rem;
    text-transform: capitalize;
`;

const BELT_OPTIONS_MODAL = ['yellow', 'orange', 'green', 'blue', 'brown', 'black'];

const DeleteConfirmText = styled.p`
    color: #ff6b6b;
    text-align: center;
    font-size: 0.95rem;
    margin: 1rem 0;
`;

const EditBeltModal = ({ belt, editable, apiPrefix, onClose, onSave, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [color, setColor] = useState(belt.color);
    const [graduationDate, setGraduationDate] = useState(belt.graduation_date);
    const [examinerId, setExaminerId] = useState(belt.examiner_id ? String(belt.examiner_id) : (belt.examiner_name ? 'other' : ''));
    const [customExaminer, setCustomExaminer] = useState(belt.examiner_name || '');
    const [coaches, setCoaches] = useState([]);
    const [saving, setSaving] = useState(false);
    React.useEffect(() => {
        if (editing) {
            apiRequest('/user/club-coaches').then(setCoaches).catch(() => {});
        }
    }, [editing]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiRequest(`${apiPrefix}/belts/${belt.id}`, { method: 'DELETE' });
            const body = { color, graduation_date: graduationDate };
            if (examinerId === 'other') {
                body.examiner_name = customExaminer;
            } else if (examinerId) {
                body.examiner_id = parseInt(examinerId);
            }
            const newBelt = await apiRequest(`${apiPrefix}/belts`, {
                method: 'POST',
                body: JSON.stringify(body),
            });
            onSave(newBelt);
        } catch {
            setSaving(false);
        }
    };

    if (editing && editable) {
        return (
            <Overlay onClick={onClose}>
                <Modal onClick={e => e.stopPropagation()}>
                    <ModalTitle>Edit Belt</ModalTitle>
                    <ModalForm onSubmit={handleSave}>
                        <div>
                            <ModalLabel>Belt Color</ModalLabel>
                            <ModalSelect value={color} onChange={e => setColor(e.target.value)}>
                                {BELT_OPTIONS_MODAL.map(b => (
                                    <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
                                ))}
                            </ModalSelect>
                        </div>
                        <div>
                            <ModalLabel>Graduation Date</ModalLabel>
                            <ModalInput type="date" value={graduationDate} onChange={e => setGraduationDate(e.target.value)} required />
                        </div>
                        <div>
                            <ModalLabel>Examiner</ModalLabel>
                            <ModalSelect value={examinerId} onChange={e => setExaminerId(e.target.value)}>
                                <option value="">Not specified</option>
                                {coaches.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                                <option value="other">Other (type name)...</option>
                            </ModalSelect>
                            {examinerId === 'other' && (
                                <ModalInput
                                    value={customExaminer}
                                    onChange={e => setCustomExaminer(e.target.value)}
                                    placeholder="Examiner name"
                                    style={{ marginTop: '0.5rem' }}
                                />
                            )}
                        </div>
                        <ModalBtnRow>
                            <ModalCancelBtn type="button" onClick={() => setEditing(false)}>Cancel</ModalCancelBtn>
                            <ModalSaveBtn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</ModalSaveBtn>
                        </ModalBtnRow>
                    </ModalForm>
                </Modal>
            </Overlay>
        );
    }

    if (confirmDelete) {
        return (
            <Overlay onClick={onClose}>
                <Modal onClick={e => e.stopPropagation()}>
                    <BeltBig color={belt.color} />
                    <ModalTitle style={{ textAlign: 'center' }}>Delete Belt?</ModalTitle>
                    <DeleteConfirmText>
                        Are you sure you want to remove the <strong style={{ textTransform: 'capitalize' }}>{belt.color}</strong> belt
                        from {belt.graduation_date}? This action cannot be undone.
                    </DeleteConfirmText>
                    <ModalBtnRow>
                        <ModalCancelBtn onClick={() => setConfirmDelete(false)}>Cancel</ModalCancelBtn>
                        <ModalDeleteBtn onClick={() => onDelete(belt.id)}>Yes, Delete</ModalDeleteBtn>
                    </ModalBtnRow>
                </Modal>
            </Overlay>
        );
    }

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <BeltBig color={belt.color} />
                <ModalTitle style={{ textAlign: 'center', textTransform: 'capitalize' }}>{belt.color} Belt</ModalTitle>
                <InfoRow>
                    <InfoLabel>Graduation Date</InfoLabel>
                    <InfoValue>{belt.graduation_date}</InfoValue>
                </InfoRow>
                {belt.examiner_name && (
                    <InfoRow>
                        <InfoLabel>Examiner</InfoLabel>
                        <InfoValue>{belt.examiner_name}</InfoValue>
                    </InfoRow>
                )}
                <ModalBtnRow style={{ marginTop: '1.5rem' }}>
                    <ModalCancelBtn onClick={onClose}>Close</ModalCancelBtn>
                    {editable && (
                        <ModalSaveBtn onClick={() => setEditing(true)}>Edit</ModalSaveBtn>
                    )}
                </ModalBtnRow>
                {editable && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <span
                            onClick={() => setConfirmDelete(true)}
                            style={{ color: '#666', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                            Delete this belt
                        </span>
                    </div>
                )}
            </Modal>
        </Overlay>
    );
};

export default StudentProfile;
