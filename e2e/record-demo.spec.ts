/**
 * Demo Video Recording Script
 *
 * Records a full BoardRoom AI demo session as a WebM video.
 * Uses Playwright's built-in video recording with real LLM calls.
 *
 * Usage:
 *   npx playwright test e2e/record-demo.spec.ts --headed
 *
 * Output:
 *   videos/demo-raw.webm  → raw recording (real-time, ~3-5 min)
 *
 * Post-processing:
 *   bash scripts/convert-demo-video.sh
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { expect, test } from "@playwright/test";

const API_KEY = process.env.OPENROUTER_API_KEY ?? "";

const DEMO_BRIEFING =
  "Should we launch our SaaS product in the US market in Q1, or focus on consolidating our existing European base first?";

const DEMO_CEO_VISION = "I want to move fast and capture the US before our competitors do.";

const CEO_ANSWERS = [
  "We have 14 months of runway. Bridge financing is available from our existing investors if US traction justifies it within 6 months.",
  "Yes — 2 CS hires are approved and budgeted. Recruitment starts immediately, targeting onboarding before US launch.",
];

const VIDEO_DIR = path.join("C:\\Users\\jonat\\projects\\comex-board-web", "videos");

/** Helper: wait for element to appear, return true/false */
async function waitForVisible(
  locator: ReturnType<typeof test["info"]> extends never ? never : import("@playwright/test").Locator,
  timeout: number,
): Promise<boolean> {
  try {
    await locator.waitFor({ state: "visible", timeout });
    return true;
  } catch {
    return false;
  }
}

test.use({
  viewport: { width: 1280, height: 720 },
  video: {
    mode: "on",
    size: { width: 1280, height: 720 },
  },
  launchOptions: {
    slowMo: 50,
  },
});

test("Record full demo — US market launch scenario", async ({ page }) => {
  test.setTimeout(600_000);

  fs.mkdirSync(VIDEO_DIR, { recursive: true });

  const log = (msg: string) => {
    const ts = new Date().toISOString().slice(11, 19);
    console.log(`[${ts}] ${msg}`);
  };

  // ── SCENE 1: Landing page ────────────────────────────────
  log("SCENE 1 — Opening app");
  await page.goto("/");

  if (API_KEY) {
    await page.evaluate(
      (key) => localStorage.setItem("boardroom-openrouter-key", key),
      API_KEY,
    );
    await page.reload();
    await page.waitForLoadState("networkidle");
  }

  // Brief pause on landing
  await page.waitForTimeout(1500);

  // ── SCENE 2: Fill briefing (fast typing) ──────────────────
  log("SCENE 2 — Typing briefing");
  const briefingArea = page.getByTestId("briefing-textarea");
  await briefingArea.click();
  await briefingArea.type(DEMO_BRIEFING, { delay: 25 });
  await page.waitForTimeout(300);

  log("SCENE 2 — Typing CEO vision");
  const ceoInput = page.getByTestId("ceo-vision-input");
  await ceoInput.click();
  await ceoInput.type(DEMO_CEO_VISION, { delay: 25 });
  await page.waitForTimeout(500);

  // Submit
  log("SCENE 2 — Launching analysis");
  await page.getByTestId("launch-button").click();

  // ── SCENE 3: Round 1 — Members streaming ─────────────────
  log("SCENE 3 — Waiting for member grid");
  await expect(page.getByTestId("member-grid")).toBeVisible({ timeout: 15000 });
  await page.getByTestId("member-grid").scrollIntoViewIfNeeded();

  // Wait for all 6 verdicts — this is real LLM time
  log("SCENE 3 — Waiting for all member verdicts");
  const roles = ["cpo", "cmo", "cfo", "cro", "cco", "cto"] as const;
  for (const role of roles) {
    await expect(page.getByTestId(`member-verdict-${role}`)).toBeVisible({
      timeout: 120000,
    });
    log(`  ${role.toUpperCase()} verdict visible`);
  }
  // Brief pause to show verdicts, then move on quickly
  await page.waitForTimeout(800);

  // ── SCENE 4: Friction Detection ──────────────────────────
  log("SCENE 4 — Waiting for frictions");
  const hasFrictions = await waitForVisible(
    page.getByText("FRICTION DETECTED"),
    30000,
  );

  if (hasFrictions) {
    log("SCENE 4 — Frictions detected, scrolling");
    await page.getByText("FRICTION DETECTED").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
  }

  // ── SCENE 5: Multi-turn Debates ──────────────────────────
  log("SCENE 5 — Waiting for debates");
  const hasDebates = await waitForVisible(
    page.getByText("MULTI-TURN DEBATE"),
    90000,
  );

  if (hasDebates) {
    log("SCENE 5 — Debates started, scrolling to follow");
    await page.getByText("MULTI-TURN DEBATE").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    // Scroll progressively to follow debate turns
    for (let i = 0; i < 6; i++) {
      await page.waitForTimeout(2500);
      await page.evaluate(() => window.scrollBy({ top: 200, behavior: "smooth" }));

      // Check if debates have resolved
      const outcomeVisible = await page
        .locator('[data-testid^="debate-outcome-"]')
        .first()
        .isVisible()
        .catch(() => false);
      if (outcomeVisible) {
        log("SCENE 5 — Debate outcome visible");
        break;
      }
    }

    // Wait for at least one debate outcome
    log("SCENE 5 — Waiting for debate outcomes");
    await waitForVisible(
      page.locator('[data-testid^="debate-outcome-"]').first(),
      120000,
    );
    await page.waitForTimeout(1000);
  }

  // ── SCENE 6a: Synthesis ──────────────────────────────────
  log("SCENE 6a — Waiting for synthesis");
  const hasSynthesis = await waitForVisible(
    page.getByTestId("synthesis-section"),
    120000,
  );

  if (hasSynthesis) {
    log("SCENE 6a — Synthesis visible, scrolling");
    await page.getByTestId("synthesis-section").scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollBy({ top: 250, behavior: "smooth" }));
    await page.waitForTimeout(1500);
  }

  // ── SCENE 6b: CEO Follow-Up ──────────────────────────────
  log("SCENE 6b — Checking for CEO follow-up");
  const ceoFollowUp = page.getByTestId("ceo-followup-section");
  const analysisComplete = page.getByTestId("analysis-complete");
  await expect(ceoFollowUp.or(analysisComplete)).toBeVisible({ timeout: 120000 });

  const hasCeoFollowUp = await ceoFollowUp.isVisible().catch(() => false);

  if (hasCeoFollowUp) {
    log("SCENE 6b — CEO Follow-Up questions detected");
    await ceoFollowUp.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1500);

    // Type CEO answers
    const answerFields = page.locator('[data-testid^="ceo-answer-"]');
    const answerCount = await answerFields.count();

    for (let i = 0; i < answerCount; i++) {
      const answer = CEO_ANSWERS[i] ?? CEO_ANSWERS[0];
      await answerFields.nth(i).click();
      await answerFields.nth(i).type(answer, { delay: 15 });
      await page.waitForTimeout(300);
    }

    // Submit
    log("SCENE 6b — Submitting CEO answers");
    await page.waitForTimeout(600);
    await page.getByTestId("ceo-submit").scrollIntoViewIfNeeded();
    await page.getByTestId("ceo-submit").click();

    // ── SCENE 7: Final Verdict ─────────────────────────────
    log("SCENE 7 — Waiting for Final Verdict");
    const finalVerdict = page.getByTestId("final-verdict");
    const streaming = page.getByTestId("final-verdict-streaming");
    await expect(finalVerdict.or(streaming)).toBeVisible({ timeout: 120000 });

    if (await streaming.isVisible().catch(() => false)) {
      log("SCENE 7 — Final verdict streaming...");
      await streaming.scrollIntoViewIfNeeded();

      // Follow streaming text
      for (let i = 0; i < 8; i++) {
        await page.waitForTimeout(1500);
        await page.evaluate(() => window.scrollBy({ top: 100, behavior: "smooth" }));
        if (await finalVerdict.isVisible().catch(() => false)) break;
      }
    }

    await expect(finalVerdict).toBeVisible({ timeout: 120000 });
    log("SCENE 7 — Final verdict complete");
    await finalVerdict.scrollIntoViewIfNeeded();
    await page.waitForTimeout(2000);
  }

  // ── SCENE 8: Export ────────────────────────────────────────
  log("SCENE 8 — Export report");
  await expect(page.getByTestId("export-button")).toBeVisible({ timeout: 30000 });
  await page.getByTestId("analysis-complete").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  await page.getByTestId("export-button").click();
  await page.waitForTimeout(1500);

  // ── SCENE 9: Closing ──────────────────────────────────────
  log("SCENE 9 — Scrolling back to top");
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await page.waitForTimeout(2500);

  log("RECORDING COMPLETE");

  const videoPath = await page.video()?.path();
  if (videoPath) {
    log(`Raw video saved at: ${videoPath}`);
    test.info().annotations.push({
      type: "video_path",
      description: videoPath,
    });
  }
});
