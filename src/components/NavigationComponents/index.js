import React from "react";
import {
    Nav,
    NavLogo,
    NavLink,
    NavMenu,
} from "./NavbarElements.js";
import styled from "styled-components";
import logo from "./../../../src/logo.png";
import { useAuth } from "../../hooks/useAuth";

const LogoImage = styled.img`
    height: 50px;
    width: auto;
    max-width: 150px;
`;

const LogoutBtn = styled.span`
    color: #a0a0a0;
    display: flex;
    align-items: center;
    padding: 0.8rem 1rem;
    cursor: pointer;
    font-weight: 500;
    transition: color 0.3s ease-in-out;
    font-family: 'Inter', sans-serif;

    &:hover {
        color: #ff6b6b;
    }

    @media screen and (max-width: 768px) {
        padding: 0.5rem;
        font-size: 0.9rem;
    }
`;

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();

    return (
        <Nav>
            <NavLogo to="/techniques" aria-label="Go to Techniques Page">
                <LogoImage src={logo} alt="Judo Techniques Logo" />
            </NavLogo>

            <NavMenu>
                <NavLink to="/quiz">
                    Quiz
                </NavLink>
                <NavLink to="/techniques">
                    Techniques
                </NavLink>
                <NavLink to="/kata">
                    Kata
                </NavLink>
                <NavLink to="/randori">
                    Timer
                </NavLink>
                {isAuthenticated ? (
                    <>
                        <NavLink to="/account">
                            {user?.name || 'Account'}
                        </NavLink>
                        <LogoutBtn onClick={logout}>
                            Logout
                        </LogoutBtn>
                    </>
                ) : (
                    <NavLink to="/login">
                        Login
                    </NavLink>
                )}
            </NavMenu>
        </Nav>
    );
};

export default Navbar;
