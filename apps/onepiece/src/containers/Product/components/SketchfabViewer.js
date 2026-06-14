import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { GhostArrowBtn } from 'components/Button';
import ReactSVG from 'components/ReactSVG';
import { useDispatch } from 'react-redux';
import { EVENT_PDP_DETAILS, EVENT_MODEL_LOAD_TIME } from 'utils/track/constants';
import { useInView } from 'react-intersection-observer';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useSupportAR } from '../hooks/compatibility';
import style from './style.scss';

const SketchfabViewer = ({ uid, variantInfo, handleThreeDView, defaultStartAR }, { frame, router }) => {
  const viewerIframeRef = useRef(null);
  const [viewerApi, setViewerApi] = useState();
  const [loaded, setLoaded] = useState(!!window.Sketchfab);
  const [initialized, setInitialized] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [initPosition, setInitPosition] = useState({});
  const isSupportAR = useSupportAR();
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();

  const handleBack = useCallback(() => {
    if (viewerApi) {
      viewerApi.stop(() => {
        handleThreeDView(false);
        console.log('Viewer stopped');
        window.location.hash = '';
      });
    } else {
      handleThreeDView(false);
      window.location.hash = '';
    }
  }, [viewerApi, handleThreeDView]);

  const handleAR = useCallback(
    (api) => {
      const { host, pathname, search } = window.location || {};

      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: 'view_click',
          label: 'view_with_ar',
        },
      });

      const modalParams = {
        url: `${host + pathname + search}`,
        uid,
        api: api?.startAR ? api : viewerApi,
        handleBack,
        variantInfo,
      };

      if (!desktop) {
        const closeHandler = () => {
          if (!defaultStartAR) {
            router.goBack();
          }
          frame.removeModal();
        };

        frame.openModal(
          'arModal',
          {
            params: modalParams,
            subOption: {
              styleOverflow: 'scroll',
              closeHandler,
            },
          },
          {
            height: 82,
            dismiss: closeHandler,
          }
        );
      } else {
        frame.openModal('arModal', {
          params: modalParams,
        });
      }
    },
    [frame, dispatch, router, viewerApi, handleBack, defaultStartAR, uid, variantInfo, desktop]
  );

  const handleCloseTip = () => {
    setShowTip(false);
  };

  const handleReset = () => {
    const { position, target } = initPosition;
    // Sets the camera position and target.
    viewerApi.setCameraLookAt(position, target, 2, (err) => {
      if (!err) {
        window.console.log('Camera moved');
      }
    });
  };

  useEffect(() => {
    if (!window.Sketchfab) {
      const sketchfabScript = document.createElement('script');
      // FIXME can use Script Component
      sketchfabScript.src = 'https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';
      document.body.appendChild(sketchfabScript);

      sketchfabScript.addEventListener('load', () => setLoaded(true));
    }

    return () => {
      handleBack();
    };
  }, []);

  useEffect(() => {
    const { hash } = window.location;
    if (!hash) {
      handleThreeDView(false);
      frame.removeModal();
    } else if (hash === '#dimensions-3d') {
      frame.removeModal();
    }
  }, [window.location.hash]);

  useEffect(() => {
    if (initialized) {
      setTimeout(() => {
        // This event is triggered when the camera begins to move.
        viewerApi.addEventListener('camerastart', () => {
          window.console.log('Camera is moving');
          if (showTip) {
            handleCloseTip();
          }
        });
      }, 1000);
    }
  }, [initialized]);

  useEffect(() => {
    if (loaded) {
      const startTime = new Date().getTime();
      console.log(startTime, '-------startTime');

      try {
        const version = '1.12.1';
        const client = new window.Sketchfab(version, viewerIframeRef.current);

        client.init(uid, {
          success: (api) => {
            // Starts the model viewer.
            api.start();
            api.addEventListener('viewerready', () => {
              // API is ready to use
              console.log('Viewer is ready');

              // Sets a color background - a normalized RGB array, [R, G, B]
              const bgR = 243;
              const bgG = 243;
              const bgB = 243;
              const normalizedColor = [bgR / 255, bgG / 255, bgB / 255]; // #F3F3F3
              api.setBackground({ color: normalizedColor }, () => {
                console.log('Background changed');
              });

              const endTime = new Date().getTime();
              console.log(endTime, '-------endTime');
              const loadTime = endTime - startTime;
              console.log(loadTime, '-------Time consuming');
              dispatch({
                type: EVENT_MODEL_LOAD_TIME,
                result: {
                  loadTime:
                    loadTime > 1000 ? `${parseInt(loadTime / 1000)}s${loadTime % 1000}ms` : `${loadTime % 1000}ms`,
                  modelId: uid,
                },
              });

              setViewerApi(api);
              setInitialized(true);
              if (defaultStartAR) {
                handleAR(api);
              }

              // Returns the current camera position and target.
              api.getCameraLookAt((err, camera) => {
                if (camera) {
                  if (desktop) {
                    setInitPosition({
                      position: camera.position,
                      target: camera.target,
                    });
                  } else {
                    const [x, y, z] = camera.position;
                    api.setCameraLookAt([x, y - 4, z], camera.target, 2, (err) => {
                      if (!err) {
                        window.console.log('Camera reset');
                        setInitPosition({
                          position: [x, y - 4, z],
                          target: camera.target,
                        });
                      }
                    });
                  }
                }
              });
            });
          },
          // This callback will be invoked when the viewer can not be initialized.
          error: (err) => {
            console.log(err); // The requested Sketchfab 3D model does not exist.
            handleBack();
            frame.openModal('response', { body: '3D model is not available.' });
          },
          autostart: 1, // make the model load immediately once the page is ready, rather than waiting for a user to click the Play button.
          autospin: 0.1, // to automatically spin around the z-axis after loading. The greater the number, the faster the spin. A negative number will reverse the spin direction.
          annotation_tooltip_visible: 0, // hide annotation tooltips by default.
          annotations_visible: 0, // hide annotations by default.
          camera: 0, // skip the initial animation that occurs when a model is loaded, and immediately show the model in its default position.
          ui_stop: 0, // hide the "Disable Viewer" button in the top right so that users cannot stop the 3D render once it is started.
          ui_animations: 0, // hide the animation menu and timeline.
          ui_annotations: 0, // hide the Annotation menu
          ui_controls: 0, //  hide all the viewer controls at the bottom of the viewer (Help, Settings, Inspector, VR, Fullscreen, Annotations, and Animations).
          ui_fadeout: 0, // prevent the viewer controls from disappearing when the camera moves or when the viewer is inactive for a few seconds.
          ui_hint: 0, // always hide the viewer hint animation ("click & hold to rotate")
          ui_infos: 0, // hide the model info bar at the top of the viewer.
          ui_loading: 0, // hide the viewer loading bars.
          ui_watermark: 0, // remove the Sketchfab logo watermark.
          ui_ar_help: 0, // remove the link to the sketchfab.com model page below the QR code as well as the help link during the "Loading" screen.
          prevent_user_light_rotation: 1, // prevent using alt + click/drag to rotate the lights and environment.
          preload: 1, // force all resources (textures) to download before the scene is displayed. to prevent your viewers from seeing low-resolution or missing textures during the model load time.
          orbit_constraint_zoom_in: 1, // define the camera zoom in limit (minimum distance from the model)
          orbit_constraint_zoom_out: desktop ? 5 : 10, // define the camera zoom out limit (maximum distance from the model)
          orbit_constraint_pitch_up: Math.PI / 2, // define the camera's pitch up rotation limit
          orbit_constraint_pitch_down: Math.PI / 18, // define the camera's pitch down rotation limit
        });
      } catch (err) {
        frame.openModal('arErrorModal', {
          handleClose: handleBack,
        });
        console.log(err, 'Not support');
      }
    }
  }, [loaded, desktop]);

  const [arRef, arInView] = useInView({
    threshold: 1,
    triggerOnce: true,
  });

  useEffect(() => {
    if (arInView) {
      dispatch({
        type: EVENT_PDP_DETAILS,
        result: {
          detailAction: 'view_impression',
          label: 'view_with_ar',
        },
      });
    }
  }, [arInView, dispatch]);

  return (
    <div className={style.viewer} data-selenium="top-layer">
      <iframe
        title="3d"
        ref={viewerIframeRef}
        width="100%"
        height="100%"
        scrolling="0"
        frameBorder="0"
        allow="fullscreen"
        allowFullScreen=""
        mozallowfullscreen="true"
        webkitallowfullscreen="true"
        className="is-modal-open"
      />

      {initialized ? (
        <>
          <GhostArrowBtn
            className={`${style.viewer}__back`}
            text="Back"
            direction="left"
            color="primary"
            onClick={handleBack}
          />

          {showTip && (
            <div className={`${style.viewer}__tip`}>
              <div>Drag to rotate. Pinch{desktop && '/Scroll'} to zoom.</div>
              <button type="button" onClick={handleCloseTip}>
                OK
              </button>
            </div>
          )}

          <button type="button" className={`${style.viewer}__reset`} onClick={handleReset}>
            <ReactSVG name="reset" />
          </button>
        </>
      ) : (
        <div className={`${style.viewer}__loading`}>
          <img
            src="https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1657867713/static/web-ar/loading.gif"
            alt="loading"
          />
          <span>Loading 3D View...</span>
        </div>
      )}

      {isSupportAR &&
        (desktop || initialized) &&
        (desktop ? (
          <button type="button" className={`${style.viewer}__arBtn`} onClick={handleAR}>
            <ReactSVG name="view-with-AR" />
            <span ref={arRef}>View with AR</span>
          </button>
        ) : (
          <a href="#ar-via-qr-code" className={`${style.viewer}__arBtn`} onClick={handleAR}>
            <ReactSVG name="view-with-AR" />
            <span ref={arRef}>View with AR</span>
          </a>
        ))}
    </div>
  );
};

export default SketchfabViewer;

SketchfabViewer.propTypes = {
  uid: PropTypes.string,
  variantInfo: PropTypes.object,
  handleThreeDView: PropTypes.func,
  defaultStartAR: PropTypes.bool,
};
SketchfabViewer.contextTypes = {
  frame: PropTypes.object,
  router: PropTypes.object,
};
