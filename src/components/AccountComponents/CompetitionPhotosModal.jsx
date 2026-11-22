import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { FiUpload, FiTrash2, FiCheck, FiX, FiCrop, FiLayout } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import { API_BASE } from "../../utils/apiBase";
import CropEditor from './PhotoEditor/CropEditor';
import CollageEditor from './PhotoEditor/CollageEditor';


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
    display: flex; align-items: center; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem;
`;
const UploadBtn = styled.label`
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: #667eea; color: #fff;
    padding: 0.5rem 0.9rem; border-radius: 6px;
    cursor: pointer; font-size: 0.85rem; font-weight: 500;
    &:hover { background: #5a6fd8; }
`;
const ActionBtn = styled.button`
    display: inline-flex; align-items: center; gap: 0.4rem;
    background: ${p => p.primary ? '#667eea' : 'transparent'};
    color: #fff;
    border: 1px solid ${p => p.primary ? 'transparent' : 'rgba(255,255,255,0.2)'};
    padding: 0.5rem 0.9rem; border-radius: 6px;
    cursor: pointer; font-size: 0.85rem; font-weight: 500;
    &:hover:not(:disabled) { background: ${p => p.primary ? '#5a6fd8' : 'rgba(255,255,255,0.08)'}; }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const StatusMsg = styled.span`
    color: ${p => p.error ? '#f87171' : '#9ca3af'};
    font-size: 0.8rem;
`;
const Staged = styled.div`
    border: 1px dashed rgba(250,204,21,0.45);
    border-radius: 10px;
    padding: 0.85rem;
    margin-bottom: 1.25rem;
    background: rgba(250,204,21,0.04);
`;
const StagedTitle = styled.div`
    color: #facc15; font-size: 0.78rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.05em;
    margin-bottom: 0.6rem;
`;
const StagedActions = styled.div`
    display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.85rem;
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
    width: 100%; height: 100%; object-fit: ${p => p.whole ? 'contain' : 'cover'}; display: block;
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
    background: ${p => p.danger ? 'rgba(220,38,38,0.85)' : p.edit ? 'rgba(102,126,234,0.9)' : 'rgba(34,197,94,0.85)'};
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

// Photos waiting to be uploaded. Nothing is sent, and nothing is deleted, until
// the person presses Upload, so every crop or collage can still be thrown away.
//   original  what the editor starts from, however many times it is re-cropped
//   blob      what will be uploaded
//   edited    true once it has been cropped or made by the collage editor
//   replaces  id of an uploaded photo this one is an edited copy of: the
//             original is removed once the copy has uploaded
let stagedSeq = 0;
const makeStaged = (blob, name, extra = {}) => ({
    key: `staged-${Date.now()}-${stagedSeq++}`,
    original: blob,
    blob,
    name,
    previewUrl: URL.createObjectURL(blob),
    edited: false,
    ...extra,
});

// Edited photos are always saved as JPEG, so they get a .jpg name whatever the
// original was: the server decides the file type from the name.
const uploadName = (item) =>
    item.edited ? `${(item.name || 'photo').replace(/\.[^.]+$/, '') || 'photo'}.jpg` : item.name;

const CompetitionPhotosModal = ({ eventName, eventDate, competitionName, onClose, onCountChange }) => {
    const { user: currentUser } = useAuth();
    const [photos, setPhotos] = useState([]);
    const [staged, setStaged] = useState([]);
    const [editor, setEditor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState({ text: '', error: false });
    const inputRef = useRef(null);
    const stagedRef = useRef([]);
    stagedRef.current = staged;

    const isCoachOrAdmin = currentUser && (currentUser.role === 'coach' || currentUser.role === 'admin');
    const eventQuery = `name=${encodeURIComponent(eventName)}&date=${encodeURIComponent(eventDate)}`;

    useEffect(() => {
        apiRequest(`/user/club-event-photos?${eventQuery}`)
            .then((data) => setPhotos(data || []))
            .catch(() => setMsg({ text: 'Failed to load photos', error: true }))
            .finally(() => setLoading(false));
    }, [eventQuery]);

    // Free the previews of anything still waiting when the dialog closes.
    const revokeAllStaged = useCallback(() => {
        stagedRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    }, []);
    useEffect(() => revokeAllStaged, [revokeAllStaged]);

    const notifyCount = (next) => {
        if (onCountChange) onCountChange(next.length);
    };

    const deletePath = (id) => (isCoachOrAdmin ? `/coach/photos/${id}` : `/user/photos/${id}`);

    const requestClose = () => {
        if (staged.length > 0 && !window.confirm(
            `${staged.length} photo${staged.length > 1 ? 's' : ''} not uploaded yet will be lost. Close anyway?`
        )) {
            return;
        }
        onClose();
    };

    // --- staging -----------------------------------------------------------

    const handlePick = (e) => {
        const files = Array.from(e.target.files || []);
        e.target.value = '';
        if (files.length === 0) return;
        setMsg({ text: '', error: false });
        const items = files.map((file) => makeStaged(file, file.name));
        setStaged((prev) => [...prev, ...items]);
    };

    const removeStaged = (key) => {
        const gone = staged.find((item) => item.key === key);
        if (gone) URL.revokeObjectURL(gone.previewUrl);
        setStaged((prev) => prev.filter((item) => item.key !== key));
    };

    const discardStaged = () => {
        revokeAllStaged();
        setStaged([]);
        setMsg({ text: '', error: false });
    };

    const cropStaged = (item) => {
        setEditor({
            type: 'crop',
            title: 'Crop photo',
            source: { file: item.original },
            onApply: (blob) => {
                const previewUrl = URL.createObjectURL(blob);
                URL.revokeObjectURL(item.previewUrl);
                setStaged((prev) =>
                    prev.map((it) => (it.key === item.key ? { ...it, blob, previewUrl, edited: true } : it))
                );
            },
        });
    };

    const cropUploaded = (photo) => {
        setEditor({
            type: 'crop',
            title: 'Edit photo',
            source: { url: absoluteUrl(photo.url) },
            onApply: (blob) => {
                const item = makeStaged(blob, 'photo.jpg', { edited: true, replaces: photo.id });
                stagedRef.current
                    .filter((it) => it.replaces === photo.id)
                    .forEach((it) => URL.revokeObjectURL(it.previewUrl));
                setStaged((prev) => [...prev.filter((it) => it.replaces !== photo.id), item]);
                setMsg({ text: '', error: false });
            },
        });
    };

    const openCollage = () => setEditor({ type: 'collage' });

    const addCollage = (blob) => {
        const item = makeStaged(blob, 'collage.jpg', { edited: true });
        setStaged((prev) => [...prev, item]);
        setMsg({ text: '', error: false });
    };

    const finishEditor = (blob) => {
        if (editor && editor.type === 'crop') editor.onApply(blob);
        else addCollage(blob);
        setEditor(null);
    };

    // Everything already uploaded, plus everything waiting, as collage material.
    const collageCandidates = useMemo(() => [
        ...photos.map((p) => ({
            key: `photo-${p.id}`,
            source: { url: absoluteUrl(p.url) },
            thumb: absoluteUrl(p.url),
        })),
        ...staged.map((s) => ({ key: s.key, source: { file: s.blob }, thumb: s.previewUrl })),
    ], [photos, staged]);

    // --- uploading ---------------------------------------------------------

    const handleUploadStaged = async () => {
        if (staged.length === 0 || uploading) return;
        setUploading(true);
        setMsg({ text: '', error: false });

        const token = localStorage.getItem('token');
        const uploaded = [];
        const replaced = new Set();
        let problem = '';
        let notRemoved = 0;

        for (const item of staged) {
            const formData = new FormData();
            formData.append('photo', item.blob, uploadName(item));
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
                uploaded.push({ item, photo: await res.json() });
            } catch (err) {
                problem = err.message || 'Upload failed';
                break;
            }

            // The edited copy is safely uploaded, so the original can go. If that
            // fails the copy stays and the original just needs deleting by hand.
            if (item.replaces) {
                try {
                    await apiRequest(deletePath(item.replaces), { method: 'DELETE' });
                    replaced.add(item.replaces);
                } catch {
                    notRemoved += 1;
                }
            }
        }

        if (uploaded.length > 0) {
            const done = new Set(uploaded.map((u) => u.item.key));
            uploaded.forEach((u) => URL.revokeObjectURL(u.item.previewUrl));
            setStaged((prev) => prev.filter((it) => !done.has(it.key)));

            const next = [
                ...uploaded.map((u) => u.photo),
                ...photos.filter((p) => !replaced.has(p.id)),
            ];
            setPhotos(next);
            notifyCount(next);
        }

        if (problem) {
            setMsg({ text: problem, error: true });
        } else if (notRemoved > 0) {
            setMsg({
                text: `Uploaded, but ${notRemoved} original photo${notRemoved > 1 ? 's' : ''} could not be removed. Delete ${notRemoved > 1 ? 'them' : 'it'} by hand.`,
                error: true,
            });
        } else {
            setMsg({
                text: uploaded.some((u) => u.photo.status === 'pending')
                    ? 'Uploaded — waiting for coach approval'
                    : `Uploaded ${uploaded.length} photo${uploaded.length > 1 ? 's' : ''}`,
                error: false,
            });
        }
        setUploading(false);
    };

    // --- photos already uploaded -------------------------------------------

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
        try {
            await apiRequest(deletePath(photo.id), { method: 'DELETE' });
        } catch {
            setPhotos(photos);
            notifyCount(photos);
            setMsg({ text: 'Delete failed', error: true });
        }
    };

    return (
        <Backdrop onClick={requestClose}>
            <Modal onClick={(e) => e.stopPropagation()}>
                <Header>
                    <Title>Photos — {competitionName}</Title>
                    <CloseBtn onClick={requestClose}>×</CloseBtn>
                </Header>
                <Body>
                    <UploadRow>
                        <UploadBtn>
                            <FiUpload size={14} />
                            Upload photos
                            <input
                                ref={inputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handlePick}
                                disabled={uploading}
                                style={{ display: 'none' }}
                            />
                        </UploadBtn>
                        <ActionBtn type="button" onClick={openCollage} disabled={uploading}>
                            <FiLayout size={14} />
                            Make collage
                        </ActionBtn>
                        {msg.text && <StatusMsg error={msg.error}>{msg.text}</StatusMsg>}
                    </UploadRow>

                    {staged.length > 0 && (
                        <Staged>
                            <StagedTitle>Ready to upload ({staged.length})</StagedTitle>
                            <Grid>
                                {staged.map((item) => (
                                    <Tile key={item.key} pending>
                                        <Img src={item.previewUrl} alt="" whole />
                                        {item.replaces && <PendingBadge>Replaces original</PendingBadge>}
                                        <Actions>
                                            <IconBtn edit onClick={() => cropStaged(item)} disabled={uploading} title="Crop">
                                                <FiCrop size={14} />
                                            </IconBtn>
                                            <IconBtn danger onClick={() => removeStaged(item.key)} disabled={uploading} title="Remove">
                                                <FiX size={14} />
                                            </IconBtn>
                                        </Actions>
                                    </Tile>
                                ))}
                            </Grid>
                            <StagedActions>
                                <ActionBtn primary type="button" onClick={handleUploadStaged} disabled={uploading}>
                                    <FiUpload size={14} />
                                    {uploading
                                        ? 'Uploading…'
                                        : `Upload ${staged.length} photo${staged.length > 1 ? 's' : ''}`}
                                </ActionBtn>
                                <ActionBtn type="button" onClick={discardStaged} disabled={uploading}>
                                    Discard
                                </ActionBtn>
                            </StagedActions>
                        </Staged>
                    )}

                    {loading ? (
                        <Empty>Loading…</Empty>
                    ) : photos.length === 0 ? (
                        <Empty>No photos yet. Be the first to upload!</Empty>
                    ) : (
                        <Grid>
                            {photos.map(photo => {
                                const isMine = currentUser && photo.uploaded_by_id === currentUser.id;
                                const isPending = photo.status === 'pending';
                                const canChange = isCoachOrAdmin || isMine;
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
                                            {canChange && (
                                                <IconBtn edit onClick={() => cropUploaded(photo)} title="Crop">
                                                    <FiCrop size={14} />
                                                </IconBtn>
                                            )}
                                            {canChange && (
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

            {editor && editor.type === 'crop' && (
                <CropEditor
                    title={editor.title}
                    source={editor.source}
                    onSave={finishEditor}
                    onCancel={() => setEditor(null)}
                />
            )}
            {editor && editor.type === 'collage' && (
                <CollageEditor
                    candidates={collageCandidates}
                    onSave={finishEditor}
                    onCancel={() => setEditor(null)}
                />
            )}
        </Backdrop>
    );
};

export default CompetitionPhotosModal;
