// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gemini-2.5-flash-preview-04-17',
    label: 'gemini 2.5 flash preview',
    apiIdentifier: 'gemini-2.5-flash-preview-04-17',
    description: 'Small model for fast, lightweight tasks',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'gemini-2.5-flash-preview-04-17';
