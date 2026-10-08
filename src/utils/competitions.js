// Helpers for telling finished competitions apart from upcoming ones.
// A competition's `date` is a string such as "2026-12-05" or
// "2026-11-14 - 2026-11-15"; the first 10 characters are the start date.

export const localToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const competitionStartDate = (c) => String((c && c.date) || '').slice(0, 10);

// True when the competition has not started yet. Upcoming competitions carry
// a placeholder "participated" result and must stay out of medal statistics.
export const isUpcomingCompetition = (c) => {
    const start = competitionStartDate(c);
    return !!start && start > localToday();
};
