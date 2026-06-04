import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: signalR.HubConnection;
  private queueUpdatedSubject = new Subject<void>();
  private patientCalledSubject = new Subject<{ patientId: number; clinicName: string; queueNumber: number }>();

  public queueUpdated$: Observable<void> = this.queueUpdatedSubject.asObservable();
  public patientCalled$: Observable<{ patientId: number; clinicName: string; queueNumber: number }> = this.patientCalledSubject.asObservable();

  constructor() {
    this.startConnection();
  }

  private startConnection() {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const hubUrl = `https://medicareos-bend.onrender.com/queueHub`;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('⚡ Connected to SignalR QueueHub'))
      .catch(err => {
        console.error('❌ Error establishing SignalR connection, retrying in 5s...', err);
        setTimeout(() => this.startConnection(), 5000);
      });

    this.registerOnServerEvents();
  }

  private registerOnServerEvents() {
    this.hubConnection.on('QueueUpdated', () => {
      console.log('🔄 SignalR: QueueUpdated received');
      this.queueUpdatedSubject.next();
    });

    this.hubConnection.on('PatientCalled', (patientId: number, clinicName: string, queueNumber: number) => {
      console.log(`🔊 SignalR: PatientCalled received. PatientId: ${patientId}, Clinic: ${clinicName}, No: ${queueNumber}`);
      this.patientCalledSubject.next({ patientId, clinicName, queueNumber });
    });
  }
}
