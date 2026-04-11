import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from "@angular/core";
import { email, form, FormField, pattern, required } from "@angular/forms/signals";
import { ButtonComponent } from "@tokistack/ui/button";
import { TokiInputComponent } from "@tokistack/ui/input";
import { environment } from "../../environments/environment";
import { TurnstileDirective } from "../common/directives/turnstile.directive";
import { TranslateService } from "../common/services/translate.service";
import { WaitlistService } from "./services/waitlist.service";

@Component({
  selector: "app-waitlist",
  imports: [ButtonComponent, FormField, TokiInputComponent, TurnstileDirective],
  templateUrl: "./waitlist.html",
  styleUrl: "./waitlist.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WaitlistComponent {
  protected readonly translate = inject(TranslateService);
  private readonly waitlist = inject(WaitlistService);
  private readonly turnstileDirective = viewChild(TurnstileDirective);

  readonly sitekey = environment.turnstileSiteKey;

  readonly model = signal({ email: "" });
  readonly waitlistForm = form(this.model, (schema) => {
    required(schema.email, { message: "waitlist.validation.emailRequired" });
    email(schema.email, { message: "waitlist.validation.emailInvalid" });
    pattern(
      schema.email,
      /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9-]*\.)+[A-Za-z]{2,}$/,
      { message: "waitlist.validation.emailInvalid" },
    );
  });

  readonly turnstileToken = signal("");
  readonly submitting = signal(false);
  readonly result = signal<"idle" | "success" | "error">("idle");
  readonly errorMessage = signal("");

  /**
   * Handles waitlist form submission
   * @param event
   * @returns
   */
  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    if (this.waitlistForm.email().invalid()) return;

    if (!this.turnstileToken()) {
      this.result.set("error");
      this.errorMessage.set(this.translate.t("waitlist.validation.turnstileRequired"));
      return;
    }

    this.submitting.set(true);
    this.result.set("idle");

    try {
      await this.waitlist.signup({
        email: this.model().email,
        language: this.translate.locale(),
        turnstileToken: this.turnstileToken(),
      });
      this.result.set("success");
    } catch {
      this.result.set("error");
      this.errorMessage.set(this.translate.t("waitlist.error.generic"));
      this.turnstileDirective()?.reset();
      this.turnstileToken.set("");
    } finally {
      this.submitting.set(false);
    }
  }
}
