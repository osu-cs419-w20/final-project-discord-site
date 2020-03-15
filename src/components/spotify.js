import React, { useState, useEffect } from 'react';
import {useParams} from 'react-router-dom';
import queryString from 'query-string';
import styled from '@emotion/styled';
import fetch from 'isomorphic-unfetch';
import {baseUrlSpotify} from '../App.js';
import Spinner from './spinner.js';
import ErrorContainer from './errorContainer.js';
import config from '../config.js';

import { useDispatch } from 'react-redux';
import { initUser } from '../redux/actions';

const SpotifyMainContainer = styled.main`
    display: grid;
    grid-template-columns: 1fr 2fr max-content 2fr 1fr;
    grid-template-rows: 1fr 5fr 1fr;
    grid-template-areas:
    " . . title . ."
    " . spotify spotify spotify ."
    ". . . . .";
    > h1{
        grid-area: title;
    }
    .container{
        grid-area: spotify;
        border-radius: 2px;
        background-color: var(--color-dark-gray);
    }
`;

function Spotify(props) {

    const [ user, setUser ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState("");
    const dispatch = useDispatch();
    const parsed = queryString.parse(props.location.hash);


    useEffect (() => {
        let ignore = false;
        const controller = new AbortController();
        if (parsed.access_token && parsed.refresh_token){
            dispatch(initUser(parsed.access_token, parsed.refresh_token))
        
        

            async function fetchSearchResults() {
                ignore = false;
                let responseBody = {};
                setLoading(true);
                try {
                    const response = await fetch(
                    baseUrlSpotify + `me`,
                    { 
                        signal: controller.signal,
                        headers: {
                            'Authorization': `Bearer ${parsed.access_token}`
                        }
                    }
                    );
                    if (response.status === 401){
                        setError("unauthorized")
                        ignore = true;
                    }
                    responseBody = await response.json();
                } catch (e) {
                    if (e instanceof DOMException) {
                        console.log("== HTTP request aborted");
                    } else {
                        setError(Object.toString(e));
                        console.log(e);
                    }
                }
                

                if (!ignore) {
                    setError("");
                    setLoading(false);
                    setUser(responseBody);
                } else {
                    // console.log("== ignoring results");
                }
            }

            fetchSearchResults();
        }
        return () => {
            controller.abort();
            ignore = true;
        };

    }, [parsed.access_token]);

    useEffect(() => {
        
    }, []);

    function refresh(e){
        if(props.refresh){
            props.refresh()
        }
    }

    return (
        <SpotifyMainContainer>
            <h1> Spotify </h1>
            {error != "" && <div>{error}</div>}
            <div className="container">
                {!parsed.access_token ?
                    <div>Login at /api/spotify/login</div> :
                    loading ? 
                    <Spinner/> :
                    <div> logged in as {user.display_name ? user.display_name : ""}</div>
                }
            </div>
            
        </SpotifyMainContainer>
    );
}

export default Spotify;