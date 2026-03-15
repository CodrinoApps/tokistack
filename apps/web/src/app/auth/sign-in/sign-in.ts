import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { ButtonComponent } from "@tokistack/ui/button";

@Component({
  selector: "app-sign-in",
  imports: [ButtonComponent],
  templateUrl: "./sign-in.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent {
  readonly submitting = signal(false);

  onSubmit() {
    this.submitting.set(true);
    setTimeout(() => this.submitting.set(false), 2000);
  }
}
