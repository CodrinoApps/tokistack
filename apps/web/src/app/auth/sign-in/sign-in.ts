import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { email, form, FormField, required } from "@angular/forms/signals";
import { RouterLink } from "@angular/router";
import { ButtonComponent } from "@tokistack/ui/button";
import { TokiInputComponent } from "@tokistack/ui/input";
import { TranslateService } from "../../common/services/translate.service";

@Component({
  selector: "app-sign-in",
  imports: [ButtonComponent, FormField, RouterLink, TokiInputComponent],
  templateUrl: "./sign-in.html",
  styleUrl: "./sign-in.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  protected readonly translate = inject(TranslateService);
  readonly submitting = signal(false);

  readonly loginModel = signal({ email: "", password: "" });
  readonly loginForm = form(this.loginModel, (schema) => {
    required(schema.email, { message: "auth.signIn.validation.emailRequired" });
    email(schema.email, { message: "auth.signIn.validation.emailInvalid" });
    required(schema.password, { message: "auth.signIn.validation.passwordRequired" });
  });

  onSubmit(event: Event) {
    event.preventDefault();

    if (this.loginForm.email().invalid() || this.loginForm.password().invalid()) {
      return;
    }

    this.submitting.set(true);
    setTimeout(() => this.submitting.set(false), 2000);
  }
}
