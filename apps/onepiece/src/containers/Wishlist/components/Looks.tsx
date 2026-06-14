/* eslint-disable @typescript-eslint/no-unsafe-call */
import React from 'react';

import { Card, CardOverflow, Grid, IconButton } from '@castlery/fortress';
import ReactPicture from 'components/ReactPicture';
import { FavoriteFilled } from '@castlery/fortress/Icons';
import { remove } from 'redux/modules/theLookWishlist';
import { useDispatch } from 'react-redux';
import { EVENT_SHOP_THE_LOOK } from 'utils/track/constants';

import type { LooksProps, Look } from './props';

const Looks: React.FC<LooksProps> = ({ looks, setShowTheLookDetail, onUnLikeLook }) => {
  const dispatch: any = useDispatch();

  const unLikeLook = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, look: Look) => {
    e.stopPropagation();
    dispatch(remove({ shop_the_look_id: look.shop_the_look_id })).then(() => {
      onUnLikeLook(look);
    });
  };

  const onClickLook = (look: Look) => {
    dispatch({
      type: EVENT_SHOP_THE_LOOK,
      result: {
        detailAction: 'view_saved_look',
        label: look.shop_the_look_id,
      },
    });
    setShowTheLookDetail(look);
  };

  return (
    <Grid container width="100%" spacing={2}>
      {looks.map((look, i) => (
        <Grid
          xs={12}
          md={6}
          key={i}
          sx={{
            position: 'relative',
          }}
        >
          <Card>
            <CardOverflow
              sx={{
                padding: 0,
                cursor: 'pointer',
              }}
              onClick={(e) => onClickLook(look)}
            >
              <ReactPicture
                {...({
                  srcset: look.background_image,
                } as any)}
              />
              <IconButton
                variant="soft"
                onClick={(e) => {
                  unLikeLook(e, look);
                }}
                sx={{
                  position: 'absolute',
                  zIndex: 2,
                  borderRadius: '50%',
                  right: '1rem',
                  top: '1rem',
                  // backgroundColor: 'white',
                }}
              >
                <FavoriteFilled />
              </IconButton>
            </CardOverflow>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default Looks;
