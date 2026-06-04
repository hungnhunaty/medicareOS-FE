import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register';
import { HomePage } from './HomePage/home-page/home-page';
import { Introduce } from './HomePage/introduce/introduce';
import { ServiceInstruct } from './HomePage/service-instruct/service-instruct';
import { QA } from './HomePage/qa/qa';
import { Contact } from './HomePage/contact/contact';
import { Login } from './login/login';
import { Dashboard } from './Admin/dashboard/dashboard';
import { AdminLayout } from './Admin/admin-layout/admin-layout';
import { Staff } from './Admin/staff/staff';
import { Patients } from './Admin/patients/patients';
import { Services } from './Admin/services/services';
import { Medications } from './Admin/medications/medications';
import { Finance } from './Admin/finance/finance';

import { DoctorLayout } from './Doctor/doctor-layout/doctor-layout';
import { DoctorExaminations } from './Doctor/examinations/examinations';
import { StaffLayout } from './Staff/staff-layout/staff-layout';
import { StaffReception } from './Staff/reception/reception';
import { StaffPatients } from './Staff/patients/patients';
import { PatientLayout } from './Patients/patient-layout/patient-layout';
import { PatientDashboard } from './Patients/dashboard/dashboard';
import { RejectComponent } from './reject/reject';
import { authGuard } from './Services/auth.guard';
import { VerifyEmailComponent } from './verify-email/verify-email';
import { ForgotPasswordComponent } from './forgot-password/forgot-password';
import { ResetPasswordComponent } from './reset-password/reset-password';
import { PharmacistLayout } from './Pharmacist/pharmacist-layout/pharmacist-layout';

export const routes: Routes = [
    {path: "", redirectTo: "home", pathMatch:"full"},
    {path: "register", component: RegisterComponent},
    {path: "verify-email", component: VerifyEmailComponent},
    {path: "forgot-password", component: ForgotPasswordComponent},
    {path: "reset-password", component: ResetPasswordComponent},
    {path: "home", component: HomePage,
        children: [
        // Khi truy cập /introduce, nội dung sẽ được đổ vào <router-outlet> của home-page.html
        { path: '', component: Introduce },
        { path: 'services', component: ServiceInstruct},
        { path: 'faq', component: QA},
        { path: 'contact', component: Contact}
        ]
    },
    {path: "login", component: Login},
    {path: "reject", component: RejectComponent},
    {path: "admin",
        component: AdminLayout, // Khung ngoài luôn giữ nguyên
        canActivate: [authGuard],
        data: { roles: ['Admin'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: Dashboard},
            { path: 'staff', component: Staff},
            { path: 'patients', component: Patients},
            { path: 'services', component: Services},
            { path: 'medications', component: Medications},
            { path: 'finance', component: Finance},
        ]
    },
    {path: "doctor",
        component: DoctorLayout,
        canActivate: [authGuard],
        data: { roles: ['Doctor'] },
        children: [
            { path: '', redirectTo: 'examinations', pathMatch: 'full' },
            { path: 'examinations', component: DoctorExaminations }
        ]
    },
    {path: "staff-portal",
        component: StaffLayout,
        canActivate: [authGuard],
        data: { roles: ['Staff'] },
        children: [
            { path: '', redirectTo: 'reception', pathMatch: 'full' },
            { path: 'reception', component: StaffReception },
            { path: 'patients', component: StaffPatients },
            { path: 'finance', component: Finance }
        ]
    },
    {path: "pharmacist",
        component: PharmacistLayout,
        canActivate: [authGuard],
        data: { roles: ['Pharmacist'] },
        children: [
            { path: '', redirectTo: 'medications', pathMatch: 'full' },
            { path: 'medications', component: Medications }
        ]
    },
    {path: "patient",
        component: PatientLayout,
        canActivate: [authGuard],
        data: { roles: ['Patient', 'User'] },
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', component: PatientDashboard }
        ]
    }
];
