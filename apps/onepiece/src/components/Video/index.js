/* eslint-disable jsx-a11y/media-has-caption */
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import ReactPicture from 'components/ReactPicture';
import { videoCloudinaryRoot } from 'config';
import { useDispatch } from 'react-redux';
import { EVENT_VIDOE_PROGRESS } from 'utils/track/constants';
import { useDevice } from 'utils/hooks';
import debounce from 'lodash/debounce';
import { Close, PlayArrowFilled, PlayCircleFilled, Replay } from '@castlery/fortress/Icons';
import { Box, Button, buttonClasses } from '@castlery/fortress';
import { isChrome, isIOS, isSafari } from 'react-device-detect';
import style from './style.scss';

// function isIos() {
//   return /iPad|iPhone|iPod/.test(navigator.userAgent);
// }

const videoResolutions = {
  '480P': 720,
  '720P': 1280,
  '1080P': 1920,
};

const Video = ({
  ratios,
  id,
  videoRoot,
  thumbnail,
  autoPlay = true,
  forTrack,
  objectFit,
  needPause = false,
  needCrop = false,
  resolution = '720P',
  showControls = true,
  loop = false,
  onCloseMasterVideo,
  onPlayVideo,
  muted = false,
  allowUnmute = false,
  hideClose = false,
  clickOverlayEvent,
  qAuto,
  needLazyLoad = false,
  forceThumbnail = false,
}) => {
  const dispatch = useDispatch();
  const [showThumbnail, setShowThumbnail] = useState(true);
  const videoRef = useRef(null);
  const [play, setPlay] = useState(autoPlay);
  const [videoEnded, setVideoEnded] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const device = useDevice();
  const [watchCompleted, setWatchCompleted] = useState(false);

  const ratio = useMemo(() => {
    if (typeof ratios === 'number') {
      return ratios;
    }
    return ratios[device];
  }, [ratios, device]);

  const aspectRatioParam = useMemo(() => (needCrop ? `,ar_${(1 / ratio).toFixed(1)}` : ''), [needCrop, ratio]);

  const cloudinaryVideoRoot = videoRoot || videoCloudinaryRoot;

  const thumbnailUrl = useMemo(() => {
    if (!thumbnail) return null;
    if (!thumbnail.id) {
      return `${cloudinaryVideoRoot}/so_0,c_fill${aspectRatioParam}/${id}.jpg`;
    }

    if (thumbnail.id.startsWith('https://res.cloudinary.com')) {
      const arr = thumbnail.id.split('/upload/');
      return `${arr[0]}/upload/c_fill${aspectRatioParam}/${arr[1]}`;
    }
    return `${cloudinaryVideoRoot}/c_fill${aspectRatioParam}/${thumbnail.id}.jpg`;
  }, [aspectRatioParam, cloudinaryVideoRoot, id, thumbnail]);

  const debouncedTrack = debounce((percentage) => {
    if (!forTrack || watchCompleted) return;
    if (percentage === 100) {
      setWatchCompleted(true);
    }
    dispatch({
      type: EVENT_VIDOE_PROGRESS,
      result: {
        progress: percentage,
        sku: forTrack.sku,
      },
    });
  }, 1000);

  const handleControlOverlay = () => {
    if (clickOverlayEvent === 'play') {
      videoRef.current.play();
    }
  };

  useEffect(() => {
    if (isVideoLoaded && !videoRef.current.paused && needPause) {
      videoRef.current.pause();
    }
  }, [needPause, isVideoLoaded]);

  const handleIntersect = useCallback(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // 如果视频标签完全可见
          const video = entry.target;
          videoRef.current.play();
          observer.unobserve(video); // 停止观察视频标签
        }
      });
    },
    [videoRef]
  );

  const createObserver = useCallback(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0, // 当视频完全可见时触发回调
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    if (videoRef?.current) {
      videoRef.current.pause();
      observer.observe(videoRef?.current); // 观察视频标签
    }
  }, [handleIntersect, videoRef]);

  useEffect(() => {
    if (isVideoLoaded && needLazyLoad) {
      if (IntersectionObserver) {
        createObserver();
      }
    }
  }, [needLazyLoad, isVideoLoaded, createObserver]);

  return (
    <div className={style.video} style={{ paddingTop: `${ratio * 100}%` }}>
      {thumbnailUrl && (forceThumbnail || (!autoPlay && showThumbnail)) && (
        <div className={`${style.video}__thumbnail`}>
          <ReactPicture
            srcset={thumbnailUrl}
            alt={thumbnail.alt}
            loader={{
              ratio,
              widths: [500, 700, 900, 1000, 1200, 1400],
              sizes: device === 'desktop' ? ['700px-xxl', '500px-xl', '0.5'] : ['0.9-md'],
              objectFit,
              ...(!!thumbnail.loader && thumbnail.loader),
            }}
            lazy={false}
            setImagePreloaderOnServer={thumbnail.setImagePreloaderOnServer}
          />
        </div>
      )}
      {isVideoLoaded && !play && showControls && !autoPlay && (
        <div className={`${style.video}__overlay`}>
          <div
            role="button"
            className={`${style.video}__overlay-play`}
            onClick={() => {
              if (onPlayVideo) {
                onPlayVideo();
              }
              setShowThumbnail(false);
              videoRef.current.play();
            }}
          >
            <PlayCircleFilled
              sx={{
                fontSize: { xs: '3.75rem', md: '7.5rem' },
                color: (theme) => theme.palette.common.white,
              }}
            />
          </div>
        </div>
      )}
      {isVideoLoaded && !play && showControls && autoPlay && (
        <Box
          className={`${style.video}__overlay`}
          sx={{
            [`.${buttonClasses.root}`]: {
              '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' },
            },
          }}
          onClick={handleControlOverlay}
        >
          {!hideClose && (
            <Button onClick={onCloseMasterVideo} startDecorator={<Close fontSize="xl3" />}>
              Close
            </Button>
          )}
          <Button
            variant="plain"
            onClick={() => {
              videoRef.current.play();
            }}
            startDecorator={videoEnded ? <Replay fontSize="xl3" /> : <PlayArrowFilled fontSize="xl3" />}
          >
            {videoEnded ? 'Replay' : 'Continue'}
          </Button>
        </Box>
      )}
      <video
        key={id}
        ref={videoRef}
        className={`${style.video}__video`}
        autoPlay={autoPlay}
        playsInline
        muted={muted}
        loop={loop}
        controls={play && showControls}
        disablePictureInPicture
        controlsList="nodownload"
        // FIXME onLoadedData not call when ios disable autoPlay
        onLoadedMetadata={() => {
          setIsVideoLoaded(true);
          if (autoPlay && muted) {
            setShowThumbnail(false);
          }
        }}
        // onLoadedData={() => {
        //   setIsVideoLoaded(true);
        // }}
        style={{ ...(!!objectFit && { objectFit }) }}
        onTimeUpdate={() => {
          const percentage = Math.round((videoRef.current.currentTime / videoRef.current.duration) * 100);
          if ([25, 50, 75, 100].includes(percentage)) {
            debouncedTrack(percentage);
          }
        }}
        onPlay={() => {
          setPlay(true);
          setShowThumbnail(false);
          setVideoEnded(false);
        }}
        onEnded={() => {
          setVideoEnded(true);
        }}
        onPause={() => {
          if (!videoRef.current.seeking && !(isIOS && (isSafari || isChrome))) {
            setPlay(false);
          }
        }}
        src={`${cloudinaryVideoRoot}/f_auto,q_auto${qAuto ? `:${qAuto}` : ''},w_${videoResolutions[resolution]}${
          autoPlay && muted && !allowUnmute ? ',ac_none' : ''
        },c_fill${aspectRatioParam}/${id}.mp4`}
      />
    </div>
  );
};

Video.propTypes = {
  ratios: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
  id: PropTypes.string.isRequired,
  thumbnail: PropTypes.object,
  autoPlay: PropTypes.bool,
  videoRoot: PropTypes.string,
  forTrack: PropTypes.object,
  objectFit: PropTypes.string,
  needCrop: PropTypes.bool,
  resolution: PropTypes.oneOf(['480P', '720P', '1080P']),
  loop: PropTypes.bool,
  showControls: PropTypes.bool,
  needPause: PropTypes.bool,
  onCloseMasterVideo: PropTypes.func,
  muted: PropTypes.bool,
  onPlayVideo: PropTypes.func,
  allowUnmute: PropTypes.bool,
  hideClose: PropTypes.bool,
  clickOverlayEvent: PropTypes.string,
  qAuto: PropTypes.oneOf(['best', 'good']),
  needLazyLoad: PropTypes.bool,
  forceThumbnail: PropTypes.bool,
};

export default Video;
