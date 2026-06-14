/* eslint-disable @typescript-eslint/no-unsafe-call */
import { useSelector, useDispatch } from 'react-redux';
import { getUserTermsVersion, updateUserTermsVersion } from 'redux/modules/auth';
import { FrameContext } from 'containers/Frame/FrameContext';
import React, { useContext, useEffect, useMemo, useCallback } from 'react';
import { Link as RouterLink } from 'react-router';
import { getUrl } from 'pages';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { EVENT_TOU_POPUP } from 'utils/track/constants';

type Terms = {
  version: string;
  context?: string;
  isAlertUser: boolean;
};
export function useLastTermsVersion(): string {
  // const terms: Terms[] =
  //   useSelector((state: any) => state.marketing?.['terms-of-use']?.data?.story?.content?.termsHistory) || [];
  const terms = global?.__termsHistory || [];
  const version = useMemo(() => terms[terms.length - 1]?.version || '0.0.0', [terms]);
  if (!terms) {
    return '0.0.0';
  }
  return version;
}

export function useLastTerms(): Terms | null {
  // const terms: Terms[] =
  //   useSelector((state: any) => state.marketing?.['terms-of-use']?.data?.story?.content?.termsHistory) || [];
  const terms = global?.__termsHistory || [];
  const lastTerms = useMemo(() => terms[terms.length - 1] || null, [terms]);
  if (!terms) {
    return null;
  }

  return lastTerms;
}

/**
 *
 * @param v1 eg: 1.0.0
 * @param v2 eg: 1.0.1
 * @returns [true, false, false] major, minor, patch (v1 > v2)
 */
function compareVersion(v1: string, v2: string): Array<boolean> {
  // 检查版本号格式
  const reg = /^\d+\.\d+\.\d+$/;
  if (!reg.test(v1) || !reg.test(v2)) {
    return [false, false, false];
  }

  if (v1 === v2) {
    return [false, false, false];
  }
  const v1Arr = v1.split('.');
  const v2Arr = v2.split('.');
  const result = [false, false, false];
  for (let i = 0; i < 3; i++) {
    if (parseInt(v1Arr[i]) > parseInt(v2Arr[i])) {
      result[i] = true;
      break;
    }
  }
  return result;
}

type UseAlertTermsModalType = (data: {
  accessToken: string;
  isNeedAlert?: boolean;
  lastVersion?: string;
  onConfirm?: (version: string) => void;
  onCancel?: (version: string) => void;
}) => Promise<any>;

const getLatestTerms = async (dispatch: any): Promise<Terms> => {
  const data = global?.__termsHistory || [];
  if (!data) {
    return {
      version: '0.0.0',
      isAlertUser: false,
    };
  }

  const terms: Terms[] = data || [];
  const lastTerms = terms[terms.length - 1];
  return lastTerms;
};

export function useAlertTermsModal(): UseAlertTermsModalType {
  const dispatch: any = useDispatch();
  const frame: any = useContext(FrameContext);
  const lastTermsVersion = useLastTermsVersion();
  const lastTermsData = useLastTerms();
  const { mobile } = useBreakpoints();
  // console.log(lastTermsVersion, lastTerms);
  // useEffect(() => {
  //   getLatestTerms(dispatch);
  // }, []);
  /**
   * 1.跨大版本 (需要弹窗)
   * 2.跨小版本 且 isAlertUser = true (需要弹窗)
   * 3.跨小版本 且 isAlertUser = false (不需要弹窗)
   * 4.未跨版本 (不需要弹窗)
   */
  return useCallback(
    async ({ accessToken, onConfirm, onCancel, isNeedAlert }) => {
      const termsResult = await dispatch(getUserTermsVersion({ accessToken })).catch((err: any) => ({
        error: err?.errors?.[0],
      }));

      let lastTerms = lastTermsData;
      if (!lastTerms) {
        lastTerms = await getLatestTerms(dispatch);
      }

      const lastVersion = lastTermsVersion;
      const isAlertUser = lastTerms?.isAlertUser || false;

      let userTermsVersion: string;
      if (termsResult?.error) {
        userTermsVersion = '0.0.0';
      } else {
        userTermsVersion = termsResult?.accepted_version || '0.0.0';
      }

      const [major, minor, patch] = compareVersion(lastVersion, userTermsVersion);
      // 未跨版本
      if (!major && !minor && !patch) {
        if (onConfirm) {
          onConfirm(lastVersion);
        }
        return;
      }
      // 跨大版本 或 跨小版本 且 isAlertUser = true
      if (major || isAlertUser) {
        if (!isNeedAlert) {
          dispatch(
            updateUserTermsVersion({
              accessToken,
              data: {
                terms_of_use_version: lastVersion,
              },
            })
          );
          if (onConfirm) {
            onConfirm(lastVersion);
          }
          return;
        }

        frame.openModal('confirmation', {
          type: 'warning',
          title: 'Updated Terms of Use',
          description: (
            <>
              Please read and accept our{' '}
              <RouterLink
                to={getUrl('terms-of-use')}
                style={{
                  color: '#A45B37',
                }}
                target="_blank"
              >
                Terms of Use
              </RouterLink>{' '}
              before you access our website and services.
            </>
          ),
          iconSize: mobile ? 'xs' : 'small',
          align: 'center',
          titleStyle: {
            fontSize: mobile ? '18px' : '28px',
          },
          descriptionStyle: {
            fontSize: mobile ? '0.75rem' : '1rem',
          },
          confirmText: 'Accept',
          cancelText: 'Decline',
          showCloseButton: false,
          onConfirm: () => {
            dispatch(
              updateUserTermsVersion({
                accessToken,
                data: {
                  terms_of_use_version: lastVersion,
                },
              })
            );

            if (onConfirm) {
              onConfirm(lastVersion);
            }
          },
          onCancel: () => {
            if (onCancel) {
              onCancel(lastVersion);
            }
            dispatch({
              type: EVENT_TOU_POPUP,
              result: {
                action: 'decline',
              },
            });
          },
        });
      } else {
        // 跨小版本 且 isAlertUser = false
        dispatch(
          updateUserTermsVersion({
            accessToken,
            data: {
              terms_of_use_version: lastVersion,
            },
          })
        );
        if (onConfirm) {
          onConfirm(lastVersion);
        }
      }
    },
    [dispatch, frame, lastTermsVersion, lastTermsData, mobile]
  );
}
