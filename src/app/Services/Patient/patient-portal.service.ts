import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PatientPortalService {
  private apiUrl = `https://medicareos-bend.onrender.com/api/PatientPortal`;

  constructor(private http: HttpClient) { }

  getDashboardData(patientId?: number): Observable<any> {
    const url = patientId ? `${this.apiUrl}/dashboard?patientId=${patientId}` : `${this.apiUrl}/dashboard`;
    return this.http.get<any>(url);
  }

  getBookingOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/booking-options`);
  }

  bookAppointment(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/book-appointment`, data);
  }

  updateEmail(patientId: number, email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update-email`, { patientId, email });
  }
}
