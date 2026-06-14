import React, { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { getUrl } from 'pages';
import { Link } from 'react-router';
import { EVENT_PDP_ROOM_DESIGNER, EVENT_DY_AB_TEST, EVENT_DY_EVENT } from 'utils/track/constants';
import { useDispatch } from 'react-redux';
import ReactPicture from 'components/ReactPicture';
import classNames from 'classnames';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import { useApiCampaigns } from 'hooks/dy';
import { reportClickEngagement } from 'utils/dyReporting';
import Video from 'components/Video';
import { genVideoInfo } from 'redux/modules/productOptions';
import { hullaExperienceLabel } from 'config';
import style from './style.scss';
import { useCurrentProduct, useCurrentVariant } from '../hooks/product';

function HullaSection({ productId }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTestShow, setTestShow] = useState(false);
  const [isExist, setIsExist] = useState(false);
  const [modularTool, setModularTool] = useState({});
  const [newRoomTool, setNewRoomTool] = useState({});
  const [modularShow, setModularShow] = useState(false);
  const [newRoomShow, setNewRoomShow] = useState(false);
  const [observeOnce, setObserveOnce] = useState(false);
  const dispatch = useDispatch();
  const { desktop } = useBreakpoints();
  const product = useCurrentProduct();
  const variant = useCurrentVariant();
  const selector = 'Room Designer';
  const modularSelector = 'Modular Tool';
  const dyRoomDesigner = useApiCampaigns({
    selectorArray: [selector],
    pageType: 'product',
    shouldCheckIfNeedLoad: false,
    productId,
    shouldCheckIfNeedLoadDeep: false,
    limitCountry: ['us'],
  })?.[selector]?.[String(productId)];
  const dyModularTool = useApiCampaigns({
    selectorArray: [modularSelector],
    pageType: 'product',
    shouldCheckIfNeedLoad: false,
    productId,
    shouldCheckIfNeedLoadDeep: false,
  })?.[modularSelector]?.[String(productId)];
  const collection = useMemo(() => {
    const taxon = product.taxons?.find((t) => t.level === 1 && t.ancestors[0] === 'Collections');
    return taxon?.name?.split(' ')[0] || '';
  }, [product]);
  const checkProduct = (id) => {
    const roomDesignerExperienceLabel = hullaExperienceLabel;

    if (window.HIntegrate) {
      window.HIntegrate.getProductInExperience(roomDesignerExperienceLabel, id)
        .then((product) => {
          setIsLoaded(true);
          if (product) {
            setIsExist(true);
            if (product?.image) {
              setImageSrc(product.image);
            }
          } else {
            setIsExist(false);
            setImageSrc('');
          }
        })
        .catch((err) => {
          console.log(err);
          setIsLoaded(true);
          setIsExist(false);
          setImageSrc('');
        });
    }
  };

  const RoomDesignerABTest = useMemo(
    () =>
      new Map([
        [
          'Auburn',
          {
            image_link: desktop
              ? 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/bdz8nfd8zt0thqb3qi2n'
              : 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/qti4yyzgxusuvxp7mdfy',
            click_link:
              'https://www.castlery.com/us/room-designer?&gallery=truep=20027%2CaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vY2FzdGxlcnkvaW1hZ2UvcHJpdmF0ZS9lX3RyaW06MTUsYl90cmFuc3BhcmVudCxjX2ZpdCxmX2F1dG8scV9hdXRvLHdfNzUwL3YxNjg0MjMzNDU5L2NydXNhZGVyL3ZhcmlhbnRzLzQwMzcwMDQyL0Rlc2ktV29vbC1SdWctOF8teC0xMF8tU3BlY2tsZWQtQmVpZ2UtMTY4NDIzMzQ1OS5qcGc%3D%2C244%2C305%2C497%2C458%2Cn%2Cn%2Cundefined%2C0%2CRugs%3Arectangle%2CNaN%2C%2C%2C&p=21441%2C501%2C353%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=21220%2C489%2C437%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=21439%2C218%2C435%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=22080%2C746.6124661246613%2C290.2845528455284%2Cn%2Cn%2C0%2C%2Cundefined%2C%2C%2C&p=21611%2C766%2C420%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&w=%23cdc6b3&f=%23987759&s=595&h=297&t=wood&d=plain&V=1&b=f&i=us-3',
          },
        ],
        [
          'Owen',
          {
            image_link: desktop
              ? 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/mbndtjaevew9idlss34r'
              : 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/p5mg7rpai5cjryltihq9',
            click_link:
              'https://www.castlery.com/us/room-designer?gallery=true&_gl=1*qna9jr*_ga*MTcwOTcxMjA3NC4xNzAyODkxMjc1*_ga_YM2B9443EJ*MTcwMjg5MTI3NC4xLjEuMTcwMjg5MTg0OS40NC4wLjA.&p=20022%2CaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vY2FzdGxlcnkvaW1hZ2UvcHJpdmF0ZS9lX3RyaW06MTUsYl90cmFuc3BhcmVudCxjX2ZpdCxmX2F1dG8scV9hdXRvLHdfNzUwL3YxNjg0Mjg5OTIzL2NydXNhZGVyL3ZhcmlhbnRzLzQwMzcwMDM4L1ZlbnR1cmEtSnV0ZS1SdWctOF8teC0xMF8tTmF0dXJhbC1CbGFjay0xNjg0Mjg5OTIzLmpwZw%3D%3D%2C244%2C305%2C532%2C436%2Cn%2Cn%2Cundefined%2C0%2CRugs%3Arectangle%2C0%2C%2C%2C&p=20610%2C569%2C412%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=19560%2C192%2C238%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=21266%2C516%2C336%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=22082%2C225.71263259402124%2C200.14079074252655%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=22436%2C847%2C402%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&w=%23efe5da&f=%23EAC9A4&s=579&h=297&t=wood&d=plain&V=1&b=f&i=',
          },
        ],
        [
          'Jonathan',
          {
            image_link: desktop
              ? 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/yn4wh0gpuy2ehmiyjoqu'
              : 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/rgxdk9wavq201jid1vug',
            click_link:
              'https://www.castlery.com/us/room-designer?logo=no&gallery=true&p=20039%2CaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vY2FzdGxlcnkvaW1hZ2UvcHJpdmF0ZS9lX3RyaW06MTUsYl90cmFuc3BhcmVudCxjX2ZpdCxmX2F1dG8scV9hdXRvLHdfNzUwL3YxNjg0MjMzMTgzL2NydXNhZGVyL3ZhcmlhbnRzLzQwMzcwMDUwL0F6aXphLVJ1Zy04Xy14LTEwXy1XaGl0ZS1CbGFjay0xNjg0MjMzMTgyLmpwZw%3D%3D%2C244%2C305%2C501%2C457%2Cn%2Cn%2Cundefined%2C0%2CRugs%3Arectangle%2CNaN%2C%2C%2C&p=20596%2C321%2C368%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=20292%2C222%2C402%2Cn%2Cn%2C0%2C%2C345%2C50485195%2C58938822%2Cc8963b2e232b9833cfdc625fda4259b02e875bad5a4e929452d1039a0dfd9241&p=22076%2C325%2C273%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=21309%2C618%2C390%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=20610%2C544%2C435%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&w=%23b0b0b0&f=%23EAC9A4&s=595&h=297&t=wood&d=plain&V=1&b=f&i=us-1',
          },
        ],
        [
          'Madison',
          {
            image_link: desktop
              ? 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/yymvatdkjtgzq8rh6bla'
              : 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/ghb7bctt0vttt6oyesx6',
            click_link:
              'https://www.castlery.com/us/room-designer?gallery=truep%3D20027%2CaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vY2FzdGxlcnkvaW1hZ2UvcHJpdmF0ZS9lX3RyaW06MTUsYl90cmFuc3BhcmVudCxjX2ZpdCxmX2F1dG8scV9hdXRvLHdfNzUwL3YxNjg0MjMzNDU5L2NydXNhZGVyL3ZhcmlhbnRzLzQwMzcwMDQyL0Rlc2ktV29vbC1SdWctOF8teC0xMF8tU3BlY2tsZWQtQmVpZ2UtMTY4NDIzMzQ1OS5qcGc%3D%2C244%2C305%2C454.2302357836338%2C454.2787794729543%2Cn%2Cn%2Cundefined%2C0%2CRugs%3Arectangle%2Cundefined%2C%2C%2C&p=17031%2C834%2C333%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=18893%2C193%2C362%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=20275%2C469%2C351%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=21166%2C538%2C434%2Cn%2Cn%2C0%2C%2CNaN%2C33808816%2C40181545%2C918610ad408d3622c6dc5daff332d3a3efefcf235247cac114a7c309a11c0df1&w=%23b0b0b0&f=%23EAC9A4&s=595&h=297&t=wood&d=plain&V=1&b=f&i=us-3',
          },
        ],
        [
          'Adams',
          {
            image_link: desktop
              ? 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/opsup1ztjbdase5hlixc'
              : 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/yi9wvy9dntpjexsnumds',
            click_link:
              'https://www.castlery.com/us/room-designer?gallery=truep%3D20027%2CaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vY2FzdGxlcnkvaW1hZ2UvcHJpdmF0ZS9lX3RyaW06MTUsYl90cmFuc3BhcmVudCxjX2ZpdCxmX2F1dG8scV9hdXRvLHdfNzUwL3YxNjg0MjMzNDU5L2NydXNhZGVyL3ZhcmlhbnRzLzQwMzcwMDQyL0Rlc2ktV29vbC1SdWctOF8teC0xMF8tU3BlY2tsZWQtQmVpZ2UtMTY4NDIzMzQ1OS5qcGc%3D%2C244%2C305%2C476.53061224489784%2C458.46938775510193%2Cn%2Cn%2Cundefined%2C0%2CRugs%3Arectangle%2Cundefined%2C%2C%2C&p=17010%2C424.48979591836735%2C433.97959183673476%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=22080%2C263.265306122449%2C276.8367346938776%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=20846%2C502.0408163265305%2C362.5510204081633%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&w=%23b0b0b0&f=%23EAC9A4&s=595&h=297&t=wood&d=plain&V=1&b=f&i=us-3',
          },
        ],
        [
          'Isaac',
          {
            image_link: desktop
              ? 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/sxuxj9bml2owiwyci9s8'
              : 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/yrii0tmsefkohopu9nu7',
            click_link:
              'https://www.castlery.com/us/room-designer?&gallery=truep=20039%2CaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vY2FzdGxlcnkvaW1hZ2UvcHJpdmF0ZS9lX3RyaW06MTUsYl90cmFuc3BhcmVudCxjX2ZpdCxmX2F1dG8scV9hdXRvLHdfNzUwL3YxNjg0MjMzMTgzL2NydXNhZGVyL3ZhcmlhbnRzLzQwMzcwMDUwL0F6aXphLVJ1Zy04Xy14LTEwXy1XaGl0ZS1CbGFjay0xNjg0MjMzMTgyLmpwZw%3D%3D%2C244%2C305%2C490.81632653061234%2C451.32653061224494%2Cn%2Cn%2Cundefined%2C0%2CRugs%3Arectangle%2Cundefined%2C%2C%2C&p=20290%2C463.26530612244915%2C365.61224489795916%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=20288%2C558.1632653061224%2C429.8979591836735%2Cn%2Cn%2C0%2C%2Cundefined%2C%2C%2C&p=19354%2C718.3673469387754%2C361.5306122448979%2Cn%2Cn%2C0%2C%2Cundefined%2C%2C%2C&p=22076%2C718.3673469387754%2C271.734693877551%2Cn%2Cn%2C0%2C%2Cundefined%2C%2C%2C&p=20312%2C816.3265306122449%2C411.53061224489795%2Cn%2Cn%2C0%2C%2Cundefined%2C%2C%2C&w=%23b0b0b0&f=%23EAC9A4&s=595&h=297.5&t=wood&d=plain&V=1&b=f&i=us-1',
          },
        ],
        [
          'Remi',
          {
            image_link: desktop
              ? 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/riilzod4yebhcgryyoha'
              : 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/cxmgpagtrx92coqcromt',
            click_link:
              'https://www.castlery.com/us/room-designer?gallery=truep%3D20033%2CaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vY2FzdGxlcnkvaW1hZ2UvcHJpdmF0ZS9lX3RyaW06MTUsYl90cmFuc3BhcmVudCxjX2ZpdCxmX2F1dG8scV9hdXRvLHdfNzUwL3YxNjg0MjM0MjM2L2NydXNhZGVyL3ZhcmlhbnRzLzQwMzcwMDQ2L0xvcmVuem8tV29vbC1SdWctOF8teC0xMF8tV2hpdGUtQmxhY2stMTY4NDIzNDIzNi5qcGc%3D%2C244%2C305%2C482%2C445%2Cn%2Cn%2Cundefined%2C0%2CRugs%3Arectangle%2CNaN%2C%2C%2C&p=20568%2C487%2C327%2Cn%2Cn%2C0%2C%2C0%2C10595396%2C12889015%2C08807b313e72c1e3d864eb4449bb56a3d896c3d1c0a1ba071db46488ffe5e6b9&p=17012%2C478%2C426%2Cn%2Cn%2C0%2C%2C0%2C14985902%2C21358630%2Ca286c5c34b4e7f13f5c9b1cb67c1cce739ba4db81037ad1b1bbbda94e5a07a48&p=20579%2C768%2C412%2Cn%2Cn%2C0%2C%2C30%2C46340915%2C54827052%2Cc23a1fb1d4f9087ed4303f8e2e7fd7b5f54f73cebb3b255e2e9484b92d2e1db0&p=19706%2C155%2C361%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&w=%23b0b0b0&f=%23EAC9A4&s=518&h=259&t=wood&d=plain&V=1&b=f&i=us-2',
          },
        ],
        [
          'Dawson',
          {
            image_link: desktop
              ? 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/aah9rnlvddvorvklzqra'
              : 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/twsnzktxufrpgqlt6n4d',
            click_link:
              'https://www.castlery.com/us/room-designer?&gallery=truep=22078%2C184%2C272%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=22610%2C494%2C345%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=22114%2C658%2C407%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=22116%2C126%2C401%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=21707%2C414%2C437%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=21709%2C821%2C375%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&w=%23b0b0b0&f=%23EAC9A4&s=595&h=297&t=wood&d=plain&V=1&b=f&i=us-1',
          },
        ],
        [
          'Mori',
          {
            image_link: desktop
              ? 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/w0cmi8npi1g6g7qghqea'
              : 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/uyhg5xavyetr2zosrzkx',
            click_link:
              'https://www.castlery.com/us/room-designer?gallery=truep%3D21808%2C558%2C457%2Cn%2Cn%2C0%2C%2CNaN%2C%2C%2C&p=22579%2C409%2C383%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=22572%2C834%2C450%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=22557%2C830%2C352%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&w=%23b0b0b0&f=%23EAC9A4&s=595&h=297&t=wood&d=plain&V=1&b=f&i=us-3',
          },
        ],
        [
          'Pebble',
          {
            image_link: desktop
              ? 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/itfrje6ropujllxdoju3'
              : 'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1/New%20Room%20Designer/w9di1kllsrefrwf7034v',
            click_link:
              'https://www.castlery.com/us/room-designer?p=22082%2C132%2C230%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=19807%2C860%2C422%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=19354%2C129%2C317%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=19393%2C461%2C306%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&p=17013%2C562%2C413%2Cn%2Cn%2C0%2C%2C0%2C%2C%2C&w=%23b0b0b0&f=%23EAC9A4&s=457&h=228&t=wood&d=plain&V=1&b=f&i=us-2',
          },
        ],
      ]),
    []
  );
  const observerSelectorName = 'hullabalookSection';
  useEffect(() => {
    let isMounted = true;

    const script = document.createElement('script');
    script.defer = true;
    script.id = 'hintegrate_script';
    script.src = 'https://castlery.hulla-cdn.com/hintegrate.js';
    document.body.appendChild(script);

    script.onload = () => {
      if (isMounted) {
        checkProduct(productId);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [productId]);
  useEffect(() => {
    const {
      furniture_tool_url,
      modular_tool_url,
      configurator_tool_banner_desktop,
      configurator_tool_banner_mobile,
      room_designer_banner_desktop,
      room_designer_banner_mobile,
    } = variant;
    const configuratorToolBannerDesktop = configurator_tool_banner_desktop?.path
      ? genVideoInfo(configurator_tool_banner_desktop?.path)
      : configurator_tool_banner_desktop?.links?.large || '';
    const configuratorToolBannerMobile = configurator_tool_banner_mobile?.path
      ? genVideoInfo(configurator_tool_banner_mobile?.path)
      : configurator_tool_banner_mobile?.links?.large || '';
    const roomDesignerBannerDesktop = room_designer_banner_desktop?.path
      ? genVideoInfo(room_designer_banner_desktop?.path)
      : room_designer_banner_desktop?.links?.large || '';
    const roomDesignerBannerMobile = room_designer_banner_mobile?.path
      ? genVideoInfo(room_designer_banner_mobile?.path)
      : room_designer_banner_mobile?.links?.large || '';
    if (furniture_tool_url && !!roomDesignerBannerDesktop && !!roomDesignerBannerMobile) {
      setNewRoomTool({
        furniture_tool_url,
        roomDesignerBannerDesktop,
        roomDesignerBannerMobile,
      });
      setNewRoomShow(true);
    } else {
      setNewRoomShow(false);
    }
    if (modular_tool_url && !!configuratorToolBannerDesktop && !!configuratorToolBannerMobile) {
      setModularTool({
        modular_tool_url,
        configuratorToolBannerDesktop,
        configuratorToolBannerMobile,
      });
      setModularShow(true);
    } else {
      setModularShow(false);
    }
  }, [variant]);

  useEffect(() => {
    if (dyRoomDesigner?.experiment === 'B' && RoomDesignerABTest.get(collection)) {
      setTestShow(true);
    } else {
      setTestShow(false);
    }
  }, [RoomDesignerABTest, collection, dyRoomDesigner]);

  const trackClickLink = () => {
    dispatch({
      type: EVENT_PDP_ROOM_DESIGNER,
    });
    if (modularShow) {
      if (dyModularTool) {
        reportClickEngagement({
          decisionId: dyModularTool.decisionId,
          variationId: dyModularTool.variationId,
        });
        dispatch({
          type: EVENT_DY_AB_TEST,
          result: {
            campaignName: modularSelector,
            variation: dyModularTool.type,
          },
        });
      }
    }
    if (isTestShow) {
      // dy
      reportClickEngagement({
        decisionId: dyRoomDesigner.decisionId,
        variationId: dyRoomDesigner.variationId,
      });
      // ga4
      dispatch({
        type: EVENT_DY_AB_TEST,
        result: {
          campaignName: selector,
          variation: dyRoomDesigner.experiment,
        },
      });
    }
  };

  const blankBackgrounds = {
    SG: 'https://res.cloudinary.com/castlery/image/upload/v1684378872/static/room-designer/banner_background_sg.jpg',
    AU: 'https://res.cloudinary.com/castlery/image/upload/v1684379481/static/room-designer/banner_background_au.jpg',
    US: 'https://res.cloudinary.com/castlery/image/upload/v1684379485/static/room-designer/banner_background_us.jpg',
    CA: 'https://res.cloudinary.com/castlery/image/upload/v1684379485/static/room-designer/banner_background_us.jpg',
    UK: 'https://res.cloudinary.com/castlery/image/upload/v1684379485/static/room-designer/banner_background_us.jpg',
  };
  const defaultBackgrounds = {
    SG: desktop
      ? 'https://res.cloudinary.com/castlery/image/upload/v1686126461/static/room-designer/banner_default_background_sg.png'
      : 'https://res.cloudinary.com/castlery/image/upload/v1686126869/static/room-designer/banner_default_background_sg_mobile.png',
    AU: desktop
      ? 'https://res.cloudinary.com/castlery/image/upload/v1686126461/static/room-designer/banner_default_background_au.png'
      : 'https://res.cloudinary.com/castlery/image/upload/v1686126869/static/room-designer/banner_default_background_au_mobile.png',
    US: desktop
      ? 'https://res.cloudinary.com/castlery/image/upload/v1686126461/static/room-designer/banner_default_background_us.png'
      : 'https://res.cloudinary.com/castlery/image/upload/v1686126869/static/room-designer/banner_default_background_us_mobile.png',
    CA: desktop
      ? 'https://res.cloudinary.com/castlery/image/upload/v1686126461/static/room-designer/banner_default_background_us.png'
      : 'https://res.cloudinary.com/castlery/image/upload/v1686126869/static/room-designer/banner_default_background_us_mobile.png',
    UK: desktop
      ? 'https://res.cloudinary.com/castlery/image/upload/v1686126461/static/room-designer/banner_default_background_us.png'
      : 'https://res.cloudinary.com/castlery/image/upload/v1686126869/static/room-designer/banner_default_background_us_mobile.png',
  };

  const pictiureFilter = () => {
    if (isLoaded) {
      if (isTestShow) {
        return RoomDesignerABTest.get(collection).image_link;
      }
      if (!isExist) {
        return defaultBackgrounds[__COUNTRY__];
      }
    }
    return blankBackgrounds[__COUNTRY__];
  };

  const bannerFilter = () => {
    if ((!modularShow || dyModularTool?.modularBannerShow === 'false') && (!newRoomShow || isTestShow)) {
      return (
        <ReactPicture
          srcset={pictiureFilter()}
          alt="Room Designer Background"
          loader={{
            ratio: desktop ? 0.3591 : 0.5398,
          }}
          lazy={false}
        />
      );
    }
    let id = '';
    let videoRoot = '';
    let pictureSrc = '';
    let altText = '';
    if (modularShow && (dyModularTool?.modularBannerShow === 'true' || !dyModularTool)) {
      altText = 'Modular Tool';
      const configuratorToolBannerDesktop = modularTool?.configuratorToolBannerDesktop;
      const configuratorToolBannerMobile = modularTool?.configuratorToolBannerMobile;
      if (
        (desktop && typeof configuratorToolBannerDesktop === 'string') ||
        (!desktop && typeof configuratorToolBannerMobile === 'string')
      ) {
        pictureSrc = desktop ? configuratorToolBannerDesktop : configuratorToolBannerMobile;
      } else {
        id = desktop ? configuratorToolBannerDesktop?.id : configuratorToolBannerMobile?.id;
        videoRoot = desktop ? configuratorToolBannerDesktop?.videoRoot : configuratorToolBannerMobile?.videoRoot;
      }
    }
    if (newRoomShow && !isTestShow && (dyModularTool?.modularBannerShow === 'false' || !modularShow)) {
      altText = 'Room Designer';
      const roomDesignerBannerDesktop = newRoomTool?.roomDesignerBannerDesktop;
      const roomDesignerBannerMobile = newRoomTool?.roomDesignerBannerMobile;
      if (
        (desktop && typeof roomDesignerBannerDesktop === 'string') ||
        (!desktop && typeof roomDesignerBannerMobile === 'string')
      ) {
        pictureSrc = desktop ? roomDesignerBannerDesktop : roomDesignerBannerMobile;
      } else {
        id = desktop ? roomDesignerBannerDesktop?.id : roomDesignerBannerMobile?.id;
        videoRoot = desktop ? roomDesignerBannerDesktop?.videoRoot : roomDesignerBannerMobile?.videoRoot;
      }
    }

    return pictureSrc ? (
      <ReactPicture
        srcset={pictureSrc}
        alt={`${altText} Background"`}
        loader={{
          ratio: desktop ? 0.3591 : 0.5398,
        }}
        lazy={false}
      />
    ) : (
      <Video
        id={id}
        videoRoot={videoRoot}
        muted
        resolution="1080P"
        showControls={false}
        ratios={desktop ? 0.3591 : 0.5398}
        needLazyLoad
      />
    );
  };

  const urlFilter = () => {
    if (modularShow) {
      if (dyModularTool?.modularBannerShow === 'true' || !dyModularTool) {
        return modularTool.modular_tool_url;
      }
    }
    if (isTestShow) {
      return RoomDesignerABTest.get(collection).click_link;
    }
    if (newRoomShow) {
      return newRoomTool.furniture_tool_url;
    }
    return `/${__COUNTRY__.toLocaleLowerCase()}${getUrl('room-designer')}${isExist ? `?p=${productId}` : ''}`;
  };

  const handleIntersect = useCallback(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (modularShow && dyModularTool) {
            dispatch({
              type: EVENT_DY_EVENT,
              result: {
                detailAction: 'impression_modular_tool_ab_test',
                label: `variant ${dyModularTool?.type}`,
              },
            });
          }
          if (dyRoomDesigner && (dyModularTool?.modularBannerShow === 'false' || !modularShow)) {
            dispatch({
              type: EVENT_DY_EVENT,
              result: {
                detailAction: 'impression_room_designer_ab_test',
                label: `variant ${dyRoomDesigner?.experiment}`,
              },
            });
          }
          const target = entry.target;
          observer.unobserve(target);
          setObserveOnce(false);
        }
      });
    },
    [dyRoomDesigner, dyModularTool, dispatch, modularShow]
  );

  const createObserver = useCallback(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 1.0,
    };

    const observer = new IntersectionObserver(handleIntersect, options);
    const element = document.querySelector(`.${observerSelectorName}`);
    if (element) {
      observer.observe(element);
      setObserveOnce(true);
    }
  }, [handleIntersect]);

  useEffect(() => {
    if (IntersectionObserver && (dyRoomDesigner || dyModularTool) && !observeOnce) {
      createObserver();
    }
  }, [createObserver, dyRoomDesigner, dyModularTool]);

  return (
    <div className={style.hullaSection} data-panel={productId}>
      <div className={`${style.hullaSection}__design`}>
        <div className={`${style.hullaSection}__design__banner`}>
          <Link className={observerSelectorName} href={urlFilter()} onClick={trackClickLink}>
            {bannerFilter()}
            {(dyModularTool?.modularBannerShow === 'false' || !modularShow) && !isTestShow && !newRoomShow && imageSrc && (
              <div className={classNames(`${style.hullaSection}__design__product in-${__COUNTRY__}`)}>
                <ReactPicture
                  className={`${style.hullaSection}__design__product__main`}
                  srcset={imageSrc}
                  alt="Try our Room Designer tool"
                />
                <ReactPicture
                  className={`${style.hullaSection}__design__product__icon`}
                  srcset="https://res.cloudinary.com/castlery/image/upload/v1684382730/static/room-designer/icon_drag.png"
                  alt="Try our Room Designer tool - drag icon"
                />
                <ReactPicture
                  className={`${style.hullaSection}__design__product__icon is-del`}
                  srcset="https://res.cloudinary.com/castlery/image/upload/v1684382729/static/room-designer/icon_delete.png"
                  alt="Try our Room Designer tool - delete icon"
                />
              </div>
            )}
          </Link>
        </div>

        <div className={`${style.hullaSection}__design__desc`}>
          {dyModularTool?.modularBannerShow === 'false' || !modularShow
            ? 'See how our furniture pairs with other pieces you‘ve been eyeing - no heavy lifting required.'
            : 'Combine different elements of your favorite furniture and create your ideal configuration.'}
        </div>

        <Link href={urlFilter()} className={`${style.hullaSection}__design__link`} onClick={trackClickLink}>
          {dyModularTool?.modularBannerShow === 'false' || !modularShow
            ? 'Try Our Room Designer Tool'
            : 'Try our Configurator Tool'}
        </Link>
      </div>
    </div>
  );
}

HullaSection.propTypes = {
  productId: PropTypes.string,
};

export default HullaSection;
