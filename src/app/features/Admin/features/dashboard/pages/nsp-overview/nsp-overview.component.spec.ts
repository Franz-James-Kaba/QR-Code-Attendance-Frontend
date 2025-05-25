import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '@shared/components/notification/notification.service';
import { of, throwError } from 'rxjs';

import { ModalService } from '../../../../core/services/modal.service';
import { NSPViewModel } from '../../../../shared/models/nsp.model';
import { NspService } from '../../../../shared/services/nsp.service';

import { NspOverviewComponent } from './nsp-overview.component';

describe('NspOverviewComponent', () => {
  let component: NspOverviewComponent;
  let fixture: ComponentFixture<NspOverviewComponent>;
  let mockNspService: jest.Mocked<NspService>;
  let mockModalService: jest.Mocked<ModalService>;
  let mockNotificationService: jest.Mocked<NotificationService>;

  const mockNsps: NSPViewModel[] = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
    }
  ];

  beforeEach(async () => {
    mockNspService = {
      getAllNsps: jest.fn(),
      deleteNsp: jest.fn(),
      createNsp: jest.fn(),
      updateNsp: jest.fn()
    } as any;

    mockModalService = {
      openModal: jest.fn(),
      closeModal: jest.fn()
    } as any;

    mockNotificationService = {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [NspOverviewComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({}) }
        },
        { provide: NspService, useValue: mockNspService },
        { provide: ModalService, useValue: mockModalService },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NspOverviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initialization', () => {
    it('should load NSPs on init', fakeAsync(() => {
      mockNspService.getAllNsps.mockReturnValue(of({ data: mockNsps, total: 2 }));

      component.ngOnInit();
      tick();

      expect(mockNspService.getAllNsps).toHaveBeenCalledWith(0, 10);
      expect(component.nsps).toEqual(mockNsps);
      expect(component.hasRecords).toBe(true);
    }));

    it('should handle error when loading NSPs fails', fakeAsync(() => {
      const error = new Error('Failed to load');
      mockNspService.getAllNsps.mockReturnValue(throwError(() => error));

      component.ngOnInit();
      tick();

      expect(mockNotificationService.error).toHaveBeenCalled();
    }));
  });

  describe('search functionality', () => {
    beforeEach(() => {
      component.allNsps = mockNsps;
      component.nsps = [...mockNsps];
    });

    it('should filter NSPs based on search query', () => {
      component.searchQuery = 'john';
      component.onSearch();

      expect(component.nsps.length).toBe(1);
      expect(component.nsps[0].firstName).toBe('John');
    });

    it('should restore all NSPs when search query is empty', () => {
      component.searchQuery = '';
      component.onSearch();

      expect(component.nsps).toEqual(mockNsps);
    });
  });

  describe('NSP operations', () => {
    it('should open create NSP modal', () => {
      component.createNsp();
      expect(mockModalService.openModal).toHaveBeenCalledWith('createNsp');
    });

    it('should open edit NSP modal', () => {
      const nsp = mockNsps[0];
      component.editNsp(nsp);
      expect(mockModalService.openModal).toHaveBeenCalledWith('editNsp', nsp);
    });

    it('should handle NSP deletion', fakeAsync(() => {
      mockNspService.deleteNsp.mockReturnValue(of('success'));
      component.nspToDelete = mockNsps[0];

      component.executeDelete();
      tick();

      expect(mockNspService.deleteNsp).toHaveBeenCalledWith(1);
      expect(mockNotificationService.success).toHaveBeenCalled();
      expect(component.showDeleteModal).toBeFalsy();
    }));

    it('should handle NSP creation', fakeAsync(() => {
      const newNsp = { ...mockNsps[0], id: '' };
      mockNspService.createNsp.mockReturnValue(of('success'));

      component.handleNspFormSubmit(newNsp);
      tick();

      expect(mockNspService.createNsp).toHaveBeenCalled();
      expect(mockModalService.closeModal).toHaveBeenCalled();
      expect(mockNotificationService.success).toHaveBeenCalled();
    }));
  });

  describe('pagination', () => {
    it('should handle page changes', fakeAsync(() => {
      mockNspService.getAllNsps.mockReturnValue(of({ data: mockNsps, total: 2 }));

      component.onPageChange(1);
      tick();

      expect(mockNspService.getAllNsps).toHaveBeenCalledWith(1, 10);
    }));
  });
});
