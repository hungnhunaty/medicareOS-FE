import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  private apiUrl = `https://medicareos-bend.onrender.com/api/AdminService`;

  constructor(private http: HttpClient) { }

  getAllServices(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createService(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateService(serviceId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${serviceId}`, data);
  }

  deleteService(serviceId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${serviceId}`);
  }
}
