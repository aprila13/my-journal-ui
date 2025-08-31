import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AuthService } from "../../core/auth.service";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent {
  hide = true;
  loading = false;
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private snack: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      username: [
        "",
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(10),
          Validators.pattern(/^[a-z0-9]+$/)
        ]
      ],
      password: [
        "",
        [
          Validators.required,
          Validators.minLength(4),
          Validators.maxLength(10),
          Validators.pattern(/^[A-Za-z]{1,7}\d{2}\$/)
        ]
      ]
    });
  }

  usernameHint = "5–10 chars, lowercase letters & numbers. Ex: janedoe1";
  passwordHint = "1–7 letters + 2 digits, end with $. Ex: MyPass12$";

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { username, password } = this.form.value as {
      username: string;
      password: string;
    };

    this.loading = true;
    this.auth.login(username, password).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open("Logged in!", "OK", { duration: 1500 });
        this.router.navigateByUrl("/home");
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || "Login failed";
        this.snack.open(msg, "Dismiss", { duration: 3000 });
      }
    });
  }

  get username() {
    return this.form.controls["username"];
  }
  get password() {
    return this.form.controls["password"];
  }
}
