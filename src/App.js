import React from 'react';
import styled from '@emotion/styled';
import { Switch, Route } from 'react-router-dom';

import Navbar from './components/navbar';
import Server from './components/server';
import ServerChannels from './components/serverChannels';
import DirectMessage from './components/directMessage'
import Spotify from './components/spotify'
export const baseUrl ="https://discordapp.com/api/v6/";

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
        </Route>
        <Route path="/server/:serverID"> 
          <ServerChannels />
        </Route>
        <Route path="/server"> 
          <Server />
        </Route>
        <Route path="/message"> 
          <DirectMessage />
        </Route>
        <Route path="/spotify"> 
          <Spotify />
        </Route>
        <Route exact path="/">
          <h1>Welcome Page</h1>
        </Route>
      </Switch>
    </Main>
  );
}

export default App;
