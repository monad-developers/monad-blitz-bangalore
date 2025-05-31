import { google } from '@ai-sdk/google';
import { wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';

export const geminiProModel = wrapLanguageModel({
  model: google('gemini-2.5-flash-preview-04-17'),
  middleware: customMiddleware,
});

export const geminiFlashModel = wrapLanguageModel({
  model: google('gemini-2.0-flash'),
  middleware: customMiddleware,
});
