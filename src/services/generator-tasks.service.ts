import { PackGeneratorTask } from '../classes/pack-generator-task.class';

export class GeneratorTasksService {
  private static instance: GeneratorTasksService;
  public tasks: PackGeneratorTask[] = [];

  public static getInstance(): GeneratorTasksService {
    if (!GeneratorTasksService.instance) {
      GeneratorTasksService.instance = new GeneratorTasksService();
    }
    return GeneratorTasksService.instance;
  }
}
