import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AverageTimeResponse } from '@app/features/NSP/models/nsp.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly API_BASE_PATH = '/api/metrics';

  constructor(private http: HttpClient) {}

  private getAverageTimeData(endpoint: string, startDate?: string, endDate?: string): Observable<AverageTimeResponse> {
    let params = new HttpParams();

    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    return this.http.get<AverageTimeResponse>(`${this.API_BASE_PATH}/${endpoint}`, { params });
  }

  private getAverageCheckInData(startDate?: string, endDate?: string): Observable<AverageTimeResponse> {
    return this.getAverageTimeData('average-check-in-time', startDate, endDate);
  }

  private getAverageCheckOutData(startDate?: string, endDate?: string): Observable<AverageTimeResponse> {
    return this.getAverageTimeData('average-check-out-time', startDate, endDate);
  }

  public getAttendanceSummaryData() {
    
  }
}
