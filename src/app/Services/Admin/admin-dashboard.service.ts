import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminDashboardService {
  private apiUrl = `https://medicareos-bend.onrender.com/api/AdminDashboard`;

  constructor(private http: HttpClient) { }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getActiveQueues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/active-queues`);
  }

  updateQueueStatus(examId: number, statusStr: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/update-status/${examId}`, { status: statusStr });
  }

  createEmergencyExam(patientName: string, phone: string, symptoms: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/emergency`, { patientName, phone, symptoms });
  }
}
