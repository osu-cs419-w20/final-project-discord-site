/**i
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

const Discord = require('discord.js');
const config = require('./config.json');

const express = require('express'); // Express web server framework
const request = require('request'); // "Request" library
const cors = require('cors');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const fetch = require('isomorphic-unfetch');
const ytdl = require('ytdl-core');

const Client = class extends Discord.Client {
	constructor(config) {
		super({
			disableEveryone: true,
			disabledEvents: ['TYPING_START'],
		});

		// this.commands = new Collection();

		this.queue = new Map();

		this.config = config;
	}
};

const client = new Client();

//spotify consts
const client_id = config.client_id;
const client_secret = config.client_secret;
const redirect_uri = 'http://192.168.0.243/disc/api/spotify/callback'; // Your redirect uri

//spotify vars
var g_auth_token;
var g_refresh_token;
var lastloginmsg;
var current_login_name;
var current_user_id;
var current_user_playlists;

//google/youtube vars
const youtubeAPI = "https://www.googleapis.com/youtube/v3";

//login vars
var authUser = false;
var authUserObject = {};
const authUserIds = config.userIDs;

//music queue vars
function Song(url, name, addedBy) {
	this.url = url;
	this.name = name;
	this.addedBy = addedBy;
}


// let queue = new Map();
let current_song = null;
let song_playing = false;

// 
// 
//  Functions 
// 
//
function reset_state(){

	g_auth_token = null;
	g_refresh_token = null;
	lastloginmsg = null;
	current_login_name = null;
	current_user_id = null;
	current_user_playlists = null;
	authUser = false;
	authUserId = null;
	current_song = null;
}
//music queue functions
// async function stream_song(connection, channel){
// 	const streamOptions = { seek: 0, volume: 1 };//{ type: 'opus' };

// 	// console.log("joined channel");
// 	console.log("playing: ", current_song.name);
// 	console.log(current_song.url);
// 	const stream = ytdl(current_song.url, {
// 					filter: 'audioonly',
// 					highWaterMark: 1<<25
// 				});
// 	const dispatcher = connection.play(stream, streamOptions);
// 	song_playing = true;
// 	// stream.on('end', ()=> {
// 	// 	console.log("stream end");
// 	// })
// 	stream.on("end", end => {
// 		console.log("stream end");
// 		if(current_song.next){
// 			console.log("playing next");
// 			const next = current_song.next;
// 			remove_from_queue(current_song);
// 			current_song = next;
// 			stream_song(connection, channel)
// 		} else {
// 			song_playing = false;
// 			current_song = null;
// 			console.log("left channel");
// 			channel.leave();
// 		}
		
// 	});
// }
function play(guildid, song) {
	console.log("song", song);
	const serverQueue = client.queue.get(guildid);
	if (!song) {
		serverQueue.voiceChannel.leave();
		client.queue.delete(guildid);
		return;
	}
	const dispatcher = serverQueue.connection
    .play(ytdl(song.url), { filter: 'audioonly', highWaterMark: 1<<25 })
    .on("finish", () => {
		console.log("finish event hit, playing next song")
        serverQueue.songs.shift();
        play(guildid, serverQueue.songs[0]);
	})
	.on("end", () => {
		console.log("end event hit");
        // serverQueue.songs.shift();
        // play(guild, serverQueue.songs[0]);
	})
	.on("error", error => console.error("error event: ", error));
	
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	if(serverQueue.textChannel) {serverQueue.textChannel.send(`Playing: **${song.name}**`);}
}

function skip(message) {
	const serverQueue = client.queue.get(message.guild.id);

	if (!message.member.voice.channel){
		message.channel.send("You have to be in a voice channel to stop the music!");
		return;
	}
	if (!serverQueue){
		message.channel.send("There is no song that I could skip!");
		return;
	}
	// console.log(serverQueue.connection);
	// console.log(serverQueue.connection.dispatcher);
	// serverQueue.connection.dispatcher.end();
	serverQueue.songs.shift();
	play(message.guild.id, serverQueue.songs[0]);
}
function stop(message) {
	const serverQueue = client.queue.get(message.guild.id);

	if (!message.member.voice.channel){
		message.channel.send( "You have to be in a voice channel to stop the music!" );
		return;
	}
	if (serverQueue){
		serverQueue.songs = [];
		play(message.guild.id, serverQueue.songs[0]);
	}
}

function remove(message, index){
	const serverQueue = client.queue.get(message.guild.id);

	console.log(!!serverQueue)
	console.log(!!serverQueue.songs)
	if(!(serverQueue && serverQueue.songs)){
		message.channel.send("There are no songs in the queue to remove")
		return;
	}
	if(index >= serverQueue.songs.length){
		message.channel.send("The song you have chosen is out of range")
		return;
	}
	serverQueue.songs.splice(index, 1);
}

// async function play(channel){
// 	if (channel){
// 		channel.join().then(async connection => {
// 			stream_song(connection, channel)
// 		}).catch(err => console.log(err));
		
// 	}
// }


// async function start_playing(msg = null){
// 	var voiceChannel = msg ? msg.member.voice.channel: null /*find_channel(authUserId)*/;
// 	// console.log(voiceChannel);
// 	play(voiceChannel);
	

// }


//https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url
function validURL(str) {
	var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
		'((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
		'((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
		'(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
		'(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
		'(\\#[-a-z\\d_]*)?$','i'); // fragment locator
	return !!pattern.test(str);
}


async function get_song(query, user, msg = null){

	if(validURL(query)){
		const songInfo = await ytdl.getInfo(query);
		return new Song(songInfo.video_url, songInfo.title, user);
	}

	const response = await fetch(
		`${youtubeAPI}/search?type=video&part=snippet&maxResults=25&q=${query}&key=${config.youtube_key}`,
		{ 
			headers: {
				Accept: "application/json"
			}
		}
	);
	responseBody = await response.json();
	if (msg){
		msg.channel.send(`Adding ${responseBody.items[0].snippet.title}`);
	}
	return new Song(`http://www.youtube.com/watch?v=${responseBody.items[0].id.videoId}`,
					 responseBody.items[0].snippet.title,
					 user)
}

async function add_to_queue(serverQueue, voiceChannel, query, msg, idx = -1){

	const song = await get_song(query, msg.member.displayName, msg);
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			dispatcher: null,
			songs: [],
			volume: 5,
			playing: true,
		};
		client.queue.set(msg.guild.id, queueConstruct);
		queueConstruct.songs.push(song);
		
		try {
			// Here we try to join the voicechat and save our connection into our object.
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			// Calling the play function to start a song
			play(msg.guild.id, queueConstruct.songs[0]);
		} catch (err) {
			// Printing the error message if the bot fails to join the voicechat
			console.log(err);
			client.queue.delete(msg.guild.id);
			msg.channel.send(err);
			return ;
		}
	}else {
		if(!serverQueue.textChannel){
			serverQueue.textChannel = msg.channel;
		}
		if (idx === -1){
			serverQueue.songs.push(song);
		} else {
			serverQueue.songs.splice(idx, 0, song);
		}
		console.log(serverQueue.songs);
		// message.channel.send(`${song.title} has been added to the queue!`);
		return;
	}

}

async function add_to_queue_web(guildId, query, voiceChannelId = 0, idx = -1){
	const user = authUserObject;
	// console.log("presence", user.presence)
	// console.log("member ===", user.presence.member)
	// console.log("guild ===", user.presence.member.guild)
	// console.log("IDs ===", guildId === user.presence.member.guild.id)
	// let guildHasUser = false;

	async function found_user(fUser){
		const voiceChannel = voiceChannelId ? 
			client.channels.get(voiceChannelId) : 
			fUser.voice.channel;
		const serverQueue = client.queue.get(guildId);


		const song = await get_song(query, `${fUser.displayName}-web`, null);
		if (!serverQueue) {
			const queueConstruct = {
			textChannel: null,
			voiceChannel: voiceChannel,
			connection: null,
			dispatcher: null,
			songs: [],
			volume: 5,
			playing: true,
			};
			client.queue.set(guildId, queueConstruct);
			queueConstruct.songs.push(song);

			try {
				// Here we try to join the voicechat and save our connection into our object.
				var connection = await voiceChannel.join();
				queueConstruct.connection = connection;
				// Calling the play function to start a song
				play(guildId, queueConstruct.songs[0]);
			} catch (err) {
				// Printing the error message if the bot fails to join the voicechat
				console.log("connection error", err);
				client.queue.delete(guildId);
				console.log("deleted queue for ", guildId);
				// msg.channel.send(err);
				return ;
			}
		} else {
			if (idx === -1){
				serverQueue.songs.push(song);
			} else {
				serverQueue.songs.splice(idx, 0, song);
			}
			console.log(serverQueue.songs);
			// message.channel.send(`${song.title} has been added to the queue!`);
			return;
		}
	}
	
	let guild = client.guilds.resolve(guildId);
	guild.members.fetch(user.id).then(found_user).catch(console.log);

}

function print_queue(msg){
	const serverQueue = client.queue.get(msg.guild.id);
	let res = "";
	let i = 0;

	if(!serverQueue || !serverQueue.songs){
		msg.channel.send("Queue empty");
		return;
	}
	if(serverQueue.songs.length >= 1){
		while(i < serverQueue.songs.length - 1){
			console.log(serverQueue.songs[i]);
			res += `${i+1}: ${serverQueue.songs[i].name}, added by: ${serverQueue.songs[i].addedBy}\n`;
			i++;
		}
		res += `${i+1}: ${serverQueue.songs[i].name}, added by: ${serverQueue.songs[i].addedBy}`;
	} else {
		res = "Queue empty";
	}
	msg.channel.send(res);
}


function login(msg){
	if (authUserIds.includes(msg.author.id)){
		authUserId = msg.author.id;
		authUserObject = msg.author;
		authUser = true;
		msg.react('✅');
		return true;
	} else {
		msg.react('❌');
		return false;
	}
}

function check_able(msg){
	const voiceChannel = msg.member.voice.channel;
	if (!voiceChannel){
		msg.channel.send("You must be in a voice channel to play music");
		return false;
	}
	const permissions = voiceChannel.permissionsFor(msg.client.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
		msg.channel.send("Bot needs permission to your voice channel");
		return false;
	}
	return true
}

async function commandPlay(msg){
	const serverQueue = client.queue.get(msg.guild.id);
	if (!check_able(msg)) {
		return;
	}
	const splitmsg = msg.content.split(' ');
	if (splitmsg.length >= 2){
		var query = splitmsg.slice(1,splitmsg.length).join(' ');
		add_to_queue(serverQueue, msg.member.voice.channel, query, msg)
		msg.react('✅');
	} else {
		msg.channel.send(`Format: ${config.prefix}play URL`)
	}
}

async function commandPlayAt(msg){
	const serverQueue = client.queue.get(msg.guild.id);
	if (!check_able(msg)) {
		return;
	}
	const splitmsg = msg.content.split(' ');
	if (splitmsg.length >= 3){
		var idx = parseInt(msg.content.split(' ')[1]) - 1;
		var query = splitmsg.slice(2,splitmsg.length).join(' ');
		add_to_queue(serverQueue, msg.member.voice.channel, query, msg, idx)
		msg.react('✅');
	} else {
		msg.channel.send(`Format: ${config.prefix}playat index URL`)
	}
}

async function commandPlayNext(msg){
	const serverQueue = client.queue.get(msg.guild.id);
	if (!check_able(msg)) {
		return;
	}
	
	const splitmsg = msg.content.split(' ');
	if (splitmsg.length >= 2){
		var query = splitmsg.slice(1,splitmsg.length).join(' ');
		add_to_queue(serverQueue, msg.member.voice.channel, query, msg, 1)
		msg.react('✅');
	} else {
		msg.channel.send(`Format: ${config.prefix}playnext URL`)
	}
}

async function commandSkip(msg){
	if (!check_able(msg)) {
		return;
	}
	
	skip(msg);
}

async function commandStop(msg){
	if (!check_able(msg)) {
		return;
	}
	stop(msg);
}

async function commandRemove(msg){
	if (!check_able(msg)) {
		return;
	}

	const splitmsg = msg.content.split(' ');
	if (splitmsg.length === 2){
		var idx = parseInt(msg.content.split(' ')[1]) - 1;
		// serverQueue.songs.splice(index, 1);
		if(idx === 1){
			msg.channel.send(`Can't remove current song, use ${config.prefix}skip instead`)
		} else {
			remove(msg, idx);
			// remove_from_queue(idx)
			msg.react('✅');
		}
	} else {
		msg.channel.send(`Format: ${config.prefix}remove index`)
	}
}

function convertUTCDateToLocalDate(date) {
    var newDate = new Date(date.getTime()+date.getTimezoneOffset()*60*1000);

    var offset = date.getTimezoneOffset() / 60;
    var hours = date.getHours();

    newDate.setHours(hours - offset);

    return newDate;   
}

function find_cargo_times(msg){

        options = {
        	url: 'https://cargoship.herokuapp.com/api/v2/'
        	//json: true
        };

       	request.get(options, function(error, response, body) {
       		//console.log(body);
		var times = JSON.parse(body)['na'];
		var i;
		var cd = new Date();
		for (var idx in times){
			var dt = times[idx]['time'].split(" ");
			var day = dt[0].split(".");
			var time = dt[1].split(":");
		
			var d = new Date(day[2],day[1]-1,day[0],time[0],time[1],time[2]);
			if (d > cd){
				i = idx;
				break;
			}
		}

		//console.log(times);
		//console.log(times[0]);
		var dt = times[i]['time'].split(" ");
		var day = dt[0].split(".");
		var time = dt[1].split(":");
		
		var d = new Date(day[2],day[1]-1,day[0],time[0],time[1],time[2]);
		dif = Math.abs((d-cd)/1000);
		//console.log(cd.toLocaleString());
		//console.log(d.toLocaleString());
		//console.log(d-cd);
		var minutes = Math.floor(dif / 60) % 60;
		dif -= minutes * 60;
		var seconds = Math.floor(dif % 60);
		//console.log(minutes);
		//console.log(seconds);

		var dir = (times[i]['status'].includes("standIn")) ? " arrives in ": " leaves for "; 
		var loc = (times[i]['status'].includes("Solis")) ? "Solis": "Two Crowns"; 

		var s = "The cargo ship" + dir + loc + " in " + minutes.toString(10) + " minutes and " + seconds.toString(10) + " seconds.";
		//console.log(s);
		msg.channel.send(s);
	});
}

function gen_playlists(options){

	var playlists = {};
       	request.get(options, function(error, response, body) {
       		// console.log(body);
		for (var playlist in body['items']){
			playlist_idx = parseInt(playlist) + parseInt(body['offset']);
			// console.log(playlist_idx);
			playlists[playlist_idx] = {
				'id': body['items'][playlist]['id'],
				'name': body['items'][playlist]['name']
			}
		}
		// console.log(playlists);
		if (body['next'] != null) {
			options.url = body['next'];
			current_user_playlists = {...current_user_playlists,...playlists};
			current_user_playlists = {...current_user_playlists,...gen_playlists(options)};
		} else {
			current_user_playlists = {...current_user_playlists,...playlists};
			return playlists;
		}
		
	});

}
function playlists_to_string(){
	var out = ''
	for (let [key, value] of Object.entries(current_user_playlists)){
		var line = parseInt(key)+1 + ": " + value.name + '\n';
		out += line;
	}
	return out;
}
/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/api/login', function(req, res) {

	//TODO: make user enter a token (given when using login command)
	//to validate as opposed to just trusting the first page load is the user
	if(authUser){
		authUser = false;
		res.json({
			token: config.token
		});
	} else {
		res.status(401).end();
	}
});

app.post('/api/song', function(req, res) {

	let guildId = req.query.g;
	let q = req.query.q;

	let idx = parseInt(req.query.idx);
	if(! typeof(idx)){
		idx = -1;
	}
	let voiceChannelId = parseInt(req.query.vc);
	if(! typeof(voiceChannelId)){
		voiceChannelId = 0;
	}

	add_to_queue_web(guildId, q, voiceChannelId = 0, idx = -1)
	console.log("adding at: ",idx)
	
	
	// if(idx === -1){
	// 	add_to_queue(q,"web", null);
	// } else {
	// 	add_to_queue_at(q,"web",idx, null)
	// }

	res.status(200).end();
});

app.delete('/api/song', function(req, res) {

	let idx = req.query.idx || -1;
	if(idx >= 0){
		remove_from_queue(idx)
		res.status(200).end();
	} else {
		res.status(400).end();
	}
});

//
//
//Spotify Auth
//
//
app.get('/api/spotify/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private playlist-read-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/api/spotify/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        var access_token = body.access_token,
		refresh_token = body.refresh_token;
		g_auth_token = access_token;
		g_refresh_token = refresh_token;

        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
		request.get(options, function(error, response, body) {
			console.log(body);
			if(body && body.id && body.display_name){
				current_login_name = body['display_name']
				current_user_id = body['id']
				
				if(lastloginmsg){
					lastloginmsg.channel.send("logged in as user " + current_login_name);
				}
			}
		});
		
        options = {
        	url: 'https://api.spotify.com/v1/me/playlists',
        	headers: { 'Authorization': 'Bearer ' + g_auth_token },
        	json: true
        };
		current_user_playlists = {};
		gen_playlists(options);
		const url = config.appURL + '/spotify' + '#' +
		querystring.stringify({
		  access_token: access_token,
		  refresh_token: refresh_token
		})
		// we can also pass the token to the browser to make requests from there
		console.log(url);

        res.redirect(url);
      } else {
        res.redirect(config.appURL + '/spotify' + '#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/api/spotify/refresh_token', function(req, res) {

  // requesting access token from refresh token
  var refresh_token = req.query.refresh_token;
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});


client.on('ready', () => {
	  console.log("ready!");
});

client.on('message', async msg => {
	if (!msg.content.startsWith(config.prefix)){ 
		return;
	}

	// const serverQueue = queue.get(message.guild.id);


	if (msg.content === `${config.prefix}ping`) {
		msg.channel.send('pong');
	}
	if (msg.content === `${config.prefix}cargo`) {
		find_cargo_times(msg);
	}
	if (msg.content.startsWith(`${config.prefix}play `)) {
		commandPlay(msg);
	}
	if (msg.content.startsWith(`${config.prefix}playat `)) {
		commandPlayAt(msg);
	}
	if (msg.content.startsWith(`${config.prefix}playnext `)) {
		commandPlayNext(msg);
	}
	if (msg.content.startsWith(`${config.prefix}remove `)) {
		commandRemove(msg)
	}
	if (msg.content === `${config.prefix}queue`) {
		print_queue(msg);
	}
	if (msg.content === `${config.prefix}skip`) {
		commandSkip(msg);
	}
	if (msg.content === `${config.prefix}stop`) {
		commandStop(msg);
	}
	if (msg.content === `${config.prefix}login`) {
		login(msg);
	}
	if (msg.content === `${config.prefix}logout`) {
		logout(msg);
	}
	if (msg.content === `${config.prefix}slogin`) {
		lastloginmsg = msg;
		if (login(msg)){
			msg.channel.send('Please login at: http://192.168.0.243:3000/api/spotify/login');
		}
	}
	if (msg.content === `${config.prefix}slogout`) {
		msg.channel.send(current_login_name + " logged out");
		reset_state();
	}
	if (msg.content === `${config.prefix}splaylists`) {
		msg.channel.send('Playlists for ' + current_login_name);
        	tosend = playlists_to_string();
		//if(tosend.length > 2000){
        	//	msg.channel.send(tosend);
		//} else {
			var start = 0;
			var end = 2000;
			while(end < tosend.length){
				end = tosend.substring(start,end).lastIndexOf('\n');
        			msg.channel.send(tosend.substring(start,end));
				start = end;
				end += 2000;
			}
			msg.channel.send(tosend.substring(start));
		//}
	// use the access token to access the Spotify Web API
	}
});

client.login(config.token);
// console.log('Listening on 8888');
app.listen(8888);
