import { HttpInterceptorFn, HttpErrorResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../auth.service";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const withCreds = req.clone({ withCredentials: true });

  return next(withCreds).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
