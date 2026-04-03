import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { IOrder } from '../../../models/order.model';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetailsComponent implements OnInit, OnChanges {
  @Input() id!: number;
  @Output() close = new EventEmitter<void>();

  order: IOrder | null = null;
  isLoading = true;
  submitted = false;
  ErrorResponse: any;
  responseType: 'success' | 'error' = 'success';

  constructor(public orderService: OrderService, private acRoute: ActivatedRoute, private cdr: ChangeDetectorRef) {

  }

  ngOnInit(): void {
    // Popup usage passes [id] and is handled in ngOnChanges.
    // Route fallback supports direct page navigation.
    if (this.id > 0) {
      this.loadOrder(this.id);
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['id'] && this.id > 0) {
      this.loadOrder(this.id);
    }
  }

  ngOnDestroy(): void {

  }

  private loadOrder(orderId: number): void {
    this.isLoading = true;
    this.submitted = false;
    this.ErrorResponse = '';

    this.orderService.getOrder(orderId).subscribe({
      next: (data) => {
        if (!data) {
          this.order = null;
          this.submitted = true;
          this.ErrorResponse = 'No order exists for ' + orderId;
          this.responseType = 'error';
        } else {
          this.order = data;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.order = null;
        this.submitted = true;
        this.ErrorResponse = 'Failed to load order details.';
        this.responseType = 'error';
        this.isLoading = false;
      }
    });
  }
}
