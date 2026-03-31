import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiGitMerge, FiCheck } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';

const Overlay = styled.div`
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const Modal = styled.div`
    background: #1a1a2e;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    padding: 2rem;
    max-width: 700px;
    width: 95%;
    max-height: 85vh;
    overflow-y: auto;
`;

const Title = styled.h3`
    color: #fff;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
`;

const Desc = styled.p`
    color: #a0a0a0;
    font-size: 0.85rem;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
`;

const Label = styled.label`
    color: #ccc;
    font-size: 0.85rem;
    display: block;
    margin-bottom: 0.4rem;
    font-weight: 500;
`;

const Select = styled.select`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 0.6rem 1rem;
    color: #ffffff;
    font-size: 0.9rem;
    outline: none;
    width: 100%;
    margin-bottom: 1rem;
    &:focus { border-color: #667eea; }
    option { background: #1a1a2e; }
`;

const SectionTitle = styled.h4`
    color: #fff;
    margin: 1.5rem 0 0.8rem 0;
    font-size: 0.95rem;
`;

const ItemRow = styled.label`
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    padding: 0.6rem 0.8rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: rgba(255, 255, 255, 0.04); }
`;

const Checkbox = styled.input`
    margin-top: 0.2rem;
    accent-color: #667eea;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
`;

const ItemInfo = styled.div`
    flex: 1;
    font-size: 0.85rem;
    color: #ddd;
    line-height: 1.4;
`;

const ItemSource = styled.span`
    font-size: 0.75rem;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    margin-left: 0.4rem;
    background: ${p => p.isTarget ? 'rgba(74, 222, 128, 0.15)' : 'rgba(249, 158, 11, 0.15)'};
    color: ${p => p.isTarget ? '#4ade80' : '#f59e0b'};
`;

const ProfilePreview = styled.div`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    font-size: 0.85rem;
    color: #ccc;
    line-height: 1.6;
`;

const BtnRow = styled.div`
    display: flex;
    gap: 0.6rem;
    justify-content: flex-end;
    margin-top: 1.5rem;
`;

const ConfirmBtn = styled.button`
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: #fff;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    &:hover { opacity: 0.85; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const CancelBtn = styled.button`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #a0a0a0;
    border-radius: 8px;
    padding: 0.6rem 1.2rem;
    cursor: pointer;
    font-size: 0.9rem;
    &:hover { border-color: #667eea; color: #fff; }
`;

const EmptyNote = styled.p`
    color: #666;
    font-size: 0.85rem;
    font-style: italic;
    padding: 0.4rem 0;
`;

const beltLabels = {
    white: 'White', yellow: 'Yellow', orange: 'Orange', green: 'Green',
    blue: 'Blue', brown: 'Brown', black: 'Black',
};

const MergeModal = ({ users, onClose, onMerged }) => {
    const [targetId, setTargetId] = useState('');
    const [sourceId, setSourceId] = useState('');
    const [preview, setPreview] = useState(null);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [keepBeltIds, setKeepBeltIds] = useState(new Set());
    const [keepCompIds, setKeepCompIds] = useState(new Set());
    const [merging, setMerging] = useState(false);

    useEffect(() => {
        if (!targetId || !sourceId) {
            setPreview(null);
            return;
        }
        let cancelled = false;
        const load = async () => {
            setLoadingPreview(true);
            try {
                const data = await apiRequest('/admin/merge-preview', {
                    method: 'POST',
                    body: JSON.stringify({ target_id: parseInt(targetId), source_id: parseInt(sourceId) }),
                });
                if (cancelled) return;
                setPreview(data);
                // Pre-select all belts and competitions by default
                const allBeltIds = new Set([
                    ...(data.target.belts || []).map(b => b.id),
                    ...(data.source.belts || []).map(b => b.id),
                ]);
                const allCompIds = new Set([
                    ...(data.target.competitions || []).filter(c => !c.deleted).map(c => c.id),
                    ...(data.source.competitions || []).filter(c => !c.deleted).map(c => c.id),
                ]);
                setKeepBeltIds(allBeltIds);
                setKeepCompIds(allCompIds);
            } catch {
                if (!cancelled) setPreview(null);
            }
            if (!cancelled) setLoadingPreview(false);
        };
        load();
        return () => { cancelled = true; };
    }, [targetId, sourceId]);

    const toggleBelt = (id) => {
        setKeepBeltIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleComp = (id) => {
        setKeepCompIds(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleMerge = async () => {
        const target = preview?.target;
        const source = preview?.source;
        if (!target || !source) return;
        if (!window.confirm(
            `Merge "${source.name}" into "${target.name}"?\n\n` +
            `"${target.name}" keeps their name, email, photo, and password.\n` +
            `"${source.name}" will be permanently deleted.\n\nThis cannot be undone.`
        )) return;

        setMerging(true);
        try {
            await apiRequest('/admin/merge-users', {
                method: 'POST',
                body: JSON.stringify({
                    target_id: target.id,
                    source_id: source.id,
                    keep_belt_ids: [...keepBeltIds],
                    keep_competition_ids: [...keepCompIds],
                }),
            });
            onMerged?.();
            onClose();
        } catch (err) {
            alert('Merge failed: ' + (err.message || 'Unknown error'));
        }
        setMerging(false);
    };

    const allBelts = preview ? [
        ...(preview.target.belts || []).map(b => ({ ...b, _from: 'target' })),
        ...(preview.source.belts || []).map(b => ({ ...b, _from: 'source' })),
    ] : [];

    const allComps = preview ? [
        ...(preview.target.competitions || []).filter(c => !c.deleted).map(c => ({ ...c, _from: 'target' })),
        ...(preview.source.competitions || []).filter(c => !c.deleted).map(c => ({ ...c, _from: 'source' })),
    ] : [];

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <Title><FiGitMerge size={18} /> Merge Accounts</Title>
                <Desc>
                    Select the user's own account (keeps name, email, photo, password) and the coach-created profile to absorb.
                    Review belts and competitions below — uncheck any you don't want to keep.
                </Desc>

                <Label>Keep this account (user-registered):</Label>
                <Select value={targetId} onChange={e => { setTargetId(e.target.value); }}>
                    <option value="">Select user...</option>
                    {users.filter(u => String(u.id) !== sourceId).map(u => (
                        <option key={u.id} value={u.id}>
                            {u.name}{u.email ? ` (${u.email})` : ' (no email)'}
                        </option>
                    ))}
                </Select>

                <Label>Absorb this profile (coach-created):</Label>
                <Select value={sourceId} onChange={e => { setSourceId(e.target.value); }}>
                    <option value="">Select user...</option>
                    {users.filter(u => String(u.id) !== targetId).map(u => (
                        <option key={u.id} value={u.id}>
                            {u.name}{u.email ? ` (${u.email})` : ' (no email)'}
                        </option>
                    ))}
                </Select>

                {loadingPreview && <EmptyNote>Loading preview...</EmptyNote>}

                {preview && (
                    <>
                        <ProfilePreview>
                            <strong style={{ color: '#fff' }}>Result profile:</strong><br />
                            Name: <strong>{preview.target.name}</strong><br />
                            Email: {preview.target.email || 'none'}<br />
                            Photo: {preview.target.photo_url ? 'user\'s photo' : preview.source.photo_url ? 'from coach profile' : 'none'}<br />
                            Club: {preview.target.club?.name || preview.source.club?.name || 'none'}<br />
                            <span style={{ color: '#ff6b6b' }}>"{preview.source.name}" will be permanently deleted.</span>
                        </ProfilePreview>

                        <SectionTitle>Belts — check which to keep</SectionTitle>
                        {allBelts.length === 0 && <EmptyNote>No belts on either account.</EmptyNote>}
                        {allBelts.map(belt => (
                            <ItemRow key={`belt-${belt.id}`}>
                                <Checkbox
                                    type="checkbox"
                                    checked={keepBeltIds.has(belt.id)}
                                    onChange={() => toggleBelt(belt.id)}
                                />
                                <ItemInfo>
                                    {beltLabels[belt.color] || belt.color} belt — {belt.graduation_date}
                                    {belt.examiner_name ? ` (examiner: ${belt.examiner_name})` : ''}
                                    <ItemSource isTarget={belt._from === 'target'}>
                                        {belt._from === 'target' ? preview.target.name : preview.source.name}
                                    </ItemSource>
                                </ItemInfo>
                            </ItemRow>
                        ))}

                        <SectionTitle>Competitions — check which to keep</SectionTitle>
                        {allComps.length === 0 && <EmptyNote>No competitions on either account.</EmptyNote>}
                        {allComps.map(comp => (
                            <ItemRow key={`comp-${comp.id}`}>
                                <Checkbox
                                    type="checkbox"
                                    checked={keepCompIds.has(comp.id)}
                                    onChange={() => toggleComp(comp.id)}
                                />
                                <ItemInfo>
                                    {comp.name} — {comp.date}
                                    {comp.result ? ` (${comp.result})` : ''}
                                    {comp.category ? ` · ${comp.category}` : ''}
                                    <ItemSource isTarget={comp._from === 'target'}>
                                        {comp._from === 'target' ? preview.target.name : preview.source.name}
                                    </ItemSource>
                                </ItemInfo>
                            </ItemRow>
                        ))}
                    </>
                )}

                <BtnRow>
                    <CancelBtn onClick={onClose}>Cancel</CancelBtn>
                    <ConfirmBtn
                        disabled={!preview || merging}
                        onClick={handleMerge}
                    >
                        <FiCheck size={14} />
                        {merging ? 'Merging...' : 'Merge Accounts'}
                    </ConfirmBtn>
                </BtnRow>
            </Modal>
        </Overlay>
    );
};

export default MergeModal;
