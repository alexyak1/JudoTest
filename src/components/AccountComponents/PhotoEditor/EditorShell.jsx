import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

// The full-screen frame shared by the crop and collage editors: a dark panel
// over the photos dialog, a title, a scrolling body and a footer for buttons.

const Overlay = styled.div`
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.85);
    display: flex; align-items: center; justify-content: center;
    z-index: 1100;
    padding: 0.75rem;
`;
const Panel = styled.div`
    background: #1a1a2e;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    width: 100%;
    max-width: 900px;
    max-height: 96vh;
    display: flex; flex-direction: column;
    overflow: hidden;
`;
const Head = styled.div`
    display: flex; justify-content: space-between; align-items: center;
    padding: 0.75rem 1.1rem;
    border-bottom: 1px solid rgba(255,255,255,0.06);
`;
const Title = styled.h3`
    margin: 0; color: #fff; font-size: 1rem; font-weight: 600;
`;
const CloseBtn = styled.button`
    background: transparent; border: none; color: #aaa; cursor: pointer;
    font-size: 1.5rem; line-height: 1; padding: 0;
    &:hover { color: #fff; }
`;
const Content = styled.div`
    padding: 1rem 1.1rem; overflow-y: auto; flex: 1 1 auto; min-height: 0;
`;
const Foot = styled.div`
    display: flex; align-items: center; justify-content: flex-end; flex-wrap: wrap; gap: 0.6rem;
    padding: 0.75rem 1.1rem;
    border-top: 1px solid rgba(255,255,255,0.06);
`;

export const Button = styled.button`
    display: inline-flex; align-items: center; gap: 0.4rem;
    border: 1px solid ${p => p.primary ? 'transparent' : 'rgba(255,255,255,0.18)'};
    background: ${p => p.primary ? '#667eea' : 'transparent'};
    color: #fff;
    padding: 0.5rem 1rem; border-radius: 6px;
    cursor: pointer; font-size: 0.85rem; font-weight: 500;
    &:hover:not(:disabled) { background: ${p => p.primary ? '#5a6fd8' : 'rgba(255,255,255,0.08)'}; }
    &:disabled { opacity: 0.45; cursor: not-allowed; }
`;

export const ErrorText = styled.span`
    color: #f87171; font-size: 0.8rem; margin-right: auto;
`;

const EditorShell = ({ title, onCancel, footer, children }) => {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onCancel]);

    // Portalled to <body> so no ancestor's overflow or stacking can clip it. The
    // click is stopped here because React still bubbles events from a portal up
    // through the component tree, and the photos dialog underneath closes
    // itself on a backdrop click.
    return createPortal(
        <Overlay onClick={(e) => e.stopPropagation()}>
            <Panel role="dialog" aria-label={title}>
                <Head>
                    <Title>{title}</Title>
                    <CloseBtn onClick={onCancel} aria-label="Close">×</CloseBtn>
                </Head>
                <Content>{children}</Content>
                <Foot>{footer}</Foot>
            </Panel>
        </Overlay>,
        document.body
    );
};

export default EditorShell;
