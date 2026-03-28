export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const suggestions = [
  "I'm feeling overwhelmed with my studies, how can I manage stress?",
  "Help me create a study plan for my upcoming exams",
  "What career paths are available with a computer science degree?",
  "How do I prepare for a job interview as a student?",
];
