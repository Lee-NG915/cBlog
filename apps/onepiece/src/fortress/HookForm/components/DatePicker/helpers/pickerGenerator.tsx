import { RenderMonthContent, CustomInput } from '../Base';
import React from 'react';

type PickerType = 'date' | 'dateTime' | 'month' | 'year'; //'yearMonth' 拆成year和month

type PickerGeneratorPara = {
  type: PickerType;
  format: string; //"yyyy-MM-DD" | "yyyy-MM-DD HH:mm:ss" | "yyyy-MM"|...
};
export type BasePickerGenerator = {
  getPicker(): {};
  getYMMonthPicker(): {};
};

class PickerGenerator implements BasePickerGenerator {
  private readonly type: PickerType;
  private format: string;
  private calendarClassName: string;
  constructor({ type, format }: Partial<PickerGeneratorPara>) {
    this.type = type || 'date';
    this.format = format || this.formatter(this.type);
    this.calendarClassName = `dp__castlery_calendar`;
  }

  private monthContent = (month: number, shortMonth: string) => <RenderMonthContent shortMonth={shortMonth} />;

  private getTypePicker() {
    const obj = {
      date: 'showFullMonthYearPicker',
      dateTime: 'showTimeSelect',
      month: 'showMonthYearPicker',
      year: 'showYearPicker',
    };
    return obj[this.type];
  }
  private formatter(type: PickerType) {
    const obj = {
      date: 'MMM dd yyyy',
      dateTime: 'MMM dd yyyy HH:mm:ss',
      year: 'yyyy',
      month: 'MMM yyyy',
    };
    return obj[type];
  }
  private getCommonOptions() {
    const showTypePicker = this.getTypePicker();
    return {
      calendarClassName: this.calendarClassName,
      [showTypePicker]: true,
      closeOnScroll: false,
      dateFormat: this.format,
    };
  }
  private getSelfOptions() {
    const map = new Map([
      ['date', {}],
      ['dateTime', {}],
      ['year', {}],
      [
        'month',
        {
          showFourColumnMonthYearPicker: true,
        },
      ],
    ]);
    return map.get(this.type);
  }
  public getPicker() {
    return {
      ...this.getCommonOptions(),
      ...this.getSelfOptions(),
      customInput: <CustomInput />,
    };
  }

  public getYMMonthPicker() {
    return {
      ...this.getCommonOptions(),
      ...this.getSelfOptions(),
      shouldCloseOnSelect: true,
      renderMonthContent: this.monthContent,
    };
  }
}

export default PickerGenerator;
