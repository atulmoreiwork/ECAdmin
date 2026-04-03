import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray';
export type BadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-badge',
  imports: [CommonModule],
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.css'
})
export class BadgeComponent {
  @Input() variant: BadgeVariant = 'primary';
  @Input() size: BadgeSize = 'md';
  @Input() rounded = true;
  @Input() icon?: string;

  get variantClasses(): string {
    const variants = {
      primary: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
      warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
      danger: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      info: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
      gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
    };
    return variants[this.variant] || variants.primary;
  }

  get sizeClasses(): string {
    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
      lg: 'px-4 py-2 text-base'
    };
    return sizes[this.size] || sizes.md;
  }

  get borderRadiusClass(): string {
    return this.rounded ? 'rounded-full' : 'rounded-md';
  }
}
