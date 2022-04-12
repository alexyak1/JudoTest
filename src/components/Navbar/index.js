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
        <div className="navbar">
            <Nav>
                <NavLogo to="/">
                    <img src={logo} className="App-logo" alt="logo" />
                </NavLogo>

                <NavMenu>
                    <NavLink to="/">
                        Home
                    </NavLink>
                    <NavLink to="/test">
                        Test
                    </NavLink>
                    <NavLink to="/techniques">
                        Techniques
                    </NavLink>
                </NavMenu>
            </Nav>
        </div>
    );
};
export default Navbar;