'use client';

import { Button, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { DetailProps, QuestionProps } from '../types';
import { useCallback, useEffect, useState } from 'react';
import { SelectStars } from './SelectStars';
import { Questionnaire } from './Questionnare';
import { SubmitSuccess } from './SubmitSuccess';
import { submitDeliveryReview } from '@castlery/modules-others-domain';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { AfterSubmitRender } from './AfterSubmitRender';
import { trackGeneralSubmitFormEvent } from '@castlery/modules-tracking-services';
import { EcEnv } from '@castlery/config';
import { logger } from '@castlery/observability/client';

type DetailItemProps = {
  title: string;
  description: string[];
};

const DetailItem = ({ title, description }: DetailItemProps) => {
  return (
    <Stack>
      <Typography level="subh3" sx={(theme) => ({ mb: theme.spacing(3) })}>
        {title.toLocaleUpperCase()}
      </Typography>
      {description.map((item, index) => (
        <Typography level="body2" key={index}>
          {item}
        </Typography>
      ))}
    </Stack>
  );
};

const DeliveryReviewDetail = ({ detail, token }: { detail: DetailProps; token: string }) => {
  const dispatch = useAppDispatch();
  const [selected, setSelected] = useState(0);
  const { desktop, md } = useBreakpoints();
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [afterSubmit, setAfterSubmit] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const getDefaultAnswers = (questions: QuestionProps[]) =>
    questions
      .filter((question) => question.type === 'select')
      .reduce((acc, cur) => {
        acc[cur.key] = true;
        return acc;
      }, {});

  const handleAnswersChange = useCallback(
    (answers: { [key: string]: string }) => {
      setAnswers(answers);
    },
    [setAnswers]
  );
  const handleSubmit = async () => {
    let realAnswers = {
      ...getDefaultAnswers(detail.questionnaire.questions),
      ...answers,
    };
    if (selected === 5) {
      realAnswers = {
        ...getDefaultAnswers(detail.questionnaire.questions),
      };
    }
    Object.keys(realAnswers).forEach((key) => {
      if (realAnswers[key] === 'true') {
        realAnswers[key] = true;
      }
      if (realAnswers[key] === 'false') {
        realAnswers[key] = false;
      }
    });

    try {
      setSubmitLoading(true);
      const data = {
        token,
        rating: selected,
        ...realAnswers,
      };
      const result = await dispatch(submitDeliveryReview(data)).unwrap();
      setAfterSubmit(true);
      dispatch(
        trackGeneralSubmitFormEvent({
          action: 'delivery_review submit',
          label: EcEnv.NEXT_PUBLIC_COUNTRY === 'AU' ? 'Google' : 'Trustpilot',
        })
      );
      setSubmitLoading(false);
    } catch (error) {
      setSubmitLoading(false);
      logger.error('Failed to submit delivery review', { error, reviewId: detail?.id });
    }
  };
  if (!detail) return null;
  if (afterSubmit) {
    return <AfterSubmitRender rating={selected} textValue={answers['customer_comment'] || ''} />;
  }
  if (!detail.status) {
    return <SubmitSuccess />;
  }
  return (
    <Stack
      sx={(theme) => ({
        width: '100%',
        padding: desktop
          ? `0 ${theme.spacing(15)} ${theme.spacing(30)} ${theme.spacing(15)}`
          : `${theme.spacing(0)} ${theme.spacing(6)} ${theme.spacing(10)} ${theme.spacing(6)}`,
      })}
    >
      <Stack sx={(theme) => ({ mb: selected !== 5 && selected !== 0 ? theme.spacing(10) : 0 })}>
        <Typography
          level="h3"
          sx={(theme) => ({
            mb: desktop ? theme.spacing(4) : theme.spacing(2),
          })}
        >
          Thank you for shopping with Castlery!
        </Typography>
        <Typography
          level="body1"
          sx={(theme) => ({
            mb: desktop ? theme.spacing(10) : theme.spacing(3),
            color: theme.palette.brand.mono[700],
          })}
        >
          We would love to hear about your delivery experience.
        </Typography>
        <Typography level="h4" sx={(theme) => ({ mb: theme.spacing(5) })}>
          {detail.questionnaire.title}
        </Typography>
        <Stack direction={desktop ? 'row' : 'column'} justifyContent={'space-between'}>
          <Stack direction={desktop ? 'row' : 'column'} gap={desktop ? 10 : 4}>
            <DetailItem title="Shipment number:" description={[detail.delivery_order_number]} />
            <DetailItem title="Delivery partner:" description={[detail.carrier_display_name]} />
            <DetailItem
              title="ITem(s) Delivered:"
              description={detail.products.map((product: any) => `${product.quantity} x ${product.product_name}`)}
            />
            <SelectStars onSelectChange={setSelected} />
          </Stack>
          {desktop && (
            <Button
              variant="solid"
              onClick={handleSubmit}
              loading={submitLoading}
              disabled={selected === 0}
              sx={{ ml: desktop ? '20px' : 0 }}
            >
              REVIEW
            </Button>
          )}
        </Stack>
      </Stack>
      {selected !== 0 && selected !== 5 && (
        <Questionnaire
          questions={detail.questionnaire.questions}
          onAnswersChange={handleAnswersChange}
          initialAnswers={answers}
        />
      )}
      {!desktop && (
        <Button
          variant="solid"
          sx={(theme) => ({ mt: selected !== 0 && selected !== 5 ? 0 : theme.spacing(8) })}
          onClick={handleSubmit}
          loading={submitLoading}
          disabled={selected === 0}
        >
          REVIEW
        </Button>
      )}
    </Stack>
  );
};

export { DeliveryReviewDetail };
