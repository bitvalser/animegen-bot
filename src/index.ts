import 'reflect-metadata';
import * as dotenv from 'dotenv';
import EventEmitter from 'events';
import fs from 'fs';
import packageJson from '../package.json';
import * as Discord from 'discord.js';
import { HelpController } from './controllers/help.controller';
import { ControllerProcessor } from './classes/controllers-processor.class';
import { CreatePackController } from './controllers/create-pack.controller';

dotenv.config();

export const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.GUILD_MESSAGE_TYPING,
    Discord.Intents.FLAGS.GUILD_MEMBERS,
    Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Discord.Intents.FLAGS.DIRECT_MESSAGE_TYPING,
  ],
  partials: ['CHANNEL', 'REACTION', 'MESSAGE'],
});

export const emitter = new EventEmitter();

console.log('Clear folders');
fs.rmSync('packs', { force: true, recursive: true });

const BOT_VERSION = packageJson.version;
console.log(`Bot prod -> (${BOT_VERSION})`);
client.login(process.env.BOT_TOKEN);

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
});

const rootCommandProcessor = new ControllerProcessor([HelpController, CreatePackController]);

client.on('messageCreate', (message) => {
  console.log(message.content);
  if (message.content.startsWith('!') && !message.author.bot) {
    rootCommandProcessor.processMessage(message);
  }
});
