import React from 'react';
import styled from '@emotion/styled';



const List = styled.ul`
    list-style: none;
    padding: 0;
    > li:nth-of-type(1){
      border-top: 1px solid var(--color-light-gray);
    }
    .message{
      border-top: 1px solid var(--color-light-gray);
      margin: 0 0 0 1rem;
      padding: .5rem;
      word-wrap: break-word;
    }
`;


function MessageContainer(props) {

  return (
    
      <List>
        {props.messages.map(message => (
          <li className='message' key={message.id}>
              <span>{message.author.username}: {message.content}</span>
          </li>
        ))}
      </List>
  );
}

export default MessageContainer;
