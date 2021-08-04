import { HttpClient } from '@angular/common/http';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Auth } from '../models/auth.mode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private httpClient: HttpClient, private route: Router) {}

  private userURL = 'http://localhost:6060/api/users';
  private token!: string;
  private userId!: string;
  private tokenTimer!: any;
  private isAuthenticated = false;
  private authListener = new Subject<boolean>();

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  getAuthListener() {
    return this.authListener.asObservable();
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  createUser(email: string, password: string) {
    const authData: Auth = { email, password };
    this.httpClient
      .post(`${this.userURL}/signup`, authData)
      .subscribe((response) => {
        console.log(response);
      });
  }

  login(email: string, password: string) {
    const authData: Auth = { email, password };

    this.httpClient
      .post<{ token: string; expiresIn: number; userId: string }>(
        `${this.userURL}/login`,
        authData
      )
      .subscribe((response) => {
        const token = response.token;
        this.token = token;
        if (token) {
          const expiresInDuration = response.expiresIn;
          console.log(expiresInDuration);
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authListener.next(true);
          this.setAuthTimer(expiresInDuration);
          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + expiresInDuration * 1000
          );
          this.saveAuthData(token, expirationDate, this.userId);
          this.route.navigate(['/']);
        }
      });
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const now = new Date();
    const expiresIn = authInfo?.expiration.getTime()! - now.getTime();
    if (expiresIn > 0) {
      this.token = authInfo?.token!;
      this.isAuthenticated = true;
      this.userId = authInfo.userId!;
      this.setAuthTimer(expiresIn / 1000);
      this.authListener.next(true);
    }
  }

  logout() {
    this.token = '';
    this.isAuthenticated = false;
    this.authListener.next(false);
    this.userId = '';
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.route.navigate(['/']);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token: token,
      expiration: new Date(expirationDate),
      userId: userId,
    };
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
}
