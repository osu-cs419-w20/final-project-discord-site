import React, {useState} from 'react';
import styled from '@emotion/styled';
import SongList from './songList';
import PlaylistList from './playlistList';

import { FaPlay, FaArrowLeft } from 'react-icons/fa';

const SpotifySongsMainContainer = styled.main`
    display: grid;
    grid-template-columns: .5fr minmax(10rem,max-content) minmax(10rem,max-content) 3fr .5fr;
    grid-template-rows: 2rem 80vh 2rem;
    grid-template-areas:
    " . . title . ."
    " . serverList channelList channelChat ."
    ". . . . .";
    gap: 1rem;
    > h1{
        grid-area: title;
    }
    > div:nth-of-type(1){
        grid-area: serverList;
        border-radius: 2px;
        background-color: var(--color-dark-gray);
        overflow: scroll;
    }
    > div:nth-of-type(2){
        grid-area: channelList;
        border-radius: 2px;
        background-color: var(--color-dark-gray);
        overflow: hidden;
    }
    > p{
        grid-area: instructions;
        margin: auto;
    }
    > button{
        display: none;
    }

    @media screen and (max-width: 768px){
        grid-template-columns: 1fr max-content 1fr;
        grid-template-rows: 8vh 87vh 5vh;

        margin: 0 .5rem;
        gap: .2rem;
        grid-template-areas:
        ". title . "
        "left center right "
        ". . . ";
        > button{
            display: block;
            position: absolute;
            margin: 1rem;
            font-size: 1.5rem;
            padding-top: .3rem;
            color: var(--color-text);
            background-color: var(--color-blue);
            border: none;
            border-radius: 2px;
            /* &:after{
                content: '\\f27a';
            } */
        }

        > div:nth-of-type(1){
            grid-area: ${props => props.open ? 'left' : '2 / 1 / 3 / 5'};
            border-radius: 2px;
            background-color: var(--color-dark-gray);
            overflow: scroll;
            display: ${props => props.open ? 'none' : 'block'};
        }
        > div:nth-of-type(2){
            grid-area: ${props => props.open ? '2 / 1 / 3 / 5' : 'right'};
            border-radius: 2px;
            background-color: var(--color-dark-gray);
            overflow: hidden;
            display: ${props => props.open ? 'grid' : 'none'};

        }
    }
`;

function SpotifySongs() {
    const [ refresh, setRefresh ] = useState(0);
    const [ channel, setChannel ] = useState({});
    const [ songOpen, setSongOpen ] = useState(true);

    function incRefresh(){
        setRefresh(refresh + 1);
        setSongOpen(true);
    }
    function updateChannel(ch){
        // console.log("serverchannels ", ch);
        setChannel(ch);
        setSongOpen(true);
    }
    function toggleSong(){
        setSongOpen(!songOpen);
    }

    return (
        <SpotifySongsMainContainer open={songOpen}>
            <button onClick={toggleSong}>{songOpen ? <FaArrowLeft/> :<FaPlay/>} </button>
            <PlaylistList refresh={incRefresh}/>
            <SongList/>
            
        </SpotifySongsMainContainer>
    );
}

export default SpotifySongs;