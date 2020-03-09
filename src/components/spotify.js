import React, { useState, useEffect } from 'react';
import {Link, useParams} from 'react-router-dom';
import styled from '@emotion/styled';
import fetch from 'isomorphic-unfetch';
import {baseUrl} from '../App.js';
import Spinner from './spinner.js';
import ErrorContainer from './errorContainer.js';
import config from '../config.js';

import { useDispatch } from 'react-redux';
import { initUser } from '../redux/actions';

const SpotifyMainContainer = styled.main`
    
`;

function Spotify(props) {

    const dispatch = useDispatch();


    // const [ user, setUser ] = useState({});
    // const [ loading, setLoading ] = useState(false);
    // const [ error, setError ] = useState(false);

    // const { serverID } = useParams();

    // useEffect(() => {
    //     let ignore = false;
    //     const controller = new AbortController();

    //     async function fetchSearchResults() {
    //         ignore = false;
    //         let responseBody = {};
    //         setLoading(true);
    //         try {
    //             const response = await fetch(
    //             baseUrl + `users/@me/guilds`,
    //             { 
    //                 signal: controller.signal,
    //                 headers: {
    //                     'Authorization': `Bot ${config.token}`
    //                 }
    //             }
    //             );
    //             responseBody = await response.json();
    //         } catch (e) {
    //             if (e instanceof DOMException) {
    //                 console.log("== HTTP request aborted");
    //             } else {
    //                 setError(true);
    //                 console.log(e);
    //             }
    //         }
    //         if (responseBody.message === "You are being rate limited."){
    //             ignore = true;
    //             console.log("Discord API rate limit for Servers, retrying in: ", responseBody.retry_after)
    //             setTimeout(fetchSearchResults, responseBody.retry_after);
    //         }
    //         if (!ignore) {
    //             setError(false);
    //             setLoading(false);
    //             setUser(responseBody);
    //         } else {
    //             // console.log("== ignoring results");
    //         }
    //     }
    //     console.log()
    //     fetchSearchResults();
    //     return () => {
    //         controller.abort();
    //         ignore = true;
    //     };
    // }, []);

    function refresh(e){
        if(props.refresh){
            props.refresh()
        }
    }

    return (
        <SpotifyMainContainer>
            
        </SpotifyMainContainer>
    );
}

export default Spotify;