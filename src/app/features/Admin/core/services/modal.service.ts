import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export type ModalType =
  | 'createNsp'
  | 'createFacilitator'
  | 'editNsp'
  | 'editFacilitator'
  | 'createSession'
  | 'editSession'
  | null;

export type ModalComponent = {
  createSession?: (data: unknown) => void;
  updateSession?: (data: unknown) => void;
  // Add other component methods as needed
};

export interface ModalData<T = unknown> {
  type: string;
  data: T;
}

export interface ModalConfig {
  component: ModalComponent;
  type?: string;
  onOpen: (data?: unknown) => void | ModalData<unknown> | null;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly modalVisibleSubject = new BehaviorSubject<boolean>(false);
  private readonly modalTypeSubject = new BehaviorSubject<ModalType>(null);
  private readonly modalDataSubject = new BehaviorSubject<unknown>(null);
  private readonly modalRegistry = new Map<string, ModalConfig>();

  // Added for supporting modal communication
  public readonly modalClosed = new Subject<{ id: string; data: unknown }>();

  // Observable streams
  public modalVisible$: Observable<boolean> = this.modalVisibleSubject.asObservable();
  public modalType$: Observable<ModalType> = this.modalTypeSubject.asObservable();
  public modalData$: Observable<unknown> = this.modalDataSubject.asObservable();


  /**
   * Register a modal component
   */
  registerModal(id: string, config: ModalConfig): void {
    this.modalRegistry.set(id, config);
  }

  /**
   * Opens a modal with specified type and optional data
   */
  openModal(type: ModalType, data?: unknown): void {
    this.modalTypeSubject.next(type);
    this.modalDataSubject.next(data);
    this.modalVisibleSubject.next(true);

    // If modal is registered, call its onOpen method
    if (type && this.modalRegistry.has(type.toString())) {
      const modal = this.modalRegistry.get(type.toString());
      if (modal) {
        modal.onOpen(data);
      }
    }
  }

  /**
   * Closes the currently open modal
   */
  closeModal(): void {
    const currentType = this.modalTypeSubject.value;
    const currentData = this.modalDataSubject.value;

    this.modalVisibleSubject.next(false);

    // We delay clearing the type and data to allow animations to complete
    setTimeout(() => {
      this.modalTypeSubject.next(null);
      this.modalDataSubject.next(null);
    }, 300); // Match this to your animation duration

    // Emit modal closed event if type exists
    if (currentType) {
      this.modalClosed.next({ id: currentType, data: currentData });
    }
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
  getModalData<T = unknown>(): T | null {
    return this.modalDataSubject.value as T | null;
  }

  /**
   * Gets a registered modal configuration
   */
  getModal(type: ModalType): ModalConfig | undefined {
    if (!type) return undefined;
    return this.modalRegistry.get(type.toString());
  }
}
