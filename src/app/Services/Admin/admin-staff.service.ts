import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminStaffService {
  private apiUrl = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5265/api/AdminStaff`;

  constructor(private http: HttpClient) { }

  getAllStaff(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createStaff(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateStaff(userId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${userId}`, data);
  }

  deleteStaff(userId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${userId}`);
  }
}
