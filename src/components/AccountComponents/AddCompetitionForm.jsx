import React, { useState } from 'react';
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

const RESULTS = ['gold', 'silver', 'bronze', 'participated'];

const AddCompetitionForm = ({ onClose, onSave, apiPrefix = '/user' }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [link, setLink] = useState('');
    const [category, setCategory] = useState('');
    const [result, setResult] = useState('participated');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const newComp = await apiRequest(`${apiPrefix}/competitions`, {
                method: 'POST',
                body: JSON.stringify({ name, date, link, category, result }),
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
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. City Championship" required />
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
                        <Label>Result</Label>
                        <Select value={result} onChange={e => setResult(e.target.value)}>
                            {RESULTS.map(r => (
                                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                            ))}
                        </Select>
                    </div>
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
