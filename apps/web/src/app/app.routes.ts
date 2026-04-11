import type { Routes } from "@angular/router";
import { authGuard } from "./auth/auth.guard";

export const routes: Routes = [
  {
    path: "auth",
    loadComponent: () => import("./layout/auth-layout").then(m => m.AuthLayoutComponent),
    children: [
      { path: "sign-in", loadComponent: () => import("./auth/sign-in/sign-in").then(m => m.SignInComponent) },
    ],
  },
  {
    path: "waitlist",
    loadComponent: () => import("./layout/auth-layout").then(m => m.AuthLayoutComponent),
    children: [
      { path: "", loadComponent: () => import("./waitlist/waitlist").then(m => m.WaitlistComponent) },
    ],
  },
  {
    path: "",
    loadComponent: () => import("./layout/app-layout").then(m => m.AppLayoutComponent),
    canActivate: [authGuard],
    children: [
      { path: "", pathMatch: "full", redirectTo: "dashboard" },
    ],
  },
];
