'use client';

import { useCallback, useMemo } from 'react';

import { useLazyGetUserTermsVersionQuery, useUpdateUserTermsVersionMutation } from '@castlery/modules-user-domain';
import { compareVersion } from '@castlery/utils';
import { Link, Typography } from '@castlery/fortress';
import { EcEnv } from '@castlery/config';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { selectTermsOfUse } from '@castlery/modules-cms-domain';
import { useUIContext } from '@castlery/shared-components';
import { TermsWithVersionStoryblok, UseTermsVersionOptions, UseTermsVersionReturn } from '@castlery/types';
import { logger } from '@castlery/observability/client';

/**
 * Terms Version Hook
 * 处理用户条款版本检查和弹窗逻辑
 * 1.跨大版本 (需要弹窗)
 * 2.跨小版本 且 isAlertUser = true (需要弹窗)
 * 3.跨小版本 且 isAlertUser = false (不需要弹窗)
 * 4.未跨版本 (不需要弹窗)
 */

export function useTermsVersion(termsOfUse?: TermsWithVersionStoryblok): UseTermsVersionReturn {
  const dispatch = useAppDispatch();
  const lastTermsData = useAppSelector(selectTermsOfUse) || termsOfUse;
  const { modal } = useUIContext();
  const lastTermsVersion = useMemo(() => lastTermsData?.version || '0.0.0', [lastTermsData]);

  const [getUserTermsVersion, { isLoading: isLoadingUser, isError: isErrorUser }] = useLazyGetUserTermsVersionQuery();
  const [updateUserTermsVersion, { isLoading: isUpdating }] = useUpdateUserTermsVersionMutation();

  const isLoading = isLoadingUser || isUpdating;

  const checkTermsVersion = useCallback(
    async (options: UseTermsVersionOptions = {}) => {
      const { isNeedAlert = true, onConfirm, onCancel, accessToken, onClose } = options;
      try {
        const lastTerms = lastTermsData
          ? lastTermsData
          : {
              version: '0.0.0',
              isAlertUser: false,
            };

        const lastVersion = lastTerms?.version || '0.0.0';
        const isAlertUser = lastTerms?.isAlertUser || false;

        let userTermsVersion: string;
        const { data: userTerms } = await getUserTermsVersion({ accessToken });

        if (isErrorUser) {
          userTermsVersion = '0.0.0';
        } else {
          userTermsVersion = userTerms?.accepted_version || '0.0.0';
        }

        const [major, minor, patch] = compareVersion(lastVersion, userTermsVersion);

        if (!major && !minor && !patch) {
          if (onConfirm) {
            onConfirm(lastVersion);
          }
          return;
        }

        if (major || isAlertUser) {
          // 跨大版本 或 跨小版本 且 isAlertUser = true
          if (!isNeedAlert) {
            await updateUserTermsVersion({
              data: { terms_of_use_version: lastVersion },
              accessToken,
            }).unwrap();

            if (onConfirm) {
              onConfirm(lastVersion);
            }
            return;
          }

          modal.warning({
            title: 'Updated Terms of Use',
            subDesc: (
              <Typography level="body1">
                Please read and accept our&nbsp;
                <Link
                  href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLowerCase()}/terms-of-use`}
                  target="_blank"
                  variant="primary"
                  rel="noopener noreferrer"
                >
                  Terms of Use
                </Link>
                &nbsp;before you access our website and services.
              </Typography>
            ),
            confirmText: 'Accept',
            cancelText: 'Decline',
            disabledCloseByClickBackdrop: true,
            onConfirm: async () => {
              try {
                await updateUserTermsVersion({
                  data: { terms_of_use_version: lastVersion },
                  accessToken,
                }).unwrap();

                if (onConfirm) {
                  onConfirm(lastVersion);
                }
              } catch (error) {
                logger.error('Failed to update terms version', { error, accessToken });
              }
            },
            onCancel: () => {
              if (onCancel) {
                onCancel(lastVersion);
              }
            },
            onClose: () => {
              if (onClose) {
                onClose(lastVersion);
              }
            },
          });
        } else {
          // 跨小版本 且 isAlertUser = false - 静默更新
          await updateUserTermsVersion({
            data: { terms_of_use_version: lastVersion },
            accessToken,
          }).unwrap();

          if (onConfirm) {
            onConfirm(lastVersion);
          }
        }
      } catch (error) {
        logger.error('Terms version check failed', { error });
        // 即使检查失败，也执行确认回调，避免阻塞用户
        if (onConfirm) {
          onConfirm(lastTermsVersion);
        }
      }
    },
    [lastTermsData, getUserTermsVersion, updateUserTermsVersion, dispatch, isErrorUser, modal]
  );

  return {
    checkTermsVersion,
    isLoading,
  };
}
