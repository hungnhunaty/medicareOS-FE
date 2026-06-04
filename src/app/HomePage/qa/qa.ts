import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-qa',
  imports: [CommonModule],
  templateUrl: './qa.html',
  styleUrl: './qa.css',
})
export class QA {
  active: number | null = null;

  toggle(id: number) {
    this.active = this.active === id ? null : id;
  }
}
