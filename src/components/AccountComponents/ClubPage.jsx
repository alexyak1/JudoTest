import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiChevronDown, FiChevronUp, FiTrash2, FiCalendar } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

const StatRow = styled.div`
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
    margin-bottom: 1rem;

    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr);
    }
`;

const StatCard = styled.div`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 0.8rem;
    text-align: center;
`;

const StatValue = styled.div`
    color: ${p => p.color || '#fff'};
    font-size: 1.8rem;
    font-weight: 700;
    font-family: 'Inter', sans-serif;
`;

const StatLabel = styled.div`
    color: #888;
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.2rem;
`;

const Card = styled.div`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    margin-bottom: 0.8rem;
    @media (max-width: 768px) { padding: 1rem; }
`;

const FilterRow = styled.div`
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
    margin-bottom: 1rem;
`;

const FilterBtn = styled.button`
    background: ${p => p.active ? 'rgba(102, 126, 234, 0.2)' : 'rgba(255, 255, 255, 0.04)'};
    border: 1px solid ${p => p.active ? 'rgba(102, 126, 234, 0.4)' : 'rgba(255, 255, 255, 0.08)'};
    color: ${p => p.active ? '#667eea' : '#888'};
    border-radius: 6px;
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { border-color: rgba(102, 126, 234, 0.4); color: #667eea; }
`;

const DateInput = styled.input`
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    padding: 0.35rem 0.6rem;
    color: #fff;
    font-size: 0.8rem;
    outline: none;
    &:focus { border-color: #667eea; }
    &::-webkit-calendar-picker-indicator { filter: invert(1); opacity: 0.5; }
`;

const SectionHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.6rem;
`;

const SectionTitle = styled.h3`
    color: #999;
    font-family: 'Inter', sans-serif;
    margin: 0;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
`;

const AddBtn = styled.button`
    background: rgba(102, 126, 234, 0.15);
    border: 1px solid rgba(102, 126, 234, 0.25);
    color: #667eea;
    border-radius: 6px;
    padding: 0.3rem 0.6rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    font-weight: 500;
    &:hover { background: rgba(102, 126, 234, 0.25); }
`;

const CompRow = styled.div`
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 8px;
    margin-bottom: 0.4rem;
    overflow: hidden;
`;

const CompHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 0.8rem;
    cursor: pointer;
    &:hover { background: rgba(255, 255, 255, 0.02); }
`;

const CompName = styled.span`
    color: #fff;
    font-weight: 500;
    font-size: 0.9rem;
`;

const CompDate = styled.span`
    color: #888;
    font-size: 0.8rem;
    margin-left: 0.5rem;
`;

const CompDetails = styled.div`
    padding: 0 0.8rem 0.8rem;
`;

const CompLink = styled.a`
    color: #667eea;
    font-size: 0.75rem;
    text-decoration: none;
    &:hover { text-decoration: underline; }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 300px;
`;

const Th = styled.th`
    color: #666;
    font-weight: 500;
    text-align: left;
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 0.7rem;
    text-transform: uppercase;
`;

const Td = styled.td`
    color: #ddd;
    padding: 0.35rem 0.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    font-size: 0.8rem;
`;

const ResultSelect = styled.select`
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 0.2rem 0.4rem;
    color: #fff;
    font-size: 0.8rem;
    outline: none;
    option { background: #1a1a2e; }
`;

const MedalDot = styled.span`
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.3rem;
    background: ${p => p.color};
`;

const EmptyState = styled.p`
    color: #555;
    font-style: italic;
    font-size: 0.8rem;
    margin: 0.3rem 0;
`;

const ClubPage = () => {
    const { user, isCoach, isAdmin } = useAuth();
    const canEdit = isCoach || isAdmin;
    const [stats, setStats] = useState(null);
    const [competitions, setCompetitions] = useState([]);
    const [expandedComp, setExpandedComp] = useState(null);
    const [filter, setFilter] = useState('year');
    const [dateFrom, setDateFrom] = useState(`${new Date().getFullYear()}-01-01`);
    const [dateTo, setDateTo] = useState(`${new Date().getFullYear()}-12-31`);

    const fetchData = () => {
        let params = '';
        if (filter === 'year') {
            params = `?from=${new Date().getFullYear()}-01-01&to=${new Date().getFullYear()}-12-31`;
        } else if (filter === 'custom' && dateFrom && dateTo) {
            params = `?from=${dateFrom}&to=${dateTo}`;
        }

        apiRequest(`/user/club-stats${params}`).then(setStats).catch(() => {});
        apiRequest('/user/club-competitions-full').then(setCompetitions).catch(() => {});
    };

    useEffect(() => { fetchData(); }, [filter, dateFrom, dateTo]);

    const handleResultChange = async (compId, newResult) => {
        try {
            await apiRequest(`/coach/competitions/${compId}/result`, {
                method: 'PUT',
                body: JSON.stringify({ result: newResult }),
            });
            fetchData();
        } catch {}
    };

    const handleCategoryChange = async (compId, newCategory) => {
        try {
            await apiRequest(`/coach/competitions/${compId}/category`, {
                method: 'PUT',
                body: JSON.stringify({ category: newCategory }),
            });
        } catch {}
    };

    const handleRemove = async (compId) => {
        try {
            await apiRequest(`/coach/competitions/${compId}`, { method: 'DELETE' });
            fetchData();
        } catch {}
    };

    // Group competitions
    const grouped = (() => {
        const compMap = {};
        competitions.forEach(comp => {
            const key = `${comp.name}_${comp.date}`;
            if (!compMap[key]) {
                compMap[key] = { name: comp.name, date: comp.date, link: comp.link, participants: [] };
            }
            compMap[key].participants.push({
                ...comp,
                studentName: comp.user_name,
                studentId: comp.user_id,
            });
        });
        return Object.values(compMap).sort((a, b) => b.date.localeCompare(a.date));
    })();

    // Filter competitions for display based on date
    const filteredGrouped = filter === 'all' ? grouped : grouped.filter(c => {
        if (filter === 'year') {
            return c.date.startsWith(String(new Date().getFullYear()));
        }
        if (filter === 'custom') {
            return (!dateFrom || c.date >= dateFrom) && (!dateTo || c.date <= dateTo);
        }
        return true;
    });

    return (
        <>
            <Card>
                <SectionHeader>
                    <SectionTitle>{user?.club?.name || 'Club'} Statistics</SectionTitle>
                </SectionHeader>

                <FilterRow>
                    <FiCalendar size={14} color="#888" />
                    <FilterBtn active={filter === 'year'} onClick={() => setFilter('year')}>
                        {new Date().getFullYear()}
                    </FilterBtn>
                    <FilterBtn active={filter === 'all'} onClick={() => setFilter('all')}>
                        All time
                    </FilterBtn>
                    <FilterBtn active={filter === 'custom'} onClick={() => setFilter('custom')}>
                        Custom
                    </FilterBtn>
                    {filter === 'custom' && (
                        <>
                            <DateInput type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                            <span style={{ color: '#666' }}>-</span>
                            <DateInput type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                        </>
                    )}
                </FilterRow>

                {stats && (
                    <StatRow>
                        <StatCard>
                            <StatValue>{stats.total_competitions}</StatValue>
                            <StatLabel>Events</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#ffd700">{stats.gold}</StatValue>
                            <StatLabel><MedalDot color="#ffd700" />Gold</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#c0c0c0">{stats.silver}</StatValue>
                            <StatLabel><MedalDot color="#c0c0c0" />Silver</StatLabel>
                        </StatCard>
                        <StatCard>
                            <StatValue color="#cd7f32">{stats.bronze}</StatValue>
                            <StatLabel><MedalDot color="#cd7f32" />Bronze</StatLabel>
                        </StatCard>
                    </StatRow>
                )}
            </Card>

            <Card>
                <SectionHeader>
                    <SectionTitle>Competitions ({filteredGrouped.length})</SectionTitle>
                </SectionHeader>

                {filteredGrouped.length > 0 ? (
                    filteredGrouped.map((comp, idx) => (
                        <CompRow key={idx}>
                            <CompHeader onClick={() => setExpandedComp(expandedComp === idx ? null : idx)}>
                                <div>
                                    <CompName>{comp.name}</CompName>
                                    <CompDate>{comp.date}</CompDate>
                                    <span style={{ color: '#555', fontSize: '0.75rem', marginLeft: '0.4rem' }}>
                                        ({comp.participants.length})
                                    </span>
                                </div>
                                {expandedComp === idx ? <FiChevronUp color="#888" size={16} /> : <FiChevronDown color="#888" size={16} />}
                            </CompHeader>
                            {expandedComp === idx && (
                                <CompDetails>
                                    {comp.link && <CompLink href={comp.link} target="_blank" rel="noopener noreferrer">{comp.link}</CompLink>}
                                    <Table>
                                        <thead>
                                            <tr>
                                                <Th>Name</Th>
                                                <Th>Category</Th>
                                                <Th>Result</Th>
                                                {canEdit && <Th></Th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comp.participants.map(p => (
                                                <tr key={p.id}>
                                                    <Td>{p.studentName}</Td>
                                                    <Td>
                                                        {canEdit ? (
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
                                                                    background: 'transparent', border: 'none',
                                                                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                                                                    color: '#ddd', fontSize: '0.8rem', padding: '0.1rem 0',
                                                                    outline: 'none', width: '70px',
                                                                }}
                                                            />
                                                        ) : (
                                                            <span style={{ color: '#ddd', fontSize: '0.8rem' }}>{p.category || '-'}</span>
                                                        )}
                                                    </Td>
                                                    <Td>
                                                        {canEdit ? (
                                                            <ResultSelect value={p.result} onChange={e => handleResultChange(p.id, e.target.value)}>
                                                                <option value="participated">Participated</option>
                                                                <option value="gold">Gold</option>
                                                                <option value="silver">Silver</option>
                                                                <option value="bronze">Bronze</option>
                                                            </ResultSelect>
                                                        ) : (
                                                            <span style={{ color: '#ddd', fontSize: '0.8rem', textTransform: 'capitalize' }}>{p.result}</span>
                                                        )}
                                                    </Td>
                                                    {canEdit && (
                                                        <Td>
                                                            <span onClick={() => handleRemove(p.id)} style={{ color: '#555', cursor: 'pointer' }} title="Remove">
                                                                <FiTrash2 size={12} />
                                                            </span>
                                                        </Td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </CompDetails>
                            )}
                        </CompRow>
                    ))
                ) : (
                    <EmptyState>No competitions for this period</EmptyState>
                )}
            </Card>
        </>
    );
};

export default ClubPage;
