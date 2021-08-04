import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();
    const authRequest = request.clone({
      /*set() method it doesn't override the old headers but it adds a new header to the headers and 
      it sets the value form it but if the header exists it will override it*/
      headers: request.headers.set('Authorization', `Bearer ${authToken}`),
    });
    return next.handle(authRequest);
  }
}
