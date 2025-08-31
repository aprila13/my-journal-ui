import { Component, OnInit } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { AuthService } from "./core/auth.service";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
  styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {
  constructor(private auth: AuthService) {}
  ngOnInit() {
    this.auth.initialize();
  }
}
