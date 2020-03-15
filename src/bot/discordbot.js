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

const client = new Discord.Client();

//spotify consts
const client_id = config.client_id;
const client_secret = config.client_secret;
const redirect_uri = 'http://localhost:3000/api/spotify/callback'; // Your redirect uri

var g_auth_token;
var g_refresh_token;
var lastloginmsg;
var current_login_name;
var current_user_id;
var current_user_playlists;

var authUser = false;
const authUserIds = ['128250152837316609']

function reset_state(){

	g_auth_token = null;
	g_refresh_token = null;
	lastloginmsg = null;
	current_login_name = null;
	current_user_id = null;
	current_user_playlists = null;
}

function login(msg){
	if (authUserIds.includes(msg.author.id)){
		authUser = true;
		msg.react('✅');
	} else {
		msg.react('❌');
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

	if(authUser){
		authUser = false;
		res.json({
			token: config.token
		});
	} else {
		res.status(401).end();
	}
});

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
			current_login_name = body['display_name']
			current_user_id = body['id']
			if(lastloginmsg){
				lastloginmsg.channel.send("logged in as user " + current_login_name);
			}
		});
		
        options = {
        	url: 'https://api.spotify.com/v1/me/playlists',
        	headers: { 'Authorization': 'Bearer ' + g_auth_token },
        	json: true
        };
		current_user_playlists = {};
		gen_playlists(options);
		const url = "http://" + config.appURL + '/spotify' + '#' +
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

client.on('message', msg => {
	if (msg.content === `${config.prefix}ping`) {
		msg.channel.send('pong');
	}
	if (msg.content === `${config.prefix}cargo`) {
		find_cargo_times(msg);
	}
	if (msg.content === `${config.prefix}login`) {
		login(msg);
	}
	if (msg.content === `${config.prefix}logout`) {
		logout(msg);
	}
	if (msg.content === `${config.prefix}slogin`) {
		lastloginmsg = msg;
		msg.channel.send('Please login at: http://localhost:3000/api/spotify/login');
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
