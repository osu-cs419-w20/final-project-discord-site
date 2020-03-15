import React from 'react';
import styled from '@emotion/styled';

const WelcomeMainContainer = styled.main`
    display: grid;
    grid-template-columns: 1fr 2fr max-content 2fr 1fr;
    grid-template-rows: 1fr 5fr 1fr;
    grid-template-areas:
    " . . title . ."
    " . text text text ."
    ". . . . .";
    > h1{
        grid-area: title;
    }
    > p{
        grid-area: text;
        margin: auto;
    }
`;

function Welcome() {
    return (
        <WelcomeMainContainer>
            <h1>Welcome </h1>
            <p>Instructions to add bot to server</p>
        </WelcomeMainContainer>
    );
}

export default Welcome;