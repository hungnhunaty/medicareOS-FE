import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PatientPortalService } from '../../Services/Patient/patient-portal.service';
import { SignalRService } from '../../Services/signalr.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class PatientDashboard implements OnInit, OnDestroy {
  profile: any = null;
  history: any[] = [];
  currentQueue: any = null;
  invoices: any[] = [];
  filteredInvoices: any[] = [];
  invoiceFilter: 'all' | 'paid' | 'unpaid' = 'all';
  userId?: number;

  // SignalR Subscriptions
  private queueSub!: Subscription;
  private callSub!: Subscription;

  // Alarm and Vibration Fields
  isCalledModalOpen: boolean = false;
  calledClinicName: string = '';
  calledQueueNumber: number = 0;
  private audioCtx: AudioContext | null = null;
  private alarmInterval: any;

  constructor(
    private patientService: PatientPortalService,
    private signalrService: SignalRService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const userInfoStr = localStorage.getItem('userInfo');

    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr);
        console.log(userInfo);
        this.userId = userInfo.userID || userInfo.UserId || userInfo.id;
      } catch (e) {
        console.error('Lỗi phân tích userInfo:', e);
      }
    }

    this.loadData();

    // Lắng nghe sự kiện SignalR để tự động làm mới hàng đợi
    this.queueSub = this.signalrService.queueUpdated$.subscribe(() => {
      console.log('🔔 Bệnh nhân nhận tín hiệu QueueUpdated, tiến hành load lại...');
      this.loadData();
    });

    // Lắng nghe sự kiện gọi khám
    this.callSub = this.signalrService.patientCalled$.subscribe((data) => {
      if (data.patientId === this.userId) {
        console.log(`📱 Bệnh nhân của chúng ta được gọi khám! Phòng: ${data.clinicName}`);
        this.showCalledAlert(data.clinicName, data.queueNumber);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.queueSub) this.queueSub.unsubscribe();
    if (this.callSub) this.callSub.unsubscribe();
    this.stopAlarm();
  }

  isUpdatingEmail: boolean = false;
  editEmail: string = '';

  loadData(): void {
    this.patientService.getDashboardData(this.userId).subscribe({
      next: (data) => {
        console.log(data);
        this.profile = data.profile;
        this.history = data.history;
        this.currentQueue = data.currentQueue;
        this.invoices = data.invoices || [];
        this.filterInvoices();
        
        if (this.profile) {
          this.editEmail = (this.profile.email && this.profile.email !== 'Chưa cập nhật') ? this.profile.email : '';
        }
        this.cd.detectChanges();
      },
      error: (err) => console.error('Lỗi khi tải dữ liệu Dashboard bệnh nhân:', err)
    });
  }

  setInvoiceFilter(filter: 'all' | 'paid' | 'unpaid'): void {
    this.invoiceFilter = filter;
    this.filterInvoices();
  }

  filterInvoices(): void {
    if (this.invoiceFilter === 'all') {
      this.filteredInvoices = [...this.invoices];
    } else if (this.invoiceFilter === 'paid') {
      this.filteredInvoices = this.invoices.filter(i => i.status === 'Đã thanh toán');
    } else {
      this.filteredInvoices = this.invoices.filter(i => i.status === 'Chờ thanh toán');
    }
    this.cd.detectChanges();
  }

  onUpdateEmail(): void {
    if (!this.userId) return;
    if (this.editEmail && !this.editEmail.includes('@')) {
      alert('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    this.isUpdatingEmail = true;
    this.patientService.updateEmail(this.userId, this.editEmail).subscribe({
      next: (res) => {
        this.isUpdatingEmail = false;
        alert(res.message || 'Cập nhật email thành công!');
        this.loadData();
      },
      error: (err) => {
        this.isUpdatingEmail = false;
        alert(err.error?.message || 'Có lỗi xảy ra khi cập nhật email.');
      }
    });
  }

  showCalledAlert(clinicName: string, queueNumber: number): void {
    this.calledClinicName = clinicName;
    this.calledQueueNumber = queueNumber;
    this.isCalledModalOpen = true;
    this.startAlarm();
    this.cd.detectChanges();
  }

  dismissCalledAlert(): void {
    this.isCalledModalOpen = false;
    this.stopAlarm();
    this.cd.detectChanges();
  }

  startAlarm(): void {
    if (this.alarmInterval) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.audioCtx = new AudioContextClass();

    const playBeep = () => {
      if (!this.audioCtx) return;
      try {
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume();
        }
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, this.audioCtx.currentTime); // A5 note

        gain.gain.setValueAtTime(0.5, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.5);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 0.5);
      } catch (e) {
        console.error('Lỗi âm thanh Web Audio:', e);
      }
    };

    playBeep();
    this.alarmInterval = setInterval(() => {
      playBeep();
      if (navigator.vibrate) {
        navigator.vibrate(300); // Rung mỗi giây
      }
    }, 1000);
  }

  stopAlarm(): void {
    if (this.alarmInterval) {
      clearInterval(this.alarmInterval);
      this.alarmInterval = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    if (navigator.vibrate) {
      navigator.vibrate(0); // Ngừng rung
    }
  }

  getStatusClass(code: number): string {
    switch (code) {
      case 0: return 'bg-amber-100 text-amber-700';
      case 1: return 'bg-emerald-100 text-emerald-700 animate-pulse';
      case 2: return 'bg-slate-100 text-slate-500';
      case 3: return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-50';
    }
  }
}
