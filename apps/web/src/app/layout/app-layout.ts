import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

@Component({
  selector: "app-layout",
  imports: [RouterOutlet],
  template: `
    <div class="app-layout">
      <aside>Sidebar</aside>
      <div class="app-layout__main">
        <header>Topbar</header>
        <main><router-outlet /></main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {}
