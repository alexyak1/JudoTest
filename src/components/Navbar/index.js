import React from "react";
import {
    Nav,
    NavLogo,
    NavLink,
    NavMenu,
} from "./NavbarElements.js";
import logo from './../../../src/logo.png'

const Navbar = () => {
    return (
        <>
           <Nav>
            <NavLogo to="/">
                <img src={logo} className="App-logo" alt="logo" />
            </NavLogo>

            <NavMenu>
                <NavLink to="/" activeStyle>
                    Home
                </NavLink>
                <NavLink to="/about" activeStyle>
                    About
                </NavLink>
            </NavMenu>
           </Nav>
        </>
    );
};
export default Navbar;