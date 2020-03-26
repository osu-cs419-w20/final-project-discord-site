import React from 'react';
import styled from '@emotion/styled';
import config from '../config';

import { FaPlay, FaArrowRight } from 'react-icons/fa';

const SongContainer = styled.div`

    display: grid;
    grid-template-rows: 1rem 1fr 1fr 1rem;
    grid-template-columns: max-content 6fr 4fr;
    gap: .3rem;
    grid-template-areas:
    "image title ."
    "image title actions"
    "image artists actions"
    "image artists .";

    img{
        grid-area: image;
        margin: auto;
        width: 100%;
    }
    .artists{
        grid-area: artists;
        font-size: .8rem;
        text-overflow: ellipsis;
        margin: auto 0;
    }
    .title{
        grid-area: title;
        text-overflow: ellipsis;
        margin: auto 0;
    }
    .actionsContainer{
        grid-area: actions;
        margin: auto;
        display: flex;
        > button:nth-of-type(1){
            padding-left: .5rem;
        }
        button{
            margin: .5rem;
            color: var(--color-spotify);
            height: 2rem;
            width: 2rem;
            border-radius: 1rem;
            border: 1px solid var(--color-spotify);
            background-color: transparent;
            font-size: 1rem;
            line-height: 2rem;
            &:hover{
                color: var(--color-text);
                border: 1px solid var(--color-text);

            }
        }
    }

`;


function Song(props) {

    async function queueSong(when){
        let ignore = false;
        const controller = new AbortController();

        async function sendRequest(idx) {
            ignore = false;
            let responseBody = {};
            const query = `${props.song.track.name} ${props.song.track.artists.map(artist => artist.name).join(' ')}`
            let params = {q:query, idx:idx};
            let url = new URL(`${config.appURL}/api/song`);
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
            // setLoading(true);
            try {
                const response = await fetch(url,
                    { 
                        method: 'post',
                        signal: controller.signal,
                    }
                );
                if (response.status === 400){
                    ignore = true;
                    // setError(true);
                } else {
                    // responseBody = await response.json();
                }
            } catch (e) {
                if (e instanceof DOMException) {
                    console.log("== HTTP request aborted");
                } else {
                    // setError(true);
                    console.log(e);
                }
            }
            if (!ignore) {
                // setError(false);
                console.log("added", props.song.track.name);
                // dispatch(addToken(responseBody.token));
            } else {
                // console.log("== ignoring results");
            }
        }
        // const when = e.target.getAttribute('when');
        // console.log(e.target.getAttribute('when'))
        // console.log(typeof(e.target.getAttribute('when')))
        switch(when){
            case "end":
                console.log("at end");
                sendRequest(-1);
                break;
            case "next":
                console.log("at next");

                sendRequest(0);
                break;
            defualt:
            console.log("at default");

                sendRequest(-1);
        }
        // sendRequest(0);
        return () => {
            controller.abort();
            ignore = true;
        };
    }

    return (
        <SongContainer>
            <img src={props.song.track.album.images[2].url} />
            <span className="artists">{props.song.track.artists.map(artist => artist.name).join(', ')}</span>
            <span className="title">{props.song.track.name}</span>
            <div className="actionsContainer">
                <button className="queue" when="end" onClick={() => queueSong("end")}><FaPlay/></button>
                <button className="next" when="next" onClick={() => queueSong("next")}><FaArrowRight/></button>
            </div>
        </SongContainer>
    );
}

export default Song;