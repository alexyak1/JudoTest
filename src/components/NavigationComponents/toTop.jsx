import React, { useState, useEffect } from "react";
import { GrFormUp } from "react-icons/gr";
import styled from "styled-components";

const ScrollButton = styled.button`
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #0073e6;
    color: white;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2);
    opacity: ${(props) => (props.visible ? "1" : "0")};
    transition: opacity 0.3s ease, transform 0.3s ease;

    &:hover {
        background: #005bb5;
        transform: scale(1.1);
    }
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

    return (
        <ScrollButton
            visible={isVisible}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="Scroll to Top"
        >
            <GrFormUp size={24} color="white" />
        </ScrollButton>
    );
};

export { ToTop };
