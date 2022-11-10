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
                <NavLogo to="/techniques">
                    <img src={logo} className="App-logo" alt="logo" />
                </NavLogo>

                <NavMenu>
                    <NavLink to="/quiz">
                        Home
                    </NavLink>
                    <NavLink to="/quiz">
                        Quiz
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