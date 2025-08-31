import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Entry } from "../../core/types";
import { environment } from "../../../environments/environments";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class EntriesService {
  constructor(private http: HttpClient) {}

  list(): Observable<Entry[]> {
    return this.http.get<Entry[]>(`${environment.api}/entries`);
  }

  create(data: { title?: string | null; body: string }): Observable<Entry> {
    return this.http.post<Entry>(`${environment.api}/entries`, data);
  }

  update(id: string, data: { title?: string | null; body?: string }): Observable<Entry> {
    return this.http.put<Entry>(`${environment.api}/entries/${id}`, data);
  }

  remove(id: string) {
    return this.http.delete<{ ok: true }>(`${environment.api}/entries/${id}`);
  }
}
