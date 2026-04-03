import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { TokenService } from '../services/token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private tokenService: TokenService) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const session = this.tokenService.getSession();

    if (!session || !this.tokenService.isLoggedIn()) {
      console.warn('[AuthGuard] No valid session, redirecting to login');
      return this.router.parseUrl('/login');
    }

    return true;
  }
}
