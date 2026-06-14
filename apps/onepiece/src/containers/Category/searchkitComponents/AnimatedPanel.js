import React from 'react';
import { animate } from 'utils/animate';
import { Panel, block } from 'searchkit';

export default class AnimatedPanel extends Panel {
  componentDidMount() {
    if (this.props.collapsable) {
      this.setStyle(this.state.collapsed);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.defaultCollapsed !== this.props.defaultCollapsed) {
      if (this.props.collapsable) {
        this.setStyle(this.props.defaultCollapsed);
      }
    }
  }

  setStyle(isCollapsed) {
    if (isCollapsed) {
      this.content.style.height = '0px';
      this.content.style.overflow = 'hidden';
    } else {
      this.content.style.height = 'auto';
      this.content.style.overflow = 'visible';
    }
  }

  toggleCollapsed() {
    // one toggle a time
    if (this.state.collapsing) {
      return;
    }

    const height = this.content.children[0].clientHeight;
    if (this.state.collapsed) {
      animate({
        from: 0,
        to: height,
        duration: 200,
        callback: (h) => (this.content.style.height = `${h}px`),
        done: () => {
          this.content.style.height = 'auto';
          this.content.style.overflow = 'visible';
          this.setState({
            collapsing: false,
          });
        },
      });
    } else {
      this.content.style.overflow = 'hidden';
      animate({
        from: height,
        to: 0,
        duration: 200,
        callback: (h) => (this.content.style.height = `${h}px`),
        done: () => {
          this.setState({
            collapsing: false,
          });
        },
      });
    }

    this.setState({
      collapsing: true,
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    const { title, mod, className, disabled, children, collapsable } = this.props;
    const collapsed = collapsable && this.state.collapsed;
    const containerBlock = block(mod).state({ disabled });

    let titleDiv;
    if (collapsable) {
      titleDiv = (
        <div
          role="button"
          className={containerBlock.el('header').state({ collapsable, collapsed })}
          onClick={this.toggleCollapsed.bind(this)}
        >
          {title}
        </div>
      );
    } else {
      titleDiv = <div className={containerBlock.el('header')}>{title}</div>;
    }

    return (
      <div className={containerBlock.mix(className).state({ enabled: !disabled })}>
        {titleDiv}
        <div className={containerBlock.el('content').state({ collapsed })} ref={(c) => (this.content = c)}>
          <div>{children}</div>
        </div>
      </div>
    );
  }
}
