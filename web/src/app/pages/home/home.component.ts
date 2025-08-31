import { Component } from "@angular/core";
import { EntriesComponent } from "../entries/entries.component";
import { MatCardModule } from "@angular/material/card";
import { MatButtonModule } from "@angular/material/button";
import { Router, RouterLink } from "@angular/router";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [EntriesComponent, MatCardModule, MatIcon, MatButtonModule, RouterLink],
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent {
  constructor(private router: Router) {}
}
