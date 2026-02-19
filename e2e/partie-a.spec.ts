import { test, expect } from "@playwright/test";

const API_KEY = process.env.OPENROUTER_API_KEY ?? "";

const EXAMPLE_BRIEFING = `We're building "MealPlan AI" — a mobile-first SaaS that generates personalized weekly meal plans using AI. The user inputs dietary preferences, allergies, budget, and cooking skill level. The AI generates a 7-day plan with recipes, a grocery list, and estimated costs.

Target audience: health-conscious millennials (25-40) who want to eat better but hate planning meals. They currently use a mix of Pinterest, random recipe apps, and impulse grocery shopping.

Monetization: freemium model. Free tier = 1 plan/week with ads. Pro tier at $9.99/month = unlimited plans, nutritional tracking, grocery delivery integration.

Tech stack: React Native, Node.js backend, OpenAI API for recipe generation. MVP timeline: 6 weeks. Budget: $2,000 (API costs + design).

Competition: Mealime (free, no AI), Eat This Much (AI but ugly UX), ChatGPT (generic, no structure). Our edge: beautiful UX + structured output + grocery integration.`;

const VAGUE_BRIEFING = "I want to build an app that uses AI to do stuff. Budget is flexible. No timeline.";

// Skip all A tests if no API key is provided
test.describe("PARTIE A — Tests Fonctionnels Core", () => {
  test.beforeEach(async ({ page }) => {
    if (!API_KEY) test.skip();
    await page.goto("/");
    await page.evaluate((key) => localStorage.setItem("boardroom-openrouter-key", key), API_KEY);
    await page.reload();
  });

  test.describe("A1. Brief détaillé (MealPlan AI — DeepSeek)", () => {
    test("Pipeline complet avec brief détaillé", async ({ page }) => {
      test.setTimeout(300_000); // 5 minutes max

      // Fill briefing
      await page.getByTestId("briefing-textarea").fill(EXAMPLE_BRIEFING);
      await page.getByTestId("ceo-vision-input").fill("Focus on go-to-market strategy and unit economics");

      // Ensure DeepSeek is selected (default)
      await expect(page.getByTestId("model-select")).toHaveValue("deepseek/deepseek-v3.2");

      // Launch
      await page.getByTestId("launch-button").click();

      // ROUND 1: All 6 members should start analyzing
      const memberGrid = page.getByTestId("member-grid");
      await expect(memberGrid).toBeVisible({ timeout: 15000 });

      // Wait for all 6 members to complete (verdict badges appear)
      const roles = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];
      for (const role of roles) {
        const card = page.getByTestId(`member-card-${role}`);
        await expect(card).toBeVisible({ timeout: 10000 });
        // Wait for member to complete — check that "Standby" is gone
        // and either analyzing or complete text is shown
      }

      // Wait for at least one member verdict to appear (signals Round 1 completing)
      await expect(page.getByTestId("member-verdict-cpo")).toBeVisible({ timeout: 90000 });

      // Wait for ALL members to complete
      for (const role of roles) {
        await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible({ timeout: 120000 });
      }

      // FRICTIONS: Check friction section appears
      await expect(page.getByText("FRICTION DETECTED")).toBeVisible({ timeout: 30000 });

      // DEBATES: Wait for debate threads
      await expect(page.getByText("MULTI-TURN DEBATE")).toBeVisible({ timeout: 60000 });

      // Wait for at least one debate outcome
      await expect(page.getByTestId("debate-outcome-0")).toBeVisible({ timeout: 120000 });

      // SYNTHESIS: Wait for collective verdict
      await expect(page.getByTestId("synthesis-section")).toBeVisible({ timeout: 60000 });

      // Analysis should complete
      // Either we get analysis-complete directly, or CEO follow-up first
      const analysisComplete = page.getByTestId("analysis-complete");
      const ceoFollowUp = page.getByTestId("ceo-followup-section");

      await expect(analysisComplete.or(ceoFollowUp)).toBeVisible({ timeout: 120000 });

      // If no CEO follow-up, verify analysis complete
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
      await expect(page.getByTestId("member-grid")).toBeVisible({ timeout: 15000 });

      const roles = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];
      for (const role of roles) {
        await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible({ timeout: 120000 });
      }

      // Wait for frictions, debates, synthesis
      await expect(page.getByText("FRICTION DETECTED")).toBeVisible({ timeout: 30000 });
      await expect(page.getByTestId("synthesis-section")).toBeVisible({ timeout: 180000 });

      // Check if CEO follow-up appears
      const ceoSection = page.getByTestId("ceo-followup-section");
      const analysisComplete = page.getByTestId("analysis-complete");

      await expect(ceoSection.or(analysisComplete)).toBeVisible({ timeout: 30000 });

      // If CEO follow-up exists, fill answers and submit
      if (await ceoSection.isVisible().catch(() => false)) {
        // Fill first answer textarea
        const firstAnswer = page.locator('[data-testid^="ceo-answer-"]').first();
        await firstAnswer.fill("We want to build a meal planning app targeting millennials with a $10/month subscription model.");

        // Submit
        await page.getByTestId("ceo-submit").click();

        // Wait for final verdict
        await expect(
          page.getByTestId("final-verdict").or(page.getByTestId("final-verdict-streaming"))
        ).toBeVisible({ timeout: 120000 });

        // Wait for final verdict to complete
        await expect(page.getByTestId("final-verdict")).toBeVisible({ timeout: 120000 });
        await expect(page.getByTestId("final-verdict-badge")).toBeVisible();

        // Verify sections in final verdict
        await expect(page.getByText("REASONING")).toBeVisible();
        await expect(page.getByText("KEY ACTIONS")).toBeVisible();
      }

      // Verify export buttons eventually appear
      await expect(page.getByTestId("export-button")).toBeVisible({ timeout: 30000 });
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
      await expect(page.getByTestId("member-grid")).toBeVisible({ timeout: 15000 });
      const roles = ["cpo", "cmo", "cfo", "cro", "cco", "cto"];
      for (const role of roles) {
        await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible({ timeout: 120000 });
      }

      // Wait for synthesis
      await expect(page.getByTestId("synthesis-section")).toBeVisible({ timeout: 180000 });

      // Analysis completes (or CEO follow-up)
      const analysisComplete = page.getByTestId("analysis-complete");
      const ceoFollowUp = page.getByTestId("ceo-followup-section");
      await expect(analysisComplete.or(ceoFollowUp)).toBeVisible({ timeout: 60000 });
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
        await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible({ timeout: 120000 });
      }

      // Click each member card and verify modal
      for (const role of roles) {
        await page.getByTestId(`member-card-${role}`).click();
        // Wait for modal (MemberDetail) — look for CLOSE button or detailed analysis text
        await expect(page.getByText("CLOSE").or(page.getByText("ANALYSIS"))).toBeVisible({ timeout: 5000 });
        // Close modal
        const closeBtn = page.getByText("CLOSE");
        if (await closeBtn.isVisible().catch(() => false)) {
          await closeBtn.click();
        } else {
          // Try pressing Escape
          await page.keyboard.press("Escape");
        }
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe("A5. Export du rapport", () => {
    test("EXPORT REPORT télécharge un .md", async ({ page }) => {
      test.setTimeout(300_000);

      await page.getByTestId("briefing-textarea").fill(EXAMPLE_BRIEFING);
      await page.getByTestId("launch-button").click();

      // Wait for completion
      await expect(page.getByTestId("analysis-complete").or(
        page.getByTestId("ceo-followup-section")
      )).toBeVisible({ timeout: 240000 });

      // If CEO follow-up, handle it
      const ceoSection = page.getByTestId("ceo-followup-section");
      if (await ceoSection.isVisible().catch(() => false)) {
        const firstAnswer = page.locator('[data-testid^="ceo-answer-"]').first();
        await firstAnswer.fill("Proceed with the plan as outlined.");
        await page.getByTestId("ceo-submit").click();
        await expect(page.getByTestId("final-verdict")).toBeVisible({ timeout: 120000 });
      }

      await expect(page.getByTestId("export-button")).toBeVisible({ timeout: 30000 });

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

      await expect(page.getByTestId("analysis-complete").or(
        page.getByTestId("ceo-followup-section")
      )).toBeVisible({ timeout: 240000 });

      // Handle CEO follow-up if needed
      const ceoSection = page.getByTestId("ceo-followup-section");
      if (await ceoSection.isVisible().catch(() => false)) {
        const firstAnswer = page.locator('[data-testid^="ceo-answer-"]').first();
        await firstAnswer.fill("Proceed with the plan.");
        await page.getByTestId("ceo-submit").click();
        await expect(page.getByTestId("final-verdict")).toBeVisible({ timeout: 120000 });
      }

      await expect(page.getByTestId("share-image-button")).toBeVisible({ timeout: 30000 });

      const downloadPromise = page.waitForEvent("download");
      await page.getByTestId("share-image-button").click();
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/\.png$/);
    });
  });
});
