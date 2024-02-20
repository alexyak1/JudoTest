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
        <div>
            <Nav>
                <NavLogo to="/techniques">
                    <img src={logo} className="App-logo" alt="logo" />
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
        </div>
    );
};
export default Navbar;