import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsersService } from '../../../services/users.service';
import { Router } from '@angular/router';
import { IUsers } from '../../../models/admin-users';

@Component({
  standalone: true,
  imports: [],
  selector: 'app-user-delete',
  templateUrl: './user-delete.component.html',
  styleUrl: './user-delete.component.css'
})
export class UserDeleteComponent implements OnInit {
  @Input() userId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();
 
  constructor(public userService: UsersService, public fb: FormBuilder, private router: Router) {  }

  ngOnInit(): void 
  { 

  } 

  confirmDelete(): void {
    if (!this.userId) return;

    this.userService.deleteUserById(this.userId).subscribe({
      next: (res: any) => {
        if (res.success) { 
          this.deleted.emit();
        } else {
          console.log('Failed to delete user: ' + res.message);
        }
      },
      error: (err: any) => {
        console.log('Delete error:', err);
        console.log('An error occurred while deleting the user.');
      }
    });
  }

  cancelDelete(): void {
    this.close.emit();
  }
}
