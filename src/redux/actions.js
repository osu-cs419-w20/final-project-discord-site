
export const authSpotifyUserActions = {
    INIT_USER: 'INIT_USER'
};

export function initUser(access_token, refresh_token) {
    return { type: authSpotifyUserActions.INIT_USER, access_token, refresh_token };
}


export const authDiscordActions = {
    INIT_TOKEN: 'INIT_TOKEN',
    INIT_DM: 'INIT_DM',
    INIT_USER: 'INIT_USER',
    INIT_CHANNEL: 'INIT_CHANNEL',
    LOGOUT: 'LOGOUT'
};

export function logoutUser() {
    return { type: authDiscordActions.LOGOUT };
}
export function addDirectMessage(userID, channel) {
    return { type: authDiscordActions.INIT_DM, userID, channel };
}
export function addDirectMessageuserID(userID) {
    return { type: authDiscordActions.INIT_USER, userID };
}
export function addToken(token) {
    return { type: authDiscordActions.INIT_TOKEN, token };
}
export function addDirectMessageChannel(channel) {
    return { type: authDiscordActions.INIT_CHANNEL, channel };
}