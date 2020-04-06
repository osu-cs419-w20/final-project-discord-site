import React, { useState, useEffect } from 'react';
import queryString from 'query-string';
import styled from '@emotion/styled';
import fetch from 'isomorphic-unfetch';
import {baseUrlSpotify} from '../App.js';
import Spinner from './spinner.js';
import PlaylistList from './playlistList';

import { getAuthSpotifyUser } from '../redux/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { initUser } from '../redux/actions';

const SpotifyMainContainer = styled.main`
    display: grid;
    grid-template-columns: 1fr 2fr max-content 2fr 1fr;
    grid-template-rows: max-content 70vh 2rem;
    grid-template-areas:
    " . title title title ."
    " . spotify spotify spotify ."
    ". . . . .";
    max-height: 100vh;
    > h1{
        grid-area: title;
        margin-left: auto;
        margin-right: auto;
    }
    .container{
        grid-area: spotify;
        overflow: scroll;
        border-radius: 2px;
        background-color: var(--color-dark-gray);
    }
`;

function Spotify(props) {

    const [ authUser, setAuthUser ] = useState(useSelector(getAuthSpotifyUser));
    // const [ user, setUser ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState("");
    const dispatch = useDispatch();
    const parsed = queryString.parse(props.location.hash);


    useEffect (() => {
        let ignore = false;
        const controller = new AbortController();
        if (parsed.access_token && parsed.refresh_token){
        
            async function fetchSearchResults() {
                ignore = false;
                // let responseBody = {};
                setLoading(true);
                try {
                    const response = await fetch(
                    `${baseUrlSpotify}me`,
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
                    // responseBody = await response.json();
                } catch (e) {
                    if (e instanceof DOMException) {
                        console.log("== HTTP request aborted");
                    } else {
                        setError(Object.toString(e));
                        console.log(e);
                    }
                }
                

                if (!ignore) {
                    // console.log(responseBody);
                    setError("");
                    setLoading(false);
                    // setUser(responseBody);
                    setAuthUser({access_token: parsed.access_token, refresh_token: parsed.refresh_token})
                    dispatch(initUser(parsed.access_token, parsed.refresh_token))
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

    }, [parsed.access_token, parsed.refresh_token, dispatch]);


    return (
        <SpotifyMainContainer>
            <h1> Spotify </h1>
            <div className="container">
                

                {!authUser.access_token ?
                    <div>Login at /api/spotify/login</div> :
                    loading ? 
                        error !== "" ? 
                            <div>{error}</div> : 
                            <Spinner/> 
                        :
                        <PlaylistList />
                }
            </div>
            
        </SpotifyMainContainer>
    );
}

export default Spotify;