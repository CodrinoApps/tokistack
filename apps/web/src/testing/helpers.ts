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
 * Checks a checkbox input element and dispatches a change event.
 * @param el
 */
export function checkCheckbox(el: HTMLElement): void {
  const checkbox = el.querySelector("input[type=\"checkbox\"]");
  if (!(checkbox instanceof HTMLInputElement)) {
    throw new Error("checkCheckbox: no <input type=\"checkbox\"> found inside the provided element");
  }
  checkbox.checked = true;
  checkbox.dispatchEvent(new Event("change"));
}

/**
 * Helper function to wait for all pending microtasks and promise chains to settle.
 * @returns
 */
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}
