import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import ReactSvg from 'components/ReactSVG';
import { Link } from 'react-router';
import style from './style.scss';

const NotificationBar = ({ setShowNotification, data }) => {
  const { msg1, msg2, linkTo, undo } = data;
  const [container] = useState(() => document.createElement('div'));
  const root = document.querySelector(`#root`);
  const [counter, setCounter] = useState(5);
  useEffect(() => {
    container.classList.add(style.notification);
    root.appendChild(container);
    const timer = setInterval(() => {
      if (counter === 0) {
        clearInterval(timer);
      }
      setCounter((prevCount) => prevCount - 1);
    }, 1000);
    return () => {
      clearInterval(timer);
      root.removeChild(container);
    };
  }, []);

  useEffect(() => {
    if (counter === 0) {
      setShowNotification(false);
    }
  }, [counter, setShowNotification]);

  useEffect(() => {
    setCounter(5);
  }, [msg1, msg2, linkTo, undo]);

  const children = (
    <>
      <div>
        <span>{msg1}</span>
        {linkTo && <Link className={`${style.notification}__actionText`} to={linkTo}>{`${msg2} (0:0${counter})`}</Link>}
        {undo && (
          <span
            className={`${style.notification}__actionText`}
            onClick={() => {
              undo();
              setShowNotification(false);
            }}
            role="button"
          >{`Undo (0:0${counter})`}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          setShowNotification(false);
        }}
      >
        <ReactSvg name="close" />
      </button>
    </>
  );

  return ReactDOM.createPortal(children, container);
};

export default NotificationBar;
