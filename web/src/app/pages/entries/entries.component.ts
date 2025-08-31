import { Component, OnInit, signal, computed } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from "@angular/forms";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatDividerModule } from "@angular/material/divider";
import { EntriesService } from "./entries.service";
import { Entry } from "../../core/types";

@Component({
  selector: "app-entries",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  template: `
    <div class="page">
      <!-- New Entry -->
      <mat-card class="card new-entry">
        <h2 class="title">Make a journal entry</h2>

        <form [formGroup]="newForm" (ngSubmit)="create()">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Title (optional)</mat-label>
            <input matInput formControlName="title" maxlength="200" />
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Body</mat-label>
            <textarea matInput rows="5" formControlName="body" required></textarea>
          </mat-form-field>

          <button mat-raised-button color="primary" [disabled]="newForm.invalid || creating()">
            {{ creating() ? "Saving…" : "Save" }}
          </button>
        </form>
      </mat-card>

      <mat-divider class="spacer"></mat-divider>

      <!-- Loading -->
      <div class="loading" *ngIf="loading()"><mat-spinner diameter="36"></mat-spinner></div>

      <!-- Entries List -->
      <div class="list" *ngIf="!loading()">
        <ng-container *ngIf="entries().length; else emptyState">
          <mat-card class="card entry" *ngFor="let e of entries(); trackBy: trackId">
            <div class="entry-header">
              <h3 class="entry-title" [title]="e.title || '(untitled)'">
                {{ e.title || "(untitled)" }}
              </h3>
              <div class="entry-actions">
                <button mat-icon-button aria-label="Edit" (click)="toggleEdit(e)">
                  <mat-icon>{{ editingId() === e.id ? "close" : "edit" }}</mat-icon>
                </button>
                <button mat-icon-button color="warn" aria-label="Delete" (click)="confirmDelete(e)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>

            <div class="meta">
              <span>Created: {{ e.timeCreated | date: "MMM d, y, h:mm a" }}</span>
              <span>•</span>
              <span>Updated: {{ e.timeUpdated | date: "MMM d, y, h:mm a" }}</span>
            </div>

            <div *ngIf="editingId() !== e.id; else editForm">
              <p class="body">{{ e.body }}</p>
            </div>

            <ng-template #editForm>
              <form [formGroup]="editFormGroup" (ngSubmit)="saveEdit(e)">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Title</mat-label>
                  <input matInput formControlName="title" maxlength="200" />
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Body</mat-label>
                  <textarea matInput rows="5" formControlName="body"></textarea>
                </mat-form-field>

                <div class="edit-actions">
                  <button mat-stroked-button type="button" (click)="toggleEdit(null)">
                    Cancel
                  </button>
                  <button
                    mat-raised-button
                    color="primary"
                    [disabled]="editFormGroup.invalid || savingEdit()"
                  >
                    {{ savingEdit() ? "Saving…" : "Save changes" }}
                  </button>
                </div>
              </form>
            </ng-template>
          </mat-card>
        </ng-container>

        <ng-template #emptyState>
          <mat-card class="card empty">
            <p>No entries yet. Create your first one above ✨</p>
          </mat-card>
        </ng-template>
      </div>
    </div>
  `,
  styles: [
    `
      .page {
        max-width: 880px;
        margin: 24px auto;
        padding: 0 16px;
      }
      .card {
        margin-bottom: 16px;
      }
      .w-full {
        width: 100%;
      }
      .spacer {
        margin: 16px 0 24px;
      }
      .loading {
        display: flex;
        justify-content: center;
        padding: 24px;
      }
      .entry-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .entry-actions {
        display: flex;
        gap: 6px;
      }
      .entry-title {
        margin: 0;
        font-weight: 600;
      }
      .meta {
        color: #666;
        display: flex;
        gap: 8px;
        font-size: 12px;
        margin: 6px 0 10px;
      }
      .body {
        white-space: pre-wrap;
        line-height: 1.5;
      }
      .edit-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }
      .empty {
        text-align: center;
        color: #666;
      }
    `,
  ],
  //separate later
  // templateUrl: "./entries.component.html",
  // styleUrl: ["./entries.component.scss"],
})
export class EntriesComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private entriesService: EntriesService,
    private snack: MatSnackBar,
  ) {
    this.newForm = this.fb.group({
      title: [""],
      body: ["", [Validators.required, Validators.minLength(1)]],
    });

    this.editFormGroup = this.fb.group({
      title: [""],
      body: ["", [Validators.required, Validators.minLength(1)]],
    });
  }

  entries = signal<Entry[]>([]);
  loading = signal<boolean>(false);
  creating = signal<boolean>(false);
  editingId = signal<string | null>(null);
  savingEdit = signal<boolean>(false);
  newForm!: FormGroup;
  editFormGroup!: FormGroup;

  

  ngOnInit(): void {
    this.load();
  }

  trackId = (_: number, entry: Entry) => entry.id;

  load() {
    this.loading.set(true);
    this.entriesService.list().subscribe({
      next: (list) => this.entries.set(list),
      error: () => this.snack.open("Failed to load entries", "Dismiss", { duration: 3000 }),
      complete: () => this.loading.set(false),
    });
  }

  create() {
    if (this.newForm.invalid) return;
    this.creating.set(true);

    const payload = {
      title: (this.newForm.value.title || "")!.trim() || null, 
      body: this.newForm.value.body!,
    };

    this.entriesService.create(payload).subscribe({
      next: (created) => {
        this.entries.set([created, ...this.entries()]);
        this.newForm.reset({ title: "", body: "" });
        this.snack.open("Entry saved", "", { duration: 1500 });
      },
      error: () => this.snack.open("Failed to save entry", "Dismiss", { duration: 3000 }),
      complete: () => this.creating.set(false),
    });
  }

  toggleEdit(entry: Entry | null) {
    if (!entry) {
      this.editingId.set(null);
      return;
    }
    if (this.editingId() === entry.id) {
      this.editingId.set(null);
      return;
    }
    this.editFormGroup.reset({
      title: entry.title ?? "",
      body: entry.body,
    });
    this.editingId.set(entry.id);
  }

  saveEdit(entry: Entry) {
    if (this.editFormGroup.invalid) return;
    this.savingEdit.set(true);

    const entryModel: { title?: string | null; body?: string } = {};
    const title = (this.editFormGroup.value.title || "")!.trim();
    const body = this.editFormGroup.value.body || "";

    if (title !== "") entryModel.title = title;
    if (body !== "") entryModel.body = body;

    this.entriesService.update(entry.id, entryModel).subscribe({
      next: (updated) => {
        const list = this.entries().map((e) => (e.id === entry.id ? updated : e));
        this.entries.set(list);
        this.editingId.set(null);
        this.snack.open("Entry updated", "", { duration: 1500 });
      },
      error: () => this.snack.open("Failed to update entry", "Dismiss", { duration: 3000 }),
      complete: () => this.savingEdit.set(false),
    });
  }

  confirmDelete(entry: Entry) {
    if (!confirm("Delete this entry?")) return;
    this.entriesService.remove(entry.id).subscribe({
      next: () => {
        this.entries.set(this.entries().filter((entry) => entry.id !== entry.id));
        this.snack.open("Entry deleted", "", { duration: 1500 });
      },
      error: () => this.snack.open("Failed to delete entry", "Dismiss", { duration: 3000 }),
    });
  }
}
