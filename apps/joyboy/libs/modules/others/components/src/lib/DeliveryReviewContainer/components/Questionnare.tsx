'use client';

import { Radio, RadioGroup, Stack, Textarea, Typography, useBreakpoints } from '@castlery/fortress';
import { QuestionProps } from '../types';
import { useEffect, useRef, useState } from 'react';

const Questionnaire = ({
  questions,
  onAnswersChange,
  initialAnswers = {},
}: {
  questions: QuestionProps[];
  onAnswersChange: (answers: { [key: string]: string }) => void;
  initialAnswers?: { [key: string]: string };
}) => {
  const [textPlaceholder, setTextPlaceholder] = useState('');
  const [textKey, setTextKey] = useState('');

  // 直接使用 initialAnswers 作为状态源，避免重复状态
  const textQuestion = questions.find((question) => question.type === 'text');
  const textValue = initialAnswers[textQuestion?.key || ''] || '';
  const textAreaRef = useRef<HTMLDivElement>(null);

  const { desktop } = useBreakpoints();

  useEffect(() => {
    setTextPlaceholder(questions.find((question) => question.type === 'text')?.display || '');
    setTextKey(questions.find((question) => question.type === 'text')?.key || '');
  }, [questions]);

  useEffect(() => {
    if (textAreaRef.current) {
      const textarea = textAreaRef.current.querySelector('textarea');
      if (textarea) {
        textarea.setAttribute('maxlength', '500');
      }
    }
  }, [textValue]);

  return (
    <Stack
      sx={(theme) => ({
        borderTop: `1px solid ${theme.palette.brand.mono[300]}`,
        paddingTop: theme.spacing(10),
        gap: desktop ? theme.spacing(5) : 0,
      })}
      flexDirection={desktop ? 'row' : 'column'}
      justifyContent="space-between"
    >
      <Stack>
        {questions.map((question) => {
          if (question.type === 'select') {
            return (
              <Stack sx={(theme) => ({ mb: theme.spacing(6) })} key={question.key}>
                <Typography level="h4" sx={(theme) => ({ mb: theme.spacing(4) })} key={question.key}>
                  {question.display}
                </Typography>
                <RadioGroup
                  value={initialAnswers[question.key] || question.possible_answers[0].value}
                  onChange={(e) => {
                    const newAnswers = { ...initialAnswers, [question.key]: e.target.value };
                    onAnswersChange(newAnswers);
                  }}
                  sx={(theme) => ({
                    flexDirection: 'row',
                    gap: theme.spacing(6),
                    span: {
                      marginTop: '0 !important',
                    },
                  })}
                >
                  {question.possible_answers.map((answer: { display: string; value: string }) => (
                    <Radio key={answer.value} label={answer.display} value={answer.value}>
                      {answer.display}
                    </Radio>
                  ))}
                </RadioGroup>
              </Stack>
            );
          }
        })}
      </Stack>
      <Stack sx={{ flex: 1 }}>
        <Typography level="body2">Any other matters?</Typography>
        <Stack
          sx={(theme) => ({
            minWidth: {
              xs: '100%',
              sm: '400px',
              md: '400px',
              lg: '400px',
              xl: '400px',
            },
            padding: `${theme.spacing(3)} ${theme.spacing(4)}`,
          })}
        >
          <Textarea
            ref={textAreaRef}
            value={textValue}
            sx={(theme) => ({
              fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              '&::placeholder': {
                color: theme.palette.brand.maroonVelvet[200],
              },
              padding: '0 !important',
              fontSize: '18px',
              lineHeight: '1.5',
              color: theme.palette.brand.maroonVelvet[500],
              minHeight: '100px',
              overflowY: 'auto',
              resize: 'none',
              borderBottom: 'none',
              // 隐藏滚动条但保持滚动功能
              scrollbarWidth: 'none', // Firefox
              '&::-webkit-scrollbar': {
                display: 'none', // Chrome, Safari, Edge
              },
              '&:hover': {
                borderBottom: 'none',
              },
              '&:focus': {
                borderBottom: 'none',
              },
            })}
            placeholder={textPlaceholder}
            onChange={(e) => {
              const newAnswers = { ...initialAnswers, [textKey]: e.target.value };
              onAnswersChange(newAnswers);
            }}
            maxRows={5}
          />
          <Typography level="caption2" textAlign="right">
            {textValue.length}/500
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export { Questionnaire };
