import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminFinanceService {
  private apiUrl = `http://${typeof window !== 'undefined' ? window.location.hostname : 'localhost'}:5265/api/AdminFinance`;

  constructor(private http: HttpClient) { }

  getAllInvoices(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createInvoice(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  confirmPayment(invoiceId: number, method: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/confirm/${invoiceId}`, { method });
  }

  cancelInvoice(invoiceId: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cancel/${invoiceId}`, {});
  }

  getPatientFees(patientCode: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/patient-fees/${patientCode}`);
  }
}
