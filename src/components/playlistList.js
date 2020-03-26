import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import {Link, useParams} from 'react-router-dom';
import fetch from 'isomorphic-unfetch';
import {baseUrlSpotify} from '../App.js';
import Spinner from './spinner.js';
import ErrorContainer from './errorContainer.js';
import { getAuthSpotifyUser } from '../redux/selectors';
import { useSelector } from 'react-redux';


const PlaylistListContainer = styled.div`
    > div{
        margin: auto;
    }
    ul{
        list-style: none;
        padding: 0;
        margin: 1rem;
        > li:nth-of-type(1){
            border-top: 1px solid var(--color-light-gray);
        }
        li{
            margin: 0;
            padding: .5rem .3rem;
            border-bottom: 1px solid var(--color-light-gray);
            a{
                padding: .3rem;
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
                    /* border-radius: 100%; */
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

function PlaylistList(props) {
    const spotifyUser = useSelector(getAuthSpotifyUser);

    const [ playlists, setPlaylists ] = useState([]);
    const [ playlistList, setPlaylistLists ] = useState({});
    const [ loading, setLoading ] = useState(false);
    const [ error, setError ] = useState(false);
    const { playlistID } = useParams();


    useEffect (() => {
        let ignore = false;
        const controller = new AbortController();
        // let newplaylists = playlists;

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
                    // console.log(responseBody);
                    setError("");
                    setLoading(false);
                    setPlaylistLists(responseBody);
                    // console.log("1", playlists);
                    setPlaylists(playlists => [...playlists, ...responseBody.items]);
                    // console.log("2", playlists);

                    if (responseBody.next){
                        fetchSearchResults(responseBody.next);
                    }
                } else {
                    // console.log("== ignoring results");
                }
            }

            fetchSearchResults(`${baseUrlSpotify}me/playlists`);
        }
        return () => {
            controller.abort();
            ignore = true;
        };

    }, [spotifyUser]);

    function refresh(e){
        if(props.refresh){
            props.refresh()
        }
    }

    return (
        <PlaylistListContainer>
            {error && <ErrorContainer>Error</ErrorContainer>}
            {loading ? (
                <Spinner/>
            ) :
                <ul>
                {playlists && playlists.map(playlist => (
                    <li key={playlist.id}>
                        <Link 
                            className={playlistID === playlist.id ? "active" : ""}
                            to={`/spotify/${playlist.id}`}
                            onClick={e => refresh(e)}
                            >
                        { props.icon != 'false' && 
                                <img src={playlist.images[0].url} /> }
                        <span>{playlist.name}</span>
                        </Link>
                    </li>
                ))}
                </ul>
            }
        </PlaylistListContainer>
    );
}

export default PlaylistList;