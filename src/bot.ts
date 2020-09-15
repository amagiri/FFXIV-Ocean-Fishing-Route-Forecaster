// Configures dotenv
const dotenv = require('dotenv');
const result = dotenv.config();

if (result.error) {
    throw result.error;
}

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
    
    console.log(message.content);
});

client.login(process.env.AUTH_TOKEN);
