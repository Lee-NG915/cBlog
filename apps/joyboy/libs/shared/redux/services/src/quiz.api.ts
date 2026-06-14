import { api } from './api';

export const quizApi = api.injectEndpoints({
  endpoints: (builder) => ({
    postQuizResult: builder.mutation<
      unknown,
      { rawAnswers: { questionId: string; questionType: string; scale?: number; selectedOptionIds?: string[] }[] }
    >({
      async queryFn(payload, _api, extraOptions, baseQuery) {
        const { rawAnswers } = payload;
        const result = await baseQuery({
          url: '/api/v1/quiz/results',
          method: 'POST',
          body: { rawAnswers },
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data };
      },
    }),
    postQuizReward: builder.mutation<unknown, { quizId: string }>({
      async queryFn(payload, _api, extraOptions, baseQuery) {
        const { quizId } = payload;
        const result = await baseQuery({
          url: '/api/v1/quiz/rewards',
          method: 'POST',
          body: { quizId },
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data };
      },
    }),
  }),
});

export const { usePostQuizResultMutation, usePostQuizRewardMutation } = quizApi;
const { postQuizResult, postQuizReward } = quizApi.endpoints;
export { postQuizResult, postQuizReward };
