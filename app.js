'use strict';

let config = require('./config.js');
let TwitterBot = require('./TwitterBot.js');

let bot = new TwitterBot(config);

bot.run();