import React from 'react';
import styled from '@emotion/styled';
import { useDispatch } from 'react-redux';

import { logoutUser } from '../redux/actions';
import { NavLink } from 'react-router-dom';

const NavbarContainer = styled.nav`
    margin: 0;
    padding: 1rem;
    width: 100vw;
    background-color: var(--color-dark-gray);
    display: grid;
    grid-template-columns: 40vw 60vw;
    
    a{
        color: var(--color-blue);
        text-decoration: none;
        &:hover{
            color: var(--color-white);
        }
        &:active{
            color: var(--color-blue);
        }
        h1{
            margin: auto 0;
        }
    }
    .linkContainer{
        margin: auto 2rem auto auto;
        a{
            margin: auto 2rem auto auto;
        }
    }
    
`;

function Navbar() {
    const dispatch = useDispatch();
    return (
        <NavbarContainer>
            <NavLink to="/"><h1>Discord Dev Bot</h1></NavLink>
            <div className="linkContainer">
                <NavLink to="/server"> Server List </NavLink>
                <NavLink to="/message"> Message Bot</NavLink>
                <NavLink 
                    to="/" 
                    onClick={() => dispatch(logoutUser())}>
                    Logout
                </NavLink>
            </div>
        </NavbarContainer>
    );
}

export default Navbar;