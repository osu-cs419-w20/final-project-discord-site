/** @jsx jsx */

import React , {useState, useEffect, useRef} from 'react';
import { useDispatch } from 'react-redux';
import { jsx, css } from '@emotion/core'
import { logoutUser } from '../redux/actions';
import { NavLink } from 'react-router-dom';

const styles = css`
    margin: 0;
    padding: 1rem;
    width: 100vw;
    background-color: var(--color-dark-gray);
    display: flex;
    button{
      display: none;
    }

    @media screen and (max-width: 768px){
        transition: 0.3s;
        /* max-height: 20vh; */
        padding: 0 .5rem .5rem .5rem;
        min-height: auto;
        height: 30vh; 
        width: 40vw;
        position: fixed;
        z-index: 1; 
        top: .5rem; 
        right: .5rem;
        flex-direction: column;
        background-color: var(--color-light-gray);
        

        &.closed{
            width: 2rem;
            background-color: transparent;
            a{
                display: none;
            }
            label{
                display: none;
            }
            
        }
        &.open{
            button{
                &::after{
                    content: '\\276F'; 
                }
            }
            .linkContainer{
                flex-direction: column;
                margin: auto 0;
                a{
                    margin: 0 auto ;
                    font-size: 1.5rem;
                    padding: .3rem 0;
                }
            }
            a{
                white-space: nowrap;
            }
        }
        .title{
            margin: .5rem auto auto auto;

            h1{            
                display: none;
            }
            &::after{
                font-size: 1.5rem;
                content: "Home";
            }
            
        }
        button{
            display: inline-block;
            background: none;
            border: none;
            font-size: 2rem;
            transition: 0.3s;
            /* top: .6rem; */
            right: 1rem;
            position: absolute;
            &:hover{
                ::after{
                    color: var(--color-text);
                }
            }
            &::after{
                display: block;
                color: var(--color-blue);
                content: '\\2630'; 
                
            }
        }
    }
    
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
        display: flex;
        margin: auto 2rem auto auto;
        a{
            margin: auto 2rem auto auto;
        }
    }
    
`;



function Navbar() {
    const [ closed, setClosed ] = useState(true);
    const dispatch = useDispatch();
    const wrapperRef = useRef(null);

    function useOutsideAlerter(ref) {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
          if (!closed && ref.current && !ref.current.contains(event.target)) {
            setClosed(true);
          }
        }
      
        useEffect(() => {
          // Bind the event listener
          document.addEventListener("mousedown", handleClickOutside);
          return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
          };
        });
      }


    useOutsideAlerter(wrapperRef);

    function toggleDrawer(){
        setClosed(!closed);
    }
    
    return (
        <nav 
            ref={wrapperRef} 
            css={styles} 
            className={`${closed ? 'closed' : 'open'}`}
        >
            <button onClick={toggleDrawer} />
            <NavLink className="title" exact to="/"><h1>Discord Dev Bot</h1></NavLink>
            <div className="linkContainer">
                <NavLink to="/server"> Server List </NavLink>
                <NavLink to="/message"> Message Bot</NavLink>
                <NavLink exact
                    to="/" 
                    onClick={() => dispatch(logoutUser())}>
                    Logout
                </NavLink>
            </div>
        </nav>
    );
}

export default Navbar;