import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux'
import { Global, css } from '@emotion/core';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import store from './redux/store';

const globalStyles = css`
    @import url('https://fonts.googleapis.com/css?family=Emilys+Candy&display=swap');
    

    body {
        margin: 0;
        font-family: sans-serif;
        overflow: hidden;
        --color-blue : #7289da;
        --color-white : #ffffff;
        --color-light-gray : #99aab5;
        --color-gray : #2c2f33;
        --color-dark-gray : #23272a;
    }
    button{
        margin: 3px;
        padding: .3rem .5rem;
        background-color: #FEA0B0;
        border: none;
        border-radius: 3px;
        &:hover{
            background-color: #E6B3D9;
            &:disabled{
                background-color: gray;
            }
        } 
        &:disabled{
            background-color: gray;
        }
    }
`;

ReactDOM.render(
    <Provider store={store}>
        <Global styles={globalStyles} />
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Provider>, 
    document.getElementById('root')
);
