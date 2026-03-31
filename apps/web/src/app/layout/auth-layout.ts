import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthTopbarComponent } from "./auth-topbar";

@Component({
  selector: "auth-layout",
  imports: [RouterOutlet, AuthTopbarComponent],
  template: `
    <div class="bg">
      <div class="bg-gradient"></div>
      <div class="bg-orb bg-orb--primary"></div>
      <div class="bg-orb bg-orb--secondary"></div>
      <div class="bg-orb bg-orb--accent"></div>
      <div class="bg-dots"></div>
    </div>
    <auth-topbar />
    <main><router-outlet /></main>
  `,
  styleUrl: "./auth-layout.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {}
