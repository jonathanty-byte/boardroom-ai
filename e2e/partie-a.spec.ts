import { expect, test } from "@playwright/test";

const API_KEY = process.env.OPENROUTER_API_KEY ?? "";

const EXAMPLE_BRIEFING = `We're building "MealPlan AI" — a mobile-first SaaS that generates personalized weekly meal plans using AI. The user inputs dietary preferences, allergies, budget, and cooking skill level. The AI generates a 7-day plan with recipes, a grocery list, and estimated costs.

Target audience: health-conscious millennials (25-40) who want to eat better but hate planning meals. They currently use a mix of Pinterest, random recipe apps, and impulse grocery shopping.

Monetization: freemium model. Free tier = 1 plan/week with ads. Pro tier at $9.99/month = unlimited plans, nutritional tracking, grocery delivery integration.

Tech stack: React Native, Node.js backend, OpenAI API for recipe generation. MVP timeline: 6 weeks. Budget: $2,000 (API costs + design).

Competition: Mealime (free, no AI), Eat This Much (AI but ugly UX), ChatGPT (generic, no structure). Our edge: beautiful UX + structured output + grocery integration.`;

const VAGUE_BRIEFING =
  "I want to build an app that uses AI to do stuff. Budget is flexible. No timeline.";

/** Helper: wait for pipeline to complete (analysis-complete or ceo-followup-section) */
async function waitForPipelineEnd(page: import("@playwright/test").Page, timeoutMs = 280_000) {
  const analysisComplete = page.getByTestId("analysis-complete");
  const ceoFollowUp = page.getByTestId("ceo-followup-section");
  await expect(analysisComplete.or(ceoFollowUp)).toBeVisible({ timeout: timeoutMs });
}

/** Helper: handle CEO follow-up if present, submit answers, wait for final verdict */
async function handleCeoFollowUpIfPresent(page: import("@playwright/test").Page) {
  const ceoSection = page.getByTestId("ceo-followup-section");
  if (await ceoSection.isVisible().catch(() => false)) {
    const firstAnswer = page.locator('[data-testid^="ceo-answer-"]').first();
    await firstAnswer.fill(
      "We want to build a meal planning app targeting millennials. $10/month subscription. 6 week MVP. $2000 budget.",
    );
    await page.getByTestId("ceo-submit").click();
    await expect(page.getByTestId("final-verdict")).toBeVisible({ timeout: 180_000 });
  }
}

// Skip all A tests if no API key is provided
test.describe("PARTIE A — Tests Fonctionnels Core", () => {
  test.beforeEach(async ({ page }) => {
    if (!API_KEY) test.skip();
    await page.goto("/");
    await page.evaluate((key) => localStorage.setItem("boardroom-openrouter-key", key), API_KEY);
    await page.reload();
    await page.waitForLoadState("networkidle");
  });

  test.describe("A1. Brief détaillé (MealPlan AI — DeepSeek)", () => {
    test("Pipeline complet avec brief détaillé", async ({ page }) => {
      test.setTimeout(480_000); // 8 minutes — detailed brief + DeepSeek debates are slow

      // Fill briefing
      await page.getByTestId("briefing-textarea").fill(EXAMPLE_BRIEFING);
      await page
        .getByTestId("ceo-vision-input")
        .fill("Focus on go-to-market strategy and unit economics");

      // Ensure DeepSeek is selected (default)
      await expect(page.getByTestId("model-select")).toHaveValue("deepseek/deepseek-v3.2");

      // Launch
      await page.getByTestId("launch-button").click();

      // ROUND 1: All 6 members should appear
      const memberGrid = page.getByTestId("member-grid");
      await expect(memberGrid).toBeVisible({ timeout: 15_000 });

      // Wait for pipeline to finish first (debates can take 4+ min with DeepSeek)
      await waitForPipelineEnd(page, 450_000);

      // Retroactively verify all pipeline stages are visible in the DOM
      const roles = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];
      for (const role of roles) {
        await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible();
      }

      // Friction + debate traces should be present
      await expect(page.getByText("FRICTION DETECTED")).toBeVisible();
      await expect(page.getByText("MULTI-TURN DEBATE")).toBeVisible();

      // Synthesis section should be visible
      await expect(page.getByTestId("synthesis-section")).toBeVisible();

      // If no CEO follow-up, verify export buttons visible
      const analysisComplete = page.getByTestId("analysis-complete");
      if (await analysisComplete.isVisible().catch(() => false)) {
        await expect(page.getByTestId("export-button")).toBeVisible();
        await expect(page.getByTestId("share-image-button")).toBeVisible();
      }
    });
  });

  test.describe("A2. Brief vague (CEO Follow-Up)", () => {
    test("Pipeline avec brief vague et CEO follow-up", async ({ page }) => {
      test.setTimeout(300_000);

      await page.getByTestId("briefing-textarea").fill(VAGUE_BRIEFING);
      await page.getByTestId("launch-button").click();

      // Wait for Round 1 to complete
      await expect(page.getByTestId("member-grid")).toBeVisible({ timeout: 15_000 });

      const roles = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];
      for (const role of roles) {
        await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible({ timeout: 120_000 });
      }

      // Wait for pipeline to finish (synthesis + optional CEO follow-up)
      await waitForPipelineEnd(page);

      // Check if CEO follow-up appears
      const ceoSection = page.getByTestId("ceo-followup-section");
      const analysisComplete = page.getByTestId("analysis-complete");

      // If CEO follow-up exists, fill answers and submit
      if (await ceoSection.isVisible().catch(() => false)) {
        const firstAnswer = page.locator('[data-testid^="ceo-answer-"]').first();
        await firstAnswer.fill(
          "We want to build a meal planning app targeting millennials with a $10/month subscription model.",
        );

        // Submit
        await page.getByTestId("ceo-submit").click();

        // Wait for final verdict
        await expect(
          page.getByTestId("final-verdict").or(page.getByTestId("final-verdict-streaming")),
        ).toBeVisible({ timeout: 180_000 });

        // Wait for final verdict to complete
        await expect(page.getByTestId("final-verdict")).toBeVisible({ timeout: 180_000 });
        await expect(page.getByTestId("final-verdict-badge")).toBeVisible();

        // Verify sections in final verdict
        await expect(page.getByText("REASONING")).toBeVisible();
        await expect(page.getByText("KEY ACTIONS")).toBeVisible();
      }

      // Verify export buttons eventually appear
      await expect(page.getByTestId("export-button")).toBeVisible({ timeout: 60_000 });
      await expect(page.getByTestId("share-image-button")).toBeVisible();
    });
  });

  test.describe("A3. Test avec Gemini Flash", () => {
    test("Pipeline complet avec Gemini Flash", async ({ page }) => {
      test.setTimeout(300_000);

      await page.getByTestId("briefing-textarea").fill(EXAMPLE_BRIEFING);
      await page.getByTestId("model-select").selectOption("google/gemini-3-flash-preview");
      await page.getByTestId("launch-button").click();

      // Wait for Round 1 completion
      await expect(page.getByTestId("member-grid")).toBeVisible({ timeout: 15_000 });
      const roles = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];
      for (const role of roles) {
        await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible({ timeout: 120_000 });
      }

      // Wait for pipeline end
      await waitForPipelineEnd(page);
    });
  });

  test.describe("A4. Inspection des cartes membres", () => {
    test("Click sur chaque carte → modal détail", async ({ page }) => {
      test.setTimeout(300_000);

      // First run an analysis
      await page.getByTestId("briefing-textarea").fill(EXAMPLE_BRIEFING);
      await page.getByTestId("launch-button").click();

      // Wait for all members to complete
      const roles = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];
      for (const role of roles) {
        await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible({ timeout: 120_000 });
      }

      // Click each member card and verify modal
      for (const role of roles) {
        await page.getByTestId(`member-card-${role}`).click();
        // Wait for modal: look for CLOSE button specifically (role='button')
        const closeBtn = page.getByRole("button", { name: "CLOSE" });
        await expect(closeBtn).toBeVisible({ timeout: 5_000 });
        await closeBtn.click();
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe("A5. Export du rapport", () => {
    test("EXPORT REPORT télécharge un .md", async ({ page }) => {
      test.setTimeout(300_000);

      await page.getByTestId("briefing-textarea").fill(EXAMPLE_BRIEFING);
      await page.getByTestId("launch-button").click();

      // Wait for pipeline end
      await waitForPipelineEnd(page);

      // Handle CEO follow-up if present
      await handleCeoFollowUpIfPresent(page);

      await expect(page.getByTestId("export-button")).toBeVisible({ timeout: 60_000 });

      // Listen for download
      const downloadPromise = page.waitForEvent("download");
      await page.getByTestId("export-button").click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/boardroom-report.*\.md$/);
    });
  });

  test.describe("A6. Share Image", () => {
    test("SHARE IMAGE télécharge un PNG", async ({ page }) => {
      test.setTimeout(300_000);

      await page.getByTestId("briefing-textarea").fill(EXAMPLE_BRIEFING);
      await page.getByTestId("launch-button").click();

      // Wait for pipeline end
      await waitForPipelineEnd(page);

      // Handle CEO follow-up if present
      await handleCeoFollowUpIfPresent(page);

      await expect(page.getByTestId("share-image-button")).toBeVisible({ timeout: 60_000 });

      const downloadPromise = page.waitForEvent("download");
      await page.getByTestId("share-image-button").click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.png$/);
    });
  });
});
