import { expect, type Page, test } from "@playwright/test";

import en from "../messages/en.json";
import zh from "../messages/zh-CN.json";
import { settings } from "../src/lib/mock/data";
import { mockHandle } from "../src/lib/mock/handler";
import type { FindingTraffic } from "../src/lib/types";

declare global {
  interface Window {
    __i18nStreams: EventSource[];
    __i18nDraft: Element | null;
  }
}

const raw = "\u539f\u6587 {value} <payload>";
const model = { model: "fixture", name: "fixture", format: "openai", profile_id: 1 };
const item = {
  id: "i18n-side",
  ordinal: 1,
  client_request_id: "fixture",
  question: raw,
  answer: "",
  status: "running",
  model,
  sequence: 1,
  snapshot_at: "2026-10-30T07:08:09Z",
  created_at: "2026-10-30T07:08:09Z",
};
const sideHistory = {
  items: [item],
  current: item,
  next_cursor: 0,
  snapshot: { captured_at: item.snapshot_at, model, available: true, reason: "" },
};
const sideURL = "**/api/conversations/1/side-questions?*";
const language = (page: Page) => page.locator("select").filter({ has: page.locator('option[value="en"]') });
let runtimeErrors: string[];

async function selectLanguage(page: Page, locale: "en" | "zh-CN") {
  await language(page).selectOption(locale);
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

test.beforeEach(async ({ page }) => {
  runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await page.addInitScript(() => {
    localStorage.setItem("artex_token", "fixture-only");
    window.__i18nStreams = [];
    class FixtureEventSource extends EventTarget {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSED = 2;
      readyState = 1;
      onopen?: () => void;
      constructor(public url: string) {
        super();
        window.__i18nStreams.push(this as unknown as EventSource);
        setTimeout(() => this.onopen?.(), 0);
      }
      close() {
        this.readyState = 2;
      }
    }
    window.EventSource = FixtureEventSource as unknown as typeof EventSource;
  });
  await page.route("**/api/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    let json: unknown;
    if (url.pathname === "/api/auth/status") json = { initialized: true, authenticated: true };
    else if (url.pathname === "/api/health") json = { ok: true, version: "fixture" };
    else if (url.pathname === "/api/settings") json = { ...settings, show_egress_ip: false };
    else json = await mockHandle(request.method(), url.pathname.slice(4) + url.search, request.postData());
    await route.fulfill({ json });
  });
});

test.afterEach(() => expect(runtimeErrors).toEqual([]));

test("Chinese default and explicit language preference survive reloads", async ({ page }) => {
  await page.goto("/chat/");
  await expect(language(page)).toHaveValue("zh-CN");
  await expect(page).toHaveTitle(zh.metadata.title);
  await selectLanguage(page, "en");
  await page.reload();
  await expect(language(page)).toHaveValue("en");
  await expect(page).toHaveTitle(en.metadata.title);
  await selectLanguage(page, "zh-CN");
  await page.reload();
  await expect(language(page)).toHaveValue("zh-CN");
  await expect(page).toHaveTitle(zh.metadata.title);
});

test("side-question errors translate without replacing drafts, raw data or streams", async ({ page }) => {
  await page.route(sideURL, (route) => route.fulfill({ json: sideHistory }));
  await page.goto("/chat/?c=1");
  await selectLanguage(page, "en");
  await page.getByRole("button", { name: en.sideQuestion.button, exact: true }).click();
  const panel = page.getByRole("region", { name: en.sideQuestion.panelLabel });
  const draft = panel.getByRole("textbox");
  await draft.fill(raw);
  await draft.evaluate((element) => {
    window.__i18nDraft = element;
  });
  await expect(panel.getByRole("article").getByText(raw, { exact: true })).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => window.__i18nStreams.some((s) => s.url.includes("/side-questions/i18n-side/events"))),
    )
    .toBe(true);
  const streams = await page.evaluate(() => window.__i18nStreams.length);
  await page.evaluate(() => {
    const stream = window.__i18nStreams.find((s) => s.url.includes("/side-questions/i18n-side/events"));
    stream?.dispatchEvent(new MessageEvent("snapshot", { data: "invalid-json" }));
  });
  await expect(page.getByText(en.sideQuestion.parseError, { exact: true })).toBeVisible();
  for (const locale of ["zh-CN", "en"] as const) {
    await selectLanguage(page, locale);
    const messages = locale === "en" ? en : zh;
    await expect(page.getByText(messages.sideQuestion.parseError, { exact: true })).toBeVisible();
    const input = page.getByRole("textbox", { name: messages.sideQuestion.questionAria, exact: true });
    await expect(input).toHaveValue(raw);
    expect(await input.evaluate((element) => element === window.__i18nDraft)).toBe(true);
    expect(await page.evaluate(() => window.__i18nStreams.length)).toBe(streams);
  }
  await page.evaluate(
    (answer) => {
      const stream = window.__i18nStreams.find((s) => s.url.includes("/side-questions/i18n-side/events"));
      if (!stream || stream.readyState !== EventSource.OPEN) throw new Error("Stream was closed by locale change");
      stream.dispatchEvent(new MessageEvent("snapshot", { data: JSON.stringify(answer) }));
    },
    { ...item, sequence: 2, answer: "Stream still delivers", status: "completed" },
  );
  await expect(page.getByText("Stream still delivers", { exact: true })).toBeVisible();

  // Even identical backend wording must remain raw, not matched against local errors.
  await page.route(sideURL, (route) => route.fulfill({ status: 503, json: { error: zh.sideQuestion.parseError } }));
  await page.reload();
  await expect(language(page)).toHaveValue("en");
  await page.getByRole("button", { name: en.sideQuestion.button, exact: true }).click();
  await expect(page.getByText(zh.sideQuestion.parseError, { exact: true })).toBeVisible();
});

test("traffic evidence and picker retain time of day in both languages", async ({ page }) => {
  await page.route("**/api/exploration/findings/f-2/traffic", async (route) => {
    const data = await mockHandle<FindingTraffic>("GET", "/exploration/findings/f-2/traffic");
    const json = structuredClone(data);
    json.bindings.forEach((binding, index) => {
      binding.snapshot.captured_at = Date.parse(`2026-10-30T07:08:0${index + 1}Z`) / 1000;
      binding.note = `${raw} ${index}`;
    });
    await route.fulfill({ json });
  });
  await page.route("**/api/traffic?*", async (route) => {
    await route.fulfill({
      json: {
        total: 2,
        exchanges: [1, 2].map((n) => ({
          id: `i18n-${n}`,
          method: "GET",
          url: `https://example.test/${n}`,
          status: 200,
          ts: `2026-10-30T07:08:0${n}Z`,
        })),
      },
    });
  });
  await page.goto("/function/findings/detail/?id=f-2");
  for (const locale of ["zh-CN", "en"] as const) {
    await selectLanguage(page, locale);
    const messages = locale === "en" ? en : zh;
    await expect(page.getByText(`${raw} 0`, { exact: true })).toBeVisible();
    await expect(page.getByText(/14:08:01/).first()).toBeVisible();
    await expect(page.getByText(/14:08:02/).first()).toBeVisible();
    await page.getByRole("button", { name: messages.settings.intelligence.binding, exact: true }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/14:08:01/)).toBeVisible();
    await expect(dialog.getByText(/14:08:02/)).toBeVisible();
    await dialog.getByRole("button", { name: messages.trafficEvidence.picker.cancel, exact: true }).click();
  }
});
