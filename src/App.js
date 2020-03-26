import React from 'react';
import styled from '@emotion/styled';
import { Switch, Route } from 'react-router-dom';

import Navbar from './components/navbar';
import Server from './components/server';
import ServerChannels from './components/serverChannels';
import DirectMessage from './components/directMessage'
import Spotify from './components/spotify'
import Welcome from './components/welcome'
import Auth from './components/auth'
import { getToken } from './redux/selectors';
import { useSelector } from 'react-redux';
import SpotifySongs from './components/spotifySongs';
export const baseUrl ="https://discordapp.com/api/v7/";
export const baseUrlSpotify ="https://api.spotify.com/v1/";

const Main = styled.div`
  background-color: var(--color-gray);
  height: 100vh;
  width: 100vw;
`;


function App() {
  const token = useSelector(getToken);

  return (
    
    <Main>
      

      {!token ? <Auth/> :
      <div>
      <Navbar />

      <Switch>
        <Route path="/server/:serverID" component={ServerChannels} /> 
        <Route path="/server" component={Server} /> 
        <Route path="/message" component={DirectMessage} /> 
        <Route path="/spotify/:playlistID" component={SpotifySongs} />
        <Route path="/spotify" component={Spotify} />

        <Route exact path="/" component={Welcome} />
        <Route path="/" ><div>404</div></Route>
      </Switch>
      </div>
      }

      
    </Main>
  );
}

export default App;
