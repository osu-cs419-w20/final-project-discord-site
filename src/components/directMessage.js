import React, { useState, useEffect }from 'react';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import Chat from './chat';
import GetAuthChannel from './getAuthChannel';
import {baseUrl} from '../App.js';
import config from '../config.js';
import {getAuthDiscord, getToken} from '../redux/selectors';


const DirectMessageMainContainer = styled.main`
    display: grid;
    grid-template-columns: 1fr 2fr max-content 2fr 1fr;
    grid-template-rows: max-content 80vh 1fr;
    grid-template-areas:
    " . . title . ."
    " . chat chat chat ."
    ". . . . .";
    > h1{
        grid-area: title;
    }
    > div{
        grid-area: chat;
        border-radius: 2px;
        background-color: var(--color-dark-gray);
    }
`;

function DirectMessage() {
    const authDiscord = useSelector(getAuthDiscord);
    const token = useSelector(getToken);

    
    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        async function fetchSearchResults() {
            ignore = false;
            let responseBody = {};
            try {
                const response = await fetch(
                baseUrl + `/channels/${authDiscord.channel.id}`,
                { 
                    signal: controller.signal,
                    headers: {
                        'Authorization': `Bot ${token}`
                    }
                }
                );
                responseBody = await response.json();
            } catch (e) {
                if (e instanceof DOMException) {
                    ignore = true;
                    console.log("== HTTP request aborted");
                } else {
                    console.log(e);
                }
            }
            if (responseBody.message === "You are being rate limited."){
                ignore = true;
                console.log("Discord API rate limit for Servers, retrying in: ", responseBody.retry_after)
                setTimeout(fetchSearchResults, responseBody.retry_after);
            }
            if (!ignore) {
                //  setAuthChannel(responseBody);
            } 
        }
        console.log(authDiscord);
        if(authDiscord){
            // fetchSearchResults();
        }
        return () => {
            controller.abort();
            ignore = true;
        };
    }, [authDiscord]);


    return (
        <DirectMessageMainContainer>
            <h1>Direct Message</h1>
            {authDiscord.channel ? 
                <Chat channel={authDiscord.channel} /> :
                <GetAuthChannel />
            }
            
        </DirectMessageMainContainer>
    );
}

export default DirectMessage;