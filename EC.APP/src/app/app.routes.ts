import { Routes } from '@angular/router';
import { AuthGuard } from './interceptors/auth.guard';
import { MainLayoutComponent } from './shared/layout/main.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./core/login/login').then((m) => m.Login),
  },
  {
    path: '', redirectTo: 'login', pathMatch: 'full',
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'user/roles',
        loadComponent: () => import('./features/adminusers/roles/roles-list.component').then(m => m.RolesListComponent),
      },
      {
        path: 'user/adminusers',
        loadComponent: () => import('./features/adminusers/users/users-list.component').then(m => m.UsersListComponent),
      },
      {
        path: 'user/adminuserimports',
        loadComponent: () => import('./features/adminusers/imports/users-imports.component').then(m => m.UsersImportsComponent),
      },
      {
        path: 'customer',
        loadComponent: () => import('./features/customer/customer-list/customer-list.component').then((m) => m.CustomerListComponent)
      },
      {
        path: 'customer/customeraddedit/:id',
        loadComponent: () => import('./features/customer/customer-add-edit/customer-add-edit.component').then(m => m.CustomerAddEditComponent),
      },
      {
        path: 'category',
        loadComponent: () => import('./features/category/category-list/category-list.component').then((m) => m.CategoryListComponent)
      },
      {
        path: 'category/categoryaddedit/:id',
        loadComponent: () => import('./features/category/category-add-edit/category-add-edit.component').then(m => m.CategoryAddEditComponent),
      },
      {
        path: 'product',
        loadComponent: () => import('./features/product/product-list/product-list.component').then((m) => m.ProductListComponent)
      },
      {
        path: 'product/productaddedit/:id',
        loadComponent: () => import('./features/product/add-edit-product/add-edit-product.component').then(m => m.AddEditProductComponent),
      },
      {
        path: 'order',
        loadComponent: () => import('./features/order/order-list/order-list.component').then((m) => m.OrderListComponent)
      },
      {
        path: 'order/orderaddedit/:id',
        loadComponent: () => import('./features/order/order-add-edit/order-add-edit.component').then(m => m.OrderAddEditComponent),
      },
      {
        path: 'product/addedit/:id',
        loadComponent: () => import('./features/product/product-form/product-form').then((m) => m.ProductFormComponent)
      },
      {
        path: 'tenants',
        loadComponent: () => import('./features/tenant/tenant-list/tenant-list').then((m) => m.TenantList)
      },
      {
        path: 'settings',
        loadComponent: () => import('./features/setting/setting').then((m) => m.Setting)
      }
    ]
  },
  {
    path: '**', redirectTo: 'login',
  },
];
