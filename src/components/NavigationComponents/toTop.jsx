import React, { useState, useEffect } from "react";
import styled from "styled-components";

const ScrollButton = styled.button`
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 12px;
    width: 60px;
    height: 60px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    opacity: ${(props) => (props.visible ? "1" : "0")};
    transition: all 0.3s ease;
    z-index: 1500;
    font-family: 'Inter', sans-serif;
    font-weight: 600;

    &:hover {
        background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        transform: translateY(-3px);
        box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
    }

    &:active {
        transform: translateY(-1px);
    }

    @media screen and (max-width: 768px) {
        bottom: 20px;
        right: 20px;
        width: 56px;
        height: 56px;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
    }
`;

const ArrowIcon = styled.div`
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 12px solid white;
    margin-bottom: 4px;
`;

const ButtonText = styled.span`
    font-size: 0.7rem;
    font-weight: 600;
    color: white;
    text-transform: uppercase;
    letter-spacing: 0.5px;
`;

const ToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            setIsVisible(window.scrollY > 300);
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, []);

    const handleClick = (e) => {
        // Prevent event bubbling and default behavior
        e.preventDefault();
        e.stopPropagation();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleTouchStart = (e) => {
        // Prevent touch events from bubbling to elements behind
        e.stopPropagation();
    };

    const handleTouchEnd = (e) => {
        // Prevent touch events from bubbling to elements behind
        e.preventDefault();
        e.stopPropagation();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <ScrollButton
            visible={isVisible}
            onClick={handleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            title="Scroll to Top"
        >
            <ArrowIcon />
            <ButtonText>Top</ButtonText>
        </ScrollButton>
    );
};

export { ToTop };
