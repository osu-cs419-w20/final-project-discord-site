import { combineReducers } from 'redux';

import {
    ServersActions,
    ChannelsActions,
    DirectMessagesActions
} from './actions';

function serversReducer ( state = [], action){
    switch(action.type){
        case ServersActions.INIT_SERVERS:
            return state;
        default: 
            return state;
    }

}

function channelsReducer ( state = [], action){
    switch(action.type){
        case ChannelsActions.INIT_CHANNELS:
            return state;
        case ChannelsActions.ADD_MESSAGE:
            return state;
        case ChannelsActions.SEND_MESSAGE:
            return state;
        default: 
            return state;
    }

}
function directMessagesReducer ( state = [], action){
    switch(action.type){
        case DirectMessagesActions.ADD_MESSAGE:
            return state;
        case DirectMessagesActions.SEND_MESSAGE:
            return state;
        default: 
            return state;
    }

}

const rootReducer = combineReducers({
  servers: serversReducer,
  channels: channelsReducer,
  directMessages: directMessagesReducer
});
export default rootReducer;