import React from "react";
import { useSeo } from "../utils/seo";

// A static host cannot return a 404 status for a client-side route, so every
// unknown URL used to answer "200 OK" with the quiz. The noindex tag is what
// keeps those soft-404s out of the index.
export default function NotFound() {
    useSeo({
        title: 'Page not found | JudoQuiz',
        description: 'This page does not exist on JudoQuiz.',
        path: '/404',
        noindex: true,
    });

    return (
        <div className='app' style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <h1 style={{ color: '#ffffff', fontSize: '1.8rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                Page not found
            </h1>
            <p style={{ color: '#b8b8b8', fontFamily: 'Inter, sans-serif' }}>
                That page does not exist. Try the <a href="/" style={{ color: '#667eea' }}>judo quiz</a>,
                the <a href="/techniques" style={{ color: '#667eea' }}>technique library</a> or
                the <a href="/randori" style={{ color: '#667eea' }}>randori timer</a>.
            </p>
        </div>
    );
}
