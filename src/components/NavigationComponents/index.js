import React from "react";
import {
    Nav,
    NavLogo,
    NavLink,
    NavMenu,
} from "./NavbarElements.js";
import styled from "styled-components";
import logo from "./../../../src/logo.png";

const LogoImage = styled.img`
    height: 50px;
    width: auto;
    max-width: 150px;
`;

const Navbar = () => {
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
            </NavMenu>
        </Nav>
    );
};

export default Navbar;
