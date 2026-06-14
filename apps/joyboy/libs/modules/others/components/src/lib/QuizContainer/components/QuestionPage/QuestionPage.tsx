'use client';

import { Button, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { IdealVacationHomeConfiguration } from '../../configuration/ideal-vacation-home';
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FortressImage } from '@castlery/shared-components';
import { SingleChoices } from './components/SingleChoices';
import { RatingChoices } from './components/RatingChoices';
import { MultipleChoices } from './components/MultipleChoices';

const ProgressBar = ({ currentIndex, totalIndex }: { currentIndex: number; totalIndex: number }) => {
  const progress = useMemo(() => {
    return `${((currentIndex / totalIndex) * 100).toFixed(0)}%`;
  }, [currentIndex, totalIndex]);
  const { desktop } = useBreakpoints();
  return (
    <Stack
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing(3),
        marginBottom: theme.spacing(8),
        ...(!desktop && {
          marginBottom: theme.spacing(6),
        }),
      })}
    >
      <Stack
        sx={(theme) => ({
          position: 'relative',
          flex: 1,
          height: '8px',
          backgroundColor: theme.palette.brand.terracotta[100],
          borderRadius: theme.spacing(2),
        })}
      >
        <Stack
          sx={(theme) => ({
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            backgroundColor: theme.palette.brand.terracotta[500],
            borderRadius: theme.spacing(2),
            width: progress,
          })}
        />
      </Stack>
      <Typography>{progress}</Typography>
    </Stack>
  );
};

const ActionBar = ({
  currentConfiguration,
  onFuncCall,
  disableNext,
}: {
  currentConfiguration: IdealVacationHomeConfiguration;
  onFuncCall: (action: { type: string; payload: { index: number } }) => void;
  disableNext: boolean;
}) => {
  const { desktop } = useBreakpoints();
  return (
    <Stack
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        gap: theme.spacing(3),
        alignItems: 'center',
      })}
    >
      {currentConfiguration?.previousAction && (
        <Button
          variant="outlined"
          sx={(theme) => ({
            backgroundColor: currentConfiguration?.previousAction?.styles.backgroundColor,
            color: currentConfiguration?.previousAction?.styles.color,
            fontSize: `${
              currentConfiguration?.previousAction?.styles.fontSize[desktop ? 'desktop' : 'mobile']
            } !important`,
          })}
          onClick={() => {
            onFuncCall({
              type: currentConfiguration?.previousAction?.action.type || '',
              payload: {
                index: currentConfiguration?.previousAction?.action.payload.index || 0,
              },
            });
          }}
        >
          {currentConfiguration?.previousAction?.text}
        </Button>
      )}
      {currentConfiguration?.nextAction && (
        <Button
          sx={(theme) => ({
            backgroundColor: currentConfiguration.nextAction.styles.backgroundColor,
            color: currentConfiguration.nextAction.styles.color,
            fontSize: `${currentConfiguration.nextAction.styles.fontSize[desktop ? 'desktop' : 'mobile']} !important`,
          })}
          onClick={() => {
            onFuncCall({
              type: currentConfiguration.nextAction.action.type,
              payload: {
                index: currentConfiguration.nextAction.action.payload.index,
              },
            });
          }}
          disabled={disableNext}
        >
          {currentConfiguration.nextAction.text}
        </Button>
      )}
    </Stack>
  );
};

const QuestionPage = ({
  currentConfiguration,
  totalQuestionCount,
  onFuncCall,
}: {
  currentConfiguration: IdealVacationHomeConfiguration;
  totalQuestionCount: number;
  onFuncCall: (action: { type: string; payload: { index: number; answers?: { [key: number]: string } } }) => void;
}) => {
  const [currentSubConfiguration, setCurrentSubConfiguration] = useState<IdealVacationHomeConfiguration>();

  const [alreadyAnsweredQuestionCount, setAlreadyAnsweredQuestionCount] = useState(0);

  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const questionPageRef = useRef<HTMLDivElement>(null);
  const prevQuestionIndexRef = useRef<number | undefined>(currentConfiguration?.index);

  const { desktop, tablet, mobile } = useBreakpoints();

  // 题目切换后再滚动到顶部，避免被 React 重绘覆盖
  useEffect(() => {
    const currentIndex = currentConfiguration?.index;
    if (!desktop && currentIndex != null && prevQuestionIndexRef.current !== currentIndex) {
      prevQuestionIndexRef.current = currentIndex;
      const scrollToTop = () => {
        questionPageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };
      requestAnimationFrame(() => requestAnimationFrame(scrollToTop));
    }
  }, [currentConfiguration?.index, desktop]);

  const currentAnswer = answers[currentConfiguration?.index ?? -1];

  const QuestionRendered = useCallback(() => {
    if (!currentConfiguration) return null;
    const choiceProps = {
      onAnswer: (answer: string) => setAnswers((prev) => ({ ...prev, [currentConfiguration.index]: answer })),
    };
    switch (currentConfiguration.subType) {
      case 'single-choice':
        return (
          <SingleChoices
            choices={(currentConfiguration.choices || []).map((c) => ({ text: c?.text ?? '' }))}
            value={currentAnswer}
            {...choiceProps}
          />
        );
      case 'rating-choice':
        return (
          <RatingChoices
            choices={(currentConfiguration.choices || []).map((c) => ({
              lowest: c?.lowest,
              low: c?.low,
              mid: c?.mid,
              high: c?.high,
              highest: c?.highest,
            }))}
            value={currentAnswer}
            {...choiceProps}
          />
        );
      case 'multiple-choice':
        return (
          <MultipleChoices
            choices={(currentConfiguration.choices || []).map((c) => ({
              id: c?.id ?? c?.text ?? '',
              text: c?.text ?? '',
              ...(c?.extraAction && { extraAction: c.extraAction }),
            }))}
            value={currentAnswer}
            {...choiceProps}
          />
        );
      default:
        return null;
    }
  }, [currentConfiguration, currentAnswer]);

  const illustration = useMemo(() => {
    if (desktop) {
      return currentConfiguration.illustration?.desktop;
    }
    if (tablet) {
      return currentConfiguration.illustration?.tablet;
    }
    if (mobile) {
      return currentConfiguration.illustration?.mobile;
    }
    return '';
  }, [desktop, tablet, mobile, currentConfiguration]);

  useEffect(() => {
    if (!currentConfiguration) {
      setCurrentSubConfiguration(currentConfiguration);
    }
  }, [currentConfiguration]);
  return (
    <Stack
      ref={questionPageRef}
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        gap: theme.spacing(15),
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.palette.brand.warmLinen[500],
        padding: `${theme.spacing(24)} ${theme.spacing(8)}`,
        ...(!desktop && {
          gap: theme.spacing(6),
          flexDirection: 'column',
          padding: `${theme.spacing(4)} ${theme.spacing(4)} ${theme.spacing(8)} ${theme.spacing(4)}`,
        }),
      })}
    >
      <Stack
        sx={{
          minWidth: '630px',
          ...(!desktop && {
            minWidth: '100%',
          }),
        }}
      >
        <FortressImage
          src={illustration || ''}
          alt="Question Page"
          objectFit="cover"
          imageWidth={desktop ? 630 : undefined}
          ratio={1.5}
        />
      </Stack>
      <Stack
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Stack
          sx={(theme) => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(3),
            marginBottom: theme.spacing(6),
            ...(!desktop && {
              gap: theme.spacing(2),
              marginBottom: theme.spacing(4),
            }),
          })}
        >
          <Typography
            level={currentConfiguration.title.level}
            sx={(theme) => ({
              color: currentConfiguration.title.styles.color,
              fontSize: `${currentConfiguration.title.styles.fontSize[desktop ? 'desktop' : 'mobile']} !important`,
            })}
          >
            {currentConfiguration.title.text}
          </Typography>
          {currentConfiguration?.tips && (
            <Typography
              level="body1"
              sx={(theme) => ({
                color: theme.palette.brand.maroonVelvet[500],
                fontSize: '18px !important',
                fontWeight: 'bold',
                textAlign: currentConfiguration?.tips?.position || 'center',
                ...(!desktop && {
                  fontSize: '16px !important',
                  textAlign: 'left',
                }),
              })}
            >
              {currentConfiguration.tips.text}
            </Typography>
          )}
          {currentConfiguration?.description && (
            <Typography
              level={currentConfiguration?.description?.level}
              sx={(theme) => ({
                color: currentConfiguration.description?.styles?.color,
                fontSize: `${
                  currentConfiguration.description?.styles?.fontSize[desktop ? 'desktop' : 'mobile']
                } !important`,
              })}
            >
              {currentConfiguration.description.text}
            </Typography>
          )}
        </Stack>
        <QuestionRendered />
        <ProgressBar currentIndex={alreadyAnsweredQuestionCount} totalIndex={totalQuestionCount - 1} />
        <ActionBar
          currentConfiguration={currentConfiguration}
          disableNext={answers[currentConfiguration.index] === undefined || answers[currentConfiguration.index] === ''}
          onFuncCall={(action) => {
            if (action.type === 'goNext') {
              setAlreadyAnsweredQuestionCount((prev) => prev + 1);
            }
            if (action.type === 'goPrevious') {
              const tempAnswers = { ...answers };
              delete tempAnswers[currentConfiguration.index];
              // if (currentConfiguration.index - 1) {
              //   delete tempAnswers[currentConfiguration.index - 1];
              // }
              setAnswers(tempAnswers);
              setAlreadyAnsweredQuestionCount((prev) => prev - 1);
            }
            if (action.type === 'submit') {
              onFuncCall({
                type: action.type,
                payload: {
                  index: action.payload.index,
                  answers: answers,
                },
              });
              if (!desktop) {
                const scrollToTop = () => {
                  questionPageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  document.documentElement.scrollTop = 0;
                  document.body.scrollTop = 0;
                };
                requestAnimationFrame(() => requestAnimationFrame(scrollToTop));
              }
              return;
            }
            onFuncCall(action);
          }}
        />
      </Stack>
    </Stack>
  );
};

export { QuestionPage };
