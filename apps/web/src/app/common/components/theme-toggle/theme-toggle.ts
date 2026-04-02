import { ChangeDetectionStrategy, Component, computed, inject, model } from "@angular/core";
import { type SelectOption, TokiSelectComponent } from "@tokistack/ui/select";
import { TranslateService } from "../../services/translate.service";

@Component({
  selector: "theme-toggle",
  templateUrl: "./theme-toggle.html",
  styleUrl: "./theme-toggle.scss",
  imports: [TokiSelectComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThemeToggleComponent {
  protected readonly translate = inject(TranslateService);

  readonly value = model<string>("system");

  readonly themeOptions = computed<SelectOption[]>(() => [
    { value: "light", label: this.translate.t("layout.themeToggle.light") },
    { value: "dark", label: this.translate.t("layout.themeToggle.dark") },
    { value: "system", label: this.translate.t("layout.themeToggle.system") },
  ]);
}
