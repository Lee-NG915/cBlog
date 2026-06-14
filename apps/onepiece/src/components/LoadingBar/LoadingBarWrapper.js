import React, { Component } from 'react';
import LoadingBar from './LoadingBar';

export default class LoadingBarWrapper extends Component {
  state = {
    percent: -1,
  };

  start() {
    this.setState({
      percent: 0,
    });
  }

  end() {
    this.setState({
      percent: 100,
    });
  }

  reset() {
    this.setState({
      percent: -1,
    });
  }

  render() {
    const { percent } = this.state;
    return <LoadingBar percent={percent} />;
  }
}
