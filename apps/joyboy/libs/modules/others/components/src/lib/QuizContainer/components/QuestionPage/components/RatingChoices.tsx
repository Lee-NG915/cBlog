'use client';

import { Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { useEffect, useState } from 'react';

const RatingItem = ({
  choice,
  selectedValue,
  onSelected,
}: {
  choice: {
    lowest?: string;
    highest?: string;
    low?: string;
    mid?: string;
    high?: string;
  };
  selectedValue?: string;
  onSelected: (index: string) => void;
}) => {
  const { desktop } = useBreakpoints();
  const [selectedRating, setSelectedRating] = useState<number>(() => {
    if (selectedValue == null || selectedValue === '') return -1;
    const n = parseInt(selectedValue, 10);
    return Number.isNaN(n) ? -1 : n;
  });

  useEffect(() => {
    if (selectedValue == null || selectedValue === '') {
      setSelectedRating(-1);
    } else {
      const n = parseInt(selectedValue, 10);
      setSelectedRating(Number.isNaN(n) ? -1 : n);
    }
  }, [selectedValue]);

  const handleSelectRating = (index: number) => {
    setSelectedRating(index);
    onSelected(index.toString());
  };

  const [ratingWidth, setRatingWidth] = useState<{
    desktop: number;
    mobile: number;
  }>({
    desktop: 200,
    mobile: 142,
  });
  useEffect(() => {
    const availableKeys = Object.keys(choice).filter((key) => choice[key as keyof typeof choice]);
    if (availableKeys.length > 2) {
      setRatingWidth({
        desktop: 57,
        mobile: 46,
      });
    } else {
      setRatingWidth({
        desktop: 200,
        mobile: 142,
      });
    }
  }, [choice]);

  return (
    <Stack>
      <Stack
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: theme.spacing(3),
        })}
      >
        {Object.entries(choice).map(([key, value], index, entries) => {
          const isLast = index === entries.length - 1;
          return (
            <Typography
              key={key}
              sx={(theme) => ({
                color: theme.palette.brand.mono[700],
                fontSize: '14px !important',
                maxWidth: `${ratingWidth.desktop}px`,
                ...(!desktop && {
                  fontSize: '12px !important',
                  maxWidth: `${ratingWidth.mobile}px`,
                }),
                ...(isLast && { textAlign: 'right' }),
              })}
            >
              {value}
            </Typography>
          );
        })}
      </Stack>
      <Stack
        sx={(theme) => ({
          width: '100%',
          padding: `${theme.spacing(2)} ${theme.spacing(5)}`,
          backgroundColor: theme.palette.brand.warmLinen[200],
          borderRadius: theme.spacing(2),
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          ...(!desktop && {
            padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
          }),
        })}
      >
        {[...Array(5)].map((_, index) => (
          <Stack
            key={index}
            sx={(theme) => ({
              width: theme.spacing(9),
              height: theme.spacing(9),
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            })}
            onClick={() => handleSelectRating(index + 1)}
          >
            <Stack
              sx={(theme) => ({
                width: theme.spacing(4),
                height: theme.spacing(4),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme.spacing(4),
                border: `1px solid ${theme.palette.brand.terracotta[500]}`,
              })}
            >
              {selectedRating - 1 === index && (
                <Stack
                  sx={(theme) => ({
                    width: theme.spacing(2),
                    height: theme.spacing(2),
                    backgroundColor: theme.palette.brand.terracotta[500],
                    borderRadius: theme.spacing(2),
                  })}
                />
              )}
            </Stack>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
};

const RatingChoices = ({
  choices,
  value,
  onAnswer,
}: {
  choices: {
    lowest?: string;
    highest?: string;
    low?: string;
    mid?: string;
    high?: string;
  }[];
  value?: string;
  onAnswer: (answer: string) => void;
}) => {
  const { desktop } = useBreakpoints();
  const valueParts = value != null && value !== '' ? value.split(',') : [];
  const [tempSelectedRating, setTempSelectedRating] = useState<{ [key: number]: string }>(() => {
    const initial: { [key: number]: string } = {};
    valueParts.forEach((part, i) => {
      initial[i] = part.trim();
    });
    return initial;
  });

  useEffect(() => {
    if (value == null || value === '') {
      setTempSelectedRating({});
      return;
    }
    const parts = value.split(',');
    const next: { [key: number]: string } = {};
    parts.forEach((part, i) => {
      next[i] = part.trim();
    });
    setTempSelectedRating(next);
  }, [value]);

  useEffect(() => {
    if (Object.keys(tempSelectedRating).length === choices.length) {
      onAnswer(Array.from({ length: choices.length }, (_, i) => tempSelectedRating[i] ?? '').join(','));
    }
  }, [tempSelectedRating, choices.length]);

  return (
    <Stack
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(6),
        marginBottom: theme.spacing(8),
        ...(!desktop && {
          marginBottom: theme.spacing(6),
          gap: theme.spacing(4),
        }),
      })}
    >
      {choices.map((choice, index) => (
        <RatingItem
          key={index}
          choice={choice}
          selectedValue={tempSelectedRating[index]}
          onSelected={(answer) => setTempSelectedRating((prev) => ({ ...prev, [index]: answer }))}
        />
      ))}
    </Stack>
  );
};

export { RatingChoices };
