export const isProductionEnvironment = process.env.NODE_ENV === "production";
export const isDevelopmentEnvironment = process.env.NODE_ENV === "development";
export const isTestEnvironment = Boolean(
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.PLAYWRIGHT ||
    process.env.CI_PLAYWRIGHT
);

export const suggestions = [
  "I've been feeling really stressed about my exams lately",
  "I need help understanding a topic in my course",
  "I'm not sure what career path I should follow",
  "I have a problem with my enrollment or documents",
];
