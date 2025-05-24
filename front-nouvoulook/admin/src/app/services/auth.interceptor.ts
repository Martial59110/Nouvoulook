import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private router: Router, private snackBar: MatSnackBar) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(cloned).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            const refreshToken = this.auth.getRefreshToken();
            if (refreshToken) {
              return from(this.auth.refreshAccessToken(refreshToken)).pipe(
                switchMap((newAccessToken: string | null) => {
                  if (newAccessToken) {
                    const retried = req.clone({
                      setHeaders: { Authorization: `Bearer ${newAccessToken}` }
                    });
                    return next.handle(retried);
                  } else {
                    this.handleSessionExpired();
                    return throwError(() => error);
                  }
                }),
                catchError(() => {
                  this.handleSessionExpired();
                  return throwError(() => error);
                })
              );
            } else {
              this.handleSessionExpired();
            }
          }
          return throwError(() => error);
        })
      );
    }
    return next.handle(req);
  }

  private handleSessionExpired() {
    this.auth.logout();
    this.snackBar.open('Votre session a expiré, veuillez vous reconnecter.', 'Fermer', { duration: 6000 });
    this.router.navigate(['/login']);
  }
} 