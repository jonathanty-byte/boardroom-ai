import { test, expect } from "@playwright/test";
import * as fs from "node:fs";
import * as path from "node:path";

const API_KEY = process.env.OPENROUTER_API_KEY ?? "";

const EXAMPLE_BRIEFING = `We're building "MealPlan AI" — a mobile-first SaaS that generates personalized weekly meal plans using AI. The user inputs dietary preferences, allergies, budget, and cooking skill level. The AI generates a 7-day plan with recipes, a grocery list, and estimated costs.

Target audience: health-conscious millennials (25-40) who want to eat better but hate planning meals. They currently use a mix of Pinterest, random recipe apps, and impulse grocery shopping.

Monetization: freemium model. Free tier = 1 plan/week with ads. Pro tier at $9.99/month = unlimited plans, nutritional tracking, grocery delivery integration.

Tech stack: React Native, Node.js backend, OpenAI API for recipe generation. MVP timeline: 6 weeks. Budget: $2,000 (API costs + design).

Competition: Mealime (free, no AI), Eat This Much (AI but ugly UX), ChatGPT (generic, no structure). Our edge: beautiful UX + structured output + grocery integration.`;

const VAGUE_BRIEFING =
  "I want to build an app that uses AI to do stuff. Budget is flexible. No timeline.";

test.describe("Capture — Full Pipeline Analysis", () => {
  test.beforeEach(async ({ page }) => {
    if (!API_KEY) test.skip();
    await page.goto("/");
    await page.evaluate(
      (key) => localStorage.setItem("boardroom-openrouter-key", key),
      API_KEY,
    );
    await page.reload();
  });

  test("A1 — Brief détaillé: capture complète du pipeline", async ({ page }) => {
    test.setTimeout(360_000);

    const events: string[] = [];
    const timestamps: Record<string, number> = {};
    const startTime = Date.now();

    // Fill briefing
    await page.getByTestId("briefing-textarea").fill(EXAMPLE_BRIEFING);
    await page
      .getByTestId("ceo-vision-input")
      .fill("Focus on go-to-market strategy and unit economics");
    await page.getByTestId("launch-button").click();
    timestamps["launch"] = Date.now() - startTime;

    // Wait for member grid
    await expect(page.getByTestId("member-grid")).toBeVisible({ timeout: 15000 });
    timestamps["member_grid_visible"] = Date.now() - startTime;

    // Wait for all 6 members to complete
    const roles = ["cpo", "cmo", "cfo", "cro", "cco", "cto"] as const;
    const verdicts: Record<string, string> = {};

    for (const role of roles) {
      await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible({
        timeout: 120000,
      });
      const verdictEl = page.getByTestId(`member-verdict-${role}`);
      verdicts[role] = (await verdictEl.textContent()) ?? "N/A";
    }
    timestamps["round1_complete"] = Date.now() - startTime;

    events.push(`ROUND 1 complete in ${timestamps["round1_complete"]}ms`);
    events.push(`Verdicts: ${JSON.stringify(verdicts)}`);

    // Check for frictions
    const hasFrictions = await page
      .getByText("FRICTION DETECTED")
      .isVisible({ timeout: 30000 })
      .catch(() => false);
    if (hasFrictions) {
      timestamps["frictions_detected"] = Date.now() - startTime;
      events.push("Frictions detected");

      // Count frictions
      const frictionCount = await page.locator(".dialogue-box").count();
      events.push(`Friction boxes visible: ${frictionCount}`);
    }

    // Wait for debates
    const hasDebates = await page
      .getByText("MULTI-TURN DEBATE")
      .isVisible({ timeout: 60000 })
      .catch(() => false);
    if (hasDebates) {
      timestamps["debates_started"] = Date.now() - startTime;
      events.push("Multi-turn debates started");

      // Wait for debate outcomes
      await page.waitForTimeout(5000);
      const outcomes = await page.locator('[data-testid^="debate-outcome-"]').allTextContents();
      events.push(`Debate outcomes: ${JSON.stringify(outcomes)}`);
    }

    // Wait for synthesis
    const hasSynthesis = await page
      .getByTestId("synthesis-section")
      .isVisible({ timeout: 120000 })
      .catch(() => false);
    if (hasSynthesis) {
      timestamps["synthesis_visible"] = Date.now() - startTime;
      const collectiveVerdict = await page
        .getByTestId("collective-verdict")
        .textContent()
        .catch(() => "N/A");
      events.push(`Collective verdict: ${collectiveVerdict}`);

      // Capture consensus/compromises/impasses
      const consensus = await page
        .locator("text=CONSENSUS")
        .locator("..")
        .textContent()
        .catch(() => "");
      const compromises = await page
        .locator("text=COMPROMISES")
        .locator("..")
        .textContent()
        .catch(() => "");
      const impasses = await page
        .locator("text=IMPASSES")
        .locator("..")
        .textContent()
        .catch(() => "");
      events.push(`Consensus section: ${consensus.slice(0, 300)}`);
      events.push(`Compromises section: ${compromises.slice(0, 300)}`);
      events.push(`Impasses section: ${impasses.slice(0, 300)}`);
    }

    // Wait for completion or CEO follow-up
    const analysisComplete = page.getByTestId("analysis-complete");
    const ceoFollowUp = page.getByTestId("ceo-followup-section");
    await expect(analysisComplete.or(ceoFollowUp)).toBeVisible({ timeout: 240000 });
    timestamps["pipeline_complete"] = Date.now() - startTime;

    const hasCeoFollowUp = await ceoFollowUp.isVisible().catch(() => false);
    events.push(`CEO Follow-Up needed: ${hasCeoFollowUp}`);

    if (hasCeoFollowUp) {
      // Capture questions
      const questions = await page.locator('[data-testid^="ceo-question-"]').allTextContents();
      events.push(`CEO Questions: ${JSON.stringify(questions)}`);

      // Answer all questions to trigger final verdict
      const answerFields = page.locator('[data-testid^="ceo-answer-"]');
      const answerCount = await answerFields.count();
      for (let i = 0; i < answerCount; i++) {
        await answerFields
          .nth(i)
          .fill(
            "We project $0.02/API call, 5% conversion, <3% monthly churn. We've benchmarked against Mealime's model and have negotiated volume pricing with OpenAI.",
          );
      }
      await page.getByTestId("ceo-submit").click();
      events.push("CEO answers submitted");

      // Wait for final verdict
      await expect(
        page.getByTestId("final-verdict").or(page.getByTestId("final-verdict-streaming")),
      ).toBeVisible({ timeout: 120000 });
      await expect(page.getByTestId("final-verdict")).toBeVisible({ timeout: 120000 });
      events.push("Final verdict received");

      const badge = await page
        .getByTestId("final-verdict-badge")
        .textContent()
        .catch(() => "N/A");
      events.push(`Final verdict: ${badge}`);
    }

    // Now export the report
    await expect(page.getByTestId("export-button")).toBeVisible({ timeout: 30000 });
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-button").click();
    const download = await downloadPromise;

    const reportPath = path.join(
      "C:\\Users\\jonat\\projects\\comex-board-web",
      "test-results",
      "captured-report-a1.md",
    );
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    await download.saveAs(reportPath);
    events.push(`Report saved to: ${reportPath}`);

    // Final timing
    const totalTime = Date.now() - startTime;
    events.push(`Total pipeline time: ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);

    // Write capture log
    const logPath = path.join(
      "C:\\Users\\jonat\\projects\\comex-board-web",
      "test-results",
      "capture-log-a1.txt",
    );
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.writeFileSync(logPath, events.join("\n"), "utf-8");

    // Assertions
    expect(Object.keys(verdicts)).toHaveLength(6);
    expect(totalTime).toBeLessThan(300000); // < 5 minutes
  });

  test("A2 — Brief vague: CEO Follow-Up path", async ({ page }) => {
    test.setTimeout(360_000);

    const events: string[] = [];
    const startTime = Date.now();

    await page.getByTestId("briefing-textarea").fill(VAGUE_BRIEFING);
    await page.getByTestId("launch-button").click();

    // Wait for all members to complete
    const roles = ["cpo", "cmo", "cfo", "cro", "cco", "cto"] as const;
    const verdicts: Record<string, string> = {};

    await expect(page.getByTestId("member-grid")).toBeVisible({ timeout: 15000 });

    for (const role of roles) {
      await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible({
        timeout: 120000,
      });
      verdicts[role] = (await page.getByTestId(`member-verdict-${role}`).textContent()) ?? "N/A";
    }
    events.push(`Round 1 verdicts: ${JSON.stringify(verdicts)}`);
    events.push(`Round 1 time: ${Date.now() - startTime}ms`);

    // Check CTO verdict
    events.push(`CTO verdict: ${verdicts["cto"]}`);

    // Wait for synthesis
    await expect(page.getByTestId("synthesis-section")).toBeVisible({ timeout: 180000 });
    const collectiveVerdict = await page
      .getByTestId("collective-verdict")
      .textContent()
      .catch(() => "N/A");
    events.push(`Collective verdict: ${collectiveVerdict}`);

    // Wait for completion
    const ceoSection = page.getByTestId("ceo-followup-section");
    const analysisComplete = page.getByTestId("analysis-complete");
    await expect(ceoSection.or(analysisComplete)).toBeVisible({ timeout: 60000 });

    const hasCeo = await ceoSection.isVisible().catch(() => false);
    events.push(`CEO Follow-Up triggered: ${hasCeo}`);

    if (hasCeo) {
      // Capture questions
      const questions = await page.locator('[data-testid^="ceo-question-"]').allTextContents();
      events.push(`Questions count: ${questions.length}`);
      for (let i = 0; i < questions.length; i++) {
        events.push(`  Q${i + 1}: ${questions[i].slice(0, 200)}`);
      }

      // Answer questions
      const answerFields = page.locator('[data-testid^="ceo-answer-"]');
      const count = await answerFields.count();
      for (let i = 0; i < count; i++) {
        await answerFields
          .nth(i)
          .fill(
            "We want to build a mobile meal planning app for millennials. Target $10/mo subscription. MVP in 8 weeks with React Native + OpenAI.",
          );
      }

      // Submit
      await page.getByTestId("ceo-submit").click();
      events.push("CEO answers submitted");

      // Wait for final verdict
      const finalVerdict = page.getByTestId("final-verdict");
      const streaming = page.getByTestId("final-verdict-streaming");
      await expect(finalVerdict.or(streaming)).toBeVisible({ timeout: 120000 });

      if (await streaming.isVisible().catch(() => false)) {
        events.push("Final verdict streaming...");
      }

      await expect(finalVerdict).toBeVisible({ timeout: 120000 });
      events.push("Final verdict complete");

      // Capture verdict details
      const badge = await page
        .getByTestId("final-verdict-badge")
        .textContent()
        .catch(() => "N/A");
      events.push(`Final verdict badge: ${badge}`);

      const reasoning = await page
        .locator('[data-testid="final-verdict"] >> text=REASONING')
        .locator("..")
        .textContent()
        .catch(() => "N/A");
      events.push(`Reasoning: ${reasoning?.slice(0, 500)}`);

      const keyActions = await page
        .locator('[data-testid="final-verdict"] >> text=KEY ACTIONS')
        .locator("..")
        .textContent()
        .catch(() => "N/A");
      events.push(`Key Actions: ${keyActions?.slice(0, 300)}`);

      const risks = await page
        .locator('[data-testid="final-verdict"] >> text=ACKNOWLEDGED RISKS')
        .locator("..")
        .textContent()
        .catch(() => "N/A");
      events.push(`Risks: ${risks?.slice(0, 300)}`);
    }

    // Export report
    await expect(page.getByTestId("export-button")).toBeVisible({ timeout: 30000 });
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("export-button").click();
    const download = await downloadPromise;
    const reportPath = path.join(
      "C:\\Users\\jonat\\projects\\comex-board-web",
      "test-results",
      "captured-report-a2.md",
    );
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    await download.saveAs(reportPath);
    events.push(`Report saved to: ${reportPath}`);

    // Total time
    events.push(`Total time: ${Date.now() - startTime}ms`);

    // Write log
    const logPath = path.join(
      "C:\\Users\\jonat\\projects\\comex-board-web",
      "test-results",
      "capture-log-a2.txt",
    );
    fs.writeFileSync(logPath, events.join("\n"), "utf-8");

    // Assertions
    expect(Object.keys(verdicts)).toHaveLength(6);
  });
});
