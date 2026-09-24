import React, { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import TechniquesBeltSelector from "../components/TechniquesBeltSelector";
import { ShowTechniques, techniquePoster } from "../components/ShowTechniques";
import { ToTop } from "../components/NavigationComponents/toTop";
import { useBeltWithUrl, usePageTracking } from "../hooks/useBeltWithUrl";
import { useSeo } from "../utils/seo";

const BELT_LABELS = {
    yellow: 'Yellow Belt',
    orange: 'Orange Belt',
    green: 'Green Belt',
    blue: 'Blue Belt',
    brown: 'Brown Belt',
};

export default function Techniques() {
    // Use URL-based belt selection with analytics tracking
    const { belt, setBelt } = useBeltWithUrl('yellow', 'techniques');

    // Track page views with belt information
    usePageTracking('techniques', belt);

    // Each belt is its own indexable page: same template, genuinely different
    // list of techniques, so each one canonicalises to its own ?belt= URL.
    const label = BELT_LABELS[belt] || 'All Belts';

    // A shared technique link is its own page as far as sharing and indexing
    // go: one named throw with its own video, not just the belt list again.
    const [searchParams] = useSearchParams();
    const openSlug = searchParams.get('technique');
    // Only the first letter: the files are named "O-uchi-gari", not
    // "O-Uchi-Gari", and the title should read the way the technique does.
    const openName = openSlug
        ? openSlug.charAt(0).toUpperCase() + openSlug.slice(1)
        : null;

    useSeo(openName ? {
        title: `${openName} - Judo Technique Video, Frame by Frame | JudoQuiz`,
        description: `Watch ${openName}, a ${label.toLowerCase()} judo technique, as video you can slow down and step through one frame at a time.`,
        path: `/techniques?belt=${belt}&technique=${openSlug}`,
        image: techniquePoster(belt, openSlug) || '/logo.png',
    } : {
        title: `Judo Techniques - ${label} Syllabus with Video | JudoQuiz`,
        description: `Every ${label.toLowerCase()} judo technique with video: throws, hold-downs, strangles and armlocks, named in Japanese and grouped by grading level.`,
        path: belt === 'yellow' ? '/techniques' : `/techniques?belt=${belt}`,
    });

    const applyFilter = useCallback((beltColor) => {
        setBelt(beltColor);
    }, [setBelt]);

    return (
        <div className='app'>
            <div>
                <h1 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: '600', fontFamily: 'Inter, sans-serif', textAlign: 'center', marginBottom: '2rem' }}>Judo techniques &mdash; {label}</h1>
                <div className="belt-selector-container">
                    <TechniquesBeltSelector setBeltColor={applyFilter} selectedBelt={belt} />
                </div>
                <ShowTechniques belt={belt} />
                <ToTop />
            </div>
        </div>
    );
}
