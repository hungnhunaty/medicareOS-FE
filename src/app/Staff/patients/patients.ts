import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StaffPortalService } from '../../Services/Staff/staff-portal.service';

@Component({
  selector: 'app-staff-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class StaffPatients implements OnInit {
  patients: any[] = [];
  filteredPatients: any[] = [];
  searchKeyword: string = '';
  isLoading: boolean = false;

  constructor(private staffService: StaffPortalService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.loadPatients();
  }

  loadPatients() {
    this.isLoading = true;
    this.staffService.getPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.filteredPatients = data;
        this.isLoading = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching patients:', err);
        this.isLoading = false;
      }
    });
  }

  onSearch() {
    if (!this.searchKeyword.trim()) {
      this.filteredPatients = this.patients;
      return;
    }
    const kw = this.searchKeyword.toLowerCase().trim();
    this.filteredPatients = this.patients.filter(p =>
      (p.id && p.id.toLowerCase().includes(kw)) ||
      (p.userId && p.userId.toString().includes(kw)) ||
      (p.name && p.name.toLowerCase().includes(kw)) ||
      (p.phone && p.phone.toLowerCase().includes(kw))
    );
  }
}
