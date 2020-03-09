/*
 * Spinner derived from https://tobiasahlin.com/spinkit/.
 */

import React from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/core';

const SpinnerContainer = styled.div`
  /* display: inline-block; */
  text-align: center;
`;

const bounceDelay = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  } 40% {
    transform: scale(1.0);
  }
`;

const Dot = styled.div`
  display: inline-block;
  border-radius: 100%;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  margin: ${props => props.size / 2}px;
  background-color: ${props => props.color};
  animation: ${bounceDelay} infinite 1.4s ease-in-out both;
  &:nth-of-type(1) {
    animation-delay: -0.32s;
  }
  &:nth-of-type(2) {
    animation-delay: -0.16s;
  }
`;

function Spinner({ size, color }) {
  size = size || 12;
  color = color || '#dadbdc';

  return (
    <SpinnerContainer>
      <Dot size={size} color={color} />
      <Dot size={size} color={color} />
      <Dot size={size} color={color} />
    </SpinnerContainer>
  );
}

export default Spinner;