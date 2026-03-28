import { customProvider } from "ai";
import { createMistral } from "@ai-sdk/mistral";
import { isTestEnvironment } from "../constants";

const mistral = createMistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

export const myProvider = isTestEnvironment
  ? (() => {
      const { chatModel, titleModel } = require("./models.mock");
      return customProvider({
        languageModels: {
          "chat-model": chatModel,
          "title-model": titleModel,
        },
      });
    })()
  : null;

export function getLanguageModel(modelId: string) {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel(modelId);
  }

  return mistral(modelId);
}

export function getTitleModel() {
  if (isTestEnvironment && myProvider) {
    return myProvider.languageModel("title-model");
  }
  return mistral("mistral-tiny-latest");
}
