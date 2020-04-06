import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import fetch from 'isomorphic-unfetch';
import {baseUrl, baseUrlSpotify} from '../App.js';
import Spinner from './spinner.js';
import ErrorContainer from './errorContainer.js';
import { getAuthSpotifyUser, getToken } from '../redux/selectors';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Song from './song.js';


const SongListContainer = styled.div`
    display: grid;
    grid-template-rows: 2rem 1fr;
    grid-template-columns: 6fr 4fr;
    overflow: hidden;
    grid-template-areas:
    "search server"
    "songs songs";
    
    > div{
        margin: auto;
    }
    ul{
        grid-area: songs;
        list-style: none;
        padding: 0;
        margin: .5rem;
        overflow: scroll;
        > li:nth-of-type(1){
            border-top: 1px solid var(--color-light-gray);
        }
        li{
            margin: 0;
            padding: .3rem;
            /* box-shadow: 4px 4px 7px black; */
            border-bottom: 1px solid var(--color-light-gray);
        }
    }
    input{
        padding: .4rem;
        grid-area: search;
    }
    select{
        grid-area: server;
    }
`;

function SongList(props) {
    const spotifyUser = useSelector(getAuthSpotifyUser);
    const token = useSelector(getToken);

    const [ songs, setSongs ] = useState([]);
    const [ servers, setServers ] = useState([]);
    const [ serverId, setServerId ] = useState(0);
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState(false);
    const [ search, setSearch ] = useState("");
    const { playlistID } = useParams();

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
                        'Authorization': `Bot ${token}`
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
                setServerId(responseBody[0].id);
            } else {
                // console.log("== ignoring results");
            }
        }
        fetchSearchResults();
        return () => {
            controller.abort();
            ignore = true;
        };
    }, [token]);

    useEffect (() => {
        let ignore = false;
        const controller = new AbortController();
        setSongs([]);
        // let newsongs = songs;

        if (spotifyUser.access_token){
        
            async function fetchSearchResults(url) {
                ignore = false;
                let responseBody = {};
                setLoading(true);
                try {
                    const response = await fetch(url,
                    { 
                        signal: controller.signal,
                        headers: {
                            'Authorization': `Bearer ${spotifyUser.access_token}`
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
                    console.log(responseBody);
                    setError("");
                    setLoading(false);
                    // setSongLists(responseBody);
                    setSongs(songs => [...songs, ...responseBody.items]);

                    if (responseBody.next){
                        fetchSearchResults(responseBody.next);
                    }
                } else {
                    // console.log("== ignoring results");
                }
            }

            fetchSearchResults(`${baseUrlSpotify}playlists/${playlistID}/tracks`);
        }
        return () => {
            controller.abort();
            ignore = true;
        };

    }, [playlistID, spotifyUser.access_token]);

    function updateSearch(e){
        setSearch(e.target.value);
    }
    function updateSelect(e){
        setServerId(e.target.value)
    }

    return (
        <SongListContainer>
            <input 
                    placeholder="search"
                    onChange={updateSearch}
                    value={search} />
                <select
                    onChange={updateSelect}
                    value={serverId}>
                    {servers && servers.map(server => (
                    <option key={server.id} value={server.id}>
                        {server.name}
                    </option>
                    ))}
                </select>
            {error && <ErrorContainer>Error</ErrorContainer>}
            {loading ? (
                <Spinner/>
            ) :
                
                <ul>
                {songs && songs.map(song => 
                    search==="" ||
                    song.track.name.toLowerCase().includes(search.toLowerCase()) ||
                    song.track.artists.map(artist => artist.name.toLowerCase()).join().includes(search.toLowerCase())
                    ? (
                        <li key={song.track.id}>
                            <Song 
                                song={song} 
                                guildId={serverId} />
                        </li>
                    ) : ""
                )}
                </ul>
            }
        </SongListContainer>
    );
}

export default SongList;