import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminPatientService {
  private apiUrl = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5265/api/AdminPatient`;

  constructor(private http: HttpClient) { }

  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createPatient(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
