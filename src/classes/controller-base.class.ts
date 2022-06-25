import * as Discord from 'discord.js';

export abstract class ControllerBase {
  public message: Discord.Message;
  public args: string[];

  constructor(message: Discord.Message, args: string[]) {
    this.message = message;
    this.args = args;
  }

  public onInit(): void {}

  public abstract processCommand(): void;
}
