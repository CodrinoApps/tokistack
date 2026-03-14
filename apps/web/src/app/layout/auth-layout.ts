import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "auth-layout",
  imports: [RouterOutlet],
  template: `
    <div class="auth-layout">
      <header>Theme / Language</header>
      <main><router-outlet /></main>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {}
