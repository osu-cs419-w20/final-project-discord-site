import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import fetch from 'isomorphic-unfetch';
import {baseUrlSpotify} from '../App.js';
import Spinner from './spinner.js';
import ErrorContainer from './errorContainer.js';
import { getAuthSpotifyUser } from '../redux/selectors';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import Song from './song.js';


const SongListContainer = styled.div`
    display: grid;
    grid-template-rows: 2rem 1fr;
    overflow: hidden;
    
    > div{
        margin: auto;
    }
    ul{
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
    }
`;

function SongList(props) {
    const spotifyUser = useSelector(getAuthSpotifyUser);

    const [ songs, setSongs ] = useState([]);
    const [ songList, setSongLists ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState(false);
    const [ search, setSearch ] = useState("");
    const { playlistID } = useParams();


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
                    setSongLists(responseBody);
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

    }, [playlistID]);

    function updateSearch(e){
        setSearch(e.target.value);
    }

    return (
        <SongListContainer>
            <input 
                placeholder="search"
                onChange={updateSearch}
                value={search} />
            {error && <ErrorContainer>Error</ErrorContainer>}
            {loading ? (
                <Spinner/>
            ) :
                <ul>
                {songs.map(song => 
                    search==="" ||
                    song.track.name.toLowerCase().includes(search.toLowerCase()) ||
                    song.track.artists.map(artist => artist.name.toLowerCase()).join().includes(search.toLowerCase())
                    ? (
                        <li key={song.track.id}>
                            <Song song={song} />
                        </li>
                    ) : ""
                )}
                </ul>
            }
        </SongListContainer>
    );
}

export default SongList;