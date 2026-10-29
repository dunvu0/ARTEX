import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createTranslator } from "next-intl";
import ts from "typescript";
import { checkMessages } from "./check-messages.mjs";
import { inventory } from "./inventory-chinese.mjs";

test("catalogs reject missing keys, empty values and invalid ICU", () => {
  assert.match(checkMessages({ a: "A" }, {})[0], /Missing key/);
  assert.throws(() => checkMessages({ a: "A" }, { a: " " }), /Empty message/);
  assert.match(checkMessages({ a: "A" }, { a: "{broken" })[0], /Invalid ICU/);
});

test("nested ICU arguments and rich tags must agree; plural categories can differ", () => {
  const zh = { a: "{n, plural, other {<b>{name}</b>}}" };
  const en = { a: "{n, plural, one {<b>{name}</b>} other {<b>{name}</b>}}" };
  assert.deepEqual(checkMessages(zh, en), []);
  assert.match(checkMessages(zh, { a: "{n, plural, other {{different}}}" })[0], /Placeholder mismatch/);
});

test("inventory detects JSX, attributes and template fragments but ignores comments", () => {
  const source = '// 中文 comment\nconst x = <p title="标题">你好{`开始${name}结束`}</p>;';
  const items = inventory(source, "page.tsx");
  assert.deepEqual(items.map((item) => item.text), ["标题", "你好", "开始", "结束"]);
  assert.ok(items.every((item) => item.line === 2));
});

test("completed UI files contain no uncataloged Chinese literals", () => {
  const completed = [
    "app/(auth)/login/page.tsx",
    "app/(auth)/setup/page.tsx",
    "app/(main)/dashboard/page.tsx",
    "app/(main)/_components/main-content.tsx",
    "app/(main)/_components/egress-ip-banner.tsx",
    "app/(main)/_components/live-clock.tsx",
    "app/(main)/_components/sidebar/account-switcher.tsx",
    "app/(main)/_components/sidebar/change-password-dialog.tsx",
    "app/(main)/_components/sidebar/layout-controls.tsx",
    "app/(main)/_components/sidebar/nav-user.tsx",
    "app/(main)/_components/sidebar/search-dialog.tsx",
    "app/(main)/_components/sidebar/theme-switcher.tsx",
    "components/copy-button.tsx",
    "components/date-select.tsx",
    "components/date-range-picker.tsx",
    "components/time-select.tsx",
    "components/table-pagination.tsx",
    "components/status-badge.tsx",
  ];
  for (const file of completed) {
    const source = readFileSync(new URL(`../src/${file}`, import.meta.url), "utf8");
    assert.deepEqual(inventory(source, file), [], `Review new UI strings in ${file}`);
  }
});

test("status display follows locale without mutating shared metadata or unknown wire values", async () => {
  const source = readFileSync(new URL("../src/lib/status.ts", import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
  const { statusMeta } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
  const read = (locale) => JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"));
  const chinese = read("zh-CN");
  const english = read("en");
  const translate = createTranslator({ locale: "en", messages: english, namespace: "status" });

  for (const [domain, values] of Object.entries(chinese.status)) {
    for (const [value, label] of Object.entries(values)) {
      const original = { ...statusMeta(domain, value) };
      assert.equal(original.label, label, `Stale Chinese catalog: ${domain}.${value}`);
      assert.deepEqual(statusMeta(domain, value, translate), { ...original, label: english.status[domain][value] });
      assert.deepEqual(statusMeta(domain, value, () => undefined), original);
      assert.deepEqual(statusMeta(domain, value), original);
    }
  }
  for (const value of ["future_status", "constructor", "__proto__"]) {
    assert.deepEqual(statusMeta("task", value, () => assert.fail("Unknown status must stay raw")), {
      label: value, tone: "neutral",
    });
  }
});
