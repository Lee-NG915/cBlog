'use client';

import { RadioButton, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { useState, useEffect } from 'react';

const ChoiceItem = ({
  text,
  selected = false,
  onSelect,
}: {
  text: string;
  selected: boolean;
  onSelect: () => void;
}) => {
  const { desktop } = useBreakpoints();
  return (
    <Stack
      onClick={onSelect}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: `${theme.spacing(3)} ${theme.spacing(6)} ${theme.spacing(3)} ${theme.spacing(2)}`,
        gap: theme.spacing(1),
        border: `1px solid ${theme.palette.brand.mono[300]}`,
        borderRadius: theme.spacing(2),
        cursor: 'pointer',
        '&:hover': {
          backgroundColor: theme.palette.brand.warmLinen[300],
        },
        ...(selected && {
          borderColor: theme.palette.brand.maroonVelvet[500],
        }),
      })}
    >
      <Stack
        sx={(theme) => ({
          minWidth: theme.spacing(9),
          minHeight: theme.spacing(9),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        })}
      >
        <Stack
          sx={(theme) => ({
            width: theme.spacing(4),
            height: theme.spacing(4),
            border: `1px solid ${theme.palette.brand.terracotta[500]}`,
            borderRadius: theme.spacing(4),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          {selected && (
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
      <Typography
        level="body2"
        sx={(theme) => ({
          color: theme.palette.brand.maroonVelvet[500],
          fontSize: '16px !important',
          ...(!desktop && {
            fontSize: '14px !important',
          }),
        })}
      >
        {text}
      </Typography>
    </Stack>
  );
};

const SingleChoices = ({
  choices,
  value,
  onAnswer,
}: {
  choices: { text: string }[];
  value?: string;
  onAnswer: (answer: string) => void;
}) => {
  const getIndexFromValue = (v: string | undefined) => {
    if (v == null || v === '') return null;
    const idx = choices.findIndex((c) => c.text === v);
    return idx >= 0 ? idx : null;
  };
  const [selectedChoice, setSelectedChoice] = useState<number | null>(() => getIndexFromValue(value));
  const { desktop } = useBreakpoints();

  useEffect(() => {
    setSelectedChoice(getIndexFromValue(value));
  }, [value]);

  const handleSelect = (index: number) => {
    setSelectedChoice(index);
    onAnswer(choices[index].text);
  };

  return (
    <Stack
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: theme.spacing(4),
        marginBottom: theme.spacing(8),
        ...(!desktop && {
          marginBottom: theme.spacing(6),
          gridTemplateColumns: 'repeat(1, 1fr)',
        }),
      })}
    >
      {choices.map((choice, index) => (
        <ChoiceItem
          key={index}
          text={choice.text}
          selected={selectedChoice === index}
          onSelect={() => handleSelect(index)}
        />
      ))}
    </Stack>
  );
};

export { SingleChoices };
