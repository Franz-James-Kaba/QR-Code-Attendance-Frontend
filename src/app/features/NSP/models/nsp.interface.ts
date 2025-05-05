export interface CalendarDate {
  day: number;
  name: string;
  active: boolean;
  selectable: boolean;
}

interface SvgIcon {
  path: string;
  size: number;
  viewBox: string;
}

export interface SummaryCard {
  icon: SvgIcon;
  title: string;
  value: string;
  description: string;
}
