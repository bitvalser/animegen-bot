import { AnimeCharacterRole, AnimeKind, GeneratorOptions, PackRound } from '@bitvalser/animegen';
import * as Discord from 'discord.js';
import { ControllerBase } from '../classes/controller-base.class';
import { PackGeneratorTask } from '../classes/pack-generator-task.class';
import { CREATE_ARGUMENTS_DATA } from '../data/create-arguments.data';
import { Controller } from '../decorators/controller.decorator';
import { GeneratorTasksService } from '../services/generator-tasks.service';

export type CreateArguments = Record<keyof typeof CREATE_ARGUMENTS_DATA, any> & Partial<GeneratorOptions>;

@Controller({
  commands: ['create'],
})
export class CreatePackController extends ControllerBase {
  public static MAX_TASKS = 5;
  private generatorTasksService: GeneratorTasksService = GeneratorTasksService.getInstance();

  private showQueue(): Promise<any> {
    return this.message.reply({
      content: `Очередь ${this.generatorTasksService.tasks.length}/${CreatePackController.MAX_TASKS}`,
      embeds: this.generatorTasksService.tasks.map(
        (task) =>
          new Discord.MessageEmbed({
            fields: [
              {
                ...task.getStatusRow(),
                name: task.getAuthor(),
              },
            ],
          })
      ),
    });
  }

  private getDefaultOptions(formattedOptions: CreateArguments): Partial<GeneratorOptions> {
    return {
      animeKinds: formattedOptions.animeKinds || [
        AnimeKind.Film,
        AnimeKind.ONA,
        AnimeKind.OVA,
        AnimeKind.Special,
        AnimeKind.TV,
      ],
      charactersRoles: formattedOptions.charactersRoles || [AnimeCharacterRole.Main, AnimeCharacterRole.Supporting],
      imageCompression: formattedOptions.imageCompression || 0.7,
      ...(formattedOptions.packName ? { packName: formattedOptions.packName } : {}),
      rounds: formattedOptions.rounds || [PackRound.Characters, PackRound.Screenshots],
      titleCounts: formattedOptions.titleCounts || 50,
      showScore: formattedOptions.showScore ?? true,
      noRepeats: formattedOptions.noRepeats ?? false,
    };
  }

  public processCommand(): void {
    if (this.args[0] === 'queue') {
      this.showQueue();
    } else {
      const options = this.args.reduce<Record<string, string>>((acc, val) => {
        const [arg, value] = val
          .split('=')
          .filter((item) => Boolean(item))
          .map((item) => item.trim());
        return arg && value
          ? {
              ...acc,
              [arg]: value,
            }
          : acc;
      }, {});
      const formattedOptions: CreateArguments = {};
      let lastNotValidArg = null;
      console.log(options);
      let isValid = Object.entries(CREATE_ARGUMENTS_DATA).every(([arg, data]) => {
        if (options[arg]) {
          const isValid = data.validator(options[arg]);
          if (isValid) {
            formattedOptions[data.mapTo || arg] = data.mapValue ? data.mapValue(options[arg]) : options[arg];
          } else {
            lastNotValidArg = arg;
          }
          return isValid;
        }
        return !data.required;
      });
      if (isValid && formattedOptions.rounds) {
        const haveMusic =
          formattedOptions.rounds.includes(PackRound.Endings) || formattedOptions.rounds.includes(PackRound.Openings);
        if (haveMusic && formattedOptions.titleCounts > 100) {
          isValid = false;
          lastNotValidArg = 'titles';
        }
      }
      if (isValid) {
        if (this.generatorTasksService.tasks.length < CreatePackController.MAX_TASKS) {
          if (this.generatorTasksService.tasks.some((task) => task.getAuthor() === this.message.author.username)) {
            this.message.reply('У вас уже есть активная задача генерации');
          } else {
            const task = new PackGeneratorTask(
              formattedOptions.name,
              this.getDefaultOptions(formattedOptions),
              this.message.author.username,
              formattedOptions.animeProvider,
              formattedOptions.musicProvider,
              formattedOptions.random
            );
            this.generatorTasksService.tasks.push(task);
            task.start(this.message).finally(() => {
              this.generatorTasksService.tasks = this.generatorTasksService.tasks.filter(
                (nestedTask) => nestedTask.getAuthor() !== task.getAuthor()
              );
            });
          }
        } else {
          this.showQueue();
        }
      } else if (lastNotValidArg) {
        this.message.reply(`Аргумент ${lastNotValidArg} не корректный!`);
      } else {
        this.message.reply('Что-то пошло не так :(');
      }
    }
  }
}
