import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiUpload, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE } from "../../utils/apiBase";


const Backdrop = styled.div`
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex; align-items: center; justify-content: center;
    z-index: 1000;
    padding: 1rem;
`;
const Modal = styled.div`
    background: #1a1a2e;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    width: 100%;
    max-width: 720px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
`;
const Header = styled.div`
    display: flex; justify-content: space-between; align-items: center;
    padding: 1rem 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.06);
`;
const Title = styled.h3`
    margin: 0; color: #fff; font-size: 1rem; font-weight: 600;
`;
const CloseBtn = styled.button`
    background: transparent; border: none; color: #aaa; cursor: pointer;
    font-size: 1.5rem; line-height: 1; padding: 0;
    &:hover { color: #fff; }
`;
const Body = styled.div`
    padding: 1.25rem; overflow-y: auto; flex: 1;
`;
const UploadRow = styled.div`
    display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;
`;
const UploadBtn = styled.label`
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: #667eea; color: #fff;
    padding: 0.5rem 0.9rem; border-radius: 6px;
    cursor: pointer; font-size: 0.85rem; font-weight: 500;
    &:hover { background: #5a6fd8; }
`;
const StatusMsg = styled.span`
    color: ${p => p.error ? '#f87171' : '#9ca3af'};
    font-size: 0.8rem;
`;
const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.75rem;
`;
const Tile = styled.div`
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    background: #111;
    border: 1px solid ${p => p.pending ? '#facc15' : 'rgba(255,255,255,0.06)'};
`;
const Img = styled.img`
    width: 100%; height: 100%; object-fit: cover; display: block;
`;
const Actions = styled.div`
    position: absolute; bottom: 0; left: 0; right: 0;
    display: flex; gap: 0.25rem;
    padding: 0.35rem;
    background: linear-gradient(transparent, rgba(0,0,0,0.7));
`;
const IconBtn = styled.button`
    flex: 1;
    border: none;
    background: ${p => p.danger ? 'rgba(220,38,38,0.85)' : 'rgba(34,197,94,0.85)'};
    color: #fff;
    padding: 0.25rem;
    border-radius: 4px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    &:hover { filter: brightness(1.15); }
`;
const PendingBadge = styled.div`
    position: absolute; top: 0.3rem; left: 0.3rem;
    background: #facc15; color: #1a1a2e;
    font-size: 0.65rem; font-weight: 600;
    padding: 0.1rem 0.4rem; border-radius: 4px;
    text-transform: uppercase; letter-spacing: 0.05em;
`;
const Empty = styled.div`
    color: #6b7280; text-align: center; padding: 2rem 0;
    font-size: 0.9rem;
`;

const absoluteUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url}`;
};

const CompetitionPhotosModal = ({ eventName, eventDate, competitionName, onClose, onCountChange }) => {
    const { user: currentUser } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState({ text: '', error: false });
    const inputRef = useRef(null);

    const isCoachOrAdmin = currentUser && (currentUser.role === 'coach' || currentUser.role === 'admin');
    const eventQuery = `name=${encodeURIComponent(eventName)}&date=${encodeURIComponent(eventDate)}`;

    useEffect(() => {
        apiRequest(`/user/club-event-photos?${eventQuery}`)
            .then((data) => setPhotos(data || []))
            .catch(() => setMsg({ text: 'Failed to load photos', error: true }))
            .finally(() => setLoading(false));
    }, [eventQuery]);

    const notifyCount = (next) => {
        if (onCountChange) onCountChange(next.length);
    };

    const handleUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        setUploading(true);
        setMsg({ text: '', error: false });

        const token = localStorage.getItem('token');
        const results = [];
        for (const file of files) {
            const formData = new FormData();
            formData.append('photo', file);
            try {
                const res = await fetch(`${API_BASE}/user/club-event-photos?${eventQuery}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData,
                });
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}));
                    throw new Error(err.error || 'Upload failed');
                }
                results.push(await res.json());
            } catch (err) {
                setMsg({ text: err.message || 'Upload failed', error: true });
                break;
            }
        }
        if (results.length > 0) {
            const next = [...results, ...photos];
            setPhotos(next);
            notifyCount(next);
            setMsg({
                text: results.some(p => p.status === 'pending')
                    ? 'Uploaded — waiting for coach approval'
                    : `Uploaded ${results.length} photo${results.length > 1 ? 's' : ''}`,
                error: false,
            });
        }
        setUploading(false);
        if (inputRef.current) inputRef.current.value = '';
    };

    const handleApprove = async (photo) => {
        const next = photos.map(p => p.id === photo.id ? { ...p, status: 'approved' } : p);
        setPhotos(next);
        try {
            await apiRequest(`/coach/photos/${photo.id}/approve`, { method: 'PUT' });
        } catch {
            setPhotos(photos);
            setMsg({ text: 'Approval failed', error: true });
        }
    };

    const handleDelete = async (photo) => {
        if (!window.confirm('Delete this photo?')) return;
        const next = photos.filter(p => p.id !== photo.id);
        setPhotos(next);
        notifyCount(next);
        const path = isCoachOrAdmin
            ? `/coach/photos/${photo.id}`
            : `/user/photos/${photo.id}`;
        try {
            await apiRequest(path, { method: 'DELETE' });
        } catch {
            setPhotos(photos);
            notifyCount(photos);
            setMsg({ text: 'Delete failed', error: true });
        }
    };

    return (
        <Backdrop onClick={onClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>Photos — {competitionName}</Title>
                    <CloseBtn onClick={onClose}>×</CloseBtn>
                </Header>
                <Body>
                    <UploadRow>
                        <UploadBtn>
                            <FiUpload size={14} />
                            {uploading ? 'Uploading…' : 'Upload photos'}
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleUpload}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                        </UploadBtn>
                        {msg.text && <StatusMsg error={msg.error}>{msg.text}</StatusMsg>}
                    </UploadRow>

                    {loading ? (
                        <Empty>Loading…</Empty>
                    ) : photos.length === 0 ? (
                        <Empty>No photos yet. Be the first to upload!</Empty>
                    ) : (
                        <Grid>
                            {photos.map(photo => {
                                const isMine = currentUser && photo.uploaded_by_id === currentUser.id;
                                const isPending = photo.status === 'pending';
                                return (
                                    <Tile key={photo.id} pending={isPending}>
                                        <a href={absoluteUrl(photo.url)} target="_blank" rel="noopener noreferrer">
                                            <Img src={absoluteUrl(photo.url)} alt="" />
                                        </a>
                                        {isPending && <PendingBadge>Pending</PendingBadge>}
                                        <Actions>
                                            {isCoachOrAdmin && isPending && (
                                                <IconBtn onClick={() => handleApprove(photo)} title="Approve">
                                                    <FiCheck size={14} />
                                                </IconBtn>
                                            )}
                                            {(isCoachOrAdmin || isMine) && (
                                                <IconBtn danger onClick={() => handleDelete(photo)} title="Delete">
                                                    {isCoachOrAdmin && isPending ? <FiX size={14} /> : <FiTrash2 size={14} />}
                                                </IconBtn>
                                            )}
                                        </Actions>
                                    </Tile>
                                );
                            })}
                        </Grid>
                    )}
                </Body>
            </Modal>
        </Backdrop>
    );
};

export default CompetitionPhotosModal;
