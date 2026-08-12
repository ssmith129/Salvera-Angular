import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-id-card-generator',
  templateUrl: './id-card-generator.component.html',
  styleUrls: ['./id-card-generator.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
  ],
})
export class IdCardGeneratorComponent implements OnInit {
  idCardForm!: FormGroup;
  photoUrl: string | ArrayBuffer | null = 'assets/images/user/user1.jpg';
  logoUrl: string | ArrayBuffer | null = 'assets/images/logo-salvera.png';

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.idCardForm = this.fb.group({
      hospitalName: ['Salvera Hospital'],
      hospitalTagline: ['Healing Hands, Caring Hearts'],
      personName: ['Dr. John Doe'],
      idNumber: ['EMP-2023-001'],
      departmentName: ['Cardiology'],
      dob: ['12/05/1985'],
      bloodGroup: ['O+'],
      phone: ['+1 234 567 8900'],
      address: ['123 Hospital Ave, City'],
    });
  }

  onPhotoSelected(event: Event, isLogo: boolean = false) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (isLogo) {
          this.logoUrl = e.target?.result || null;
        } else {
          this.photoUrl = e.target?.result || null;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  printIdCard() {
    window.print();
  }
}
