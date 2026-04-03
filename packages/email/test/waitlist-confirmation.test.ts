import de from "@tokistack/i18n/locales/email/de.json";
import en from "@tokistack/i18n/locales/email/en.json";
import { describe, expect, it } from "vitest";
import { waitlistConfirmation } from "../src/templates/waitlist-confirmation";

describe("waitlistConfirmation", () => {
  it("renders valid HTML with all English translations", () => {
    const { html, subject } = waitlistConfirmation({ locale: "en" });

    expect(subject).toBe(en["email.waitlist.subject"]);
    expect(html).toContain(en["email.waitlist.heading"]);
    expect(html).toContain(en["email.waitlist.body"]);
    expect(html).toContain(en["email.waitlist.whatsNext"]);
    expect(html).toContain(en["email.waitlist.nextItem1"]);
    expect(html).toContain(en["email.waitlist.nextItem2"]);
    expect(html).toContain(en["email.waitlist.nextItem3"]);
    expect(html).toContain(en["email.waitlist.cta"]);
    expect(html).toContain(en["email.footer"]);
  });

  it("renders valid HTML with all German translations", () => {
    const { html, subject } = waitlistConfirmation({ locale: "de" });

    expect(subject).toBe(de["email.waitlist.subject"]);
    expect(html).toContain(de["email.waitlist.heading"]);
    expect(html).toContain(de["email.waitlist.body"]);
    expect(html).toContain(de["email.waitlist.whatsNext"]);
    expect(html).toContain(de["email.waitlist.nextItem1"]);
    expect(html).toContain(de["email.waitlist.nextItem2"]);
    expect(html).toContain(de["email.waitlist.nextItem3"]);
    expect(html).toContain(de["email.waitlist.cta"]);
    expect(html).toContain(de["email.footer"]);
  });

  it("applies theme colors", () => {
    const { html } = waitlistConfirmation({ locale: "en" });

    expect(html).toContain("#0069ff");
    expect(html).toContain("#394e6a");
    expect(html).toContain("#959fae");
  });

  it("does not contain unresolved translation keys", () => {
    const { html } = waitlistConfirmation({ locale: "en" });

    expect(html).not.toMatch(/email\.\w+\.\w+/);
  });

  it("locale files have matching keys", () => {
    const enKeys = Object.keys(en).sort();
    const deKeys = Object.keys(de).sort();

    expect(enKeys).toEqual(deKeys);
  });
});
