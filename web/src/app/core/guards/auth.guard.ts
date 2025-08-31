import { CanActivateFn, Router } from "@angular/router";
import { map } from "rxjs";
import { AuthService } from "../auth.service";
import { inject } from "@angular/core";

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAuthenticated$.pipe(
    map((isAuthed) => (isAuthed ? true : router.createUrlTree(["/login"]))),
  );
};
