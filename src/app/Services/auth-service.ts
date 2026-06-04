import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountLoginDto } from '../Interfaces/account-login-dto';
import { Router } from '@angular/router';
import { LoginResponseDto } from '../Interfaces/login-response-dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private router: Router){}

  url:string = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5265/api/`;

  register(data: any){
    return this.http.post(this.url + "account/register", data);
  }

  login(data: AccountLoginDto){
    console.log("login Running");
    return this.http.post<LoginResponseDto>(this.url + "account/login", data);
  }

  verifyEmail(email: string, token: string) {
    return this.http.get(this.url + `account/verify-email?email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`);
  }

  forgotPassword(email: string) {
    return this.http.post(this.url + "account/forgot-password", { email });
  }

  resetPassword(data: any) {
    return this.http.post(this.url + "account/reset-password", data);
  }

  updateProfile(data: any) {
    return this.http.put(this.url + "account/profile", data);
  }
}
