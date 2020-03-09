import React, { useState, useEffect} from 'react';
import styled from '@emotion/styled';
import fetch from 'isomorphic-unfetch';
import {baseUrl} from '../App.js';
import config from '../config.js';

const Form = styled.form`
    min-height: 3rem;
    border-top: 3px solid var(--color-gray);
    padding: .2rem;
    display: grid;
    grid-template-columns: 1fr max-content;
    input{
        background-color: var(--color-light-gray);
        border: 1px solid var(--color-dark-gray);
        border-radius: 2px;
    }
    button{
        border: 1px solid var(--color-dark-gray);
        background-color: var(--color-blue);
        border-radius: 2px;
        color: var(--color-text);
    }

`;


function MessageInput(props) {

    const [ message, setMessage ] = useState("");

    function handleChange(e){
        setMessage(e.target.value);
    }

    function handleSubmit(e){
        sendPost(message);
        setMessage("");
        e.preventDefault();
    }

    async function sendPost(content) {
        if (content) {
            const response = await fetch(
            `${baseUrl}/channels/${props.channel.id}/messages`,
            {
                method: 'POST',
                body: JSON.stringify({
                    content: message
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bot ${config.token}`
                }
            }
            );
            const responseBody = await response.json();
            console.log("== Response:", responseBody);
        }
    }
    
    return (
        <Form onSubmit={handleSubmit}>
            <input
                name="message"
                type="text"
                value={message}
                onChange={handleChange} 
                disabled={props.disabled || null}
                />
            <button type="submit">Send</button>
        </Form> 
    );
}

export default MessageInput;