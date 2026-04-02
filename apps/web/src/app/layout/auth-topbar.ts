import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { type SelectOption, TokiSelectComponent } from "@tokistack/ui/select";
import { ThemeToggleComponent } from "../common/components/theme-toggle/theme-toggle";
import { type Theme, ThemeService } from "../common/services/theme.service";
import { TranslateService } from "../common/services/translate.service";

@Component({
  selector: "auth-topbar",
  imports: [TokiSelectComponent, ThemeToggleComponent],
  template: `
    <nav class="topbar">
      <theme-toggle [value]="themeService.theme()" (valueChange)="onThemeChange($event)" />
      <toki-select
        [options]="languages"
        [iconOnly]="true"
        [value]="translate.locale()"
        (valueChange)="onLocaleChange($event)"
      >
        <svg tokiSelectIcon xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="20" height="20">
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
          <path d="M3.6 9h16.8M3.6 15h16.8" />
          <path d="M12 3a15 15 0 0 1 4 9 15 15 0 0 1-4 9 15 15 0 0 1-4-9 15 15 0 0 1 4-9Z" />
        </svg>
      </toki-select>
    </nav>
  `,
  styleUrl: "./auth-topbar.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthTopbarComponent {
  protected readonly themeService = inject(ThemeService);
  protected readonly translate = inject(TranslateService);

  readonly languages: SelectOption[] = [
    { value: "en", label: "English" },
    { value: "de", label: "Deutsch" },
  ];

  onThemeChange(theme: string): void {
    this.themeService.setTheme(theme as Theme);
  }

  onLocaleChange(locale: string): void {
    this.translate.setLocale(locale);
  }
}
