import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { guestGuard } from "./core/guards/guest.guard";
import { authGuard } from "./core/guards/auth.guard";
import { HomeComponent } from "./pages/home/home.component";
import { EntriesComponent } from "./pages/entries/entries.component";

export const routes: Routes = [
  { path: "login", component: LoginComponent, canActivate: [guestGuard] },
  { path: "home", component: HomeComponent, canActivate: [authGuard] },
  { path: "entries", component: EntriesComponent, canActivate: [authGuard] },
  { path: "", pathMatch: "full", redirectTo: "home" },
  { path: "**", redirectTo: "home" },
];
