import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { catchError, lastValueFrom, throwError } from "rxjs";
import { environment } from "../../../environments/environment";

@Injectable({ providedIn: "root" })
export class WaitlistService {
  private readonly http = inject(HttpClient);

  /**
   * Submits payload to the API for waitlist signup
   * @param payload
   */
  async signup(payload: { email: string; language: string; turnstileToken: string }): Promise<void> {
    await lastValueFrom(
      this.http.post<void>(`${environment.apiBaseUrl}/waitlist/signup`, payload).pipe(
        catchError((err: HttpErrorResponse) => {
          const message = (err.error as { error?: string } | null)?.error ?? "Signup failed";
          return throwError(() => new Error(message));
        }),
      ),
    );
  }
}
