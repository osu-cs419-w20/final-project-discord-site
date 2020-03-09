import React, { useState, useEffect } from 'react';
import {Link, useParams} from 'react-router-dom';
import styled from '@emotion/styled';
import fetch from 'isomorphic-unfetch';
import {baseUrl} from '../App.js';
import Spinner from './spinner.js';
import ErrorContainer from './errorContainer.js';
import config from '../config.js';

const ServerListContainer = styled.div`
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
                display: grid;
                grid-template-rows: 1fr max-content 1fr;
                grid-template-columns: max-content 1fr;

                grid-template-areas:
                "icon ."
                "icon text"
                "icon .";
                &.noIcon{
                    grid-template-areas:
                        ". ."
                        "text text"
                        ". .";
                }

                img{
                    grid-area: icon;
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
                    grid-area: text;
                }
                &.active{
                    color: var(--color-text);
                }
            }
        }
    }
`;

function ServerList(props) {

    const [ servers, setServers ] = useState([]);
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
                baseUrl + `users/@me/guilds`,
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
                setServers(responseBody);
            } else {
                // console.log("== ignoring results");
            }
        }
        console.log()
        fetchSearchResults();
        return () => {
            controller.abort();
            ignore = true;
        };
    }, []);

    function refresh(e){
        if(props.refresh){
            props.refresh()
        }
    }

    return (
        <ServerListContainer>
            {error && <ErrorContainer>Error</ErrorContainer>}
            {loading ? (
                <Spinner/>
            ) :
                <ul>
                {servers.map(server => (
                    <li key={server.id}>
                        <Link 
                            className={`${props.icon == 'false' ? "noIcon" : ""} 
                                        ${server.id == serverID ? 'active' : ''}`} 
                            to={`/server/${server.id}`}
                            onClick={e => refresh(e)}
                        >
                            { props.icon != 'false' && 
                                <img src={`https://cdn.discordapp.com/icons/${server.id}/${server.icon}`} /> }
                            <span>{server.name}</span>
                        </Link>
                    </li>
                ))}
                </ul>
            }
        </ServerListContainer>
    );
}

export default ServerList;