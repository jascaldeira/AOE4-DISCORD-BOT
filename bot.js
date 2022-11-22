global.Discord = require('discord.io');
global.logger = require('winston');
global.config = require('./config.json');
global.request = require('request');
global.sanitizer = require('sanitize')();
global.con = require('./libraries/database.js');

require('./libraries/bootstrap.js');

require('./libraries/commands.js');