import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { useDispatch } from 'react-redux';

import { addDirectMessage } from '../redux/actions';
import Spinner from './spinner.js';
import ErrorContainer from './errorContainer.js';
import {baseUrl} from "../App";
import { getToken } from '../redux/selectors';
import { useSelector } from 'react-redux';

const Discord = require('../../node_modules/discord.js/webpack/discord.min.js');

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
    const token = useSelector(getToken);
    
    const [ DMToken, setDMToken ] = useState(maketoken(8));
    const [ ready, setReady ] = useState(false);
    const [ error, setError ] = useState(false);
    const client = new Discord.Client();
    const dispatch = useDispatch();
    // let channelID = 0;
    // let authorID = 0;

    // const [sticky] = useSticky();

    //login bot on load
    useEffect(() => {
        // console.log(token)
        client.login(token);
        client.on('ready', () => {
            console.log("Auth Client ready!");
            setReady(true);
        });

        return () => {
            client.destroy() ;
            setReady(false)
            console.log("Auth Client destroyed");
        };
    }, [token]);

    //update the channel when auth message is received from discord.js
    useEffect(() => {

//PUT/channels/{channel.id}/messages/{message.id}/reactions/{emoji}
        async function callback(msg){
            if (msg.content === DMToken){
                const response = await fetch(
                    `${baseUrl}channels/${msg.channel.id}/messages/${msg.id}/reactions/%E2%9C%85/@me`,
                    {
                        method: 'PUT',
                        headers: {
                            'Authorization': `Bot ${token}`
                        }
                    }
                    );
                    if (response.status !== 200){
                        console.log(response);
                        setError(true);//gets undone immediatly, just getting rid of the warning
                    }
                    setError(false);
                    // const responseBody = await response.json();
                    // console.log("== Response:", responseBody);
                // channelID = msg.channel.id;
                // authorID = msg.author.id;
                // msg.channel.send('t').then( () => {
                    setDMToken("");
                    dispatch(addDirectMessage(msg.author.id, msg.channel));

                // });

                
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
                    <h1>{DMToken}</h1> 
                    <span>to authenticate.</span> 
                </div>
            }
            
        </AuthContainer>
    );
}

export default GetAuthChannel;