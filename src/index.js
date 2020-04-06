import React from 'react';
import ReactDOM from 'react-dom';

import { Provider } from 'react-redux'
import { Global, css } from '@emotion/core';
import { BrowserRouter } from 'react-router-dom';

import App from './App';
import store from './redux/store';

const globalStyles = css`
    @import url('https://fonts.googleapis.com/css?family=Emilys+Candy&display=swap');
    
    ::-webkit-scrollbar {
    background-color:transparent;
    width:16px
}

    /* background of the scrollbar except button or resizer */
    ::-webkit-scrollbar-track {
        background-color:transparent
    }

    /* scrollbar itself */
    ::-webkit-scrollbar-thumb {
        background-color:#babac0;
        border-radius:8px;
        border:4px solid transparent
    }
    ::-webkit-scrollbar-corner {display: none}

    /* set button(top and bottom of the scrollbar) */
    ::-webkit-scrollbar-button {display:none}

    body {
        margin: 0;
        font-family: sans-serif;
        overflow: hidden;
        --color-blue : #7289da;
        --color-white : #ffffff;
        --color-light-gray : #43474c;
        --color-gray : #2c2f33;
        --color-dark-gray : #23272a;
        --color-text : #dadbdc;
        --color-spotify : #1DB954;

        color: var(--color-text);
        input{
            background-color: var(--color-light-gray);
            border: 1px solid var(--color-dark-gray);
            border-radius: 2px;
            font-size: 1.5rem;
            color: var(--color-text);
        }
        
    }
`;

ReactDOM.render(
    <Provider store={store}>
        <Global styles={globalStyles} />
        <BrowserRouter basename={'/disc'}>
            <App />
        </BrowserRouter>
    </Provider>, 
    document.getElementById('root')
);
