import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminPatientService {
  private apiUrl = `https://medicareos-bend.onrender.com/api/AdminPatient`;

  constructor(private http: HttpClient) { }

  getAllPatients(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createPatient(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
