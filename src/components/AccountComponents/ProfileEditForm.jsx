import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { apiRequest } from '../../utils/api';

const API_BASE = `http://${window.location.hostname}:8787`;

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

const PhotoUploadArea = styled.div`
    display: flex;
    align-items: center;
    gap: 1rem;
`;

const PhotoPreview = styled.div`
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    border: 2px solid rgba(255, 255, 255, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex-shrink: 0;
    color: #666;
    font-size: 1.5rem;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
`;

const UploadBtn = styled.button`
    background: rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.3);
    color: #667eea;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.3s;

    &:hover { background: rgba(102, 126, 234, 0.25); }
    &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const UploadStatus = styled.span`
    color: ${p => p.error ? '#ff6b6b' : '#4ade80'};
    font-size: 0.8rem;
`;

const Divider = styled.div`
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    margin: 0.5rem 0;
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
    text-align: center;
`;

const ProfileEditForm = ({ user, onClose, onSave, apiPrefix = '/user', isOwnProfile }) => {
    const [name, setName] = useState(user.name || '');
    const [photoURL, setPhotoURL] = useState(user.photo_url || '');
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadMsg, setUploadMsg] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const fileInputRef = useRef(null);

    const [clubs, setClubs] = useState([]);
    const [clubAction, setClubAction] = useState(''); // 'change', 'create'
    const [newClubName, setNewClubName] = useState('');
    const [selectedClubId, setSelectedClubId] = useState('');
    const [confirmLeave, setConfirmLeave] = useState(false);
    const [leavingClub, setLeavingClub] = useState(false);

    const showPasswordSection = isOwnProfile && user.email;
    const showClubSection = isOwnProfile && (user.role === 'coach' || user.role === 'admin');

    useEffect(() => {
        if (showClubSection) {
            apiRequest('/coach/clubs').then(setClubs).catch(() => {});
        }
    }, [showClubSection]);

    const handleLeaveClub = async () => {
        setLeavingClub(true);
        try {
            await apiRequest('/user/leave-club', { method: 'POST' });
            onSave(null);
        } catch {}
        setLeavingClub(false);
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setUploadMsg('');

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE}/user/upload-photo`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Upload failed');
            }

            const data = await response.json();
            setPhotoURL(data.photo_url);
            setUploadMsg('Uploaded');
        } catch (err) {
            setUploadMsg(err.message || 'Upload failed');
        }
        setUploading(false);
    };

    const getFullPhotoURL = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${API_BASE}${url}`;
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (!newPassword && !confirmPassword) return true;
        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return false;
        }
        if (newPassword.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            return false;
        }

        try {
            await apiRequest('/user/change-password', {
                method: 'PUT',
                body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
            });
            setPasswordSuccess('Confirmation email sent. Check your inbox to confirm the change.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordFields(false);
            return true;
        } catch (err) {
            setPasswordError(err.message || 'Failed to change password');
            return false;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        // Handle password change first if fields are filled
        if (newPassword || confirmPassword) {
            const ok = await handleChangePassword();
            if (!ok) { setSaving(false); return; }
        }

        try {
            await apiRequest(`${apiPrefix}/profile`, {
                method: 'PUT',
                body: JSON.stringify({ name, photo_url: photoURL }),
            });
            onSave({ name, photo_url: photoURL });
        } catch {
            // ignore
        }
        setSaving(false);
    };

    return (
        <Overlay onClick={onClose}>
            <Modal onClick={e => e.stopPropagation()}>
                <Title>Edit Profile</Title>
                <Form onSubmit={handleSubmit}>
                    <div>
                        <Label>Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    {showClubSection && (
                        <div>
                            <Label>Club</Label>
                            {user.club ? (
                                <>
                                <div style={{
                                    padding: '0.7rem 1rem',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '10px', color: '#667eea',
                                    fontSize: '0.95rem', fontWeight: 500,
                                }}>
                                    {user.club.name}
                                    {user.club_status === 'pending' && (
                                        <span style={{ color: '#f59e0b', fontSize: '0.8rem', marginLeft: '0.5rem' }}>(pending)</span>
                                    )}
                                </div>
                                {!confirmLeave ? (
                                    <span
                                        onClick={() => setConfirmLeave(true)}
                                        style={{ color: '#666', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline', marginTop: '0.5rem', display: 'inline-block' }}
                                    >
                                        Leave club
                                    </span>
                                ) : (
                                    <div style={{
                                        marginTop: '0.8rem', padding: '0.8rem',
                                        background: 'rgba(255,107,107,0.08)', border: '1px solid rgba(255,107,107,0.2)',
                                        borderRadius: '8px',
                                    }}>
                                        <p style={{ color: '#ff6b6b', fontSize: '0.85rem', margin: '0 0 0.8rem 0' }}>
                                            Are you sure you want to leave <strong>{user.club.name}</strong>?
                                        </p>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <CancelBtn type="button" onClick={() => setConfirmLeave(false)} style={{ flex: 1, padding: '0.4rem', fontSize: '0.85rem' }}>
                                                Cancel
                                            </CancelBtn>
                                            <button
                                                type="button"
                                                onClick={handleLeaveClub}
                                                disabled={leavingClub}
                                                style={{
                                                    flex: 1, padding: '0.4rem', fontSize: '0.85rem', fontWeight: 600,
                                                    background: 'rgba(255,107,107,0.2)', border: '1px solid rgba(255,107,107,0.3)',
                                                    color: '#ff6b6b', borderRadius: '10px', cursor: 'pointer',
                                                }}
                                            >
                                                {leavingClub ? 'Leaving...' : 'Yes, Leave'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                </>
                            ) : (
                                <div style={{ color: '#666', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                    No club yet. Go to Students tab to create or join one.
                                </div>
                            )}
                        </div>
                    )}
                    <div>
                        <Label>Photo</Label>
                        <PhotoUploadArea>
                            <PhotoPreview>
                                {photoURL
                                    ? <img src={getFullPhotoURL(photoURL)} alt="Preview" />
                                    : user.name?.charAt(0)?.toUpperCase()
                                }
                            </PhotoPreview>
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handlePhotoUpload}
                                    style={{ display: 'none' }}
                                />
                                <UploadBtn type="button" onClick={() => fileInputRef.current.click()} disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'Choose Photo'}
                                </UploadBtn>
                                {uploadMsg && (
                                    <UploadStatus error={uploadMsg !== 'Uploaded'}> {uploadMsg}</UploadStatus>
                                )}
                            </div>
                        </PhotoUploadArea>
                    </div>
                    {showPasswordSection && (
                        <>
                            <Divider />
                            {!showPasswordFields ? (
                                <CancelBtn type="button" onClick={() => setShowPasswordFields(true)} style={{ flex: 'none', fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
                                    Change Password
                                </CancelBtn>
                            ) : (
                                <>
                                    {passwordError && <ErrorMsg>{passwordError}</ErrorMsg>}
                                    {passwordSuccess && <SuccessMsg>{passwordSuccess}</SuccessMsg>}
                                    <div>
                                        <Label>Current Password</Label>
                                        <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
                                    </div>
                                    <div>
                                        <Label>New Password</Label>
                                        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                                    </div>
                                    <div>
                                        <Label>Confirm New Password</Label>
                                        <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" />
                                    </div>
                                </>
                            )}
                        </>
                    )}
                    <ButtonRow>
                        <CancelBtn type="button" onClick={onClose}>Cancel</CancelBtn>
                        <SaveBtn type="submit" disabled={saving || uploading}>{saving ? 'Saving...' : 'Save'}</SaveBtn>
                    </ButtonRow>
                </Form>
            </Modal>
        </Overlay>
    );
};

export default ProfileEditForm;
