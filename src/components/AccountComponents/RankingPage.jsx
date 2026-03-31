import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiCalendar } from 'react-icons/fi';
import { apiRequest } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';
import StudentProfile from './StudentProfile';

const Card = styled.div`
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 1.2rem 1.5rem;
    margin-bottom: 0.8rem;
    @media (max-width: 768px) { padding: 1rem; }
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

const BackBtn = styled.button`
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #a0a0a0;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    transition: all 0.3s;
    &:hover { border-color: #667eea; color: #fff; }
`;

const CATEGORY_GROUPS = {
    all: { label: 'All', match: () => true },
    children: { label: 'Children (U9-U18)', match: c => /^U(9|11|13|15|18)$/i.test((c.category || '').trim()) },
    u21_senior: { label: 'U21 / Senior', match: c => /^(U21|senior)$/i.test((c.category || '').trim()) },
    masters: { label: 'Masters (M1-M9)', match: c => /^M[1-9]$/i.test((c.category || '').trim()) },
};

const RankingPage = () => {
    const { user, isCoach, isAdmin } = useAuth();
    const [competitions, setCompetitions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('year');
    const [dateFrom, setDateFrom] = useState(`${new Date().getFullYear()}-01-01`);
    const [dateTo, setDateTo] = useState(`${new Date().getFullYear()}-12-31`);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showAll, setShowAll] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);

    useEffect(() => {
        const endpoint = (isCoach || isAdmin) ? '/coach/competitions' : '/user/club-competitions-full';
        apiRequest(endpoint).then(data => { setCompetitions(data); setLoading(false); }).catch(() => setLoading(false));
    }, [isCoach, isAdmin]);

    const viewMember = async (userId) => {
        try {
            const endpoint = (isCoach || isAdmin) ? `/coach/students/${userId}` : `/user/club-member/${userId}`;
            const data = await apiRequest(endpoint);
            setSelectedMember(data);
        } catch {}
    };

    if (selectedMember) {
        return (
            <>
                <BackBtn onClick={() => setSelectedMember(null)}>Back to Ranking</BackBtn>
                <StudentProfile user={selectedMember} isOwnProfile={false} canEdit={isCoach || isAdmin} />
            </>
        );
    }

    if (loading) return <p style={{ color: '#666', fontStyle: 'italic' }}>Loading...</p>;

    const activeComps = competitions.filter(c => !c.deleted && c.user_id);
    const filtered = (filter === 'all' ? activeComps : activeComps.filter(c => {
        if (filter === 'year') return c.date?.startsWith(String(new Date().getFullYear()));
        if (filter === 'custom') return (!dateFrom || c.date >= dateFrom) && (!dateTo || c.date <= dateTo);
        return true;
    })).filter(CATEGORY_GROUPS[categoryFilter]?.match || (() => true));

    const personMap = {};
    filtered.forEach(c => {
        if (!c.user_id || !c.user_name) return;
        if (!personMap[c.user_id]) personMap[c.user_id] = { id: c.user_id, name: c.user_name, total: 0, gold: 0, silver: 0, bronze: 0 };
        const p = personMap[c.user_id];
        p.total++;
        if (c.result === 'gold') p.gold++;
        if (c.result === 'silver') p.silver++;
        if (c.result === 'bronze') p.bronze++;
    });

    const ranking = Object.values(personMap)
        .filter(p => p.total > 0)
        .sort((a, b) => b.gold - a.gold || b.silver - a.silver || b.bronze - a.bronze || b.total - a.total);

    const PAGE_SIZE = 10;
    const visible = showAll ? ranking : ranking.slice(0, PAGE_SIZE);
    const hasMore = ranking.length > PAGE_SIZE;
    const thStyle = { color: '#666', fontWeight: 500, textAlign: 'left', padding: '0.5rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.75rem' };
    const tdStyle = { padding: '0.5rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.03)' };

    const totalGold = ranking.reduce((s, p) => s + p.gold, 0);
    const totalSilver = ranking.reduce((s, p) => s + p.silver, 0);
    const totalBronze = ranking.reduce((s, p) => s + p.bronze, 0);

    return (
        <>
            <Card>
                <SectionHeader>
                    <SectionTitle>{user?.club?.name || 'Club'} Ranking</SectionTitle>
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

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
                    {Object.entries(CATEGORY_GROUPS).map(([key, { label }]) => (
                        <button key={key} onClick={() => { setCategoryFilter(key); setShowAll(false); }} style={{
                            background: categoryFilter === key ? 'rgba(102,126,234,0.2)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${categoryFilter === key ? 'rgba(102,126,234,0.4)' : 'rgba(255,255,255,0.08)'}`,
                            color: categoryFilter === key ? '#667eea' : '#888',
                            borderRadius: '6px', padding: '0.3rem 0.6rem', fontSize: '0.75rem', cursor: 'pointer',
                        }}>{label}</button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.6rem', textAlign: 'center' }}>
                        <div style={{ color: '#fff', fontSize: '1.4rem', fontWeight: 700 }}>{ranking.length}</div>
                        <div style={{ color: '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Athletes</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.6rem', textAlign: 'center' }}>
                        <div style={{ color: '#ffd700', fontSize: '1.4rem', fontWeight: 700 }}>{totalGold}</div>
                        <div style={{ color: '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gold</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.6rem', textAlign: 'center' }}>
                        <div style={{ color: '#c0c0c0', fontSize: '1.4rem', fontWeight: 700 }}>{totalSilver}</div>
                        <div style={{ color: '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Silver</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '0.6rem', textAlign: 'center' }}>
                        <div style={{ color: '#cd7f32', fontSize: '1.4rem', fontWeight: 700 }}>{totalBronze}</div>
                        <div style={{ color: '#888', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Bronze</div>
                    </div>
                </div>
            </Card>

            {ranking.length > 0 ? (
                <Card>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr>
                                <th style={thStyle}>#</th>
                                <th style={thStyle}>Name</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Comps</th>
                                <th style={{ ...thStyle, textAlign: 'center', color: '#ffd700' }}>G</th>
                                <th style={{ ...thStyle, textAlign: 'center', color: '#c0c0c0' }}>S</th>
                                <th style={{ ...thStyle, textAlign: 'center', color: '#cd7f32' }}>B</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((p, i) => (
                                <tr key={i}>
                                    <td style={{ ...tdStyle, color: '#888' }}>{i + 1}</td>
                                    <td style={tdStyle}>
                                        <span onClick={() => viewMember(p.id)} style={{ color: '#667eea', cursor: 'pointer' }}
                                            onMouseOver={e => e.target.style.textDecoration = 'underline'}
                                            onMouseOut={e => e.target.style.textDecoration = 'none'}
                                        >{p.name}</span>
                                    </td>
                                    <td style={{ ...tdStyle, color: '#888', textAlign: 'center' }}>{p.total}</td>
                                    <td style={{ ...tdStyle, color: p.gold ? '#ffd700' : '#333', textAlign: 'center', fontWeight: p.gold ? 700 : 400 }}>{p.gold || '-'}</td>
                                    <td style={{ ...tdStyle, color: p.silver ? '#c0c0c0' : '#333', textAlign: 'center', fontWeight: p.silver ? 700 : 400 }}>{p.silver || '-'}</td>
                                    <td style={{ ...tdStyle, color: p.bronze ? '#cd7f32' : '#333', textAlign: 'center', fontWeight: p.bronze ? 700 : 400 }}>{p.bronze || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {hasMore && (
                        <div style={{ textAlign: 'center', marginTop: '0.8rem' }}>
                            <button onClick={() => setShowAll(!showAll)} style={{
                                background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.25)',
                                color: '#667eea', borderRadius: '6px', padding: '0.4rem 1rem',
                                cursor: 'pointer', fontSize: '0.8rem',
                            }}>
                                {showAll ? 'Show Top 10' : `Show All (${ranking.length})`}
                            </button>
                        </div>
                    )}
                </Card>
            ) : (
                <Card>
                    <p style={{ color: '#666', fontStyle: 'italic', margin: 0 }}>No competition data for this period</p>
                </Card>
            )}
        </>
    );
};

export default RankingPage;
