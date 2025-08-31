import { Injectable, inject, PLATFORM_ID } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { isPlatformBrowser } from "@angular/common";
import { BehaviorSubject, catchError, map, of, tap } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../../environments/environments";

export interface User {
  id: string;
  username: string;
  createdAt: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private memoryStore: Record<string, string> = {};

  private storageGet(key: string): string | null {
    if (this.isBrowser) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return this.memoryStore[key] ?? null;
  }

  private storageSet(key: string, value: string | null) {
    if (this.isBrowser) {
      try {
        if (value === null) localStorage.removeItem(key);
        else localStorage.setItem(key, value);
        return;
      } catch {
        /* ignore */
      }
    }
    if (value === null) delete this.memoryStore[key];
    else this.memoryStore[key] = value;
  }

  private _user$ = new BehaviorSubject<User | null>(this.readUserFromStorage());
  user$ = this._user$.asObservable();
  isAuthenticated$ = this.user$.pipe(map((u) => !!u));

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    if (this.isBrowser) {
      window.addEventListener("storage", (e) => {
        if (e.key === "myjournal:user") {
          const next = e.newValue ? (JSON.parse(e.newValue) as User) : null;
          this._user$.next(next);
        }
      });
    }
  }

  initialize() {
    if (!this._user$.value) {
      this.me().subscribe();
    }
  }

  private readUserFromStorage(): User | null {
    try {
      const raw = this.storageGet("myjournal:user");
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }

  private writeUserToStorage(user: User | null) {
    if (user) this.storageSet("myjournal:user", JSON.stringify(user));
    else this.storageSet("myjournal:user", null);
  }

  login(username: string, password: string) {
    return this.http
      .post<{ ok: boolean; user: User }>(`${environment.api}/auth/login`, { username, password })
      .pipe(
        map((res) => res.user),
        tap((user) => {
          this._user$.next(user);
          this.writeUserToStorage(user);
        }),
      );
  }

  me() {
    return this.http.get<User>(`${environment.api}/auth/me`).pipe(
      tap((user) => {
        if (user) {
          this._user$.next(user);
          this.writeUserToStorage(user);
        }
      }),
      catchError(() => {
        this.logout(false);
        return of(null);
      }),
    );
  }

  logout(navigate = true) {
    this.http.post(`${environment.api}/auth/logout`, {}).subscribe({
      complete: () => {
        this._user$.next(null);
        this.writeUserToStorage(null);
        if (navigate && this.isBrowser) this.router.navigateByUrl("/login");
      },
      error: () => {
        this._user$.next(null);
        this.writeUserToStorage(null);
        if (navigate && this.isBrowser) this.router.navigateByUrl("/login");
      },
    });
  }

  get currentUser(): User | null {
    return this._user$.value;
  }
}
