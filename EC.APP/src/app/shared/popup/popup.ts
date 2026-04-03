import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { PopupButton, PopupConfig } from '../../models/popupconfig';

@Component({
  selector: 'app-popup',
  imports: [CommonModule],
  templateUrl: './popup.html',
  styleUrl: './popup.css'
})
export class Popup {
  @Input() config!: PopupConfig;
  @Output() closeEvent = new EventEmitter<void>();
  @Output() buttonClick = new EventEmitter<string>();
  
  formInvalid: boolean = true;

  private bodyClassAdded = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscribeToFormChanges();
  }

  ngDoCheck(): void {
    // Track config.isShowPopup changes manually
    if (this.config.isShowPopup && !this.bodyClassAdded) {
      document.body.classList.add('overflow-hidden');
      this.bodyClassAdded = true;
    } else if (!this.config.isShowPopup && this.bodyClassAdded) {
      document.body.classList.remove('overflow-hidden');
      this.bodyClassAdded = false;
    }
  }

   private subscribeToFormChanges(): void {
    if (this.config.formGroup) {
      this.formInvalid = this.config.formGroup.invalid;

      this.config.formGroup.valueChanges.subscribe(() => {
        this.formInvalid = this.config.formGroup?.invalid ?? true;
        this.cdr.detectChanges();
      });
    }
  }

  ngAfterContentChecked(): void {
    this.cdr.detectChanges(); 
  }

  closePopup(): void {
    this.config.isShowPopup = false;
    this.closeEvent.emit();
  }

  onButtonClick(btn: PopupButton): void {
    if (btn.disabled) return;

    if (btn.action === 'close') {
      this.closePopup();
    } else if (btn.action === 'submit') {
      this.config.formGroup?.markAllAsTouched();
      this.buttonClick.emit('submit');
    } else {
      this.buttonClick.emit(btn.emitEventName || btn.label);
    }
  }
}
