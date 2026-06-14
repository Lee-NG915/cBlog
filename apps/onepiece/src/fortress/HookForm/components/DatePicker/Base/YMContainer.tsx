import React from 'react';
import CalendarContainer from './CalendarContainer';

interface YMContainerProps {
  showYear?: boolean;
  calendarClassName: string;
  children?: React.ReactNode | React.ReactNode[];
  calendarHeaderTitle?: string;
  calendarHeaderDesc?: string;
}
const YMContainer: React.FC<YMContainerProps> = ({
  calendarClassName,
  showYear,
  children,
  calendarHeaderTitle,
  calendarHeaderDesc,
}) => {
  return (
    <CalendarContainer
      calendarClassName={calendarClassName}
      calendarHeaderTitle={calendarHeaderTitle}
      calendarHeaderDesc={calendarHeaderDesc}
    >
      {showYear ? (Array.isArray(children) ? children[children.length - 1] : children) : children}
    </CalendarContainer>
  );
};

export default YMContainer;
