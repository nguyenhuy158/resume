// Read-only smoke for the static resume: GET requests only. The same suite
// runs locally (`pnpm e2e`, via e2e/run.mjs) and against production
// (`pnpm e2e:prod`, resume.huyab.click + cv.huyab.click).
import { assert, BASE, expectStatus, finish, request, test } from "./harness.mjs";

/** Keys of one language block (`en: { ... }`) in the inline I18N dictionary. */
function dictionaryKeys(html, lang) {
  const block = html.match(new RegExp(`\\n\\s*${lang}: \\{\\n([\\s\\S]*?)\\n\\s*\\},`))?.[1];
  assert(block, `I18N.${lang} block not found`);
  return new Set([...block.matchAll(/^\s*(\w+):/gm)].map((match) => match[1]));
}

console.log(`Read-only smoke against ${BASE}\n`);

let html = "";

await test("resume page renders", async () => {
  const response = await request("/");
  expectStatus(response, 200);
  assert(response.headers.get("content-type")?.startsWith("text/html"), "not served as HTML");
  html = await response.text();
  assert(html.includes("<title>Nguyen Tran Quang Huy"), "missing title");
  assert(/<h1[^>]*>Nguyen Tran Quang Huy<\/h1>/.test(html), "missing name heading");
  assert(html.includes('id="print-btn"'), "missing print button");
  assert(html.includes('data-lang="en"') && html.includes('data-lang="vi"'), "missing language toggle");
});

await test("every data-i18n key is translated in EN and VI", async () => {
  assert(html, "page did not load");
  const used = new Set([...html.matchAll(/data-i18n="(\w+)"/g)].map((match) => match[1]));
  assert(used.size > 0, "no data-i18n attributes found");
  for (const lang of ["en", "vi"]) {
    const missing = [...used].filter((key) => !dictionaryKeys(html, lang).has(key));
    assert(missing.length === 0, `I18N.${lang} missing: ${missing.join(", ")}`);
  }
});

await test("unknown path is a 404", async () => {
  expectStatus(await request("/e2e-no-such-page"), 404);
});

finish();
