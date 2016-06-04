var config = require('./config.js');
var TwitterBot = require('./TwitterBot.js');

var bot = new TwitterBot(config.twitter);

bot.run();