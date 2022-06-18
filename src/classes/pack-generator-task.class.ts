import {
  AnimeGenerator,
  AnimeProviderBase,
  DriveUploaderBase,
  GeneratorOptions,
  GoogleDriveUploader,
  MusicDownloaderProviderBase,
  ShikimoriProvider,
  YoutubeMusicDownloader,
} from '@bitvalser/animegen';
import fsPromises from 'fs/promises';
import * as Discord from 'discord.js';
import { AnimeProviders } from '../constants/anime-providers.constants';
import { MusicProviders } from '../constants/music-providers.constants';

export class PackGeneratorTask {
  private static RANGE_SCALE = 20;
  private static UPDATE_INTERVAL = 5000;
  private static OK_SYMBOL = '✅';
  private static ERROR_SYMBOL = '❌';
  private options: Partial<GeneratorOptions>;
  private author: string;
  private name: string;
  private progress: number = 0;
  private status: string = '';
  private statusMessage: Discord.Message;
  private link: string = null;
  private error: string = null;
  private updateInterval: NodeJS.Timer = null;
  private animeProvider: AnimeProviders;
  private musicProvider: MusicProviders;

  public constructor(
    name: string,
    options: Partial<GeneratorOptions>,
    author: string,
    animeProvider: AnimeProviders = null,
    musicProvider: MusicProviders = null
  ) {
    this.options = options;
    this.author = author;
    this.name = name;
    this.animeProvider = animeProvider;
    this.musicProvider = musicProvider;
  }

  public getAuthor(): string {
    return this.author;
  }

  private getDescription(): string {
    if (this.link) {
      return `${PackGeneratorTask.OK_SYMBOL} Пак успешно сгенерирован! Ссылка для скачивания находится ниже.`;
    } else if (this.error) {
      return `${PackGeneratorTask.ERROR_SYMBOL} ${this.error}`;
    }
    return 'Пак генерируется, пожалуйста подождите.';
  }

  private getAnimeProvider(): AnimeProviderBase {
    switch (this.animeProvider) {
      default:
        return new ShikimoriProvider(this.name);
    }
  }

  private getMusicProvider(): MusicDownloaderProviderBase {
    switch (this.musicProvider) {
      default:
        return new YoutubeMusicDownloader();
    }
  }

  private getUploader(): DriveUploaderBase {
    return new GoogleDriveUploader(process.env.GOOGLE_DRIVE_CREDENTIALS, process.env.GOOGLE_DRIVE_FOLDER);
  }

  private update(): void {
    if (this.statusMessage) {
      this.statusMessage.edit({
        embeds: [this.createMessage()],
      });
    }
  }

  private createMessage(): Discord.MessageEmbed {
    return new Discord.MessageEmbed({
      title: 'Генерация пака',
      description: this.getDescription(),
      fields: [this.getStatusRow()],
      ...(this.link
        ? {
            footer: {
              text: `[Скачать пакет](${this.link})`,
            },
          }
        : {}),
    });
  }

  public getStatusRow(): Discord.EmbedFieldData {
    const showSections = Math.floor((this.progress / 100) * PackGeneratorTask.RANGE_SCALE);
    return {
      name: 'Загрузка...',
      value: `${this.progress}% ${this.status}\n${'🟩'.repeat(showSections)}${'⬜'.repeat(
        PackGeneratorTask.RANGE_SCALE - showSections
      )}`,
    };
  }

  public start(message: Discord.Message): Promise<void> {
    return message
      .reply({
        embeds: [this.createMessage()],
      })
      .then((newMessage) => {
        this.statusMessage = newMessage;
        this.updateInterval = setInterval(() => this.update(), PackGeneratorTask.UPDATE_INTERVAL);
        const generator = new AnimeGenerator(this.getAnimeProvider(), this.getMusicProvider());
        return generator.createPack(this.options, (progress, status) => {
          this.progress = Math.floor(progress);
          this.status = status;
        });
      })
      .then((packPath) => {
        const uploader = this.getUploader();
        this.status = 'Загрузка пака на облако...';
        return Promise.all([uploader.uploadFile(packPath), Promise.resolve(packPath)]);
      })
      .then(([link, packPath]) => {
        this.link = link;
        fsPromises.rm(packPath, { recursive: true, force: true }).catch();
      })
      .then(() => {
        this.status = 'Готово!';
      })
      .catch((error) => {
        this.status = 'Ошибка!';
        this.error = error?.message || (error ? error.toString() : 'Что-то пошло не так при генерации пака :(');
        this.error = this.error.substring(0, 400);
      })
      .finally(() => {
        this.finish();
      });
  }

  public finish(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    this.update();
  }
}
