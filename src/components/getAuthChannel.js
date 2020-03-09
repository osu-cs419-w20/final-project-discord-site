import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useDispatch } from 'react-redux';

import { addDirectMessage } from '../redux/actions';
import Spinner from './spinner.js';
import ErrorContainer from './errorContainer.js';
import config from '../config.js';
import {Client} from "discord.js";

// const Discord = require("discord.js");

const AuthContainer = styled.div`
    .instructions{
        text-align: center;
    }
`;


function maketoken(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}


function GetAuthChannel(props) {

    const [ token, setToken ] = useState(maketoken(8));
    const [ ready, setReady ] = useState(false);
    const [ error, setError ] = useState(false);
    const client = new Client();
    const dispatch = useDispatch();
    let channelID = 0;
    let authorID = 0;

    // const [sticky] = useSticky();

    //login bot on load
    useEffect(() => {
        client.login(config.token);
        client.on('ready', () => {
            console.log("Auth Client ready!");
            setReady(true);
        });

        return () => {
            client.destroy() ;
            setReady(false)
            console.log("Auth Client destroyed");
        };
    }, []);

    //update the channel when auth message is received from discord.js
    useEffect(() => {

        async function callback(msg){
            if (msg.content === token && msg.channel.type === "dm"){
                // channelID = msg.channel.id;
                // authorID = msg.author.id;
                msg.channel.send('Authenticated').then( () => {
                    dispatch(addDirectMessage(msg.author.id, msg.channel));
                    // props.setChannelID(channelID);
                    // props.setUserID(authorID);
                    setToken("");

                });

                
            } 
        };
        client.on('message', callback);

        return () => {
            client.removeListener('message', callback);
        };
    }, []);


    return (
        <AuthContainer>
            <div className="warnings">
                {error && <ErrorContainer>Error</ErrorContainer>}
            </div>

            {!ready ? ( <Spinner/> ) :
                <div className="instructions">
                    <span>Direct Message</span>
                    <h1>{token}</h1> 
                    <span>to authenticate.</span> 
                </div>
            }
            
        </AuthContainer>
    );
}

export default GetAuthChannel;