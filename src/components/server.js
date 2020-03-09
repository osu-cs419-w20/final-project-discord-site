import React from 'react';
import styled from '@emotion/styled';
import ServerList from './serverList'

const ServerMainContainer = styled.main`
    display: grid;
    grid-template-columns: 1fr 2fr max-content 2fr 1fr;
    grid-template-rows: 1fr 5fr 1fr;
    grid-template-areas:
    " . . title . ."
    " . serverList serverList serverList ."
    ". instructions instructions instructions .";
    > h1{
        grid-area: title;
    }
    > div{
        grid-area: serverList;
        border-radius: 2px;
        background-color: var(--color-dark-gray);
    }
    > p{
        grid-area: instructions;
        margin: auto;
    }
`;

function Server() {
    return (
        <ServerMainContainer>
            <h1>Server List</h1>
            <ServerList />
            <p>Follow instructions on home page to add your server</p>
        </ServerMainContainer>
    );
}

export default Server;