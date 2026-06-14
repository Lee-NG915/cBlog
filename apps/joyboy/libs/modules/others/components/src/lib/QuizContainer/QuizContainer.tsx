'use client';

import { useMemo, useState } from 'react';
import { idealVacationHomeConfiguration } from './configuration/ideal-vacation-home';
import { LandingPage } from './components/LandingPage/LandingPage';
import { QuestionPage } from './components/QuestionPage/QuestionPage';
import { Container } from '@castlery/fortress';
import { AfterSubmitPage } from './components/AfterSubmitPage/AfterSubmitPage';
import { ResultPage } from './components/ResultPage/ResultPage';
import { GeneralBreadcrumbs } from '@castlery/shared-components';
import { postQuizResult } from '@castlery/shared-redux-services';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useAppDispatch } from '@castlery/shared-redux-store';

interface RawAnswerType {
  questionId: string;
  questionType: string;
  scale?: number;
  selectedOptionIds?: string[];
}

type PersonalityResultKey = '1' | '2' | '3' | '4' | '5';
type QuizResult = {
  creditsSent?: boolean;
  personalityType?: string | number;
  quizId?: string;
};

const numberToPersonalityResult: Record<PersonalityResultKey, string> = {
  '1': 'pht',
  '2': 'pph',
  '3': 'is',
  '4': 'rr',
  '5': 'tgg',
};

const QUIZ_ID_EXPIRY_DAYS = 90;

const setQuizIdToLocalStorage = (quizId: string) => {
  const expiresAt = Date.now() + QUIZ_ID_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  makePersistenceHandles().idealVacationHomeQuizId.setItem(
    JSON.stringify({
      value: quizId,
      expiresAt,
    })
  );
};

const QuizContainer = ({ slug }: { slug: string }) => {
  const dispatch = useAppDispatch();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const [resultType, setResultType] = useState<string | undefined>(undefined);

  const [creditsSent, setCreditsSent] = useState(false);

  const [personalityTestResult, setPersonalityTestResult] = useState<PersonalityResultKey | ''>('');

  const quizConfiguration = useMemo(() => {
    switch (slug) {
      case 'ideal-vacation-home':
        return idealVacationHomeConfiguration;
      default:
        return [];
    }
  }, [slug]);

  const sendQuizResult = async (rawAnswers: RawAnswerType[]) => {
    try {
      const result = (await dispatch(postQuizResult.initiate({ rawAnswers })).unwrap()) as QuizResult;
      if (result.quizId) {
        setQuizIdToLocalStorage(result.quizId);
      }
      if (result.creditsSent) {
        setCreditsSent(true);
      }
      if (result.personalityType) {
        setPersonalityTestResult(String(result.personalityType) as PersonalityResultKey);
      }
      return result;
    } catch (error) {
      return null;
    }
  };

  const handleFuncCall = async (action: {
    type: string;
    payload: { index: number; type?: string; answers?: { [key: number]: string } };
  }) => {
    switch (action.type) {
      case 'goNext':
        setCurrentPageIndex(action.payload.index);
        break;
      case 'goPrevious':
        setCurrentPageIndex(action.payload.index);
        break;
      case 'submit':
        if (action.payload.answers) {
          const rawAnswers: RawAnswerType[] = [];
          const filterQuestionList = quizConfiguration.filter((config) => config.pageType === 'question-page');
          Object.keys(action.payload.answers || {}).forEach((key, index) => {
            const currentQuestion = filterQuestionList[index];
            const questionIdList = currentQuestion?.questionIdList;
            const selectedAnswer = action.payload.answers?.[currentQuestion.index];
            if (questionIdList && selectedAnswer) {
              if (currentQuestion.subType === 'rating-choice') {
                const splitAnswers = selectedAnswer.split(',');
                splitAnswers.forEach((answer, answerIndex) => {
                  rawAnswers.push({
                    questionId: questionIdList[answerIndex] || '',
                    questionType: currentQuestion.questionType || 'statement_pair',
                    scale: Number(answer),
                  });
                });
              }
              if (currentQuestion.subType === 'multiple-choice') {
                const splitAnswers = selectedAnswer.split(',');
                rawAnswers.push({
                  questionId: questionIdList[0] || '',
                  questionType: 'sustainability_multi',
                  selectedOptionIds: splitAnswers,
                });
              }
            }
          });
          await sendQuizResult(rawAnswers);
        }
        setCurrentPageIndex(action.payload.index);
        break;
      case 'goResult':
        if (personalityTestResult) {
          setResultType(numberToPersonalityResult[personalityTestResult]);
        }
        break;
      default:
        break;
    }
  };

  const totalQuestionCount = useMemo(() => {
    return idealVacationHomeConfiguration.filter((config) => config.pageType === 'question-page').length;
  }, [quizConfiguration]);

  const currentPage = useMemo(() => {
    const currentSubConfiguration = quizConfiguration.find((config) => config.index === currentPageIndex);
    let pageType = currentSubConfiguration?.pageType;
    if (currentPageIndex > totalQuestionCount) {
      pageType = 'after-submit-page';
    }
    if (resultType) {
      pageType = 'result-page';
    }
    if (currentSubConfiguration) {
      // return <ResultPage result="tgg" />;
      switch (pageType) {
        case 'landing-page':
          return <LandingPage currentConfiguration={currentSubConfiguration} onFuncCall={handleFuncCall} />;
        case 'question-page':
          return (
            <QuestionPage
              currentConfiguration={currentSubConfiguration}
              totalQuestionCount={totalQuestionCount}
              onFuncCall={handleFuncCall}
            />
          );
      }
    }
    if (pageType === 'result-page' || pageType === 'after-submit-page') {
      switch (pageType) {
        case 'after-submit-page':
          return <AfterSubmitPage onFuncCall={handleFuncCall} />;
        case 'result-page':
          return <ResultPage result={resultType as string} />;
        default:
          return null;
      }
    }
    return null;
  }, [quizConfiguration, currentPageIndex, resultType]);

  return (
    <Container disableGutters>
      <GeneralBreadcrumbs
        breadcrumbs={[
          {
            label: 'Find your ideal vacation home',
            link: '/quiz',
          },
        ]}
      />
      {currentPage}
    </Container>
  );
};

export { QuizContainer };
