import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IProduct, IProductVariant } from '../../../models/product.model';
import { IOrder, IOrderItem, IOrderItemsDetails } from '../../../models/order.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-order-items',
  templateUrl: './order-items.component.html',
  styleUrls: ['./order-items.component.css']
})
export class OrderItemsComponent implements OnInit, OnChanges {
  @Input() isEditMode: boolean = false;
  @Input() productList: IProduct[] = [];
  @Input() orderItemsDetails: IOrderItemsDetails = {} as IOrderItemsDetails;
  @Output() ReturnOrderItemsDetails: EventEmitter<IOrderItemsDetails> = new EventEmitter<IOrderItemsDetails>();

  constructor(private orderService: OrderService) { }

  ngOnInit(): void {  
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['orderItemsDetails'] || changes['productList']) {
      this.orderItemsDetails.orderItems.forEach(item => {
        if (!this.getUniqueSizes(item.productId).includes(item.size)) item.size = '';
        if (!this.getUniqueColors(item.productId, item.size).includes(item.color)) item.color = '';
      });
    }
  }
  addOrderItem() {
    this.orderItemsDetails.orderItems.push({
      productId: 0,
      productName: '',
      color: '',
      size: '',
      quantity: 1,
      price: 0,
      totalAmount: 0,
      orderItemId: 0,
      orderId: 0,
      productVariantId: 0
    });
  }

  updateVariants(orderItem: IOrderItem) {
    const product = this.productList.find(p => p.productId == orderItem.productId);
    if (product) {
      orderItem.productName = product.productName;
      // Reset size and color if they are not valid
      if (!this.getUniqueSizes(orderItem.productId).includes(orderItem.size)) {
        orderItem.size = '';
      }
      if (!this.getUniqueColors(orderItem.productId, orderItem.size).includes(orderItem.color)) {
        orderItem.color = '';
      }
      this.updatePriceAndTotal(orderItem);
    }
  }

  updatePriceAndTotal(orderItem: IOrderItem) {
    const product = this.productList.find(p => p.productId == orderItem.productId);
    if (!product) return;
    const variant = product.productVariants.find(v => v.size == orderItem.size && v.color == orderItem.color);
    if (variant) {
      orderItem.price = variant.price;
      orderItem.totalAmount = orderItem.quantity * orderItem.price;
    } else {
      orderItem.price = product.price;
      orderItem.totalAmount = orderItem.quantity * orderItem.price;
    }
    this.setOrderDetails();
  }

  validateQuantity(orderItem: IOrderItem) {
    const product = this.productList.find(p => p.productId == orderItem.productId);
    if (!product) return;
    const variant = product.productVariants.find(v => v.size == orderItem.size && v.color == orderItem.color);
    if (variant) {
      orderItem.quantity = Math.max(1, Math.min(orderItem.quantity, variant.stockQuantity));
    }
    this.updatePriceAndTotal(orderItem);
  }

  removeOrderItem(index: number) {
    this.orderItemsDetails.orderItems.splice(index, 1);
  }

  getUniqueSizes(productId: number): string[] {
    const product = this.productList.find(p => p.productId == productId);
    return product ? [...new Set(product.productVariants.map(v => v.size))] : [];
  }

  getUniqueColors(productId: number, selectedSize: string): string[] {
    const product = this.productList.find(p => p.productId == productId);
    return product
      ? [...new Set(product.productVariants.filter(v => v.size == selectedSize).map(v => v.color))]
      : [];
  }

  setOrderDetails() {
    this.orderItemsDetails.totalAmount = this.orderItemsDetails.orderItems.reduce((sum, item) => sum + item.totalAmount, 0).toString();
    this.orderItemsDetails.discountAmount = (parseInt(this.orderItemsDetails.totalAmount) * 0.1).toString();
    this.orderItemsDetails.shippingAmount = "20";
    this.orderItemsDetails.grossAmount = (parseInt(this.orderItemsDetails.totalAmount) - parseInt(this.orderItemsDetails.discountAmount)).toString();
    this.orderItemsDetails.netAmount = (parseInt(this.orderItemsDetails.grossAmount) + parseInt(this.orderItemsDetails.shippingAmount)).toString();
    this.orderItemsDetails.orderItems = this.orderItemsDetails.orderItems;
    this.ReturnOrderItemsDetails.next(this.orderItemsDetails);
  }

  trackByIndex(index: number, item: IOrderItem): number {
    return index;
  }
}
