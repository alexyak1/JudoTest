import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiChevronDown, FiChevronUp, FiTrash2, FiCalendar, FiEdit2 } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const StatRow = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const StatCard = styled.div`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 0.8rem;
    text-align: center;
`;

const StatValue = styled.div`
    color: ${p => p.color || '#fff'};
    font-size: 1.8rem;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
`;

const StatLabel = styled.div`
    color: #888;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.2rem;
`;

const Card = styled.div`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    margin-bottom: 0.8rem;
    @media (max-width: 768px) { padding: 1rem; }
`;

const FilterRow = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 1rem;
`;

const FilterBtn = styled.button`
    background: ${p => p.active ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.04)'};
    border: 1px solid ${p => p.active ? 'rgba(102, 126, 234, 0.4)' : 'rgba(255, 255, 255, 0.08)'};
    color: ${p => p.active ? '#667eea' : '#888'};
    border-radius: 6px;
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { border-color: rgba(102, 126, 234, 0.4); color: #667eea; }
`;

const DateInput = styled.input`
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0.35rem 0.6rem;
    color: #fff;
    font-size: 0.8rem;
    outline: none;
    &:focus { border-color: #667eea; }
    &::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; }
`;

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
    &:hover { background: rgba(102, 126, 234, 0.25); }
`;

const CompRow = styled.div`
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    margin-bottom: 0.4rem;
    overflow: hidden;
`;

const CompHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.8rem;
    cursor: pointer;
    &:hover { background: rgba(255, 255, 255, 0.02); }
`;

const CompName = styled.span`
    color: #fff;
    font-weight: 500;
    font-size: 0.9rem;
`;

const CompDate = styled.span`
    color: #888;
    font-size: 0.8rem;
    margin-left: 0.5rem;
`;

const CompDetails = styled.div`
    padding: 0 0.8rem 0.8rem;
`;

const CompLink = styled.a`
    color: #667eea;
    font-size: 0.75rem;
    text-decoration: none;
    &:hover { text-decoration: underline; }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 300px;
`;

const Th = styled.th`
    color: #666;
    font-weight: 500;
    text-align: left;
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.7rem;
    text-transform: uppercase;
`;

const Td = styled.td`
    color: #ddd;
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    font-size: 0.8rem;
`;

const ResultSelect = styled.select`
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0.2rem 0.4rem;
    color: #fff;
    font-size: 0.8rem;
    outline: none;
    option { background: #1a1a2e; }
`;

const MedalDot = styled.span`
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.3rem;
    background: ${p => p.color};
`;

const EmptyState = styled.p`
    color: #555;
    font-style: italic;
    font-size: 0.8rem;
    margin: 0.3rem 0;
`;

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
    max-width: 520px;
    max-height: 90vh;
    overflow-y: auto;
    @media (max-width: 768px) { padding: 1.2rem; }
`;

const ModalTitle = styled.h3`
    color: #ffffff;
    margin: 0 0 1.5rem 0;
    font-family: 'Inter', sans-serif;
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
    &::-webkit-calendar-picker-indicator { filter: invert(1); }
`;

const Label = styled.label`
    color: #a0a0a0;
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
    display: block;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const ButtonRow = styled.div`
    display: flex;
    gap: 0.8rem;
    margin-top: 0.5rem;
`;

const SaveBtn = styled.button`
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

const CancelBtn = styled.button`
    flex: 1;
    background: rgba(255, 255, 255, 0.08);
    color: #a0a0a0;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 0.8rem;
    cursor: pointer;
    &:hover { border-color: #667eea; color: #fff; }
`;

const ClubPage = () => {
    const { user, isCoach, isAdmin } = useAuth();
    const canEdit = isCoach || isAdmin;
    const [stats, setStats] = useState(null);
    const [competitions, setCompetitions] = useState([]);
    const [expandedComp, setExpandedComp] = useState(null);
    const [showCompForm, setShowCompForm] = useState(false);
    const [editingComp, setEditingComp] = useState(null);
    const [confirmRemoveParticipant, setConfirmRemoveParticipant] = useState(null);
    const [confirmDeleteComp, setConfirmDeleteComp] = useState(null);
    const [clubMembers, setClubMembers] = useState([]);
    const [filter, setFilter] = useState('year');
    const [dateFrom, setDateFrom] = useState(`${new Date().getFullYear()}-01-01`);
    const [dateTo, setDateTo] = useState(`${new Date().getFullYear()}-12-31`);

    const fetchData = () => {
        let params = '';
        if (filter === 'year') {
            params = `?from=${new Date().getFullYear()}-01-01&to=${new Date().getFullYear()}-12-31`;
        } else if (filter === 'custom' && dateFrom && dateTo) {
            params = `?from=${dateFrom}&to=${dateTo}`;
        }

        const statsEndpoint = isAdmin ? `/coach/club-stats${params}` : `/user/club-stats${params}`;
        const compsEndpoint = isAdmin ? '/coach/competitions' : '/user/club-competitions-full';
        apiRequest(statsEndpoint).then(setStats).catch(() => {});
        apiRequest(compsEndpoint).then(setCompetitions).catch(() => {});
        if (canEdit && clubMembers.length === 0) {
            Promise.all([
                apiRequest('/coach/students').catch(() => []),
                apiRequest('/coach/club-coaches').catch(() => []),
            ]).then(([students, coaches]) => {
                setClubMembers([
                    ...coaches.map(c => ({ ...c, _type: 'coach' })),
                    ...students.map(s => ({ ...s, _type: 'student' })),
                ]);
            });
        }
    };

    useEffect(() => { fetchData(); }, [filter, dateFrom, dateTo]);

    const handleResultChange = async (compId, newResult) => {
        try {
            await apiRequest(`/coach/competitions/${compId}/result`, {
                method: 'PUT',
                body: JSON.stringify({ result: newResult }),
            });
            fetchData();
        } catch {}
    };

    const handleCategoryChange = async (compId, newCategory) => {
        try {
            await apiRequest(`/coach/competitions/${compId}/category`, {
                method: 'PUT',
                body: JSON.stringify({ category: newCategory }),
            });
        } catch {}
    };

    const handleRemove = async (compId) => {
        try {
            await apiRequest(`/coach/competitions/${compId}`, { method: 'DELETE' });
            fetchData();
        } catch {}
    };

    // Group competitions
    const grouped = (() => {
        const compMap = {};
        competitions.forEach(comp => {
            const key = `${comp.name}_${comp.date}`;
            if (!compMap[key]) {
                compMap[key] = { name: comp.name, date: comp.date, link: comp.link, deleted: comp.deleted, participants: [] };
            }
            if (comp.deleted) compMap[key].deleted = true;
            if (comp.user_id && comp.user_id !== 0) {
                compMap[key].participants.push({
                    ...comp,
                    studentName: comp.user_name,
                    studentId: comp.user_id,
                });
            }
        });
        return Object.values(compMap).sort((a, b) => b.date.localeCompare(a.date));
    })();

    // Filter competitions for display based on date
    const filteredGrouped = filter === 'all' ? grouped : grouped.filter(c => {
        if (filter === 'year') {
            return c.date.startsWith(String(new Date().getFullYear()));
        }
        if (filter === 'custom') {
            return (!dateFrom || c.date >= dateFrom) && (!dateTo || c.date <= dateTo);
        }
        return true;
    });

    return (
        <>
            <Card>
                <SectionHeader>
                    <SectionTitle>{user?.club?.name || 'Club'} Statistics</SectionTitle>
                </SectionHeader>

                <FilterRow>
                    <FiCalendar size={14} color="#888" />
                    <FilterBtn active={filter === 'year'} onClick={() => setFilter('year')}>
                        {new Date().getFullYear()}
                    </FilterBtn>
                    <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
                        All time
                    </FilterBtn>
                    <FilterBtn active={filter === 'custom'} onClick={() => setFilter('custom')}>
                        Custom
                    </FilterBtn>
                    {filter === 'custom' && (
                        <>
                            <DateInput type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                            <span style={{ color: '#666' }}>-</span>
                            <DateInput type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </>
                    )}
                </FilterRow>

                {stats && (
                    <StatRow>
                        <StatCard>
                            <StatValue>{stats.total_competitions}</StatValue>
                            <StatLabel>Events</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#ffd700">{stats.gold}</StatValue>
                            <StatLabel><MedalDot color="#ffd700" />Gold</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#c0c0c0">{stats.silver}</StatValue>
                            <StatLabel><MedalDot color="#c0c0c0" />Silver</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#cd7f32">{stats.bronze}</StatValue>
                            <StatLabel><MedalDot color="#cd7f32" />Bronze</StatLabel>
                        </StatCard>
                    </StatRow>
                )}
            </Card>

            <Card>
                <SectionHeader>
                    <SectionTitle>Competitions ({filteredGrouped.length})</SectionTitle>
                    {canEdit && (
                        <AddBtn onClick={() => setShowCompForm(true)}>
                            <FiPlus size={12} /> Add Competition
                        </AddBtn>
                    )}
                </SectionHeader>

                {filteredGrouped.length > 0 ? (
                    filteredGrouped.map((comp, idx) => (
                        <CompRow key={idx}>
                            <CompHeader onClick={() => setExpandedComp(expandedComp === idx ? null : idx)}>
                                <div>
                                    <CompName style={comp.deleted ? { opacity: 0.4, textDecoration: 'line-through' } : {}}>{comp.name}</CompName>
                                    <CompDate>{comp.date}</CompDate>
                                    {comp.deleted && <span style={{ color: '#ff6b6b', fontSize: '0.7rem', marginLeft: '0.4rem' }}>deleted</span>}
                                    <span style={{ color: '#555', fontSize: '0.75rem', marginLeft: '0.4rem' }}>
                                        ({comp.participants.length})
                                    </span>
                                </div>
                                {expandedComp === idx ? <FiChevronUp color="#888" size={16} /> : <FiChevronDown color="#888" size={16} />}
                            </CompHeader>
                            {expandedComp === idx && (
                                <CompDetails>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                                        {comp.link ? <CompLink href={comp.link} target="_blank" rel="noopener noreferrer">{comp.link}</CompLink> : <span />}
                                        {canEdit && !comp.deleted && (
                                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                                <span onClick={(e) => { e.stopPropagation(); setEditingComp(comp); }} style={{ color: '#888', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <FiEdit2 size={12} /> Edit
                                                </span>
                                                <span onClick={(e) => { e.stopPropagation(); setConfirmDeleteComp(comp); }} style={{ color: '#666', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                    <FiTrash2 size={12} /> Delete
                                                </span>
                                            </div>
                                        )}
                                        {comp.deleted && isAdmin && (
                                            <span onClick={async (e) => {
                                                e.stopPropagation();
                                                try {
                                                    await apiRequest('/coach/competitions/restore-event', {
                                                        method: 'POST',
                                                        body: JSON.stringify({ name: comp.name, date: comp.date }),
                                                    });
                                                    fetchData();
                                                } catch {}
                                            }} style={{ color: '#4ade80', cursor: 'pointer', fontSize: '0.8rem' }}>
                                                Restore
                                            </span>
                                        )}
                                    </div>
                                    <Table>
                                        <thead>
                                            <tr>
                                                <Th>Name</Th>
                                                <Th>Category</Th>
                                                <Th>Result</Th>
                                                {canEdit && <Th></Th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comp.participants.map(p => (
                                                <tr key={p.id}>
                                                    <Td>{p.studentName}</Td>
                                                    <Td>
                                                        {canEdit ? (
                                                            <input
                                                                defaultValue={p.category || ''}
                                                                placeholder="-"
                                                                onBlur={e => {
                                                                    if (e.target.value !== (p.category || '')) {
                                                                        handleCategoryChange(p.id, e.target.value);
                                                                    }
                                                                }}
                                                                onKeyDown={e => e.key === 'Enter' && e.target.blur()}
                                                                style={{
                                                                    background: 'transparent', border: 'none',
                                                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                                                    color: '#ddd', fontSize: '0.8rem', padding: '0.1rem 0',
                                                                    outline: 'none', width: '70px',
                                                                }}
                                                            />
                                                        ) : (
                                                            <span style={{ color: '#ddd', fontSize: '0.8rem' }}>{p.category || '-'}</span>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        {canEdit ? (
                                                            <ResultSelect value={p.result} onChange={e => handleResultChange(p.id, e.target.value)}>
                                                                <option value="participated">Participated</option>
                                                                <option value="gold">Gold</option>
                                                                <option value="silver">Silver</option>
                                                                <option value="bronze">Bronze</option>
                                                            </ResultSelect>
                                                        ) : (
                                                            <span style={{ color: '#ddd', fontSize: '0.8rem', textTransform: 'capitalize' }}>{p.result}</span>
                                                        )}
                                                    </Td>
                                                    {canEdit && (
                                                        <Td>
                                                            <span onClick={() => setConfirmRemoveParticipant({ id: p.id, name: p.studentName, isLast: comp.participants.length === 1 })} style={{ color: '#555', cursor: 'pointer' }} title="Remove">
                                                                <FiTrash2 size={12} />
                                                            </span>
                                                        </Td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    {canEdit && (() => {
                                        const participantIds = comp.participants.map(p => p.studentId);
                                        const available = clubMembers.filter(m => !participantIds.includes(m.id));
                                        if (available.length === 0) return null;
                                        return (
                                            <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.6rem', alignItems: 'center' }}>
                                                <select id={`add-part-${idx}`} style={{
                                                    flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                                                    borderRadius: '6px', padding: '0.35rem 0.5rem', color: '#fff', fontSize: '0.8rem', outline: 'none',
                                                }}>
                                                    <option value="" style={{ background: '#1a1a2e' }}>Add participant...</option>
                                                    {available.map(m => (
                                                        <option key={m.id} value={m.id} style={{ background: '#1a1a2e' }}>{m.name}{m._type === 'coach' ? ' (coach)' : ''}</option>
                                                    ))}
                                                </select>
                                                <AddBtn onClick={async () => {
                                                    const sel = document.getElementById(`add-part-${idx}`);
                                                    if (!sel.value) return;
                                                    try {
                                                        await apiRequest('/coach/competitions', {
                                                            method: 'POST',
                                                            body: JSON.stringify({ name: comp.name, date: comp.date, link: comp.link || '', student_ids: [parseInt(sel.value)] }),
                                                        });
                                                        fetchData();
                                                    } catch {}
                                                }} style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}>
                                                    <FiPlus size={12} /> Add
                                                </AddBtn>
                                            </div>
                                        );
                                    })()}
                                </CompDetails>
                            )}
                        </CompRow>
                    ))
                ) : (
                    <EmptyState>No competitions for this period</EmptyState>
                )}
            </Card>

            {showCompForm && (
                <CompForm onClose={() => setShowCompForm(false)} onSave={() => { setShowCompForm(false); fetchData(); }} />
            )}

            {confirmDeleteComp && (
                <Overlay onClick={() => setConfirmDeleteComp(null)}>
                    <Modal onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
                        <ModalTitle>Delete Competition</ModalTitle>
                        <p style={{ color: '#ff6b6b', margin: '0 0 1.5rem' }}>
                            Delete <strong style={{ color: '#fff' }}>{confirmDeleteComp.name}</strong> ({confirmDeleteComp.date}) and all its participants?
                        </p>
                        <ButtonRow>
                            <CancelBtn type="button" onClick={() => setConfirmDeleteComp(null)}>Cancel</CancelBtn>
                            <button
                                onClick={async () => {
                                    try {
                                        await apiRequest('/coach/competitions/delete-event', {
                                            method: 'POST',
                                            body: JSON.stringify({ name: confirmDeleteComp.name, date: confirmDeleteComp.date }),
                                        });
                                        fetchData();
                                    } catch {}
                                    setConfirmDeleteComp(null);
                                }}
                                style={{
                                    flex: 1, padding: '0.8rem', fontWeight: 600,
                                    background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.3)',
                                    color: '#ff6b6b', borderRadius: '10px', cursor: 'pointer',
                                }}
                            >
                                Yes, Delete
                            </button>
                        </ButtonRow>
                    </Modal>
                </Overlay>
            )}

            {editingComp && (
                <EditCompForm comp={editingComp} onClose={() => setEditingComp(null)} onSave={() => { setEditingComp(null); fetchData(); }} />
            )}

            {confirmRemoveParticipant && (
                <Overlay onClick={() => setConfirmRemoveParticipant(null)}>
                    <Modal onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
                        <ModalTitle>Remove Participant</ModalTitle>
                        <p style={{ color: '#ff6b6b', margin: '0 0 1.5rem' }}>
                            Remove <strong style={{ color: '#fff' }}>{confirmRemoveParticipant.name}</strong> from this competition?
                        </p>
                        <ButtonRow>
                            <CancelBtn type="button" onClick={() => setConfirmRemoveParticipant(null)}>Cancel</CancelBtn>
                            <button
                                onClick={async () => {
                                    await handleRemove(confirmRemoveParticipant.id);
                                    setConfirmRemoveParticipant(null);
                                }}
                                style={{
                                    flex: 1, padding: '0.8rem', fontWeight: 600,
                                    background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.3)',
                                    color: '#ff6b6b', borderRadius: '10px', cursor: 'pointer',
                                }}
                            >
                                Yes, Remove
                            </button>
                        </ButtonRow>
                    </Modal>
                </Overlay>
            )}
        </>
    );
};

const CompForm = ({ onClose, onSave }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [link, setLink] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiRequest('/coach/competitions', {
                method: 'POST',
                body: JSON.stringify({ name, date, link, student_ids: [] }),
            });
            onSave();
        } catch {}
        setSaving(false);
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <ModalTitle>Add Competition</ModalTitle>
                <Form onSubmit={handleSubmit}>
                    <div>
                        <Label>Competition Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Västgötaserien 1 2026" required />
                    </div>
                    <div>
                        <Label>Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Link (optional)</Label>
                        <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://smoothcomp.com/..." />
                    </div>
                    <ButtonRow>
                        <CancelBtn type="button" onClick={onClose}>Cancel</CancelBtn>
                        <SaveBtn type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create'}</SaveBtn>
                    </ButtonRow>
                </Form>
            </Modal>
        </Overlay>
    );
};

const EditCompForm = ({ comp, onClose, onSave }) => {
    const [name, setName] = useState(comp.name);
    const [date, setDate] = useState(comp.date);
    const [link, setLink] = useState(comp.link || '');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiRequest('/coach/competitions/update-event', {
                method: 'PUT',
                body: JSON.stringify({ old_name: comp.name, old_date: comp.date, name, date, link }),
            });
            onSave();
        } catch {}
        setSaving(false);
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <ModalTitle>Edit Competition</ModalTitle>
                <Form onSubmit={handleSubmit}>
                    <div>
                        <Label>Competition Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Link</Label>
                        <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://smoothcomp.com/..." />
                    </div>
                    <ButtonRow>
                        <CancelBtn type="button" onClick={onClose}>Cancel</CancelBtn>
                        <SaveBtn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</SaveBtn>
                    </ButtonRow>
                </Form>
            </Modal>
        </Overlay>
    );
};

export default ClubPage;
