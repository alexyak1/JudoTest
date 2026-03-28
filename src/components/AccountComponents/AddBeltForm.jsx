import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

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
    max-width: 380px;
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
    &::-webkit-calendar-picker-indicator { filter: invert(1); }
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

const BELT_OPTIONS = ['yellow', 'orange', 'green', 'blue', 'brown', 'black'];

const ErrorMsg = styled.div`
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    border: 1px solid rgba(255, 107, 107, 0.2);
    border-radius: 8px;
    padding: 0.6rem;
    font-size: 0.85rem;
    text-align: center;
`;

const AddBeltForm = ({ onClose, onSave, apiPrefix = '/user' }) => {
    const { user } = useAuth();
    const [color, setColor] = useState('yellow');
    const [graduationDate, setGraduationDate] = useState('');
    const [examinerId, setExaminerId] = useState(String(user?.id || ''));
    const [customExaminer, setCustomExaminer] = useState('');
    const [coaches, setCoaches] = useState([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        apiRequest('/user/club-coaches').then(setCoaches).catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
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
        } catch (err) {
            setError(err.message || 'Failed to add belt');
        }
        setSaving(false);
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <Title>Add Belt</Title>
                <Form onSubmit={handleSubmit}>
                    {error && <ErrorMsg>{error}</ErrorMsg>}
                    <div>
                        <Label>Belt Color</Label>
                        <Select value={color} onChange={e => setColor(e.target.value)}>
                            {BELT_OPTIONS.map(b => (
                                <option key={b} value={b}>{b.charAt(0).toUpperCase() + b.slice(1)}</option>
                            ))}
                        </Select>
                    </div>
                    <div>
                        <Label>Graduation Date</Label>
                        <Input type="date" value={graduationDate} onChange={e => setGraduationDate(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Examiner</Label>
                        <Select value={examinerId} onChange={e => setExaminerId(e.target.value)}>
                            <option value="">Not specified</option>
                            {coaches.map(c => (
                                <option key={c.id} value={c.id}>{c.name}{c.id === user?.id ? ' (me)' : ''}</option>
                            ))}
                            <option value="other">Other (type name)...</option>
                        </Select>
                        {examinerId === 'other' && (
                            <Input
                                value={customExaminer}
                                onChange={e => setCustomExaminer(e.target.value)}
                                placeholder="Examiner name"
                                style={{ marginTop: '0.5rem' }}
                            />
                        )}
                    </div>
                    <ButtonRow>
                        <CancelBtn type="button" onClick={onClose}>Cancel</CancelBtn>
                        <SaveBtn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add Belt'}</SaveBtn>
                    </ButtonRow>
                </Form>
            </Modal>
        </Overlay>
    );
};

export default AddBeltForm;
