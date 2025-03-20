import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
  background: #f7f8f9;
  min-height: 85px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem calc((100vw - 1000px) / 2);
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 12;

  @media screen and (max-width: 768px) {
    padding: 0.5rem 1rem;
  }
`;

export const NavLogo = styled(Link)`
  cursor: pointer;
  font-size: 1.8rem;
  font-weight: bold;
  text-decoration: none;
  color: #222;
  display: flex;
  align-items: center;
  gap: 8px; /* Add spacing if you have an icon */
  
  &:hover {
    color: #7a8896;
  }
`;

export const NavLink = styled(Link)`
  color: black;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0.8rem 1rem;
  height: 100%;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s ease-in-out;

  &.active {
    color: #7a8896;
    font-weight: 600;
  }

  &:hover {
    color: #7a8896;
  }

  @media screen and (max-width: 768px) {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
`;

export const NavMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem; /* Adds spacing between links */

  @media screen and (max-width: 768px) {
    gap: 1rem;
  }
`;
