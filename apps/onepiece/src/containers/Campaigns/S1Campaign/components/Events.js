import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import SignUp from './SignUp';
import WaitList from './WaitList';

const Events = ({ showWaitList, hidden }) => {
  const { data: eventsData } = useSelector((state) => state.events) || {};

  if (hidden) {
    return null;
  }
  if (showWaitList) {
    return <WaitList events={eventsData} />;
  }
  return <SignUp events={eventsData} />;
};
Events.propTypes = {
  showWaitList: PropTypes.bool,
  hidden: PropTypes.bool,
};

export default Events;
