import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import fetch from 'isomorphic-unfetch';
import ScrollToBottom /*, {useSticky}*/ from 'react-scroll-to-bottom';

import { getToken } from '../redux/selectors';
import { useSelector } from 'react-redux';

import {baseUrl} from '../App.js';
import Spinner from './spinner.js';
import ErrorContainer from './errorContainer.js';
import WarningContainer from './warningContainer.js';
import MessageInput from './messageInput.js';
import MessageContainer from './messageContainer.js';
import config from '../config.js';
// import Discord from "discord.js/webpack";
const Discord = require('../../node_modules/discord.js/webpack/discord.min.js');
// const Discord = require("discord.js");

const ChatContainer = styled.div`
    display: grid;
    grid-template-rows: max-content min-content 1fr max-content;
    grid-template-columns: 1fr;
    grid-template-areas:
    " title "
    "warnings"
    "chat"
    "input";
    overflow: hidden;
    h2{
        grid-area: title;
        border-bottom: 3px solid var(--color-gray);
        text-align: center;
        margin: 0;
        padding: .5rem;
        grid-row: 1/2;

    }
    .warnings{
        grid-area: warnings;
    }
    .scrollContainer{
        grid-area: chat;
        overflow: scroll;
        
    }
    form {
        grid-area: input;
    }
`;





function Chat(props) {

    const token = useSelector(getToken);
    const [ messages, setMessages ] = useState([]);
    const [ loading, setLoading ] = useState(false);
    const [ ready, setReady ] = useState(false);
    const [ error, setError ] = useState(false);
    const [ client, setClient ] = useState(new Discord.Client());
    // const [sticky] = useSticky();

    //login bot on load
    useEffect(() => {
        client.login(token);
        client.on('ready', () => {
            console.log("Chat Client ready!");
            setReady(true);
        });

        return () => {
            client.destroy() ;
            setReady(false)
            console.log("Chat Client destroyed");
        };
    }, [token]);

    //fetch starting channel messages using discord API
    useEffect(() => {


        let ignore = false;
        const controller = new AbortController();

        async function fetchSearchResults() {
            ignore = false;
            let responseBody = {};
            setLoading(true);
            try {
                const response = await fetch(
                baseUrl + `channels/${props.channel.id}/messages?limit=30`,
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
                    setError(true);
                    console.log(e);
                }
            }
            if (responseBody.message === "You are being rate limited."){
                ignore = true;
                console.log("Discord API rate limit for Servers, retrying in: ", responseBody.retry_after)
                setTimeout(fetchSearchResults, responseBody.retry_after);
            }
            if (!ignore) {
                setError(false);
                setLoading(false);
                if(Array.isArray(responseBody)) setMessages(responseBody.reverse());
            } else {
                //console.log("== ignoring results");
            }
        }

        if(props.channel.id){
            fetchSearchResults();
        }

        return () => {
            controller.abort();
            ignore = true;
        };
    }, [props.channel]);

    //update the list when new messages are received from discord.js
    
    useEffect(() => {
        async function callback(msg){
            if (msg.channel.id === props.channel.id){
                setMessages(messages.concat(msg))
            }
        };
        client.on('message', callback);

        return () => {
            client.removeListener('message', callback);
        };
    }, [messages]);

    return (
        <ChatContainer>
            <div className="warnings">
            {error && <ErrorContainer>Error</ErrorContainer>}
            {(!ready) && <WarningContainer>Bot loading</WarningContainer>}
            </div>
            <h2>{props.channel.name || "Channel"}</h2>

            {loading ? <Spinner/> :
                <ScrollToBottom className="scrollContainer"> 
                    <MessageContainer messages={messages} />
                </ScrollToBottom>
            }

            <MessageInput disabled={!messages.length || !ready} channel={props.channel}/>
            
        </ChatContainer>
    );
}

export default Chat;