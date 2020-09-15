// Configuration
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
    throw result.error;
}

global.__basedir = __dirname;

const config = require(__basedir + '/discord.json');
const prefix = config.prefix;

import rf from 'js/routeFinder.mjs';


// Set up Discord response
var Discord = require('discord.js');
var client = new Discord.Client();

client.once('ready', () => {
	console.log('Ready!');
});

client.on('message', message => {
    if (message.content === '!ping') {
        // send back "Pong." to the channel the message was sent in
        message.channel.send('Pong.');
    }

    if (message.content.startsWith(`${prefix}ping`)) {
        message.channel.send('Pong.');
    } else if (message.content.startsWith(`${prefix}beep`)) {
        message.channel.send('Boop.');
    }
    
    console.log(message.content);
});

client.login(process.env.AUTH_TOKEN);
