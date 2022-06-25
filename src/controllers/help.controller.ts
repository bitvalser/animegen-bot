import { ControllerBase } from '../classes/controller-base.class';
import * as Discord from 'discord.js';
import { Controller } from '../decorators/controller.decorator';
import { CreatePackController } from './create-pack.controller';

@Controller({
  commands: ['help'],
})
export class HelpController extends ControllerBase {
  public processCommand(): void {
    const rich = new Discord.MessageEmbed()
      .setTitle('Инструкция по использованию')
      .setDescription(
        `Для генерации sigame пакета нужно запустить !create команду и передать аргументы (!create name=test titles=30 означает что вы хотите сгенерировать пак из 30 тайтлов пользвователя test).\nИз-за большой нагрузки на сервер при работе с музыкой раунды с эндингами и опенингами могут генерироваться только в декстопной версии генератора.\n\nСписок аргументов представлен ниже:`
      )
      .setFields([
        {
          name: 'name',
          value: 'Обязательно поле. Имя пользователя чьи паки использовать при генерации.',
        },
        {
          name: 'titles',
          value:
            'Необязательное поле. Количество тайтлов для каждого раунда. Максимально значение 400. (По умолчанию 50)',
        },
        {
          name: 'kinds',
          value:
            'Необязательное поле. Какие типы аниме будт использовать при выборке аниме, доступные значения: tv, ona, ova, film, special. Аргументы следует передавать через запятую без пробелов. (По умолчанию tv,ona,ova,film,special)',
        },
        {
          name: 'roles',
          value:
            'Необязательное поле. Если выбран раунд с персонажами, указывает какие типы персонажей будут учавствовать в выборке, доступные значения: Main, Supporting. Аргументы следует передавать через запятую без пробелов. (По умолчанию Main,Supporting)',
        },
        {
          name: 'compression',
          value:
            'Необязательное поле. Качество после сжатия изображения. Доступное значение 0.1 - 1. (По умолчанию 0.7)',
        },
        {
          name: 'rounds',
          value:
            'Необязательное поле. Указывает какие раунды генерировать, доступные значения: characters, screenshots. Аргументы следует передавать через запятую без пробелов. (По умолчанию characters,screenshots)',
        },
        // {
        //   name: 'packName',
        //   value: 'Необязательное поле. Название сгенерированого пака.',
        // },
        {
          name: 'animeProvider',
          value:
            'Необязательное поле. Указывает какой сервис будет использоваться для получения списка аниме. Доступные значения: shikimori. (По умолчанию shikimori)',
        },
        {
          name: 'musicProvider',
          value:
            'Необязательное поле. Указывает какой сервис будет использоваться для получения аудио дорожек. Доступные значения: youtube. (По умолчанию youtube)',
        },
      ]);
    this.message.reply({
      embeds: [rich],
    });
  }
}
