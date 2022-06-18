export interface IProcessEnv {
  BOT_TOKEN: string;
  FFMPEG_PATH: string;
  GOOGLE_DRIVE_FOLDER: string;
  GOOGLE_DRIVE_CREDENTIALS: string;
  [key: string]: string;
}

declare global {
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface ProcessEnv extends IProcessEnv {}
  }
}
