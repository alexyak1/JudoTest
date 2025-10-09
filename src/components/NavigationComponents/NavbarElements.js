import { NavLink as Link } from "react-router-dom";
import styled from "styled-components";

export const Nav = styled.nav`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
  min-height: 85px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem calc((100vw - 1000px) / 2);
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 12;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media screen and (max-width: 768px) {
    padding: 0.5rem 1rem;
  }
`;

export const NavLogo = styled(Link)`
  cursor: pointer;
  font-size: 1.8rem;
  font-weight: 700;
  text-decoration: none;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: -0.01em;
  font-family: 'Inter', sans-serif;
  
  &:hover {
    color: #a0a0a0;
  }
`;

export const NavLink = styled(Link)`
  color: #ffffff;
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0.8rem 1rem;
  height: 100%;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.3s ease-in-out;
  letter-spacing: 0.01em;
  font-family: 'Inter', sans-serif;

  &.active {
    color: #667eea;
    font-weight: 600;
  }

  &:hover {
    color: #a0a0a0;
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
