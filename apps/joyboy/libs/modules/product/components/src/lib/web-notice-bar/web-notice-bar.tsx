'use client';

import { Box, Container, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';
import useInterval from '@castlery/fortress/hooks/useInterval/useInterval';
import { getDate } from '@castlery/modules-cms-services';
import { CustomLink } from '@castlery/shared-components';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { MenuBlockStoryblok } from '@castlery/types';
import React, { useState, useEffect } from 'react';

type CountDownItemProps = {
  ended_at: string;
};

const CountDownItem = ({ item, onlyShowDays }: { item: CountDownItemProps; onlyShowDays?: boolean }) => {
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const end = new Date(getDate(item.ended_at.replace(/-/g, '/')).utc().format('YYYY-MM-DD HH:mm:ss')).getTime();
    const now = new Date(getDate().format('YYYY-MM-DD HH:mm:ss')).getTime();
    setCountdown(end - now);
  }, [item]);

  const calcDate = () => {
    setCountdown((prevCountdown) => {
      const newCountdown = prevCountdown - 1000;
      setDays(Math.floor(newCountdown / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((newCountdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
      setMinutes(Math.floor((newCountdown % (1000 * 60 * 60)) / (1000 * 60)));
      setSeconds(Math.floor((newCountdown % (1000 * 60)) / 1000));
      return newCountdown;
    });
  };

  const { tablet } = useBreakpoints();
  useInterval(() => {
    if (countdown <= 0) {
      return;
    } else {
      calcDate();
    }
  }, 1000);
  if (countdown <= 0) {
    return null;
  }
  return (
    <Box
      sx={{
        fontSize: '14px',
        fontWeight: 'bold',
        marginLeft: '10px',
        textWrap: 'nowrap',
      }}
    >
      {days > 0 && (
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              marginRight: '10px',
            }}
          >
            {days} D
          </Typography>
          {onlyShowDays ? (
            ''
          ) : (
            <>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  marginRight: '10px',
                  color: '#fff',
                }}
              >
                {hours} H
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  marginRight: '10px',
                }}
              >
                {minutes} M
              </Typography>
            </>
          )}
        </Stack>
      )}
      {days === 0 && (
        <Stack
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              marginRight: '10px',
              lineHeight: tablet ? '16px' : '22.5px',
            }}
          >
            {tablet && (
              <>
                {hours}
                <br />H
              </>
            )}
            {!tablet && `${hours} H`}
          </Typography>
          {onlyShowDays ? (
            ''
          ) : (
            <>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  marginRight: '10px',
                }}
              >
                {minutes} M
              </Typography>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#fff',
                  marginRight: '10px',
                }}
              >
                {seconds} S
              </Typography>
            </>
          )}
        </Stack>
      )}
    </Box>
  );
};

type WebNoticeBarItemProps = {
  link: string;
  title: string;
  pinned: boolean;
  published_at: string;
  ended_at: string;
  countdown_enabled: boolean;
};

const NoticeItem = ({ item }: { item?: WebNoticeBarItemProps }) => {
  const { mobile, tablet, desktop } = useBreakpoints();
  const renderCountDown = () => {
    if (item?.countdown_enabled) {
      if (desktop) {
        return <CountDownItem item={{ ended_at: item.ended_at }} />;
      }
      if (tablet) {
        if (!item.pinned) {
          return <CountDownItem item={{ ended_at: item.ended_at }} onlyShowDays />;
        }
      }
      if (mobile) {
        return <CountDownItem item={{ ended_at: item.ended_at }} />;
      }
    }
    return null;
  };
  if (!item) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: { xs: 45, md: 35 },
        }}
      />
    );
  }
  return (
    <Box
      sx={[
        {
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: { xs: 45, md: 35 },
          padding: '0 10px',
          a: {
            textDecoration: 'none',
          },
        },
        mobile &&
          item.countdown_enabled && {
            flexDirection: 'column',
            alignItems: 'center',
          },
      ]}
    >
      <CustomLink
        linkKey={item.link}
        prefetch={false}
        // isExternalFlag={true}
        data-notice="link"
      >
        <Box
          sx={{
            width: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography
            sx={{
              color: '#fff',
              // fontSize: '14px',
              textWrap: 'nowrap',
              overflow: 'hidden',
              maxWidth: '100%',
              textOverflow: 'ellipsis',
            }}
            level="body2"
          >
            {item.title}
          </Typography>
          {desktop && renderCountDown()}
        </Box>
      </CustomLink>
      {/* 非桌面端倒计时：预留最小高度空间，即使 CountDownItem 初始返回 null 也保持布局稳定，避免 CLS */}
      {!desktop && (
        <Box
          sx={{
            marginLeft: '10px',
            minHeight: item.countdown_enabled ? '20px' : 0,
          }}
        >
          {renderCountDown()}
        </Box>
      )}
    </Box>
  );
};

type NoticeScrollBarProps = {
  filteredNoticeData: WebNoticeBarItemProps[];
};

const NoticeScrollBar = ({ filteredNoticeData }: NoticeScrollBarProps) => {
  let scrollAction = {};
  if (filteredNoticeData.length === 3) {
    scrollAction = {
      '0%': {
        transform: 'translateY(0)',
      },
      '27.78%': {
        transform: 'translateY(0)',
      },
      '33.33%': {
        transform: 'translateY(-33.33%)',
      },
      '61.11%': {
        transform: 'translateY(-33.33%)',
      },
      '66.67%': {
        transform: 'translateY(-66.67%)',
      },
      '94.44%': {
        transform: 'translateY(-66.67%)',
      },
      '100%': {
        transform: 'translateY(-100%)',
      },
    };
  }
  if (filteredNoticeData.length === 2) {
    scrollAction = {
      '0%': {
        transform: 'translateY(0)',
      },
      '45.45%': {
        transform: 'translateY(0)',
      },
      '50%': {
        transform: 'translateY(-50%)',
      },
      '95.45%': {
        transform: 'translateY(-50%)',
      },
      '100%': {
        transform: 'translateY(-100%)',
      },
    };
  }
  return (
    <Box
      sx={{
        position: 'relative',
        height: { xs: 45, md: 35 },
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          height: { xs: 45, md: 35 },
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{
            width: '100%',
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            '@keyframes scrollVertical': scrollAction,
            animation: `scrollVertical ${filteredNoticeData.length === 2 ? 12 : 18}s linear infinite`,
          }}
        >
          {filteredNoticeData.map((item, index) => {
            return <NoticeItem key={index} item={item} />;
          })}
        </Box>
      </Box>
    </Box>
  );
};

type WebNoticeBarProps = {
  noticeBarData: MenuBlockStoryblok[];
  noticeBarMobileData: MenuBlockStoryblok[];
};

const WebNoticeBar: React.FC<WebNoticeBarProps> = ({ noticeBarData, noticeBarMobileData }) => {
  const { tablet, desktop } = useBreakpoints();

  const { noticeSwitch } = makePersistenceHandles();

  const [hasClose, setHasClose] = useState(false);

  const renderNoticeData = desktop ? noticeBarData : noticeBarMobileData;
  let filteredNoticeData = [];
  const pinnedItem = renderNoticeData.find((item) => item.pinned);

  if (!pinnedItem) {
    filteredNoticeData = renderNoticeData;
  } else {
    filteredNoticeData = [pinnedItem];
  }

  const handleCloseClick = () => {
    if (noticeSwitch) {
      noticeSwitch.setItem('close', { maxAge: 7 * 24 * 3600 });
      setHasClose(true);
    }
  };

  if (noticeSwitch && noticeSwitch.getItem() === 'close') {
    return null;
  }

  if (hasClose) {
    return null;
  }

  return (
    <Container
      data-section="notice-bar"
      sx={{
        position: 'relative',
        backgroundColor: (theme) => theme.palette.brand.terracotta[500],
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: { xs: 45, md: 35 },
        maxWidth: '100vw !important',
      }}
    >
      {!pinnedItem && (
        <Box
          sx={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            zIndex: 100,
          }}
          onClick={handleCloseClick}
        >
          <Close stroke="#fff" />
        </Box>
      )}
      {pinnedItem && tablet && pinnedItem.countdown_enabled && (
        <Box
          sx={{
            position: 'absolute',
            right: 10,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <CountDownItem item={pinnedItem} onlyShowDays />
        </Box>
      )}
      {filteredNoticeData.length === 1 && <NoticeItem item={filteredNoticeData[0]} />}
      {filteredNoticeData.length > 1 && <NoticeScrollBar filteredNoticeData={filteredNoticeData} />}
    </Container>
  );
};

export { WebNoticeBar };
