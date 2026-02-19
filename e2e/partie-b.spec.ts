import { test, expect } from "@playwright/test";

test.describe("PARTIE B — Tests Techniques", () => {
  test.describe("B1. Validation du formulaire", () => {
    test("LAUNCH disabled sans clé API", async ({ page }) => {
      // Navigate, clear localStorage, verify launch button is disabled
      await page.goto("/");
      await page.evaluate(() => localStorage.removeItem("boardroom-openrouter-key"));
      await page.reload();
      // The launch button should be disabled because no API key is set
      const launchBtn = page.getByTestId("launch-button");
      await expect(launchBtn).toBeDisabled();
    });

    test("LAUNCH disabled sans briefing", async ({ page }) => {
      // Set API key but don't fill briefing
      await page.goto("/");
      await page.evaluate(() =>
        localStorage.setItem("boardroom-openrouter-key", "sk-test-key-12345678"),
      );
      await page.reload();
      const launchBtn = page.getByTestId("launch-button");
      await expect(launchBtn).toBeDisabled();
    });

    test("LAUNCH activé avec clé + briefing", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() =>
        localStorage.setItem("boardroom-openrouter-key", "sk-test-key-12345678"),
      );
      await page.reload();
      await page.getByTestId("briefing-textarea").fill("Test briefing content");
      const launchBtn = page.getByTestId("launch-button");
      await expect(launchBtn).toBeEnabled();
    });
  });

  test.describe("B2. Gestion clé API", () => {
    test("Saisie + SAVE → masquage ****XXXX", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() => localStorage.removeItem("boardroom-openrouter-key"));
      await page.reload();
      // Fill API key and save
      await page.getByTestId("api-key-input").fill("sk-or-test1234567890");
      await page.getByTestId("api-key-save").click();
      // Should show masked key
      const display = page.getByTestId("api-key-display");
      await expect(display).toContainText("****");
    });

    test("[CHANGE] → édition avec clé pré-remplie", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() =>
        localStorage.setItem("boardroom-openrouter-key", "sk-or-test1234567890"),
      );
      await page.reload();
      await page.getByTestId("api-key-change").click();
      const input = page.getByTestId("api-key-input");
      await expect(input).toHaveValue("sk-or-test1234567890");
    });

    test("Persistance localStorage", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() =>
        localStorage.setItem("boardroom-openrouter-key", "sk-or-persist-test"),
      );
      await page.reload();
      const storedKey = await page.evaluate(() => localStorage.getItem("boardroom-openrouter-key"));
      expect(storedKey).toBe("sk-or-persist-test");
    });
  });

  test.describe("B3. Gestion d'erreurs", () => {
    test("Clé invalide → ERROR DETECTED + message", async ({ page }) => {
      await page.goto("/");
      await page.evaluate(() =>
        localStorage.setItem("boardroom-openrouter-key", "invalid-key-xxx"),
      );
      await page.reload();
      await page.getByTestId("briefing-textarea").fill("Test briefing for error handling");
      await page.getByTestId("launch-button").click();
      // Wait for error state
      const errorMsg = page.getByTestId("error-message");
      await expect(errorMsg).toBeVisible({ timeout: 30000 });
      // Check retry button
      const retryBtn = page.getByTestId("retry-button");
      await expect(retryBtn).toBeVisible();
    });
  });

  test.describe("B4. Responsive", () => {
    test("Mobile 375px", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto("/");
      await page.evaluate(() =>
        localStorage.setItem("boardroom-openrouter-key", "sk-test-12345678"),
      );
      await page.reload();
      // Verify form is visible
      await expect(page.getByTestId("briefing-textarea")).toBeVisible();
      await expect(page.getByTestId("model-select")).toBeVisible();
      await expect(page.getByTestId("launch-button")).toBeVisible();
    });

    test("Tablet 768px", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/");
      await page.evaluate(() =>
        localStorage.setItem("boardroom-openrouter-key", "sk-test-12345678"),
      );
      await page.reload();
      await expect(page.getByTestId("briefing-textarea")).toBeVisible();
      await expect(page.getByTestId("model-select")).toBeVisible();
      await expect(page.getByTestId("launch-button")).toBeVisible();
    });

    test("Desktop 1280px", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto("/");
      await page.evaluate(() =>
        localStorage.setItem("boardroom-openrouter-key", "sk-test-12345678"),
      );
      await page.reload();
      await expect(page.getByTestId("briefing-textarea")).toBeVisible();
      await expect(page.getByTestId("model-select")).toBeVisible();
      await expect(page.getByTestId("launch-button")).toBeVisible();
    });
  });

  test.describe("B5. Console", () => {
    test("0 erreur JS pendant la session", async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      await page.goto("/");
      await page.evaluate(() =>
        localStorage.setItem("boardroom-openrouter-key", "sk-test-12345678"),
      );
      await page.reload();
      // Navigate through idle state
      await page.waitForTimeout(2000);
      expect(errors).toEqual([]);
    });

    test("Pas de 404", async ({ page }) => {
      const notFound: string[] = [];
      page.on("response", (res) => {
        if (res.status() === 404) notFound.push(res.url());
      });
      await page.goto("/");
      await page.waitForTimeout(3000);
      expect(notFound).toEqual([]);
    });
  });
});
