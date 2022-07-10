import { AnimeProviders } from '../constants/anime-providers.constants';
import { MusicProviders } from '../constants/music-providers.constants';
import { AnimeKind, PackRound, AnimeCharacterRole } from '@bitvalser/animegen';

export const CREATE_ARGUMENTS_DATA: {
  [argument: string]: {
    required?: boolean;
    mapTo?: string;
    mapValue?: (value: string) => any;
    validator: (value: string) => boolean;
  };
} = {
  name: {
    required: true,
    mapValue: (value: string) => value.substring(0, 100),
    validator: (value) => value.trim().length > 2,
  },
  titles: {
    mapTo: 'titleCounts',
    mapValue: (value) => +value,
    validator: (value: string) => +value > 9 && +value <= 400,
  },
  kinds: {
    mapTo: 'animeKinds',
    mapValue: (value: string) => value.split(','),
    validator: (value: string) =>
      value.split(',').every((item) => Object.values(AnimeKind).includes(item as AnimeKind)),
  },
  roles: {
    mapTo: 'charactersRoles',
    mapValue: (value: string) => value.split(','),
    validator: (value: string) =>
      value.split(',').every((item) => Object.values(AnimeCharacterRole).includes(item as AnimeCharacterRole)),
  },
  compression: {
    mapTo: 'imageCompression',
    mapValue: (value: string) => +value,
    validator: (value: string) => +value >= 0.1 && +value <= 1,
  },
  rounds: {
    mapTo: 'rounds',
    mapValue: (value: string) => value.split(','),
    validator: (value: string) =>
      value
        .split(',')
        .every(
          (item) =>
            Object.values(PackRound).includes(item as PackRound) &&
            ![PackRound.Openings, PackRound.Endings, PackRound.Coubs].includes(item as PackRound)
        ),
  },
  random: {
    validator: (value) => (value as never as boolean) ?? false,
    mapValue: () => true,
  },
  noRepeats: {
    validator: () => true,
    mapValue: () => true,
  },
  // packName: {
  //   mapValue: (value: string) => value.substring(0, 100),
  //   validator: (value) => value.trim().length > 2,
  // },
  animeProvider: {
    validator: (value) => Object.values(AnimeProviders).includes(value as AnimeProviders),
  },
  musicProvider: {
    validator: (value) => Object.values(MusicProviders).includes(value as MusicProviders),
  },
};
