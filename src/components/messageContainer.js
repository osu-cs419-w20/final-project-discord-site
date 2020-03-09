import React from 'react';
import styled from '@emotion/styled';



const List = styled.ul`
    list-style: none;
    .message{
      margin: .5rem;
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
