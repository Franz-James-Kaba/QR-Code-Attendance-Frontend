import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ChartComponent } from '@shared/components/chart/chart.component';
import { ChartDataSet, ChartOptions } from '@shared/models/chart.model';

@Component({
  selector: 'facilitator-root',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  templateUrl: './facilitator.component.html'
})
export class FacilitatorComponent implements OnInit {
  title = 'facilitator-frontend';

  // Chart data for NSPs and Facilitators distribution
  pieChartData: ChartDataSet | null = null;

  // Chart options
  pieChartOptions: ChartOptions = {
    height: 300,
    responsive: true,
    tooltipEnabled: true,
    showTimeRangeSelector: false
  };

  ngOnInit(): void {
    // Initialize pie chart data
    this.loadPieChartData();
  }

  loadPieChartData(): void {
    // Sample data for NSPs and Facilitators
    this.pieChartData = {
      data: [
        { label: 'NSPs', values: [250] },
        { label: 'Facilitators', values: [42] },
      ],
      series: [
        { name: 'NSPs', color: '#3b82f6' }, // blue color
        { name: 'Facilitators', color: '#8b5cf6' }, // purple color
      ],
      showLegend: true
    };
  }
}
