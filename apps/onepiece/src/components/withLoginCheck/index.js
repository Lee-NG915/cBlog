import React, { useEffect, useContext } from 'react';
import { useSelector } from 'react-redux';
import { FrameContext } from 'containers/Frame/FrameContext';

export function withLoginCheck(Component) {
  function WrappedComponent(props) {
    const user = useSelector((state) => state.auth.user);
    const hasLogin = !!(user && user.id);
    const frame = useContext(FrameContext);
    const needCheck = __CLIENT__ && !hasLogin;

    useEffect(() => {
      if (needCheck) {
        frame.openModal('login');
      }
      return () => {
        if (needCheck) {
          frame?.removeModal();
        }
      };
    }, [needCheck, frame]);

    return __CLIENT__ && hasLogin ? <Component {...props} /> : <></>;
  }

  WrappedComponent.propTypes = {
    ...Component.propTypes,
    loginSuccess: () => {},
    loginFailed: () => {},
  };
  return WrappedComponent;
}
