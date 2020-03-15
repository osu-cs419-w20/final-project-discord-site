import React from 'react';
import styled from '@emotion/styled';
import { Switch, Route } from 'react-router-dom';

import Navbar from './components/navbar';
import Server from './components/server';
import ServerChannels from './components/serverChannels';
import DirectMessage from './components/directMessage'
import Spotify from './components/spotify'
import Welcome from './components/welcome'
export const baseUrl ="https://discordapp.com/api/v7/";
export const baseUrlSpotify ="https://api.spotify.com/v1/";

const Main = styled.main`
  background-color: var(--color-gray);
  height: 100vh;
  width: 100vw;
`;


function App() {
  return (
    
    <Main>
      <Navbar />

      <Switch>
        <Route path="/auth"> 
          <h1>Authentication</h1>
          {/* TODO: redirect to here when no bot token, make request to my api to get token have instructions to log in through discord */}
        </Route>
        <Route path="/server/:serverID" component={ServerChannels} /> 
        <Route path="/server" component={Server} /> 
        <Route path="/message" component={DirectMessage} /> 
        <Route path="/spotify" component={Spotify} />

        <Route exact path="/" component={Welcome} />
        <Route path="/" ><div>404</div></Route>
      </Switch>
    </Main>
  );
}

export default App;
