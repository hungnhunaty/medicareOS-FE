import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { StaffPortalService } from '../../Services/Staff/staff-portal.service';
import { SearchService } from '../../Services/search.service';
import { Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HubConnectionBuilder, HttpTransportType } from '@microsoft/signalr';

import { SignalRService } from '../../Services/signalr.service';

@Component({
  selector: 'app-staff-reception',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reception.html',
  styleUrl: './reception.css'
})
export class StaffReception implements OnInit, OnDestroy {
  queues: any[] = [];
  doctors: any[] = [];
  searchKeyword: string = '';
  private searchSub?: Subscription;
  private signalrSub?: Subscription;

  // Form State
  showRegisterModal: boolean = false;
  patientSearchId: string = '';
  newPatient: any = {
    patientId: null as number | null,
    patientName: '',
    phone: '',
    gender: 'Nam',
    doctorId: 0,
    department: 'Khoa Khám bệnh',
    symptoms: '',
    hasAccount: false
  };

  constructor(
    private staffService: StaffPortalService,
    private searchService: SearchService,
    private signalrService: SignalRService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadQueues();
    this.loadOptions();
    this.searchSub = this.searchService.currentSearchKeyword.subscribe(keyword => {
      this.searchKeyword = keyword;
      this.cd.detectChanges();
    });

    this.signalrSub = this.signalrService.queueUpdated$.subscribe(() => {
      console.log('🔄 Lễ tân nhận tín hiệu QueueUpdated, tiến hành load lại...');
      this.loadQueues();
    });
  }

  ngOnDestroy(): void {
    if (this.searchSub) this.searchSub.unsubscribe();
    this.stopHub();
    if (this.signalrSub) this.signalrSub.unsubscribe();
  }

  loadQueues(): void {
    this.staffService.getQueues().subscribe({
      next: (data) => {
        this.queues = data;
        this.cd.detectChanges();
      }
    });
  }

  loadOptions(): void {
    this.staffService.getRoutingOptions().subscribe({
      next: (data) => {
        this.doctors = data;
        if (this.doctors.length > 0) this.newPatient.doctorId = this.doctors[0].doctorId;
        this.cd.detectChanges();
      }
    });
  }

    get filteredQueues(): any[] {
    return this.queues.filter(q => {
      const name = q.patientName || '';
      const code = q.patientCode || '';
      return name.toLowerCase().includes(this.searchKeyword.toLowerCase()) || 
             code.toLowerCase().includes(this.searchKeyword.toLowerCase());
    });
  }

  get filteredDoctors(): any[] {
    return this.doctors.filter(d => d.department === this.newPatient.department);
  }

  onDepartmentChange(): void {
    this.newPatient.doctorId = 0;
  }

  openRegister(): void {
    this.showRegisterModal = true;
    this.resetNewPatient();
  }

  closeRegister(): void {
    this.showRegisterModal = false;
  }

  lookupPatient(): void {
    if (!this.patientSearchId.trim()) {
      alert('Vui lòng nhập UserID của bệnh nhân!');
      return;
    }

    const uId = parseInt(this.patientSearchId);
    if (isNaN(uId)) {
      alert('UserID phải là số nguyên hợp lệ!');
      return;
    }

    this.staffService.getPatientById(uId).subscribe({
      next: (res) => {
        this.newPatient.patientId = res.patientId;
        this.newPatient.patientName = res.fullName;
        this.newPatient.phone = res.phone;
        this.newPatient.gender = res.gender;
        this.cd.detectChanges();
      },
      error: (err) => {
        alert(err.error?.message || 'Không tìm thấy tài khoản Bệnh nhân có ID này.');
        this.newPatient.patientId = null;
        this.newPatient.patientName = '';
        this.newPatient.phone = '';
        this.cd.detectChanges();
      }
    });
  }

  submitRegistration(): void {
    if (this.newPatient.hasAccount && !this.newPatient.patientId) {
      alert('Vui lòng nhập UserID và bấm Tra Cứu để tìm tài khoản hợp lệ!');
      return;
    }

    if (!this.newPatient.patientName || !this.newPatient.phone) {
      alert('Vui lòng nhập đầy đủ tên và số điện thoại của bệnh nhân!');
      return;
    }

    this.staffService.registerQueue(this.newPatient).subscribe({
      next: (res) => {
        this.showQueueCreatedNotification(res);
        this.loadQueues();
        this.closeRegister();
        this.resetNewPatient();
      },
      error: (err) => alert('Lỗi khi đăng ký: ' + (err.error?.message || 'Không rõ nguyên nhân'))
    });
  }

  resetNewPatient(): void {
    this.patientSearchId = '';
    this.newPatient = { 
      patientId: null,
      patientName: '', 
      phone: '', 
      gender: 'Nam', 
      doctorId: 0, 
      department: 'Khoa Khám bệnh',
      symptoms: '',
      hasAccount: false
    };
  }

  // --- QR flow state + helpers ---
  showQrModal: boolean = false;
  // default departmentId = 1 (Khoa Khám bệnh) so modal opens with a valid default
  qrModel: any = { departmentId: 1, doctorId: 0, symptoms: '' };
  qrSessionId: string | null = null;
  qrImageUrl: string | null = null;
  signalRStatus: 'disconnected' | 'connecting' | 'connected' | 'failed' = 'disconnected';
  signalRError: string | null = null;
  private hubConnection: any;

  openQrCreator(): void {
    this.showQrModal = true;
    this.qrSessionId = null;
    this.qrImageUrl = null;
    this.signalRStatus = 'disconnected';
    this.signalRError = null;
    this.qrModel = { departmentId: 1, doctorId: 0, symptoms: '' };
  }

  closeQrCreator(): void {
    this.showQrModal = false;
    // Giữ kết nối SignalR để nếu bệnh nhân quét QR sau khi đóng modal,
    // staff vẫn nhận được thông báo trên trang tiếp đón.
  }

  async createQr(): Promise<void> {
    // basic validation
    if (!this.qrModel.departmentId) {
      alert('Vui lòng chọn Khoa khám');
      return;
    }

    this.signalRStatus = 'connecting';
    this.signalRError = null;

    if (this.hubConnection) {
      await this.stopHub();
    }

    this.staffService.createQrSession(this.qrModel).subscribe({
      next: async (res) => {
        const sessionId = res.sessionId || res.SessionId || res.sessionId || res.SessionId;
        const payload = res.qrPayload || res.QrPayload || sessionId;
        this.qrSessionId = sessionId;
        // generate QR image URL (public QR API)
        this.qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payload)}`;
        this.cd.detectChanges();

        // start SignalR and join session group
        await this.startAndJoinSession(sessionId);
      },
      error: (err) => {
        this.signalRStatus = 'failed';
        this.signalRError = err.error?.message || err.message || 'Không rõ nguyên nhân';
        alert('Lỗi tạo QR: ' + this.signalRError);
      }
    });
  }

  private async startAndJoinSession(sessionId: string) {
    try {
      const hubUrl = 'https://medicareos-bend.onrender.com/queueHub';
      this.hubConnection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          transport: HttpTransportType.LongPolling,
          skipNegotiation: false
        })
        .withAutomaticReconnect()
        .build();

      this.hubConnection.on('QueueCreated', (payload: any) => {
        this.showQueueCreatedNotification(payload);
        this.loadQueues();
        this.closeQrCreator();
      });

      await this.hubConnection.start();
      this.signalRStatus = 'connected';
      console.log('SignalR connected');
      
      // call JoinSession to join the group on server
      try {
        await this.hubConnection.invoke('JoinSession', sessionId);
        console.log('Joined session:', sessionId);
      } catch (err) {
        console.warn('Invoke JoinSession failed', err);
      }
    } catch (err) {
      this.signalRStatus = 'failed';
      this.signalRError = err instanceof Error ? err.message : JSON.stringify(err);
      console.error('SignalR client failed to start', err);
      alert('Lỗi SignalR: ' + this.signalRError);
    }
  }

  private async stopHub() {
    if (this.hubConnection) {
      try { await this.hubConnection.stop(); } catch (e) { /* ignore */ }
      this.hubConnection = null;
    }
  }

  // Map of the department ids used in the QR select to the department display names
  // Keep this in sync with the select options in the template
  private readonly _deptNames: Record<number, string> = {
    2: 'Khoa Khám bệnh',
    5: 'Khoa Nội Tổng Hợp',
    6: 'Khoa Ngoại Tổng Hợp',
    3: 'Khoa Nhi',
    4: 'Khoa Xét nghiệm',
    7: 'Khoa Chẩn Đoán Hình Ảnh'
  };

  get filteredQrDoctors(): any[] {
    const deptName = this._deptNames[this.qrModel.departmentId];
    if (!deptName) return [];
    return this.doctors.filter((d: any) => (d.department || '').trim() === deptName.trim());
  }

  onQrDepartmentChange(): void {
    // Reset doctor selection to 0 which means "auto route by department" on the backend
    this.qrModel.doctorId = 0;
  }

  private showQueueCreatedNotification(data: any): void {
    const patientName = data.patientName || data.PatientName || data.patient || data.Patient || 'Bệnh nhân';
    const clinicName = data.clinicName || data.ClinicName || data.clinic || data.Clinic || 'Phòng khám';
    const queueNumber = data.queueNumber ?? data.QueueNumber ?? data.queueNumber ?? 'N/A';

    alert(`Đăng ký tiếp đón thành công!\nBệnh nhân: ${patientName}\nPhòng khám: ${clinicName}\nSố thứ tự: ${queueNumber}`);
  }

}
