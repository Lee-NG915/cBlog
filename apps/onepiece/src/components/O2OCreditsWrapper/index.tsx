import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { withLoginCheck } from 'components/withLoginCheck';
import { earnYotpoPoints } from 'api/yotpo';
import { YotpoActions } from 'config/yotpo-actions.map';
import { beforeTriggerYotpoAction, getYotpoActiveCampaigns } from 'utils/yotpo';
import { withSourceCheck } from './withSourceCheck';

/**
 * Read first: UTM Urchin Tracking Module
 * @doc https://castlery.atlassian.net/wiki/x/AQABmw
 */
// export interface O2OCreditsWrapperProps {}
export const O2OCredits = () => {
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user?.email) {
      const earnHandler = async () => {
        try {
          const actions = await getYotpoActiveCampaigns(user);
          beforeTriggerYotpoAction(
            actions,
            YotpoActions.ScanQRCodeFromOfflineShowroom
          )(async (payload: { actionName: string; error?: string }) => {
            if (payload.error) {
              throw Error(payload.error);
            }
            try {
              await earnYotpoPoints({
                customer_email: user.email,
                action_name: payload.actionName,
              });
            } catch (err) {
              console.log(err);
            }
          });
        } catch (err) {
          throw Error(`Failed to earn credits, ${JSON.stringify(err)}`);
        }
      };

      earnHandler();
    }
  }, [user]);

  return <></>;
};

export default O2OCredits;

export const O2OCreditsWrapper = withSourceCheck(withLoginCheck(O2OCredits));
