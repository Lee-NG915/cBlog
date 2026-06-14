export type PickerHeaderProps = {
  monthDate: Date;
  date: Date;
  changeYear(year: number): void;
  changeMonth(month: number): void;
  customHeaderCount: number;
  decreaseMonth(): void;
  increaseMonth(): void;
  nextYearButtonDisabled: boolean;
  prevMonthButtonDisabled: boolean;
};
export type DefaultHeaderProps = Partial<PickerHeaderProps>;
