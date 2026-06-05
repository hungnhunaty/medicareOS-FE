import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminRoomService {
  private apiUrl = `https://medicareos-bend.onrender.com/api/AdminRoom`;

  constructor(private http: HttpClient) { }

  getAllRooms(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getAllDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/departments`);
  }

  getRoomById(roomId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${roomId}`);
  }

  createRoom(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateRoom(roomId: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${roomId}`, data);
  }

  deleteRoom(roomId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${roomId}`);
  }
}
