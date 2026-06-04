import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Route, Router } from '@angular/router';
import { CommonEngine } from '@angular/ssr/node';
import { AuthService } from '../Services/auth-service';
// Import Service gọi API của bạn ở đây (ví dụ: AuthService)

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent{
  registerForm!:FormGroup;

  constructor(private fb:FormBuilder, private route:Router, private _authService: AuthService ){}
  
  ngOnInit(){
    this.registerForm = this.fb.group({
      FullName: ['', Validators.required],
      UserName: ['', Validators.required],
      Password: ['', Validators.required],
      Email: ['', [Validators.email]],
      DateOfBirth: ['', Validators.required],
      Gender: ['', [Validators.required]],
      Phone: ['', Validators.required],
      Address: ['', Validators.required],
    });
  }
  
  onSubmit(){
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    this._authService.register(this.registerForm.value).subscribe(
      {
        next:(res: any) => {
          alert(res.message || 'Đăng ký thành công!');
          this.route.navigate(['/login']);
        },
        error: (err) => {
          alert("Error: " + (err.error?.message || 'Có lỗi xảy ra.'));
        }
      }
    );    
  }

}