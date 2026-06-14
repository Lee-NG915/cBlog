'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Stack } from '@castlery/fortress';

interface CountdownProps {
  deadline: string;
  className?: string;
  color?: 'white' | 'black';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function Countdown({ deadline, className, color = 'white' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(deadline).getTime() - new Date().getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
        setIsExpired(false);
      } else {
        setIsExpired(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  if (isExpired) {
    return (
      <Typography
        className={className}
        sx={{
          color: color === 'white' ? 'white' : 'inherit',
          fontSize: '16px',
          fontWeight: 'bold',
        }}
      >
        Sale Ended
      </Typography>
    );
  }

  return (
    <Stack
      direction="row"
      spacing={2}
      className={className}
      sx={{
        color: color === 'white' ? 'white' : 'inherit',
        alignItems: 'center',
      }}
    >
      <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>Sale ends in:</Typography>
      <Stack direction="row" spacing={1}>
        {timeLeft.days > 0 && <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>{timeLeft.days}d</Typography>}
        <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
          {String(timeLeft.hours).padStart(2, '0')}h
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
          {String(timeLeft.minutes).padStart(2, '0')}m
        </Typography>
        <Typography sx={{ fontSize: '16px', fontWeight: 'bold' }}>
          {String(timeLeft.seconds).padStart(2, '0')}s
        </Typography>
      </Stack>
    </Stack>
  );
}
