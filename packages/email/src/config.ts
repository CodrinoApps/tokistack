const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) throw new Error("RESEND_API_KEY environment variable is not set");

export const RESEND_API_KEY = apiKey;
export const SENDER = "Tokistack <noreply@tokistack.com>";
