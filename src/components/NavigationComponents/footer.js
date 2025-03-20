import React from "react";
import styled from "styled-components";

const FooterContainer = styled.footer`
    background: #f7f8f9;
    color: #333;
    text-align: center;
    padding: 20px;
    font-size: 1rem;
    box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
`;

const EmailLink = styled.a`
    color: #0073e6;
    text-decoration: none;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
        color: #005bb5;
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
