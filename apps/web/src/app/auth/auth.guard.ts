import { inject } from "@angular/core";
import { type CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "./auth.store";

export const authGuard: CanActivateFn = () => {
  const store = inject(AuthStore);
  const router = inject(Router);
  return store.isAuthenticated() || router.createUrlTree(["/auth/sign-in"]);
};
