import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import de from "../src/locales/de.json";
import en from "../src/locales/en.json";

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = (locale: string) => readFileSync(path.resolve(dir, `../src/generated/user-invite-${locale}.html`), "utf8");

describe("user-invite email", () => {
  const enHtml = read("en");
  const deHtml = read("de");

  it("matches the English snapshot", () => {
    expect(enHtml).toMatchSnapshot();
  });

  it("matches the German snapshot", () => {
    expect(deHtml).toMatchSnapshot();
  });

  it("contains all English translations", () => {
    expect(enHtml).toContain(en["email.invite.heading"]);
    expect(enHtml).toContain(en["email.invite.body"]);
    expect(enHtml).toContain(en["email.invite.preheader"]);
    expect(enHtml).toContain(en["email.invite.cta"]);
    expect(enHtml).toContain(en["email.footer"]);
    expect(enHtml).toContain(en["email.footer.privacy"]);
  });

  it("contains all German translations", () => {
    expect(deHtml).toContain(de["email.invite.heading"]);
    expect(deHtml).toContain(de["email.invite.body"]);
    expect(deHtml).toContain(de["email.invite.preheader"]);
    expect(deHtml).toContain(de["email.invite.cta"]);
    expect(deHtml).toContain(de["email.footer"]);
    expect(deHtml).toContain(de["email.footer.privacy"]);
  });

  it("applies theme colors", () => {
    expect(enHtml).toContain("#0069ff");
    expect(enHtml).toContain("#394e6a");
    expect(enHtml).toContain("#959fae");
  });

  it("does not contain unresolved translation keys", () => {
    expect(enHtml).not.toMatch(/email\.\w+\.\w+/);
    expect(deHtml).not.toMatch(/email\.\w+\.\w+/);
  });

  it("locale files have matching keys", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(de).sort());
  });
});
