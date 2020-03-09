import React, { useState, useEffect } from 'react';
import {useParams} from 'react-router-dom';
import styled from '@emotion/styled';
import fetch from 'isomorphic-unfetch';
import {baseUrl} from '../App.js';
import Spinner from './spinner.js';
import ErrorContainer from './errorContainer.js';
import config from '../config.js';

const ChannelListContainer = styled.div`
    > div{
        margin: auto;
    }
    ul{
        list-style: none;
        padding: 0;
        margin: 1rem;
        li{
            margin: 1rem auto;
            a{
                img{
                    /* grid-area: icon; */
                    height: 4rem;
                    width: 4rem;
                    border-radius: 100%;
                    margin-right: 1rem;
                }
                color: var(--color-blue);
                text-decoration: none;
                &:hover{
                    color: var(--color-text);
                }
                span{
                    margin: auto .5rem;
                    /* grid-area: text; */
                }
                &.active{
                    color: var(--color-text);
                }
            }
        }
    }
`;

function ChannelList(props) {

    const [ channels, setChannels ] = useState([]);
    const [ openChannel, setOpenChannel ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState(false);
    const { serverID } = useParams();

    useEffect(() => {
        let ignore = false;
        const controller = new AbortController();

        async function fetchSearchResults() {
            ignore = false;
            let responseBody = {};
            setLoading(true);
            try {
                const response = await fetch(
                baseUrl + `guilds/${serverID}/channels?type=1`,
                { 
                    signal: controller.signal,
                    headers: {
                        'Authorization': `Bot ${config.token}`
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
                if(Array.isArray(responseBody)) setChannels(responseBody);
            } else {
                //console.log("== ignoring results");
            }
        }

        fetchSearchResults();
        return () => {
            controller.abort();
            ignore = true;
        };
    }, [props.refresh, serverID]);
    function openChat(channel){
        if (props.openChat){
            setOpenChannel(channel);
            props.openChat(channel);
            // console.log(channel);
        }
    }

    return (
        <ChannelListContainer>
            {error && <ErrorContainer>Error</ErrorContainer>}
            {loading ? (
                <Spinner/>
            ) :
                <ul>
                {channels.map(channel => (
                    <li key={channel.id}>
                        <a 
                            onClick={() => openChat(channel)}
                            className={openChannel.id === channel.id ? "active" : ""}>
                            <span>{channel.name}</span>
                        </a>
                    </li>
                ))}
                </ul>
            }
        </ChannelListContainer>
    );
}

export default ChannelList;