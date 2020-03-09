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
        width: 0 !important; 
    }

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

        color: var(--color-text);
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
