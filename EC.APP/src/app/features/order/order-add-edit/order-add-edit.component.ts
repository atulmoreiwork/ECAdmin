import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { IOrder, IOrderItemsDetails, IOrderStatus, IPaymentStatus, IPaymentType } from '../../../models/order.model';
import { ICustomer } from '../../../models/customer.model';
import { IProduct, IProductVariant } from '../../../models/product.model';
import { ICategory } from '../../../models/category.model';

import { OrderService } from '../../../services/order.service';
import { CustomerService } from '../../../services/customer.service';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { OrderItemsComponent } from '../order-items/order-items.component';

@Component({
  selector: 'app-order-add-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, OrderItemsComponent],
  templateUrl: './order-add-edit.component.html',
  styleUrls: ['./order-add-edit.component.css']
})
export class OrderAddEditComponent implements OnInit, OnChanges {

  @Input() id!: number;
  @Output() close = new EventEmitter<void>();
  @Output() addedited = new EventEmitter<void>();

  customerId: any;
  customerList: ICustomer[] = [];
  customerData: ICustomer = {} as ICustomer;

  categoryList: ICategory[] = [];

  productId: any;
  productList: IProduct[] = [];
  selectedProductVariants: IProductVariant[] = [];

  status: any;
  paymentType: any;
  paymentStatus: any;

  orderStatusList: IOrderStatus[] = [
    { id: 'Placed', name: 'Placed' },
    { id: 'Packed', name: 'Packed' },
    { id: 'Shipped', name: 'Shipped' },
    { id: 'Delivered', name: 'Delivered' }
  ];

  paymentTypeList: IPaymentType[] = [
    { id: 'NetBanking', name: 'NetBanking' },
    { id: 'UPI', name: 'UPI' },
    { id: 'Cash On Delivery', name: 'Cash On Delivery' }
  ];

  paymentStatusList: IPaymentStatus[] = [
    { id: 'Paid', name: 'Paid' },
    { id: 'Not Paid', name: 'Not Paid' }
  ];

  addNewOrderForm!: FormGroup;
  orderItems: any;
  order!: IOrder;
  isEditMode = false;
  submitted = false;
  orderItemsDetails: IOrderItemsDetails = {
    totalAmount: '0',
    discountAmount: '0',
    grossAmount: '0',
    shippingAmount: '0',
    netAmount: '0',
    orderItems: []
  };
  responseType: 'success' | 'error' = 'success';
  ErrorResponse: any;
  private hasInitialized = false;

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private router: Router,
    private customerService: CustomerService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    if (!this.hasInitialized) {
      this.initForm();
      this.hasInitialized = true;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['id']) {
      if (!this.hasInitialized || !changes['id'].firstChange) {
        this.initForm();
        this.hasInitialized = true;
      }
    }
  }

  initForm() {
    this.initializeForm();
    this.isEditMode = this.id > 0;

    this.getCustomerList(() => {
      if (this.isEditMode) {
        this.loadOrder(this.id);
      } else {
        this.getProductList();
      }
    });
  }

  initializeForm(): void {
    this.addNewOrderForm = this.fb.group({
      orderId: [0],
      orderNumber: [''],
      customerId: ['', Validators.required],
      orderShippingAddressId: [0],
      totalAmount: [0, Validators.required],
      discountAmount: [0],
      grossAmount: [0],
      shippingAmount: [0],
      netAmount: [0, Validators.required],
      status: ['', Validators.required],
      paymentStatus: ['', Validators.required],
      paymentType: ['', Validators.required],
      paymentTransactionId: [''],
      orderItems: this.fb.array([]),
      orderShippingAddress: this.fb.group({
        orderShippingAddressId: [0],
        orderId: [0],
        address: ['', Validators.required],
        state: [''],
        city: [''],
        postalCode: [''],
        flag: [0]
      }),
      row: [''],
      totalRowCount: [''],
      flag: [0]
    });
    this.productList = [];
    this.orderItemsDetails = {
      totalAmount: '0',
      discountAmount: '0',
      grossAmount: '0',
      shippingAmount: '0',
      netAmount: '0',
      orderItems: []
    };
  }

  loadOrder(orderId: number): void {

    this.orderService.getOrder(orderId).subscribe({
      next: (data) => {
        if (data) {
          this.order = data;
          this.addNewOrderForm.patchValue(this.order);
          this.status = this.order.status;
          this.paymentType = this.order.paymentType;
          this.paymentStatus = this.order.paymentStatus;
          this.customerId = this.order.customerId;
          this.customerData = this.customerList.find(x => x.customerId == this.customerId) || {} as ICustomer;
          this.loadOrderItems();
        }
      },
      error: (err: any) => {
        console.error('Error:', err);
      }
    });
  }

  loadOrderItems() {
    const productIds = this.order.orderItems.map(oi => oi.productId);

    this.productService.getProductsByIds(productIds).subscribe({
      next: (res) => {
        const products = (res?.result || []).map((p: IProduct) => ({
          ...p,
          productVariants: p.productVariants || []
        }));

        const details: IOrderItemsDetails = {
          totalAmount: this.order.totalAmount.toString(),
          discountAmount: this.order.discountAmount.toString(),
          shippingAmount: this.order.shippingAmount.toString(),
          grossAmount: this.order.grossAmount.toString(),
          netAmount: this.order.totalAmount.toString(),
          orderItems: this.order.orderItems.map(item => ({
            ...item,
            quantity: item.quantity || 1,
            price: item.price || 0,
            totalAmount: item.totalAmount || 0
          }))
        };

        // Defer input-bound updates to next tick to avoid NG0100 in popup content projection flow.
        setTimeout(() => {
          this.productList = products;
          this.orderItemsDetails = details;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        console.error('Error:', err);
      }
    });
  }

  submitForm(): void {
    this.addNewOrderForm.patchValue({
      totalAmount: this.orderItemsDetails?.totalAmount?.toString(),
      discountAmount: this.orderItemsDetails?.discountAmount?.toString(),
      shippingAmount: this.orderItemsDetails?.shippingAmount?.toString(),
      grossAmount: this.orderItemsDetails?.grossAmount?.toString(),
      netAmount: this.orderItemsDetails?.netAmount?.toString()
    });

    const orderItemsFormArray = this.addNewOrderForm.get('orderItems') as FormArray;
    orderItemsFormArray.clear();

    this.orderItemsDetails?.orderItems?.forEach((orderItem: any) => {
      orderItemsFormArray.push(this.createOrderItemFormGroup(orderItem));
    });

    this.submitted = true;
    this.addNewOrderForm.markAllAsTouched();

    if (this.addNewOrderForm.invalid) return;

    const orderData: IOrder = this.addNewOrderForm.value;

    this.orderService.addUpdateOrder(orderData).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.ErrorResponse = 'Order saved successfully';
          this.responseType = 'success';
          //this.router.navigate(['order']);
          this.addedited.emit();
        } else {
          this.ErrorResponse = response?.message || 'Unknown error occurred';
          this.responseType = 'error';
        }
      },
      error: (error: any) => {
        this.ErrorResponse = error?.message || 'Unknown error occurred';
        this.responseType = 'error';
      }
    });
  }

  createOrderItemFormGroup(orderItem: any): FormGroup {
    return this.fb.group({
      orderItemId: [0],
      orderId: [0],
      productId: [orderItem.productId],
      productVariantId: [orderItem.productVariantId],
      productName: [orderItem.productName],
      color: [orderItem.color],
      size: [orderItem.size],
      price: [orderItem.price],
      quantity: [orderItem.quantity],
      totalAmount: [orderItem.totalAmount]
    });
  }

  /****** Get Lists and Dropdown Changes ****/
  changeCustomerDropDown(evt: any): void {
    this.customerId = evt.target.value;
    this.customerData = this.customerList.find(x => x.customerId == this.customerId) || {} as ICustomer;
  }

  getCustomerList(onLoaded?: () => void): void {
    this.customerService.getCustomers().subscribe((data) => {
      const customers = data?.result || [];

      // Defer input-bound updates to next tick to avoid NG0100 during popup checks.
      setTimeout(() => {
        this.customerList = customers;
        this.customerData = this.customerList.find(x => x.customerId == this.customerId) || {} as ICustomer;
        onLoaded?.();
        this.cdr.detectChanges();
      });
    });
  }

  changeOrderStatusDropDown(event: any): void {
    this.status = event.target.value;
  }

  changePaymentTypeDropDown(event: any): void {
    this.paymentType = event.target.value;
  }

  changePaymentStatusDropDown(event: any): void {
    this.paymentStatus = event.target.value;
  }

  getOrderItemDetails(evt: any): void {
    this.orderItemsDetails = evt;
  }

  cancel(): void {
    this.close.emit();
    //this.router.navigate(['order']);
  }

  getProductList(): void {
    this.productService.getProducts().subscribe((data) => {
      if (data) {
        this.productList = data.result;
      }
    });
  }
}
