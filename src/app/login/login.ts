import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from '../Services/auth-service';
import { AccountLoginDto } from '../Interfaces/account-login-dto';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm!: FormGroup;

  constructor(private router: Router, private _authService: AuthService, private fb: FormBuilder) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      userName: ['', Validators.required],
      password: ['', [Validators.required]]
    })
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const loginData: AccountLoginDto = this.loginForm.value;

      this._authService.login(loginData).subscribe({
        next: (res) => {
          localStorage.setItem('userInfo', JSON.stringify(res));
          alert("Đăng nhập thành công.");
          const role = res.userType.toLowerCase();
          if (role === "admin") {
            this.router.navigate(['/admin']);
          } else if (role === "doctor") {
            this.router.navigate(['/doctor']);
          } else if (role === "staff") {
            this.router.navigate(['/staff-portal']);
          } else if (role === "patient") { // User role đại diện cho Patient
            this.router.navigate(['/patient']);
          } else {
            this.router.navigate(['/home']);
          }
        },
        error: (err) => {
          alert(err.error.message || "Đăng nhập thất bại!");
        }
      });
    }
    else {
      // Đánh dấu tất cả các field là touched để hiện lỗi nếu người dùng nhấn Submit mà chưa điền
      this.loginForm.markAllAsTouched();
    }
  }

}
