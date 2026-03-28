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
    &::placeholder { color: #555; }
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

const AddLicenseForm = ({ onClose, onSave, apiPrefix = '/user' }) => {
    const [name, setName] = useState('');
    const [issuedAt, setIssuedAt] = useState('');
    const [expiresAt, setExpiresAt] = useState('');
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const newLic = await apiRequest(`${apiPrefix}/licenses`, {
                method: 'POST',
                body: JSON.stringify({ name, issued_at: issuedAt, expires_at: expiresAt || undefined }),
            });
            onSave(newLic);
        } catch {}
        setSaving(false);
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <Title>Add License</Title>
                <Form onSubmit={handleSubmit}>
                    <div>
                        <Label>License Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Club Coach, Assistant" required />
                    </div>
                    <div>
                        <Label>Issued Date</Label>
                        <Input type="date" value={issuedAt} onChange={e => setIssuedAt(e.target.value)} required />
                    </div>
                    <div>
                        <Label>Expires Date (optional)</Label>
                        <Input type="date" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
                    </div>
                    <ButtonRow>
                        <CancelBtn type="button" onClick={onClose}>Cancel</CancelBtn>
                        <SaveBtn type="submit" disabled={saving}>{saving ? 'Saving...' : 'Add License'}</SaveBtn>
                    </ButtonRow>
                </Form>
            </Modal>
        </Overlay>
    );
};

export default AddLicenseForm;
