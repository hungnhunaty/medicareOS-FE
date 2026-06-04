import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../Services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  loading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  token: string = '';
  email: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      this.email = params['email'] || '';
    });

    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  onSubmit(): void {
    if (this.resetForm.invalid || !this.token || !this.email) {
      if (!this.token || !this.email) {
        this.errorMessage = 'Thông tin đặt lại mật khẩu không hợp lệ hoặc thiếu Token.';
      }
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      email: this.email,
      token: this.token,
      newPassword: this.resetForm.value.newPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = res.message || 'Đặt lại mật khẩu thành công!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Không thể đặt lại mật khẩu. Token có thể đã hết hạn hoặc không chính xác.';
      }
    });
  }
}
