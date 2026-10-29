import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parse, TYPE } from "@formatjs/icu-messageformat-parser";

export function flatten(value, prefix = "", result = {}) {
  if (typeof value === "string") {
    if (!value.trim()) throw new Error(`Empty message: ${prefix}`);
    result[prefix] = value;
  } else if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, result);
    }
  } else {
    throw new Error(`Invalid message: ${prefix}`);
  }
  return result;
}

function argumentsOf(message) {
  const args = new Set();
  function walk(elements) {
    for (const element of elements) {
      if (element.type !== TYPE.literal && element.type !== TYPE.pound) {
        args.add(`${element.type}:${element.value}`);
      }
      if (element.options) {
        for (const option of Object.values(element.options)) walk(option.value);
      }
      if (element.children) walk(element.children);
    }
  }
  walk(parse(message));
  return [...args].sort().join(",");
}

export function checkMessages(chinese, english) {
  const zh = flatten(chinese);
  const en = flatten(english);
  const errors = [];
  for (const key of new Set([...Object.keys(zh), ...Object.keys(en)])) {
    if (!(key in zh) || !(key in en)) {
      errors.push(`Missing key: ${key} (${key in zh ? "en" : "zh-CN"})`);
      continue;
    }
    try {
      if (argumentsOf(zh[key]) !== argumentsOf(en[key])) errors.push(`Placeholder mismatch: ${key}`);
    } catch (error) {
      errors.push(`Invalid ICU message: ${key}: ${error.message}`);
    }
  }
  return errors;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const read = (locale) => JSON.parse(readFileSync(new URL(`../messages/${locale}.json`, import.meta.url), "utf8"));
  const errors = checkMessages(read("zh-CN"), read("en"));
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(`Catalogs OK: ${Object.keys(flatten(read("en"))).length} messages`);
  }
}
