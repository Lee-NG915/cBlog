import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests-public",
  outputDir: "test-results-public",
  timeout: 60000,
  use: {
    channel: "chrome",
    baseURL: "http://127.0.0.1:4173/cBlog/",
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
    trace: "retain-on-failure",
  },
  workers: 2,
  reporter: "list",
});
