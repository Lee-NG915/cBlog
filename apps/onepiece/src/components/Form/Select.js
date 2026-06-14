import React, { Component } from 'react';
import PropTypes, { number } from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router';
import isEqual from 'lodash/isEqual';
import ReactSVG from 'components/ReactSVG';
import SvgIcon from 'components/SvgIcon';
import { withUseBreakpoints } from 'utils/page';
import style from './select.scss';

@withUseBreakpoints
export default class Select extends Component {
  static propTypes = {
    options: PropTypes.object.isRequired, // {value: label}
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]), // initial value
    title: PropTypes.oneOfType([PropTypes.element, PropTypes.string]), // the placeholder for multi selections
    onChange: PropTypes.func, // this is for real selections
    onClick: PropTypes.func, // this is for links, do more actions before jump
    name: PropTypes.string,
    className: PropTypes.string,
    disabled: PropTypes.bool,
    mode: PropTypes.string, // button or link-internal or link-external or multi
    placeholder: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
    CustomOption: PropTypes.func, // custom option component
    breakpoints: PropTypes.object,
  };

  static defaultProps = {
    mode: 'button',
  };

  constructor(props) {
    super(props);

    this.state = {
      value: this.getInitialValue(props),
      hover: 0,
      open: false,
      focus: false,
      keyPressed: false, // true if open options with keyboard
    };

    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (desktop) {
      window.addEventListener('click', this.handleClick);
    } else {
      window.addEventListener('touchstart', this.handleClick);
    }
  }

  componentDidUpdate(prevProps) {
    const { value, options, mode } = this.props;
    if (!isEqual(prevProps.options, options) || !isEqual(prevProps.value, value)) {
      this.setState((state) => ({
        value: this.getInitialValue(this.props),
        open: mode === 'multi' ? state.open : false,
      }));
    }
  }

  componentWillUnmount() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (desktop) {
      window.removeEventListener('click', this.handleClick);
    } else {
      window.removeEventListener('touchstart', this.handleClick);
    }
  }

  handleClick = (e) => {
    const { open } = this.state;
    if (open && !this.traverseNodeList(e, style.select)) {
      this.hideOptions();
    }
  };

  traverseNodeList = (e, className) => {
    let { target } = e;

    while (target && !target.classList.contains(className) && target.tagName !== 'BODY') {
      target = target.parentNode;
    }

    return target && target.tagName !== 'BODY';
  };

  getInitialValue = (props) => {
    const { mode, options, value } = props;

    let selected;
    if (mode === 'multi') {
      if (value) {
        selected = Object.keys(options).filter((key) => value.indexOf(key) > -1);
      } else {
        selected = [];
      }
    } else if (value) {
      selected = Object.keys(options).find((key) => key === value) || Object.keys(options)[0];
    } else {
      selected = Object.keys(options)[0];
    }

    return selected;
  };

  // if the button is triggered by keyboard, keypressed is true
  showOptions = (keyPressed) => {
    const { options, mode } = this.props;
    const { value, open } = this.state;

    setTimeout(() => {
      let hover = 0;

      if (mode !== 'multi') {
        Object.keys(options).forEach((key, index) => {
          if (key === value) {
            hover = index;
          }
        });
      }

      if (open) {
        this.setState({
          open: false,
        });
        return;
      }

      this.setState({
        open: true,
        hover,
        keyPressed,
      });
    }, 0);
  };

  hideOptions = () => {
    this.setState({
      open: false,
    });
  };

  selectOption = (value) => {
    const { onChange, mode } = this.props;
    const { value: _value } = this.state;

    let newValue;

    if (mode === 'multi') {
      if (value) {
        const index = _value.indexOf(value);
        if (index > -1) {
          newValue = _value.slice();
          newValue.splice(index, 1);
        } else {
          newValue = [..._value, value];
        }
      } else {
        newValue = [];
      }
    } else {
      newValue = value;
    }

    this.setState({
      value: newValue,
      open: mode === 'multi',
    });

    if (onChange) {
      onChange(newValue);
    }
  };

  focus = () => {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (desktop) {
      this.setState({
        focus: true,
      });
    }
  };

  blur = () => {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (desktop) {
      this.setState({
        focus: false,
      });
    }
  };

  keyDown = (e) => {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    if (desktop) {
      const { open, focus, hover } = this.state;
      const { options, mode } = this.props;

      if (focus) {
        if (!open) {
          if (e.keyCode === 40 || e.keyCode === 13) {
            this.showOptions(true);
            e.preventDefault();
          }
        } else if (e.keyCode === 38 || e.keyCode === 40) {
          /**
           * For press up and down
           */
          const length = Object.keys(options).length + (mode === 'multi' ? 1 : 0);

          this.setState({
            hover: (length + hover + (e.keyCode - 39)) % length,
          });
          e.preventDefault();
        } else if (e.keyCode === 27) {
          /**
           * For esc
           */
          this.hideOptions();
          e.preventDefault();
        } else if (e.keyCode === 13) {
          /**
           * For enter
           */
          this.selectOption(Object.keys(options)[hover]);
          e.preventDefault();
        }
      }
    }
  };

  render() {
    const {
      options,
      name,
      className,
      disabled,
      mode,
      onClick,
      title,
      placeholder,
      CustomOption,
      breakpoints = {},
    } = this.props;
    const { value, open, hover, keyPressed } = this.state;
    const { desktop } = breakpoints;
    return (
      <div className={classNames(style.select, className)}>
        <input
          name={name}
          title={name}
          disabled
          hidden
          value={mode === 'multi' ? value.join(', ') : value}
          readOnly
          aria-hidden="true"
        />
        <button
          ref={(c) => (this.button = c)}
          type="button"
          className="btn ellipsis"
          onClick={() => this.showOptions(false)}
          onFocus={this.focus}
          onBlur={this.blur}
          onKeyDown={this.keyDown}
          disabled={disabled}
        >
          <span> {mode === 'multi' ? title : placeholder || options[value]}</span>

          <SvgIcon name="down-arrow-outline" color="dark-neutral" marginLeft={8} hoverColor="dark-accent" />
        </button>
        <div
          className={classNames(`${style.select}__options`, {
            'is-close': !open,
          })}
          onClick={desktop ? () => this.button.focus() : null}
        >
          {Object.keys(options).map((key, index) => {
            if (mode === 'button' || mode === 'multi') {
              return (
                <a
                  role="button"
                  key={key}
                  onClick={() => this.selectOption(key)}
                  className={classNames(
                    { 'is-hover': keyPressed && hover === index },
                    {
                      'is-active': mode === 'multi' ? value.indexOf(key) > -1 : key === value,
                    }
                  )}
                >
                  {CustomOption ? (
                    <CustomOption
                      className="select-custom-option"
                      index={index}
                      value={options[key]}
                      optionKey={key}
                      options={options}
                    />
                  ) : (
                    options[key]
                  )}
                </a>
              );
            }
            if (mode === 'link-internal') {
              return (
                <Link
                  key={index}
                  to={key === value ? '' : key}
                  onClick={onClick ? (e) => onClick(e, key) : null}
                  className={classNames({ 'is-hover': keyPressed && hover === index }, { 'is-active': key === value })}
                >
                  {CustomOption ? (
                    <CustomOption
                      className="select-custom-option"
                      index={index}
                      value={options[key]}
                      optionKey={key}
                      options={options}
                    />
                  ) : (
                    options[key]
                  )}
                </Link>
              );
            }
            return (
              <a
                key={index}
                href={key}
                onClick={onClick ? (e) => onClick(e, key) : null}
                rel="noopener"
                className={classNames({ 'is-hover': keyPressed && hover === index }, { 'is-active': key === value })}
              >
                {CustomOption ? (
                  <CustomOption
                    className="select-custom-option"
                    index={index}
                    value={options[key]}
                    optionKey={key}
                    options={options}
                  />
                ) : (
                  options[key]
                )}
              </a>
            );
          })}
          {mode === 'multi' && (
            <a className="is-reset" onClick={() => this.selectOption()} role="button" tabIndex="0">
              <ReactSVG name="reset" /> Reset
            </a>
          )}
        </div>
      </div>
    );
  }
}
