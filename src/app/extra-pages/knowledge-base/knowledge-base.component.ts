import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  views: number;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-knowledge-base',
  templateUrl: './knowledge-base.component.html',
  styleUrls: ['./knowledge-base.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BreadcrumbComponent,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
  ]
})
export class KnowledgeBaseComponent {
  categories = [
    { name: 'All', icon: 'apps' },
    { name: 'Getting Started', icon: 'rocket_launch' },
    { name: 'Patient Care', icon: 'medical_services' },
    { name: 'Billing & Invoices', icon: 'payments' },
    { name: 'Security & Accounts', icon: 'security' },
    { name: 'Radiology & PACS', icon: 'settings' }
  ];

  selectedCategory = signal<string>('All');
  searchQuery = signal<string>('');
  selectedArticle = signal<Article | null>(null);

  articles: Article[] = [
    {
      id: '1',
      category: 'Getting Started',
      title: 'How to register a new doctor in Salvera',
      summary: 'Learn the step-by-step process of adding a new doctor to the staff roster and configuring their department assignments.',
      content: 'To register a new doctor, navigate to the Doctors section in the sidebar and click on "Add Doctor". Fill in their first name, last name, and credentials. Ensure you select the correct primary department. You can configure their shift schedule under the "Shift Management" page. The doctor will receive an automated invitation email to set up their password.',
      views: 342
    },
    {
      id: '2',
      category: 'Patient Care',
      title: 'Scheduling virtual telemedicine calls',
      summary: 'Guides on how to launch the video call interface and invite patients to virtual consultations.',
      content: 'Salvera includes an integrated Telemedicine consultation room. To book a virtual visit, go to Appointments, choose Book Appointment, and set the Visit Type to "Telemedicine". The patient will receive a link to join the waiting room via email/SMS. Five minutes before the session, the doctor can click "Join Call" from their dashboard to open the full-screen interactive WebRTC interface.',
      views: 521
    },
    {
      id: '3',
      category: 'Billing & Invoices',
      title: 'Setting up insurance co-payments',
      summary: 'Configure provider-specific claim ratios and patient billing templates.',
      content: 'To configure insurance billing, ensure the Insurance Provider is registered under Accounts -> Insurance. When registering a patient, specify their Policy Number and Coverage percentage (e.g. 80%). The system automatically splits the final invoice, sending the co-payment portion to the patient, and compiling the remainder into a claim sheet under the Insurance Claims queue.',
      views: 189
    },
    {
      id: '4',
      category: 'Security & Accounts',
      title: 'Configuring Two-Factor Authentication (2FA)',
      summary: 'Mandatory security steps to protect patient data and meet healthcare compliance guidelines.',
      content: 'Go to Settings -> Security and toggle the "Two-Factor Authentication" option. You will be prompted to scan a QR code with an authenticator app (such as Google Authenticator or Duo). Enter the generated 6-digit confirmation code to complete setup. Every future login will require the verification code to ensure HIPAA compliance.',
      views: 405
    },
    {
      id: '5',
      category: 'Radiology & PACS',
      title: 'Troubleshooting imaging upload errors',
      summary: 'Fix common scan sync issues with DICOM standards and local PACS networks.',
      content: 'If scans are not syncing, verify that the local DICOM node has the correct Port and AE Title configured under Settings -> PACS Integration. Ensure your files are valid DICOM format (.dcm). Check the Modality Tracker logs to verify if a connection timed out, and click "Retry Sync" to force re-uploading the pending image batch.',
      views: 120
    },
    {
      id: '6',
      category: 'Patient Care',
      title: 'Understanding the Triage queue system (ESI)',
      summary: 'How emergency room patient charts are color-coded based on ESI levels.',
      content: 'Salvera uses the Emergency Severity Index (ESI) scoring system to prioritize ER patients. When completing the Triage form, assign a score from 1 (Most Critical) to 5 (Non-urgent). The Triage Queue board automatically places critical patients at the top of the queue and updates their card colors. Staff can assign available ER beds via drag-and-drop actions.',
      views: 298
    }
  ];

  filteredArticles = computed(() => {
    const category = this.selectedCategory();
    const query = this.searchQuery().toLowerCase().trim();

    return this.articles.filter(article => {
      const matchesCategory = category === 'All' || article.category === category;
      const matchesQuery = !query || 
        article.title.toLowerCase().includes(query) || 
        article.summary.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  });

  selectCategory(cat: string) {
    this.selectedCategory.set(cat);
    this.selectedArticle.set(null); // Return to list view
  }

  viewArticle(article: Article) {
    this.selectedArticle.set(article);
  }

  backToList() {
    this.selectedArticle.set(null);
  }

  getArticleCount(categoryName: string): number {
    if (categoryName === 'All') {
      return this.articles.length;
    }
    return this.articles.filter(a => a.category === categoryName).length;
  }
}
