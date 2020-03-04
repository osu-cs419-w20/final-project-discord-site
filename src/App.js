import React, { useEffect } from 'react';
import styled from '@emotion/styled';

import Navbar from './components/navbar'
import { Switch, Route } from 'react-router-dom';


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
        <Route path="/server"> 
          <h1>Server List</h1>
        </Route>
        <Route path="/server/:serverID"> 
          <h1>Server List</h1>
        </Route>
        <Route path="/message"> 
          <h1>Message the bot</h1>
        </Route>
        <Route exact path="/">
          <h1>Welcome Page</h1>
        </Route>
      </Switch>
    </Main>
  );
}

export default App;
