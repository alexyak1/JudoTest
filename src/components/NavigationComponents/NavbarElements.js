import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
    background: #f7f8f9;
    height: 85px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.2rem calc((100vw - 1000px) / 2);
    z-index: 12;
`;
export const NavLogo = styled(Link)`
  cursor: pointer;
`;

export const NavLink = styled(Link)`
color: black;
display: flex;
align-items: center;
text-decoration: none;
padding: 0 0.5rem;
height: 100%;
cursor: pointer;
&.active {
  color: #7a8896;
}
&:hover {
  color: #7a8896;
}
`;

export const NavMenu = styled.div`
  display: flex;
  align-items: center;
`;

