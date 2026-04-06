import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { apiRequest } from '../../utils/api';

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
    max-height: 90vh;
    overflow-y: auto;
`;

const Title = styled.h3`
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

const Select = styled.select`
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

const SuggestionList = styled.div`
    max-height: 150px;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    margin-top: 0.3rem;
`;

const SuggestionItem = styled.div`
    padding: 0.5rem 0.8rem;
    cursor: pointer;
    color: #ddd;
    font-size: 0.9rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    &:hover { background: rgba(102, 126, 234, 0.1); }
    &:last-child { border-bottom: none; }
`;

const SuggestionDate = styled.span`
    color: #888;
    font-size: 0.8rem;
    margin-left: 0.5rem;
`;

const RESULTS = ['gold', 'silver', 'bronze', 'participated'];

const AddCompetitionForm = ({ onClose, onSave, apiPrefix = '/user' }) => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [multiDay, setMultiDay] = useState(false);
    const [link, setLink] = useState('');
    const [category, setCategory] = useState('');
    const [result, setResult] = useState('participated');
    const [saving, setSaving] = useState(false);
    const [existing, setExisting] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [picked, setPicked] = useState(false);

    useEffect(() => {
        apiRequest('/user/club-competitions')
            .then(comps => setExisting(comps || []))
            .catch(() => {});
    }, []);

    const filtered = name.length > 0
        ? existing.filter(e => e.name.toLowerCase().includes(name.toLowerCase()))
        : existing.slice(0, 10);

    const pickExisting = (comp) => {
        setName(comp.name);
        if (comp.date && comp.date.includes(' - ')) {
            const [s, e] = comp.date.split(' - ');
            setStartDate(s.trim());
            setEndDate(e.trim());
        } else {
            setStartDate(comp.date || '');
            setEndDate('');
        }
        setLink(comp.link || '');
        setShowSuggestions(false);
        setPicked(true);
    };

    const clearPicked = () => {
        setPicked(false);
        setName('');
        setStartDate('');
        setEndDate('');
        setLink('');
    };

    const today = new Date().toISOString().slice(0, 10);
    const isUpcoming = startDate > today;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const newComp = await apiRequest(`${apiPrefix}/competitions`, {
                method: 'POST',
                body: JSON.stringify({ name, date: endDate ? `${startDate} - ${endDate}` : startDate, link, category, result: isUpcoming ? 'participated' : result }),
            });
            onSave(newComp);
        } catch (err) {
            // ignore
        }
        setSaving(false);
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <Title>Add Competition</Title>
                <Form onSubmit={handleSubmit}>
                    <div>
                        <Label>Competition Name</Label>
                        {picked ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <div style={{
                                    flex: 1, padding: '0.8rem 1rem',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '10px', color: '#667eea',
                                    fontSize: '1rem', fontWeight: 500,
                                }}>
                                    {name} <span style={{ color: '#888', fontSize: '0.85rem' }}>{endDate ? `${startDate} - ${endDate}` : startDate}</span>
                                </div>
                                <span onClick={clearPicked} style={{ color: '#888', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}>change</span>
                            </div>
                        ) : (
                            <>
                                <Input
                                    value={name}
                                    onChange={e => { setName(e.target.value); setShowSuggestions(true); }}
                                    onFocus={() => setShowSuggestions(true)}
                                    placeholder="Start typing or pick from list..."
                                    required
                                    autoComplete="off"
                                />
                                {showSuggestions && filtered.length > 0 && (
                                    <SuggestionList>
                                        {filtered.map((comp, i) => (
                                            <SuggestionItem key={i} onClick={() => pickExisting(comp)}>
                                                {comp.name}
                                                <SuggestionDate>{comp.date}</SuggestionDate>
                                            </SuggestionItem>
                                        ))}
                                    </SuggestionList>
                                )}
                            </>
                        )}
                    </div>
                    {!picked && (
                        <>
                            <div>
                                <Label>Date</Label>
                                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.4rem', cursor: 'pointer', color: '#888', fontSize: '0.8rem' }}>
                                    <input type="checkbox" checked={multiDay} onChange={e => { setMultiDay(e.target.checked); if (!e.target.checked) setEndDate(''); }} style={{ accentColor: '#667eea' }} />
                                    Multi-day event
                                </label>
                                {multiDay && (
                                    <div style={{ marginTop: '0.4rem' }}>
                                        <Label>End Date</Label>
                                        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} required />
                                    </div>
                                )}
                            </div>
                            <div>
                                <Label>Link (optional)</Label>
                                <Input value={link} onChange={e => setLink(e.target.value)} placeholder="https://smoothcomp.com/..." />
                            </div>
                        </>
                    )}
                    <div>
                        <Label>Category (optional)</Label>
                        <Select value={category} onChange={e => setCategory(e.target.value)}>
                            <option value="" style={{ background: '#1a1a2e' }}>-</option>
                            {['U9','U11','U13','U15','U18','U21','Senior','M1','M2','M3','M4','M5','M6','M7','M8','M9'].map(cat => (
                                <option key={cat} value={cat} style={{ background: '#1a1a2e' }}>{cat}</option>
                            ))}
                        </Select>
                    </div>
                    {!isUpcoming && (
                        <div>
                            <Label>Result</Label>
                            <Select value={result} onChange={e => setResult(e.target.value)}>
                                {RESULTS.map(r => (
                                    <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                                ))}
                            </Select>
                        </div>
                    )}
                    <ButtonRow>
                        <CancelBtn type="button" onClick={onClose}>Cancel</CancelBtn>
                        <SaveBtn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add'}</SaveBtn>
                    </ButtonRow>
                </Form>
            </Modal>
        </Overlay>
    );
};

export default AddCompetitionForm;
