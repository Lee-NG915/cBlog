import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import style from './style.scss';

export default class Collapse extends Component {
  static collapseList = {};

  static propTypes = {
    header: PropTypes.element,
    content: PropTypes.element,
    collapse: PropTypes.bool,
    name: PropTypes.string, // used to group collapse
    className: PropTypes.string,
    disabledClick: PropTypes.bool,
    disabledAutoCollapse: PropTypes.bool,
  };

  static defaultProps = {
    collapse: true,
    disabledClick: false,
    disabledAutoCollapse: false,
  };

  constructor(props) {
    super(props);
    this.state = {
      collapse: props.collapse,
    };
  }

  componentDidMount() {
    // attach this.collapse to the collapseList if has name
    const { collapse } = this.state;
    const { name } = this.props;
    if (name) {
      const collapseAction = this.collapse;

      if (Collapse.collapseList[name]) {
        Collapse.collapseList[name].push(collapseAction);
      } else {
        Collapse.collapseList[name] = [collapseAction];
      }
      this.removeSelf = () => {
        const index = Collapse.collapseList[name].indexOf(collapseAction);
        if (index > -1) {
          Collapse.collapseList[name].splice(index, 1);
        }
      };
    }

    if (collapse) {
      this.body.style.height = '0px';
    } else {
      this.body.style.height = 'auto';
    }
  }

  componentWillUnmount() {
    if (this.removeSelf) {
      this.removeSelf();
    }
  }

  onClick = () => {
    const { collapse } = this.state;
    const { name, disabledAutoCollapse } = this.props;
    if (collapse) {
      if (name && !disabledAutoCollapse) {
        Collapse.collapseList[name].forEach((c) => c());
      }
      this.expand();
    } else {
      this.collapse();
    }
  };

  collapse = () => {
    const { collapse } = this.state;
    if (!collapse) {
      const { body } = this;
      body.style.height = `${body.children[0].clientHeight}px`;
      setTimeout(() => {
        body.style.height = '0px';
      }, 0);
      this.setState({
        collapse: true,
      });
    }
  };

  expand = () => {
    const { collapse } = this.state;
    if (collapse) {
      const { body } = this;
      body.style.height = `${body.children[0].offsetHeight}px`;
      setTimeout(() => {
        body.style.height = 'auto';
        this.setState({
          collapse: false,
        });
      }, 300);
    }
  };

  render() {
    const { header, content, className, disabledClick } = this.props;
    const { collapse } = this.state;

    return (
      <div
        className={classNames(style.collapse, className, {
          'is-expanded': !collapse,
        })}
      >
        {disabledClick ? (
          header
        ) : (
          <button type="button" className="btn" onClick={this.onClick}>
            {header}
          </button>
        )}

        <div ref={(c) => (this.body = c)}>{content}</div>
      </div>
    );
  }
}
