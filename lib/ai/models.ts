export const DEFAULT_CHAT_MODEL = "mistral-tiny-latest";

export type ModelCapabilities = {
  tools: boolean;
  vision: boolean;
  reasoning: boolean;
};

export type ChatModel = {
  id: string;
  name: string;
  provider: string;
  description: string;
  gatewayOrder?: string[];
  reasoningEffort?: "none" | "minimal" | "low" | "medium" | "high";
};

export const chatModels: ChatModel[] = [
  {
    id: "mistral-tiny-latest",
    name: "Mistral Tiny",
    provider: "mistral",
    description: "Fast and lightweight Mistral model",
  },
  {
    id: "magistral-small-latest",
    name: "Magistral Small",
    provider: "mistral",
    description: "Balanced reasoning model by Mistral",
  },
  {
    id: "magistral-medium-latest",
    name: "Magistral Medium",
    provider: "mistral",
    description: "Advanced reasoning model by Mistral",
  },
];

export async function getCapabilities(): Promise<
  Record<string, ModelCapabilities>
> {
  return Object.fromEntries(
    chatModels.map((model) => [
      model.id,
      { tools: true, vision: false, reasoning: false },
    ])
  );
}

export const isDemo = process.env.IS_DEMO === "1";

export function getActiveModels(): ChatModel[] {
  return chatModels;
}

export const allowedModelIds = new Set(chatModels.map((m) => m.id));

export const modelsByProvider = chatModels.reduce(
  (acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  },
  {} as Record<string, ChatModel[]>
);
