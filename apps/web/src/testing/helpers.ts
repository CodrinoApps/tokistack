import translations from "@tokistack/i18n/locales/en.json";

/**
 * Helper function to assert translated values
 * @param key
 * @returns
 */
export function t(key: string): string {
  return (translations as Record<string, string>)[key];
}

/**
 * Helper methods to populate inputs
 * @param input
 * @param value
 */
export function setInputValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("blur", { bubbles: true }));
}

/**
 * Helper function to wait for all pending microtasks and promise chains to settle.
 * @returns
 */
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}
