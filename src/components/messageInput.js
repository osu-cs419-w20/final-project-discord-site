import React, { useState} from 'react';
import styled from '@emotion/styled';
import fetch from 'isomorphic-unfetch';
import {baseUrl} from '../App.js';
import { FaPaperPlane } from 'react-icons/fa';
import { getToken } from '../redux/selectors';
import { useSelector } from 'react-redux';


const Form = styled.form`
    min-height: 3rem;
    border-top: 3px solid var(--color-gray);
    padding: .2rem;
    display: grid;
    grid-template-columns: 1fr max-content;
    
    button{
        border: 1px solid var(--color-dark-gray);
        background-color: var(--color-blue);
        border-radius: 2px;
        color: var(--color-text);
        font-size: 1.5rem;
    }

`;


function MessageInput(props) {
    const token = useSelector(getToken);


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
                    'Authorization': `Bot ${token}`
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
            <button type="submit"><FaPaperPlane/></button>
        </Form> 
    );
}

export default MessageInput;