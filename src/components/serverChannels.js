import React, {useState} from 'react';
import styled from '@emotion/styled';
import ServerList from './serverList'
import ChannelList from './channelList'
import Chat from './chat'
import Voice from './voice'

import { FaComment, FaArrowLeft } from 'react-icons/fa';

const ServerChannelsMainContainer = styled.main`
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
        overflow: scroll;
    }
    > div:nth-of-type(3){
        grid-area: channelChat;
        border-radius: 2px;
        background-color: var(--color-dark-gray);
    }
    > p{
        grid-area: instructions;
        margin: auto;
    }
    > button{
        display: none;
    }

    @media screen and (max-width: 768px){
        grid-template-columns: 45vw 1fr 45vw;
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
            grid-area: left;
            border-radius: 2px;
            background-color: var(--color-dark-gray);
            overflow: scroll;
            display: ${props => props.open ? 'none' : 'block'};
        }
        > div:nth-of-type(2){
            grid-area: right;
            border-radius: 2px;
            background-color: var(--color-dark-gray);
            overflow: scroll;
            display: ${props => props.open ? 'none' : 'block'};

        }
        > div:nth-of-type(3){
            grid-area: 2 / 1 / 3 / 5;
            /* grid-column: 2/5;
            grid-row: 2/3; */
            border-radius: 2px;
            background-color: var(--color-dark-gray);
            display: ${props => props.open ? 'grid' : 'none'};
            ul{
                padding: 0;
            }

        }
    }
`;

function ServerChannels() {
    const [ refresh, setRefresh ] = useState(0);
    const [ channel, setChannel ] = useState({});
    const [ chatOpen, setChatOpen ] = useState(false);

    function incRefresh(){
        setRefresh(refresh + 1);
    }
    function updateChannel(ch){
        // console.log("serverchannels ", ch);
        setChannel(ch);
        setChatOpen(true);
    }
    function toggleChat(){
        setChatOpen(!chatOpen);
    }

    return (
        <ServerChannelsMainContainer open={chatOpen}>
            <button onClick={toggleChat}>{chatOpen ? <FaArrowLeft/> :<FaComment/>} </button>
            <ServerList refresh={incRefresh} icon='false'/>
            <ChannelList openChat={updateChannel} refresh={refresh}/>
            {!channel.id ? <div>Enter a channel</div>: 
                channel.type === 0 ?
                    <Chat channel={channel}/>:
                    <Voice channel={channel}/>
            }
            
        </ServerChannelsMainContainer>
    );
}

export default ServerChannels;