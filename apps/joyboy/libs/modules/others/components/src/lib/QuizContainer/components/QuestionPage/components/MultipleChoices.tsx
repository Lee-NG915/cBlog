'use client';

import { Checkbox, Stack, useBreakpoints } from '@castlery/fortress';
import { useEffect, useState } from 'react';

type ChoiceItem = { id: string; text: string; extraAction?: string };

const MultipleChoiceItem = ({
  choice,
  checked,
  onSelect,
}: {
  choice: ChoiceItem;
  checked: boolean;
  onSelect: (id: string, extraAction?: string) => void;
}) => {
  return (
    <Stack
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        padding: `${theme.spacing(3.5)} ${theme.spacing(2)}`,
        border: `1px solid ${theme.palette.brand.mono[300]}`,
        borderRadius: theme.spacing(2),
      })}
    >
      <Checkbox
        label={choice.text}
        value={choice.id}
        checked={checked}
        onChange={() => onSelect(choice.id, choice.extraAction)}
      />
    </Stack>
  );
};

const MultipleChoices = ({
  choices,
  value,
  onAnswer,
}: {
  choices: ChoiceItem[];
  value?: string;
  onAnswer: (answer: string) => void;
}) => {
  const { desktop } = useBreakpoints();
  const [selectedChoices, setSelectedChoices] = useState<string[]>(() => {
    if (value == null || value === '') return [];
    return value
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  });

  useEffect(() => {
    if (value == null || value === '') {
      setSelectedChoices([]);
    } else {
      setSelectedChoices(
        value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      );
    }
  }, [value]);

  useEffect(() => {
    onAnswer(selectedChoices.join(','));
  }, [selectedChoices]);

  const handleSelect = (id: string, extraAction?: string) => {
    const isIndependent = extraAction === 'set_independent';
    const isCurrentlySelected = selectedChoices.includes(id);

    if (isCurrentlySelected) {
      setSelectedChoices(selectedChoices.filter((choiceId) => choiceId !== id));
      return;
    }

    if (isIndependent) {
      setSelectedChoices([id]);
      return;
    }

    const independentIds = choices.filter((c) => c.extraAction === 'set_independent').map((c) => c.id);
    const withoutIndependent = selectedChoices.filter((choiceId) => !independentIds.includes(choiceId));
    setSelectedChoices([...withoutIndependent, id]);
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
        <MultipleChoiceItem
          key={index}
          choice={choice}
          checked={selectedChoices.includes(choice.id)}
          onSelect={handleSelect}
        />
      ))}
    </Stack>
  );
};

export { MultipleChoices };
