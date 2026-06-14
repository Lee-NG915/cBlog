import React from 'react';
import ReactDOM from 'react-dom';
import LoadingBarWrapper from './LoadingBarWrapper';

class LoadingBar {
  // make sure end only excute when loading
  loading = false;

  // make suer the occurence order of start and end
  counter = 0;

  init(node) {
    ReactDOM.render(<LoadingBarWrapper ref={(c) => (this.bar = c)} />, node);
  }

  start() {
    if (this.counter >= 0) {
      // clear previous timer if availbale
      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        this.timer = null;
        if (this.bar) {
          this.bar.start();
          this.loading = true;
        }
      }, 100);
    }
    this.counter++;
  }

  end() {
    if (this.counter > 0) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (this.loading) {
        this.bar.end();
        this.loading = false;
      }
    }
    this.counter--;
  }

  reset() {
    if (this.bar) {
      this.bar.reset();
    }
  }
}

export default new LoadingBar();
