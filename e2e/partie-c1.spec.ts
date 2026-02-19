import { expect, test } from "@playwright/test";

test.describe("PARTIE C1 — Validation routes API", () => {
  const BASE = "http://localhost:3000";

  test("POST /api/analyze sans body → 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/analyze`, {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/analyze sans apiKey → 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/analyze`, {
      data: { content: "Test content" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("apiKey");
  });

  test("POST /api/analyze sans content → 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/analyze`, {
      data: { apiKey: "sk-test" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("content");
  });

  test("POST /api/finalize sans body → 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/finalize`, {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/finalize sans apiKey → 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/finalize`, {
      data: { report: { round1: [] }, ceoAnswers: "test" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/finalize sans ceoAnswers → 400", async ({ request }) => {
    const res = await request.post(`${BASE}/api/finalize`, {
      data: { report: { round1: [] }, apiKey: "sk-test" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});
