import { combineReducers } from 'redux';

import {
    authSpotifyUserActions,
    authDiscordActions
} from './actions';


function authDiscordReducer ( state = {}, action){
    switch(action.type){
        case authDiscordActions.INIT_TOKEN:
            return {
                ...state,
                token: action.token
            };
        case authDiscordActions.INIT_DM:
            return {
                ...state,
                channel: action.channel,
                userID: action.userID
            };
        case authDiscordActions.INIT_USER:
            return {
                ...state,
                userID: action.userID
            };
        case authDiscordActions.INIT_CHANNEL:
            return {
                ...state,
                channel: action.channel
            };
        case authDiscordActions.LOGOUT:
            return {};
        default: 
            return state;
    }

}
function authSpotifyUserReducer ( state = {}, action){
    switch(action.type){
        case authSpotifyUserActions.INIT_USER:
            return {
                access_token: action.access_token,
                refresh_token: action.refresh_token
            };
        default: 
            return state;
    }

}

const rootReducer = combineReducers({
    authDiscord: authDiscordReducer,
    authSpotifyUser: authSpotifyUserReducer
});
export default rootReducer;