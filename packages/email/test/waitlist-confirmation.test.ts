import de from "@tokistack/i18n/locales/email/de.json";
import en from "@tokistack/i18n/locales/email/en.json";
import { describe, expect, it } from "vitest";
import { waitlistConfirmationHtml } from "../src/generated/waitlist-confirmation";

describe("waitlistConfirmationHtml", () => {
  it("matches the English snapshot", () => {
    expect(waitlistConfirmationHtml.en).toMatchSnapshot();
  });

  it("matches the German snapshot", () => {
    expect(waitlistConfirmationHtml.de).toMatchSnapshot();
  });

  it("contains all English translations", () => {
    const html = waitlistConfirmationHtml.en;

    expect(html).toContain(en["email.waitlist.heading"]);
    expect(html).toContain(en["email.waitlist.body"]);
    expect(html).toContain(en["email.waitlist.whatsNext"]);
    expect(html).toContain(en["email.waitlist.nextItem1"]);
    expect(html).toContain(en["email.waitlist.nextItem2"]);
    expect(html).toContain(en["email.waitlist.nextItem3"]);
    expect(html).toContain(en["email.waitlist.cta"]);
    expect(html).toContain(en["email.footer"]);
  });

  it("contains all German translations", () => {
    const html = waitlistConfirmationHtml.de;

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
    const html = waitlistConfirmationHtml.en;

    expect(html).toContain("#0069ff");
    expect(html).toContain("#394e6a");
    expect(html).toContain("#959fae");
  });

  it("does not contain unresolved translation keys", () => {
    expect(waitlistConfirmationHtml.en).not.toMatch(/email\.\w+\.\w+/);
    expect(waitlistConfirmationHtml.de).not.toMatch(/email\.\w+\.\w+/);
  });

  it("locale files have matching keys", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(de).sort());
  });
});
