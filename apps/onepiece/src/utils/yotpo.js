import ApiClient from 'helpers/ApiClient';
import dayjs from 'dayjs';

/**
 * Readme: https://castlery.atlassian.net/wiki/x/8oGEog
 */
// https://loyaltyapi.yotpo.com/reference/fetch-customer-details

export const redeemYotpoPoints = (user, redemptionOptionId) => {
  const client = new ApiClient();

  return new Promise((resolve, reject) => {
    client
      .post(`/yotpo/redemptions`, {
        auth: 'strict',
        data: {
          customer_email: user?.email,
          redemption_option_id: redemptionOptionId,
        },
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getYotpoRedemptionOptions = (user) => {
  const email = window?.encodeURIComponent(user?.email);
  const client = new ApiClient();
  return new Promise((resolve, reject) => {
    client
      .get(`/yotpo/redemption_options?customer_email=${email}`, {
        auth: 'strict',
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getYotpoActiveCampaigns = (user, withStatus = false) => {
  if (!user) return Promise.resolve({ data: [] });
  const client = new ApiClient();
  return new Promise((resolve, reject) => {
    client
      .get(`/yotpo/campaigns`, {
        auth: 'strict',
        params: {
          with_status: withStatus,
          customer_email: user.email,
          customer_id: user.id,
        },
      })
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const beforeTriggerYotpoAction = (actions, actionName) => {
  if (!Array.isArray(actions) || actions.length <= 0) {
    return (fn) => fn({ actionName, error: `The yotpo action list not found` });
  }
  const campaign = actions.find((item) => item.action_name === actionName);
  if (!campaign) {
    return (fn) => fn({ actionName, error: `The yotpo action [${actionName}] not found` });
  }
  const { ends_at } = campaign;
  if (dayjs().isAfter(dayjs(ends_at))) {
    return (fn) => fn({ actionName, error: `The yotpo action [${actionName}] has ended` });
  }

  return (fn) => fn({ actionName });
};
