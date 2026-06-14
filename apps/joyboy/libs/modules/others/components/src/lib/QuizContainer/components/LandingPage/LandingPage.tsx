'use client';

import { Button, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { FortressImage } from '@castlery/shared-components';
import { useMemo } from 'react';
import { IdealVacationHomeConfiguration } from '../../configuration/ideal-vacation-home';
import { useAppDispatch } from '@castlery/shared-redux-store';
import { EVENT_COMMON_PAGE_VIEW } from '@castlery/modules-tracking-services';
import { WEB_PAGE_NAMES } from '@castlery/config';

const LandingPage = ({
  currentConfiguration,
  onFuncCall,
}: {
  currentConfiguration: IdealVacationHomeConfiguration;
  onFuncCall: (action: { type: string; payload: { index: number } }) => void;
}) => {
  const { desktop, tablet, mobile } = useBreakpoints();

  const backgroundImage = useMemo(() => {
    if (desktop) {
      return currentConfiguration.backgroundImage?.desktop;
    }
    if (tablet) {
      return currentConfiguration.backgroundImage?.tablet;
    }
    if (mobile) {
      return currentConfiguration.backgroundImage?.mobile;
    }
    return '';
  }, [desktop, tablet, mobile]);

  const dispatch = useAppDispatch();

  return (
    <Stack
      sx={{
        position: 'relative',
        ...(!desktop && {
          minHeight: '600px',
        }),
      }}
    >
      <FortressImage src={backgroundImage || ''} alt="Landing Page" objectFit="cover" ratio={desktop ? 1.6 : 0.65} />
      <Stack
        sx={(theme) => ({
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: theme.spacing(40),
          paddingRight: theme.spacing(40),
          ...(!desktop && {
            paddingLeft: theme.spacing(6),
            paddingRight: theme.spacing(6),
          }),
        })}
      >
        <Typography
          level={currentConfiguration.title.level}
          textAlign="center"
          sx={(theme) => ({
            color: currentConfiguration.title.styles.color,
            fontSize: `${currentConfiguration.title.styles.fontSize[desktop ? 'desktop' : 'mobile']} !important`,
            paddingBottom: theme.spacing(6),
          })}
        >
          {currentConfiguration.title.text}
        </Typography>
        {currentConfiguration.description && (
          <Typography
            level="body1"
            textAlign="center"
            sx={(theme) => ({
              color: currentConfiguration.description?.styles?.color,
              fontSize: `${
                currentConfiguration.description?.styles?.fontSize[desktop ? 'desktop' : 'mobile']
              } !important`,
              paddingBottom: theme.spacing(8),
              ...(!desktop && {
                paddingBottom: theme.spacing(6),
              }),
            })}
          >
            {currentConfiguration.description.text}
          </Typography>
        )}
        <Button
          sx={(theme) => ({
            backgroundColor: currentConfiguration.nextAction.styles.backgroundColor,
            color: currentConfiguration.nextAction.styles.color,
            ...(!desktop && {
              fontSize: `${currentConfiguration.nextAction.styles.fontSize[desktop ? 'desktop' : 'mobile']} !important`,
            }),
          })}
          onClick={() => {
            dispatch(
              EVENT_COMMON_PAGE_VIEW({
                pageName: WEB_PAGE_NAMES.CORPORATE_PAGE,
              })
            );
            onFuncCall({
              type: currentConfiguration.nextAction.action.type,
              payload: {
                index: currentConfiguration.nextAction.action.payload.index,
              },
            });
          }}
        >
          {currentConfiguration.nextAction.text}
        </Button>
      </Stack>
    </Stack>
  );
};

export { LandingPage };
