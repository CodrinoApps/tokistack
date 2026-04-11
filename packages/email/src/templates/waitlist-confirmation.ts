import mjml2html from "mjml";
import { type Locale, t } from "../i18n";
import { theme } from "../theme";

type WaitlistConfirmationProps = {
  locale: Locale;
};

export function waitlistConfirmation({ locale }: WaitlistConfirmationProps): { html: string; subject: string } {
  const subject = t(locale, "email.waitlist.subject");

  const { html } = mjml2html(`
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" />
          <mj-text padding="0" />
          <mj-section padding="0" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f4f4f5" width="520px">

        <mj-section padding="40px 0 0">
          <mj-column>
            <mj-text align="center" font-size="20px" font-weight="700" color="${theme.text}" letter-spacing="-0.5px" padding-bottom="24px">
              tokistack
            </mj-text>
          </mj-column>
        </mj-section>

        <mj-section background-color="${theme.primary}" border-radius="12px 12px 0 0" padding="0">
          <mj-column>
            <mj-spacer height="4px" />
          </mj-column>
        </mj-section>

        <mj-section background-color="${theme.background}" border-radius="0 0 12px 12px" padding="36px 32px 40px">
          <mj-column>
            <mj-text font-size="22px" font-weight="700" color="${theme.text}" padding-bottom="12px">
              ${t(locale, "email.waitlist.heading")}
            </mj-text>
            <mj-text font-size="15px" line-height="24px" color="${theme.textMuted}" padding-bottom="28px">
              ${t(locale, "email.waitlist.body")}
            </mj-text>

            <mj-text font-size="14px" font-weight="600" color="${theme.text}" padding-bottom="12px">
              ${t(locale, "email.waitlist.whatsNext")}
            </mj-text>
            <mj-text font-size="14px" line-height="22px" color="${theme.textMuted}" padding-bottom="10px">
              &#8226;&ensp;${t(locale, "email.waitlist.nextItem1")}
            </mj-text>
            <mj-text font-size="14px" line-height="22px" color="${theme.textMuted}" padding-bottom="10px">
              &#8226;&ensp;${t(locale, "email.waitlist.nextItem2")}
            </mj-text>
            <mj-text font-size="14px" line-height="22px" color="${theme.textMuted}" padding-bottom="28px">
              &#8226;&ensp;${t(locale, "email.waitlist.nextItem3")}
            </mj-text>

            <mj-button
              background-color="${theme.primary}"
              color="#ffffff"
              border-radius="8px"
              font-size="14px"
              font-weight="600"
              inner-padding="12px 24px"
              href="https://app.tokistack.com"
              padding="0"
            >
              ${t(locale, "email.waitlist.cta")}
            </mj-button>
          </mj-column>
        </mj-section>

        <mj-section padding="24px 0 40px">
          <mj-column>
            <mj-text align="center" font-size="12px" line-height="18px" color="${theme.textMuted}">
              ${t(locale, "email.footer")}
            </mj-text>
          </mj-column>
        </mj-section>

      </mj-body>
    </mjml>
  `);

  return { html, subject };
}
