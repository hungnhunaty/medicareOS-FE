import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StaffPortalService {
  private baseUrl = 'http://localhost:5265';
  private apiUrl = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5265/api/StaffPortal`;

  constructor(private http: HttpClient) { }

  getQueues(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/queues`);
  }

  getRoutingOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/routing-options`);
  }

  registerQueue(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register-queue`, data);
  }

  getInvoices(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/invoices`);
  }

  processPayment(invoiceId: number, paymentMethod: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/invoices/${invoiceId}/pay`, { paymentMethod });
  }

  getPatientById(userId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/patient/${userId}`);
  }

  // Create a temporary QR session (staff-only)
  createQrSession(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/api/queue/qr/create`, data);
  }
  getPatients(): Observable<any[]> {
    const adminPatientUrl = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5265/api/AdminPatient`;
    return this.http.get<any[]>(adminPatientUrl);
  }
}
