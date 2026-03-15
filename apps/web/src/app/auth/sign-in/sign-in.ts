import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { email, form, FormField, required } from "@angular/forms/signals";
import { RouterLink } from "@angular/router";
import { ButtonComponent } from "@tokistack/ui/button";
import { TokiInputComponent } from "@tokistack/ui/input";

@Component({
  selector: "app-sign-in",
  imports: [ButtonComponent, FormField, RouterLink, TokiInputComponent],
  templateUrl: "./sign-in.html",
  styleUrl: "./sign-in.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  readonly submitting = signal(false);

  readonly loginModel = signal({ email: "", password: "" });
  readonly loginForm = form(this.loginModel, (schema) => {
    required(schema.email, { message: "Email is required" });
    email(schema.email, { message: "Enter a valid email address" });
    required(schema.password, { message: "Password is required" });
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
