import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminMedicationService {
  private apiUrl = `https://medicareos-bend.onrender.com/api/AdminMedication`;

  constructor(private http: HttpClient) { }

  getAllMedications(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  createMedication(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  addStock(medicationId: number, quantity: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/add-stock/${medicationId}`, { addedQuantity: quantity });
  }

  updateMedication(medicationId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${medicationId}`, data);
  }

  deleteMedication(medicationId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${medicationId}`);
  }
}
