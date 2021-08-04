import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isUserAuthenticated = false;
  private authListenerSubscription!: Subscription;
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.isUserAuthenticated = this.authService.getIsAuthenticated();
    this.authListenerSubscription = this.authService
      .getAuthListener()
      .subscribe((isAuth) => {
        this.isUserAuthenticated = isAuth;
      });
  }

  onLogout() {
    this.authService.logout();
  }

  ngOnDestroy(): void {
    this.authListenerSubscription.unsubscribe();
  }
}
