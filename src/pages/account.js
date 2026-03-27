import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import StudentProfile from '../components/AccountComponents/StudentProfile';
import CoachDashboard from '../components/AccountComponents/CoachDashboard';
import AdminDashboard from '../components/AccountComponents/AdminDashboard';
import CoachesList from '../components/AccountComponents/CoachesList';
import PendingRequests from '../components/AccountComponents/PendingRequests';

const Container = styled.div`
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    min-height: calc(100vh - 170px);

    @media (max-width: 768px) {
        padding: 1rem;
    }
`;

const PageTitle = styled.h1`
    color: #ffffff;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 2rem;
    font-family: 'Inter', sans-serif;
`;

const TabBar = styled.div`
    display: flex;
    gap: 0.5rem;
    margin-bottom: 2rem;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
`;

const Tab = styled.button`
    background: ${p => p.active ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255, 255, 255, 0.05)'};
    border: 1px solid ${p => p.active ? 'transparent' : 'rgba(255, 255, 255, 0.1)'};
    color: #ffffff;
    border-radius: 10px;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    font-weight: ${p => p.active ? '600' : '400'};
    cursor: pointer;
    transition: all 0.3s;
    font-family: 'Inter', sans-serif;
    white-space: nowrap;

    &:hover {
        border-color: #667eea;
    }
`;

export default function Account() {
    const { user, refreshUser, updateUser, isCoach, isAdmin } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const activeTab = searchParams.get('tab') || 'profile';
    const studentId = searchParams.get('student');

    const setActiveTab = useCallback((tab) => {
        setSearchParams({ tab });
    }, [setSearchParams]);

    const setStudentView = useCallback((id) => {
        if (id) {
            setSearchParams({ tab: 'students', student: id });
        } else {
            setSearchParams({ tab: 'students' });
        }
    }, [setSearchParams]);

    if (!user) return null;

    const showTabs = isCoach || isAdmin;

    return (
        <Container>
            <title>Judo Quiz | Account</title>
            <PageTitle>My Account</PageTitle>

            {showTabs && (
                <TabBar>
                    <Tab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
                        My Profile
                    </Tab>
                    {isCoach && (
                        <Tab active={activeTab === 'students'} onClick={() => setActiveTab('students')}>
                            Students
                        </Tab>
                    )}
                    {isCoach && (
                        <Tab active={activeTab === 'coaches'} onClick={() => setActiveTab('coaches')}>
                            Coaches
                        </Tab>
                    )}
                    {isAdmin && (
                        <Tab active={activeTab === 'admin'} onClick={() => setActiveTab('admin')}>
                            Admin
                        </Tab>
                    )}
                </TabBar>
            )}

            {activeTab === 'profile' && (
                <>
                    {(isCoach || isAdmin) && user.club_status === 'approved' && <PendingRequests />}
                    <StudentProfile user={user} isOwnProfile={true} onUpdate={refreshUser} onUpdateUser={updateUser} />
                </>
            )}

            {activeTab === 'students' && isCoach && (
                <CoachDashboard studentId={studentId} onStudentChange={setStudentView} />
            )}

            {activeTab === 'coaches' && isCoach && (
                <CoachesList />
            )}

            {activeTab === 'admin' && isAdmin && (
                <AdminDashboard />
            )}
        </Container>
    );
}
