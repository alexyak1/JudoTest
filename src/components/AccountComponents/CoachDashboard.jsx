import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiChevronDown, FiChevronUp, FiTrash2, FiUserPlus } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import StudentProfile from './StudentProfile';
import ClubSection from './ClubSection';

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

const StudentGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    margin-top: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
`;

const StudentCard = styled.div`
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

const MiniAvatar = styled.div`
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
`;

const CardName = styled.div`
    color: #ffffff;
    font-weight: 600;
    font-family: 'Inter', sans-serif;
`;

const CardSub = styled.div`
    color: #a0a0a0;
    font-size: 0.85rem;
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
    transition: opacity 0.3s;
    &:hover { opacity: 0.85; }
`;

const EmptyState = styled.p`
    color: #666;
    font-style: italic;
`;

// Competition form styles
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

    @media (max-width: 768px) {
        padding: 1.2rem;
        border-radius: 12px;
        max-height: 85vh;
    }
`;

const ModalTitle = styled.h3`
    color: #ffffff;
    margin: 0 0 1.5rem 0;
    font-family: 'Inter', sans-serif;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

const Label = styled.label`
    color: #a0a0a0;
    font-size: 0.85rem;
    margin-bottom: 0.2rem;
    display: block;
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

const StudentCheckList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 200px;
    overflow-y: auto;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
`;

const CheckItem = styled.label`
    display: flex;
    align-items: center;
    gap: 0.6rem;
    color: ${p => p.checked ? '#ffffff' : '#a0a0a0'};
    cursor: pointer;
    padding: 0.4rem 0.5rem;
    border-radius: 6px;
    transition: all 0.2s;
    font-size: 0.9rem;

    &:hover { background: rgba(255, 255, 255, 0.05); }

    input {
        accent-color: #667eea;
        width: 16px;
        height: 16px;
    }
`;

const SelectAllBtn = styled.span`
    color: #667eea;
    font-size: 0.8rem;
    cursor: pointer;
    &:hover { text-decoration: underline; }
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
    &:disabled { opacity: 0.5; cursor: not-allowed; }
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

const ErrorMsg = styled.div`
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.2);
    border-radius: 8px;
    padding: 0.6rem;
    font-size: 0.85rem;
    text-align: center;
`;

const SuccessMsg = styled.div`
    color: #4ade80;
    font-size: 0.85rem;
    margin-top: 0.3rem;
`;

// Result editing
const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    margin-top: 0.5rem;
`;

const Th = styled.th`
    color: #a0a0a0;
    font-weight: 500;
    text-align: left;
    padding: 0.6rem 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    font-size: 0.85rem;
`;

const Td = styled.td`
    color: #ffffff;
    padding: 0.6rem 0.8rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    font-size: 0.9rem;
`;

const ResultSelect = styled.select`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    padding: 0.3rem 0.5rem;
    color: #ffffff;
    font-size: 0.85rem;
    outline: none;
    cursor: pointer;
    &:focus { border-color: #667eea; }
    option { background: #1a1a2e; }
`;

const ResultBadge = styled.span`
    padding: 0.15rem 0.5rem;
    border-radius: 10px;
    font-size: 0.8rem;
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

const CompRow = styled.div`
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    margin-bottom: 0.8rem;
    overflow: hidden;
`;

const CompHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 1rem;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: rgba(255, 255, 255, 0.03); }
`;

const CompName = styled.span`
    color: #ffffff;
    font-weight: 500;
`;

const CompDate = styled.span`
    color: #a0a0a0;
    font-size: 0.85rem;
    margin-left: 0.8rem;
`;

const CompDetails = styled.div`
    padding: 0 1rem 1rem;
`;

const CompLink = styled.a`
    color: #667eea;
    font-size: 0.8rem;
    text-decoration: none;
    &:hover { text-decoration: underline; }
`;

const RemoveBtn = styled.button`
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

const CoachDashboard = ({ studentId, onStudentChange }) => {
    const { user, refreshUser } = useAuth();
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCompForm, setShowCompForm] = useState(false);
    const [showAddStudent, setShowAddStudent] = useState(false);
    const [expandedComp, setExpandedComp] = useState(null);
    const [clubCoaches, setClubCoaches] = useState([]);

    const clubApproved = user?.club_status === 'approved';

    const fetchStudents = async () => {
        try {
            const data = await apiRequest('/coach/students');
            setStudents(data);
        } catch {
            // ignore
        }
        setLoading(false);
    };

    const fetchCoaches = () => {
        apiRequest('/coach/club-coaches').then(setClubCoaches).catch(() => {});
    };

    const refreshAll = () => {
        fetchStudents();
        fetchCoaches();
    };

    useEffect(() => { refreshAll(); }, []);

    // Load student from URL param on mount
    useEffect(() => {
        if (studentId && !selectedStudent) {
            apiRequest(`/coach/students/${studentId}`)
                .then(setSelectedStudent)
                .catch(() => {});
        }
    }, [studentId]);

    const [confirmRemove, setConfirmRemove] = useState(null); // { id, name }

    const removeStudent = async () => {
        if (!confirmRemove) return;
        try {
            await apiRequest(`/coach/remove-student/${confirmRemove.id}`, { method: 'DELETE' });
            setStudents(prev => prev.filter(s => s.id !== confirmRemove.id));
        } catch {
            // ignore
        }
        setConfirmRemove(null);
    };

    const viewStudent = async (id) => {
        if (onStudentChange) onStudentChange(id);
        try {
            const data = await apiRequest(`/coach/students/${id}`);
            setSelectedStudent(data);
        } catch {
            // ignore
        }
    };

    const handleResultChange = async (compId, newResult) => {
        try {
            await apiRequest(`/coach/competitions/${compId}/result`, {
                method: 'PUT',
                body: JSON.stringify({ result: newResult }),
            });
            refreshAll();
        } catch {
            // ignore
        }
    };

    const handleCategoryChange = async (compId, newCategory) => {
        try {
            await apiRequest(`/coach/competitions/${compId}/category`, {
                method: 'PUT',
                body: JSON.stringify({ category: newCategory }),
            });
            refreshAll();
        } catch {
            // ignore
        }
    };

    // Group competitions across students and coaches
    const getCompetitions = () => {
        const compMap = {};
        const addComps = (person) => {
            (person.competitions || []).forEach(comp => {
                const key = `${comp.name}_${comp.date}`;
                if (!compMap[key]) {
                    compMap[key] = { name: comp.name, date: comp.date, link: comp.link, participants: [] };
                }
                if (!compMap[key].participants.find(p => p.id === comp.id)) {
                    compMap[key].participants.push({
                        ...comp,
                        studentName: person.name,
                        studentId: person.id,
                    });
                }
            });
        };
        students.forEach(addComps);
        clubCoaches.forEach(addComps);
        return Object.values(compMap).sort((a, b) => b.date.localeCompare(a.date));
    };

    // All possible participants: students + coaches
    const allParticipants = [
        ...clubCoaches.map(c => ({ ...c, _type: 'coach' })),
        ...students.map(s => ({ ...s, _type: 'student' })),
    ];

    if (selectedStudent) {
        return (
            <>
                <BackBtn onClick={() => { setSelectedStudent(null); if (onStudentChange) onStudentChange(null); }}>Back to Students</BackBtn>
                <StudentProfile user={selectedStudent} isOwnProfile={false} canEdit={true} />
            </>
        );
    }

    if (!clubApproved) {
        return <ClubSection user={user} onClubChanged={refreshUser} />;
    }

    if (loading) return <EmptyState>Loading students...</EmptyState>;

    const competitions = getCompetitions();

    return (
        <>
            <Card>
                <SectionHeader>
                    <SectionTitle>Your Students</SectionTitle>
                    <AddBtn onClick={() => setShowAddStudent(true)}>
                        <FiPlus size={14} /> Add Student
                    </AddBtn>
                </SectionHeader>
                {students.length > 0 ? (
                    <StudentGrid>
                        {students.map(student => (
                            <StudentCard key={student.id} onClick={() => viewStudent(student.id)}>
                                <CardHeader>
                                    <MiniAvatar>{student.name?.charAt(0)?.toUpperCase()}</MiniAvatar>
                                    <div>
                                        <CardName>{student.name}</CardName>
                                        <CardSub>
                                            {(student.belts || []).length} belts | {(student.competitions || []).length} competitions
                                        </CardSub>
                                    </div>
                                    <RemoveBtn onClick={(e) => { e.stopPropagation(); setConfirmRemove({ id: student.id, name: student.name }); }} title="Remove student">
                                        <FiTrash2 size={14} />
                                    </RemoveBtn>
                                </CardHeader>
                            </StudentCard>
                        ))}
                    </StudentGrid>
                ) : (
                    <EmptyState>No students assigned yet</EmptyState>
                )}
            </Card>

            <Card>
                <SectionHeader>
                    <SectionTitle>Competitions</SectionTitle>
                    <AddBtn onClick={() => setShowCompForm(true)}>
                        <FiPlus size={14} /> Add Competition
                    </AddBtn>
                </SectionHeader>

                {competitions.length > 0 ? (
                    competitions.map((comp, idx) => (
                        <CompRow key={idx}>
                            <CompHeader onClick={() => setExpandedComp(expandedComp === idx ? null : idx)}>
                                <div>
                                    <CompName>{comp.name}</CompName>
                                    <CompDate>{comp.date}</CompDate>
                                    <span style={{ color: '#666', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                                        ({comp.participants.length} students)
                                    </span>
                                </div>
                                {expandedComp === idx ? <FiChevronUp color="#a0a0a0" /> : <FiChevronDown color="#a0a0a0" />}
                            </CompHeader>
                            {expandedComp === idx && (
                                <CompDetails>
                                    {comp.link && <CompLink href={comp.link} target="_blank" rel="noopener noreferrer">{comp.link}</CompLink>}
                                    <Table>
                                        <thead>
                                            <tr>
                                                <Th>Student</Th>
                                                <Th>Category</Th>
                                                <Th>Result</Th>
                                                <Th></Th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comp.participants.map(p => (
                                                <tr key={p.id}>
                                                    <Td>{p.studentName}</Td>
                                                    <Td>
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
                                                                background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                                color: '#fff', fontSize: '0.85rem', padding: '0.2rem 0', outline: 'none', width: '80px',
                                                            }}
                                                        />
                                                    </Td>
                                                    <Td>
                                                        <ResultSelect
                                                            value={p.result}
                                                            onChange={e => handleResultChange(p.id, e.target.value)}
                                                        >
                                                            <option value="participated">Participated</option>
                                                            <option value="gold">Gold</option>
                                                            <option value="silver">Silver</option>
                                                            <option value="bronze">Bronze</option>
                                                        </ResultSelect>
                                                    </Td>
                                                    <Td>
                                                        <span
                                                            onClick={async () => {
                                                                try {
                                                                    await apiRequest(`/coach/competitions/${p.id}`, { method: 'DELETE' });
                                                                    refreshAll();
                                                                } catch {}
                                                            }}
                                                            style={{ color: '#666', cursor: 'pointer', fontSize: '0.8rem' }}
                                                            title="Remove"
                                                        >
                                                            <FiTrash2 size={13} />
                                                        </span>
                                                    </Td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                    <AddStudentToComp comp={comp} students={allParticipants} onAdded={refreshAll} />
                                </CompDetails>
                            )}
                        </CompRow>
                    ))
                ) : (
                    <EmptyState>No competitions yet</EmptyState>
                )}
            </Card>

            {showCompForm && (
                <CompetitionForm
                    students={allParticipants}
                    onClose={() => setShowCompForm(false)}
                    onSave={() => { setShowCompForm(false); fetchStudents(); }}
                />
            )}

            {showAddStudent && (
                <AddStudentModal
                    onClose={() => setShowAddStudent(false)}
                    onAdded={() => { setShowAddStudent(false); refreshAll(); }}
                />
            )}

            {confirmRemove && (
                <Overlay onClick={() => setConfirmRemove(null)}>
                    <Modal onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
                        <ModalTitle>Remove Student</ModalTitle>
                        <p style={{ color: '#ff6b6b', margin: '0 0 1.5rem' }}>
                            Are you sure you want to remove <strong style={{ color: '#fff' }}>{confirmRemove.name}</strong> from your students?
                        </p>
                        <ButtonRow>
                            <CancelBtn type="button" onClick={() => setConfirmRemove(null)}>Cancel</CancelBtn>
                            <button
                                onClick={removeStudent}
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

const AddStudentToComp = ({ comp, students, onAdded }) => {
    const [selectedId, setSelectedId] = useState('');
    const [adding, setAdding] = useState(false);

    const participantIds = comp.participants.map(p => p.studentId);
    const available = students.filter(s => !participantIds.includes(s.id));

    if (available.length === 0) return null;

    const handleAdd = async () => {
        if (!selectedId) return;
        setAdding(true);
        try {
            await apiRequest('/coach/competitions', {
                method: 'POST',
                body: JSON.stringify({
                    name: comp.name,
                    date: comp.date,
                    link: comp.link || '',
                    category: '',
                    student_ids: [parseInt(selectedId)],
                }),
            });
            setSelectedId('');
            onAdded();
        } catch {}
        setAdding(false);
    };

    return (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.8rem', alignItems: 'center' }}>
            <select
                value={selectedId}
                onChange={e => setSelectedId(e.target.value)}
                style={{
                    flex: 1, background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px', padding: '0.5rem 0.7rem',
                    color: '#fff', fontSize: '0.85rem', outline: 'none',
                }}
            >
                <option value="" style={{ background: '#1a1a2e' }}>Add participant...</option>
                {available.map(s => (
                    <option key={s.id} value={s.id} style={{ background: '#1a1a2e' }}>{s.name}{s._type === 'coach' ? ' (coach)' : ''}</option>
                ))}
            </select>
            <AddBtn onClick={handleAdd} disabled={adding || !selectedId} style={{ padding: '0.5rem 0.8rem', fontSize: '0.8rem' }}>
                <FiPlus size={13} /> {adding ? 'Adding...' : 'Add'}
            </AddBtn>
        </div>
    );
};

const CompetitionForm = ({ students, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [link, setLink] = useState('');
    const [category, setCategory] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);
    const [search, setSearch] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const toggleStudent = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        setSelectedIds(
            selectedIds.length === students.length ? [] : students.map(s => s.id)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await apiRequest('/coach/competitions', {
                method: 'POST',
                body: JSON.stringify({
                    name,
                    date,
                    link,
                    category,
                    student_ids: selectedIds,
                }),
            });
            onSave();
        } catch (err) {
            setError(err.message || 'Failed to create competition');
        }
        setSaving(false);
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <ModalTitle>Add Competition</ModalTitle>
                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <div>
                        <Label>Competition Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Västgötaserien 1 2026 Skövde" required />
                    </div>
                    <div>
                        <Label>Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Link (optional)</Label>
                        <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://smoothcomp.com/..." />
                    </div>
                    <div>
                        <Label>Category (optional)</Label>
                        <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. PU13, FU11" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <Label style={{ margin: 0 }}>Participants {selectedIds.length > 0 && `(${selectedIds.length})`}</Label>
                            <SelectAllBtn onClick={selectAll}>
                                {selectedIds.length === students.length ? 'Deselect all' : 'Select all'}
                            </SelectAllBtn>
                        </div>
                        <Input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name..."
                            style={{ marginBottom: '0.5rem', padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                        />
                        <StudentCheckList style={{ maxHeight: '250px' }}>
                            {filtered.map(s => (
                                <CheckItem key={s.id} checked={selectedIds.includes(s.id)}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(s.id)}
                                        onChange={() => toggleStudent(s.id)}
                                    />
                                    {s.name}
                                    {s._type === 'coach' && <span style={{ color: '#667eea', fontSize: '0.75rem', marginLeft: '0.3rem' }}>(coach)</span>}
                                </CheckItem>
                            ))}
                            {filtered.length === 0 && <span style={{ color: '#666', fontSize: '0.85rem', padding: '0.5rem' }}>No matches</span>}
                        </StudentCheckList>
                    </div>
                    <ButtonRow>
                        <CancelBtn type="button" onClick={onClose}>Cancel</CancelBtn>
                        <SaveBtn type="submit" disabled={saving}>
                            {saving ? 'Creating...' : `Add for ${selectedIds.length} student${selectedIds.length !== 1 ? 's' : ''}`}
                        </SaveBtn>
                    </ButtonRow>
                </Form>
            </Modal>
        </Overlay>
    );
};

const CreateStudentRow = styled.div`
    display: flex;
    gap: 0.6rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
`;

const AddStudentModal = ({ onClose, onAdded }) => {
    const { user } = useAuth();
    const [available, setAvailable] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(true);
    const [adding, setAdding] = useState(null);
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        apiRequest('/coach/available-students')
            .then(data => { setAvailable(data); setLoadingStudents(false); })
            .catch(() => setLoadingStudents(false));
    }, []);

    const addStudent = async (studentId) => {
        setAdding(studentId);
        try {
            await apiRequest('/coach/add-student', {
                method: 'POST',
                body: JSON.stringify({ student_id: studentId }),
            });
            setAvailable(prev => prev.filter(s => s.id !== studentId));
            onAdded();
        } catch {
            // ignore
        }
        setAdding(null);
    };

    const createStudent = async () => {
        if (!newName.trim()) return;
        setCreating(true);
        try {
            await apiRequest('/coach/create-student', {
                method: 'POST',
                body: JSON.stringify({ name: newName.trim() }),
            });
            setNewName('');
            onAdded();
        } catch {
            // ignore
        }
        setCreating(false);
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <ModalTitle>Add Student</ModalTitle>

                <Label>Create new student</Label>
                <CreateStudentRow style={{ borderBottom: 'none', paddingBottom: 0, marginBottom: '0.5rem' }}>
                    <Input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                        placeholder="Student name"
                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), createStudent())}
                        style={{ flex: 1 }}
                    />
                    <AddBtn onClick={createStudent} disabled={creating || !newName.trim()} style={{ whiteSpace: 'nowrap' }}>
                        <FiUserPlus size={14} /> {creating ? 'Creating...' : 'Create'}
                    </AddBtn>
                </CreateStudentRow>

                {user?.club && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', paddingLeft: '0.2rem' }}>
                        <Label style={{ margin: 0, fontSize: '0.8rem' }}>Club:</Label>
                        <span style={{ color: '#667eea', fontSize: '0.85rem', fontWeight: 500 }}>{user.club.name}</span>
                    </div>
                )}

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0.8rem 0' }} />

                <Label>Or add existing student</Label>
                {loadingStudents ? (
                    <EmptyState>Loading...</EmptyState>
                ) : available.length > 0 ? (
                    <StudentCheckList style={{ maxHeight: '300px' }}>
                        {available.map(s => (
                            <CheckItem key={s.id} as="div" style={{ justifyContent: 'space-between' }}>
                                <span style={{ color: '#fff' }}>{s.name}</span>
                                <AddBtn
                                    onClick={() => addStudent(s.id)}
                                    disabled={adding === s.id}
                                    style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}
                                >
                                    <FiUserPlus size={13} /> {adding === s.id ? 'Adding...' : 'Add'}
                                </AddBtn>
                            </CheckItem>
                        ))}
                    </StudentCheckList>
                ) : (
                    <EmptyState>No other registered students available</EmptyState>
                )}
                <ButtonRow style={{ marginTop: '1rem' }}>
                    <CancelBtn onClick={onClose}>Close</CancelBtn>
                </ButtonRow>
            </Modal>
        </Overlay>
    );
};

export default CoachDashboard;
