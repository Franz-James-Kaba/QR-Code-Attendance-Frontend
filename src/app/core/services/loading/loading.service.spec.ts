import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show and hide general loading', (done) => {
    // Initially loading should be false
    service.loading$.subscribe(isLoading => {
      expect(isLoading).toBeFalse();
      done();
    });

    // Show loading
    service.show();
    service.loading$.subscribe(isLoading => {
      expect(isLoading).toBeTrue();
      
      // Hide loading
      service.hide();
      service.loading$.subscribe(isLoading => {
        expect(isLoading).toBeFalse();
        done();
      });
    });
  });

  it('should show and hide navigation loading', (done) => {
    // Initially loading should be false
    service.navigationLoading$.subscribe(isLoading => {
      expect(isLoading).toBeFalse();
      done();
    });

    // Show navigation loading
    service.showNavigationLoading();
    service.navigationLoading$.subscribe(isLoading => {
      expect(isLoading).toBeTrue();
      
      // Hide navigation loading
      service.hideNavigationLoading();
      service.navigationLoading$.subscribe(isLoading => {
        expect(isLoading).toBeFalse();
        done();
      });
    });
  });
});