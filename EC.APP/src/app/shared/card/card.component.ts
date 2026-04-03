import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() padding = 'p-6';
  @Input() hoverable = true;
  @Input() border = true;
}
