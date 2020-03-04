import React, { useEffect } from 'react';
import styled from '@emotion/styled';

import Navbar from './components/navbar'


const Main = styled.main`
  background-color: var(--color-gray);
  height: 100vh;
  width: 100vw;

`;


function App() {
  return (
    
    <Main>
      <Navbar />
    </Main>
  );
}

export default App;
