import { combineReducers } from 'redux';

import {
    authSpotifyUserActions,
    authDiscordActions
} from './actions';


function authDiscordReducer ( state = {}, action){
    switch(action.type){
        case authDiscordActions.INIT_DM:
            return {
                channel: action.channel,
                userID: action.userID
            };
        case authDiscordActions.INIT_USER:
            return state;
        case authDiscordActions.INIT_CHANNEL:
            return state;
        case authDiscordActions.LOGOUT:
            return {};
        default: 
            return state;
    }

}
function authSpotifyUserReducer ( state = {}, action){
    switch(action.type){
        case authSpotifyUserActions.INIT_USER:
            return state;
        default: 
            return state;
    }

}

const rootReducer = combineReducers({
  authDiscord: authDiscordReducer,
  authSpotifyUser: authSpotifyUserReducer
});
export default rootReducer;