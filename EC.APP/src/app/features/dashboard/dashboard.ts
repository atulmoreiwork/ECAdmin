import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { ProductService } from '../../services/product.service';
import { UsersService } from '../../services/users.service';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeProducts: number;
}

interface StatusBar {
  label: string;
  value: number;
  percent: number;
  colorClass: string;
}

interface RevenuePoint {
  label: string;
  amount: number;
  percent: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  isLoading = false;
  hasError = false;

  stats: DashboardStats = {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeProducts: 0
  };

  recentOrders: any[] = [];
  topProducts: any[] = [];
  statusBars: StatusBar[] = [];
  revenueSeries: RevenuePoint[] = [];
  totalRevenueInSeries = 0;

  constructor(
    private usersService: UsersService,
    private orderService: OrderService,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.hasError = false;

    const usersRequest = {
      Filter: [{ colId: 'userid', name: 'userid', value: '', type: 'num' }],
      PageNumber: 0,
      PageSize: 0
    };

    const ordersRequest = {
      Filter: [{ colId: 'orderid', name: 'orderid', value: '', type: 'num' }],
      PageNumber: 0,
      PageSize: 0
    };

    const productsRequest = {
      Filter: [{ colId: 'productid', name: 'productid', value: '', type: 'num' }],
      PageNumber: 0,
      PageSize: 0
    };

    forkJoin({
      users: this.usersService.getUsers(usersRequest).pipe(catchError(() => of(null))),
      orders: this.orderService.getAllOrders(ordersRequest).pipe(catchError(() => of(null))),
      products: this.productService.getAllProducts(productsRequest).pipe(catchError(() => of(null)))
    })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(({ users, orders, products }) => {
        const userRows = this.getResultRows(users);
        const orderRows = this.getResultRows(orders);
        const productRows = this.getResultRows(products);

        this.stats.totalUsers = this.getTotalItems(users, userRows.length);
        this.stats.totalOrders = this.getTotalItems(orders, orderRows.length);
        this.stats.totalRevenue = orderRows.reduce(
          (sum, row) => sum + this.toNumber(row?.totalAmount),
          0
        );
        this.stats.activeProducts = productRows.filter(
          (product) => (product?.status || '').toLowerCase() === 'active'
        ).length;

        this.topProducts = productRows
          .slice()
          .sort((a, b) => this.toNumber(b?.price) - this.toNumber(a?.price))
          .slice(0, 5);

        this.recentOrders = orderRows
          .slice()
          .sort((a, b) => {
            const first = this.toTime(a?.createdOn);
            const second = this.toTime(b?.createdOn);
            if (first === second) {
              return this.toNumber(b?.orderId) - this.toNumber(a?.orderId);
            }
            return second - first;
          })
          .slice(0, 6);

        this.statusBars = this.buildStatusBars(orderRows);
        this.revenueSeries = this.buildRevenueSeries(orderRows);
        this.totalRevenueInSeries = this.revenueSeries.reduce((sum, point) => sum + point.amount, 0);
        this.hasError = !users?.success || !orders?.success || !products?.success;
        this.isLoading = false
        this.cdr.detectChanges();
      });
  }

  getOrderStatusClass(status: string): string {
    const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ';
    switch ((status || '').toLowerCase()) {
      case 'paid':
      case 'delivered':
        return `${base}bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900`;
      case 'pending':
      case 'placed':
      case 'processing':
        return `${base}bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900`;
      case 'shipped':
        return `${base}bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900`;
      case 'cancelled':
      case 'canceled':
      case 'refunded':
        return `${base}bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900`;
      default:
        return `${base}bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600`;
    }
  }

  private buildStatusBars(orderRows: any[]): StatusBar[] {
    const statusCount = new Map<string, number>();

    for (const order of orderRows) {
      const status = (order?.status || 'Unknown').toString();
      statusCount.set(status, (statusCount.get(status) || 0) + 1);
    }

    const items = Array.from(statusCount.entries())
      .map(([label, value], index) => ({
        label,
        value,
        colorClass: this.getBarColorClass(index)
      }))
      .sort((a, b) => b.value - a.value);

    const maxValue = Math.max(...items.map((x) => x.value), 0);
    return items.map((item) => ({
      ...item,
      percent: maxValue > 0 ? Math.max((item.value / maxValue) * 100, 8) : 0
    }));
  }

  private getBarColorClass(index: number): string {
    const classes = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-gray-500'
    ];
    return classes[index % classes.length];
  }

  private buildRevenueSeries(orderRows: any[]): RevenuePoint[] {
    const monthMap = new Map<string, number>();
    const now = new Date();
    const monthKeys: string[] = [];

    for (let i = 5; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      monthKeys.push(key);
      monthMap.set(key, 0);
    }

    for (const order of orderRows) {
      const amount = this.toNumber(order?.totalAmount);
      const createdTime = this.toTime(order?.createdOn);

      if (!createdTime || amount <= 0) {
        continue;
      }

      const dt = new Date(createdTime);
      const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
      if (monthMap.has(key)) {
        monthMap.set(key, (monthMap.get(key) || 0) + amount);
      }
    }

    const points = monthKeys.map((key) => {
      const [year, month] = key.split('-');
      const date = new Date(Number(year), Number(month) - 1, 1);
      return {
        label: date.toLocaleString('en-US', { month: 'short' }),
        amount: monthMap.get(key) || 0,
        percent: 0
      };
    });

    const max = Math.max(...points.map((point) => point.amount), 0);
    return points.map((point) => ({
      ...point,
      percent: max > 0 ? Math.max((point.amount / max) * 100, 8) : 0
    }));
  }

  private getResultRows(response: any): any[] {
    if (response?.success && Array.isArray(response?.result?.data)) {
      return response.result.data;
    }
    return [];
  }

  private getTotalItems(response: any, fallback: number): number {
    const totalItems = this.toNumber(response?.result?.totalItems);
    return totalItems > 0 ? totalItems : fallback;
  }

  private toNumber(value: any): number {
    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/[^0-9.-]/g, ''));
      return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
  }

  private toTime(value: any): number {
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
