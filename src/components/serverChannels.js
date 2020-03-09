import React, {useState} from 'react';
import styled from '@emotion/styled';
import ServerList from './serverList'
import ChannelList from './channelList'
import Chat from './chat'

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
    > div:nth-of-type(3n + 1){
        grid-area: serverList;
        border-radius: 2px;
        background-color: var(--color-dark-gray);
        overflow: scroll;
    }
    > div:nth-of-type(3n + 2){
        grid-area: channelList;
        border-radius: 2px;
        background-color: var(--color-dark-gray);
        overflow: scroll;
    }
    > div:nth-of-type(3n + 3){
        grid-area: channelChat;
        border-radius: 2px;
        background-color: var(--color-dark-gray);
    }
    > p{
        grid-area: instructions;
        margin: auto;
    }
`;

function ServerChannels() {
    const [ refresh, setRefresh ] = useState(0);
    const [ channel, setChannel ] = useState({});

    function incRefresh(){
        setRefresh(refresh + 1);
    }
    function updateChannel(ch){
        // console.log("serverchannels ", ch);
        setChannel(ch);
    }

    return (
        <ServerChannelsMainContainer>
            <ServerList refresh={incRefresh} icon='false'/>
            <ChannelList openChat={updateChannel} refresh={refresh}/>
            <Chat channel={channel}/>
            
        </ServerChannelsMainContainer>
    );
}

export default ServerChannels;