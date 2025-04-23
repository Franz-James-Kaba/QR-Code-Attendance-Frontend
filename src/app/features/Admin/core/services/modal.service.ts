import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ModalType = 'createNsp' | 'createFacilitator' | 'editNsp' | 'editFacilitator' | null;

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private readonly modalVisibleSubject = new BehaviorSubject<boolean>(false);
  private readonly modalTypeSubject = new BehaviorSubject<ModalType>(null);
  private readonly modalDataSubject = new BehaviorSubject<any>(null);

  // Observable streams
  public modalVisible$: Observable<boolean> = this.modalVisibleSubject.asObservable();
  public modalType$: Observable<ModalType> = this.modalTypeSubject.asObservable();
  public modalData$: Observable<any> = this.modalDataSubject.asObservable();

  constructor() { }

  /**
   * Opens a modal with specified type and optional data
   */
  openModal(type: ModalType, data?: any): void {
    this.modalTypeSubject.next(type);
    this.modalDataSubject.next(data);
    this.modalVisibleSubject.next(true);
  }

  /**
   * Closes the currently open modal
   */
  closeModal(): void {
    this.modalVisibleSubject.next(false);
    // We delay clearing the type and data to allow animations to complete
    setTimeout(() => {
      this.modalTypeSubject.next(null);
      this.modalDataSubject.next(null);
    }, 300); // Match this to your animation duration
  }

  /**
   * Gets the current visibility state
   */
  isModalVisible(): boolean {
    return this.modalVisibleSubject.value;
  }

  /**
   * Gets the current modal type
   */
  getModalType(): ModalType {
    return this.modalTypeSubject.value;
  }

  /**
   * Gets the current modal data
   */
  getModalData(): any {
    return this.modalDataSubject.value;
  }
}
