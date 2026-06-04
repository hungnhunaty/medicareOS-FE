import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DoctorPortalService {
  private apiUrl = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5265/api/DoctorPortal`;

  constructor(private http: HttpClient) { }

  getExaminations(doctorId?: number): Observable<any[]> {
    const url = doctorId ? `${this.apiUrl}?doctorId=${doctorId}` : this.apiUrl;
    return this.http.get<any[]>(url);
  }

  startExamination(examinationId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${examinationId}/start`, {});
  }

  updateDiagnosis(examinationId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${examinationId}/diagnosis`, data);
  }

  callNextPatient(doctorId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/call-next?doctorId=${doctorId}`, {});
  }

  recallPatient(examinationId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recall/${examinationId}`, {});
  }

  skipPatient(examinationId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/skip/${examinationId}`, {});
  }

  getDoctorInformation(doctorId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${doctorId}/information`);
  }

  updateDoctorInformation(doctorId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${doctorId}/information`, data);
  }

  checkPrescriptionSafety(examinationId: number, medications: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-prescription-safety`, {
      examinationId,
      medications
    });
  }
}
