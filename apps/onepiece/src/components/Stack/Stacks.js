// eslint-disable-next-line import/no-import-module-exports
import { randomId } from 'utils/number';

export default class Stacks {
  stacks = [];

  history = []; // record browser history chain

  pointer = -1;

  limit = 3;

  disabledPaths = []; // when entering or leaving these paths, disable stacks

  constructor(limit, disabledPaths) {
    this.limit = limit;
    this.disabledPaths = disabledPaths;
  }

  static savedProps(props) {
    const { location, routes, params, components } = props;
    return {
      location,
      routes,
      params,
      components,
      key: randomId(), // the key to render the stack
    };
  }

  historyReset() {
    this.pointer = -1;
    this.history = [];
  }

  historyPush(key, pathname) {
    this.pointer += 1;
    this.history.splice(this.pointer);
    this.history.push({ key, pathname });
  }

  historyReplace(key, pathname) {
    if (this.history.length === 0) {
      this.pointer += 1;
    }
    this.history.splice(this.pointer, 1, { key, pathname });
  }

  historyBack() {
    this.pointer -= 1;
  }

  historyForward() {
    this.pointer += 1;
  }

  stacksPush(props) {
    this.stacks.push(Stacks.savedProps(props));
    if (this.stacks.length > this.limit) {
      this.stacks.shift();
    }
  }

  stacksReplace(props) {
    this.stacks.splice(-1, 1, Stacks.savedProps(props));
  }

  add(props) {
    /**
     *
     * rebase history and stack if entering or leaving disabled paths
     *
     */

    const containDisabledPaths = this.disabledPaths.some((path) => {
      // entering path is a disabled path
      if (props.location.pathname === path) {
        return true;
      }

      // leaving path is a disabled path
      if (this.history.length > 0 && this.history[this.pointer].pathname === path) {
        return true;
      }

      return false;
    });

    if (containDisabledPaths) {
      // rebase history and stack
      this.historyReset();
      this.historyPush(props.location.key, props.location.pathname);
      this.stacks = [Stacks.savedProps(props)];
      return;
    }

    /**
     *
     * replace, pop, and push
     *
     */

    if (props.location.action === 'REPLACE') {
      // replace happens whehn
      // 1. manually call router.replace
      // 2. click the same link twice in a sequence.
      this.historyReplace(props.location.key, props.location.pathname);
      this.stacksReplace(props);
    } else if (props.location.action === 'POP' && this.history.length > 0) {
      // Hot reload will trigger 'pop', avoid it if hot reload is enabled
      if (module.hot && props.location.key === this.history[this.pointer].key) {
        return;
      }

      if (this.pointer > 0 && props.location.key === this.history[this.pointer - 1].key) {
        // Browser 'back' button
        this.historyBack();
        if (props.location.pathname !== this.history[this.pointer + 1].pathname) {
          if (this.stacks.length > 1) {
            this.stacks.pop();
          } else {
            this.stacks = [Stacks.savedProps(props)];
          }
        }
      } else if (this.pointer < this.history.length - 1 && props.location.key === this.history[this.pointer + 1].key) {
        // Browser 'forward' button
        this.historyForward();
        if (props.location.pathname !== this.history[this.pointer - 1].pathname) {
          this.stacksPush(props);
        }
      } else {
        // rebase history if back or forward out of current page
        // have to rebase because we can't tell it's a back or forward
        this.historyReset();
        this.historyPush(props.location.key, props.location.pathname);
        this.stacks = [Stacks.savedProps(props)];
      }
    } else {
      this.historyPush(props.location.key, props.location.pathname);
      if (this.history.length === 1 || props.location.pathname !== this.history[this.pointer - 1].pathname) {
        this.stacksPush(props);
      }
    }

    // make sure the top stack always have the right location.
    this.stacks[this.stacks.length - 1].location = props.location;
  }

  get() {
    return this.stacks;
  }
}
