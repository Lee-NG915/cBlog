import React, { useState } from 'react';
import ReactPicture from 'components/ReactPicture';
import SvgIcon from 'components/SvgIcon';
import { remove, add, load as loadTheLookWishlist } from 'redux/modules/theLookWishlist';
import { useDispatch } from 'react-redux';
import Spinner from 'components/Spinner';
import { EVENT_SHOP_THE_LOOK } from 'utils/track/constants';
import style from './style.scss';

export default function Look({ data, setShowTheLookDetail, setShowNotification, setNotificationData }) {
  const [liked, setLiked] = useState(true);
  const [loadingLikebtn, setLoadingLikebtn] = useState(false);
  const dispatch = useDispatch();
  return (
    <div className={`${style.look}`}>
      <div
        className={`${style.look}__imageWrapper`}
        onClick={() => {
          if (!loadingLikebtn) {
            dispatch({
              type: EVENT_SHOP_THE_LOOK,
              result: {
                detailAction: 'view_saved_look',
                label: data.shop_the_look_id,
              },
            });
            setShowTheLookDetail(data);
          }
        }}
        role="button"
      >
        <ReactPicture srcset={data.background_image} />
      </div>
      <button
        type="button"
        className={`${style.look}__likeBtn`}
        disabled={loadingLikebtn}
        onClick={() => {
          dispatch({
            type: EVENT_SHOP_THE_LOOK,
            result: {
              detailAction: 'unsave_this_look',
              label: data.shop_the_look_id,
            },
          });
          setLoadingLikebtn(true);
          remove({ shop_the_look_id: data.shop_the_look_id })(dispatch)
            .then(() => {
              setNotificationData({
                msg1: 'You have successfully removed this look from your wishlist.',
                undo: () => add(data)(dispatch),
              });
              setShowNotification(true);
              setLoadingLikebtn(false);
            })
            .catch(() => {
              setLoadingLikebtn(false);
              dispatch(loadTheLookWishlist());
            });
        }}
      >
        {loadingLikebtn ? (
          <Spinner className={`${style.look}__spinner`} />
        ) : (
          <SvgIcon width={25} name="heart" color="primary" fillOpacity={`${liked ? 1 : 0}`} />
        )}
      </button>
    </div>
  );
}
