import React from 'react';
import styled from '@emotion/styled';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';

const NavbarContainer = styled.nav`
    margin: 0;
    width: 100vw;
    background-color: var(--color-dark-gray);
    display: grid;
    grid-template-columns: 80vw 20vw;
    h1{
        margin: auto 0 auto 1rem; 
        color: var(--color-blue)
    }
    a{
        display: inline-block;
        margin: auto 2rem auto auto;
        background-color: transparent;
        border:none;
        
    }
`;

function Navbar() {
    const dispatch = useDispatch();


    return (
        <NavbarContainer>
            <h1>Discord Dev Bot</h1>
            <NavLink to="/server"> Server List </NavLink>
            <NavLink to="/message"> Message Bot</NavLink>
            <NavLink to="/">Logout</NavLink>
            
        </NavbarContainer>
    );
}

export default Navbar;