import { Component, OnInit, inject, signal } from '@angular/core';
import { ILoginRequest } from '../../models/login';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TokenService } from '../../services/token.service';
import { CommonModule } from '@angular/common';
import { StateService } from '../../services/state.service';
import { BrandingService } from '../../services/branding.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginRequest!: ILoginRequest;
  loginForm: FormGroup;
  loginError = false;
  errorMessage = '';
  loading = signal(false);
  state = inject(StateService);
  brandingService = inject(BrandingService);

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, private TokenService: TokenService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadBrandingForLogin();
  }

  private loadBrandingForLogin(): void {
    this.brandingService.getBranding('admin').subscribe({
      next: (branding) => {
        this.state.updateBranding({
          ...branding,
          clientLogoUrl: branding.logoUrl,
          clientPrimaryColor: branding.primaryColor
        });
      }
    });
  }
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.loginError = true;
      return;
    }
    this.loading.set(true);
    const loginRequest = {
      userName: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        if (response && response.accessToken) {
          this.loginError = false;
          this.TokenService.saveSessionInLocal(response);
          this.router.navigate(['/dashboard']);
        } else {
          this.loginError = true;
          this.errorMessage = 'Login failed. Please check credentials.';
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Login error:', err);
        this.loginError = true;
        this.errorMessage = 'Server error occurred.';
        this.loading.set(false);
      }
    });
  }

}
