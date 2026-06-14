import React from 'react';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';
import style from './style.scss';

const NotJoin = () => {
  const { desktop } = useBreakpoints();
  return (
    <div className={`${style.notJoin}`}>
      {/* Not joining the event? / Missed your chance to sign up? */}
      <div className={`${style.notJoin}__title`}>Missed your chance to sign up?</div>
      <div className={`${style.notJoin}__desc`}>
        Get your hands on a <div>free Castlery x Van Gogh:{!desktop && <br />} The Immersive Experience yoga mat</div>{' '}
        with a min. spend of $1,500 in-store!
      </div>
      <div className={`${style.notJoin}__tip`}>*Valid from May 27-28, while stocks last</div>
    </div>
  );
};

export default NotJoin;
