import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
    color: #ffffff;
    text-align: center;
    padding: 20px;
    font-size: 1rem;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.3);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
`;

const EmailLink = styled.a`
    color: #667eea;
    text-decoration: none;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
        color: #764ba2;
    }
`;

const Footer = () => {
    return (
        <FooterContainer>
            <p>
                For ideas and feedback, please reach out via email:{" "}
                <EmailLink href="mailto:iakimchuk.a@gmail.com">
                    iakimchuk.a@gmail.com
                </EmailLink>
            </p>
        </FooterContainer>
    );
};

export default Footer;
