import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { RoleService } from '../../../services/role.service';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IRole } from '../../../models/admin-users';

@Component({
  selector: 'app-role-delete',
  standalone: true,
  imports: [],
  templateUrl: './role-delete.component.html',
  styleUrl: './role-delete.component.css'
})
export class RoleDeleteComponent implements OnInit{
@Input() roleId!: number;
  @Output() close = new EventEmitter<void>();
  @Output() deleted = new EventEmitter<void>();
 
  constructor(public roleService: RoleService, public fb: FormBuilder, private router: Router) {  }

  ngOnInit(): void 
  { 

  } 

  confirmDelete(): void {
    if (!this.roleId) return;
    this.roleService.deleteRoleById(this.roleId).subscribe({
      next: (res: any) => {
        if (res.success) { 
          this.deleted.emit();
        } else {
          console.log('Failed to delete role: ' + res.message);
        }
      },
      error: (err: any) => {
        console.log('Delete error:', err);
        console.log('An error occurred while deleting the role.');
      }
    });
  }

  cancelDelete(): void {
    this.close.emit();
  }
}
