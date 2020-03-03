

export const ServersActions = {
    INIT_SERVERS: 'INIT_SERVERS'
};

export function initServers( servers ) {
    return { type: ServersActions.INIT_SERVERS, servers};
}


export const ChannelsActions = {
    INIT_CHANNELS: 'INIT_CHANNELS',
    ADD_MESSAGE: 'ADD_MESSAGE',
    SEND_MESSAGE: 'SEND_MESSAGE' //might not need

};

export function initChannels(serverID) {
    return { type: ChannelsActions.INIT_CHANNELS, serverID };
}
export function addChannelMessage(channelID, message) {
    return { type: ChannelsActions.ADD_MESSAGE, channelID, message };
}
export function sendChannelMessage(channelID, message) {
    return { type: ChannelsActions.SEND_MESSAGE, channelID, message };
}


export const DirectMessagesActions = {
    ADD_MESSAGE: 'ADD_MESSAGE',
    SEND_MESSAGE: 'SEND_MESSAGE' //might not need
};

export function addDirectMessage(message) {
    return { type: DirectMessagesActions.ADD_MESSAGE, message };
}
export function sendDirectMessage(channelID, message) {
    return { type: DirectMessagesActions.ADD_MESSAGE,channelID, message };
}