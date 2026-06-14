import React from 'react';
import PropTypes from 'prop-types';
import { randomId } from 'utils/number';
import ReactSVG from 'components/ReactSVG';
import { GhostArrowBtn } from 'components/Button';
import useBreakpoints from '@castlery/fortress/hooks/useBreakpoints';

export default class FilterManager {
  constructor() {
    this.apply = this.apply.bind(this);
    this.cancel = this.cancel.bind(this);

    this.filtersToApply = {};
    this.radioGroups = {};
  }

  // for regular filters

  add = (id, filter, resume) => {
    if (!this.filtersToApply[id]) {
      this.filtersToApply[id] = { filter, resume };
    }
  };

  apply = () => {
    // apply normal filters
    Object.keys(this.filtersToApply).forEach((key) => {
      this.filtersToApply[key].filter();
    });

    // apply radio filters
    Object.keys(this.radioGroups).forEach((key) => {
      const group = this.radioGroups[key];
      if (group[0].id !== group[group.length - 1].id) {
        group[group.length - 1].filter();
      }
      this.radioGroups[key] = group.slice(-1);
    });

    this.reset();
  };

  cancel = () => {
    // cancel normal filters
    Object.keys(this.filtersToApply).forEach((key) => {
      this.filtersToApply[key].resume.call();
    });

    // cancel radio filters
    Object.keys(this.radioGroups).forEach((key) => {
      const group = this.radioGroups[key];
      if (group[0].id !== group[group.length - 1].id) {
        group[group.length - 1].toggle(false);
        group[0].toggle(true);
      }
      this.radioGroups[key] = group.slice(0, 1);
    });

    this.reset();
  };

  reset = () => {
    this.filtersToApply = {};
  };

  // for radio button group

  setRadioGroup = (name) => {
    this.radioGroups[name] = [];
  };

  addRadio = (name, id, toggle, filter) => {
    const group = this.radioGroups[name];
    group.filter((r) => r.id !== id).forEach((r) => r.toggle(false));
    this.radioGroups[name].push({ id, toggle, filter });
  };

  resetRadios = (name, id, toggle, filter) => {
    this.addRadio(name, id, toggle, filter);
    this.radioGroups[name] = this.radioGroups[name].slice(-1);
  };

  // generate components

  generateResetButton = () => {
    const innerReset = this.reset;
    const ResetButton = (props) => {
      const { resetFilters } = props;
      const { desktop } = useBreakpoints();
      const reset = () => {
        resetFilters();
        innerReset();
      };

      return (
        <>
          {desktop && (
            <button onClick={reset} type="button" className="btn">
              <ReactSVG name="reset" /> Reset
            </button>
          )}
          {!desktop && <GhostArrowBtn text="Reset" hasArrow={false} onClick={reset} />}
        </>
      );
    };
    return ResetButton;
  };

  registerRadioFilter = (name, OriginalComponent) => {
    const filterManager = this;
    filterManager.setRadioGroup(name);

    return class Buffer extends React.Component {
      static propTypes = {
        active: PropTypes.bool,
        onClick: PropTypes.func.isRequired,
      };

      constructor(props) {
        super(props);

        this.id = randomId();

        this.state = {
          active: props.active,
        };

        if (props.active) {
          filterManager.addRadio(name, this.id, this.toggle, this.bindOnClick);
        }
      }

      UNSAFE_componentWillReceiveProps(newProps) {
        const { active } = this.state;
        if (newProps.active && !active) {
          filterManager.resetRadios(name, this.id, this.toggle, this.bindOnClick);
          this.setState({
            active: true,
          });
        }
      }

      onClick = () => {
        const { active } = this.state;
        if (!active) {
          filterManager.addRadio(name, this.id, this.toggle, this.bindOnClick);
          this.setState({
            active: true,
          });
        }
      };

      toggle = (active) => {
        this.setState({
          active,
        });
      };

      bindOnClick = () => {
        const { onClick } = this.props;
        onClick();
      };

      render() {
        const { active } = this.state;
        return <OriginalComponent {...this.props} active={active} onClick={this.onClick} />;
      }
    };
  };

  registerRangeFilter(OriginalComponent) {
    const filterManager = this;

    return class BufferedComponent extends React.Component {
      static propTypes = {
        minValue: PropTypes.number,
        maxValue: PropTypes.number,
        onChange: PropTypes.func.isRequired,
        onFinished: PropTypes.func.isRequired,
      };

      constructor(props) {
        super(props);

        this.state = {
          minValue: props.minValue,
          maxValue: props.maxValue,
        };

        this.changeId = randomId();
        this.finishedId = randomId();
      }

      UNSAFE_componentWillReceiveProps(newProps) {
        const { minValue, maxValue } = this.state;
        if (newProps.minValue !== minValue || newProps.maxValue !== maxValue) {
          this.setState({
            minValue: newProps.minValue,
            maxValue: newProps.maxValue,
          });
        }
      }

      onChange = ({ min, max }) => {
        this.setState({
          minValue: min,
          maxValue: max,
        });
        filterManager.add(this.changeId, this.bindedOnChange, this.resume);
      };

      onFinished = ({ min, max }) => {
        this.setState({
          minValue: min,
          maxValue: max,
        });
        filterManager.add(this.finishedId, this.bindedOnFinished, this.resume);
      };

      bindedOnChange = () => {
        const { onChange } = this.props;
        const { minValue, maxValue } = this.state;
        onChange({
          min: minValue,
          max: maxValue,
        });
      };

      bindedOnFinished = () => {
        const { onFinished } = this.props;
        const { minValue, maxValue } = this.state;
        onFinished({
          min: minValue,
          max: maxValue,
        });
      };

      resume = () => {
        const { minValue, maxValue } = this.props;
        this.setState({
          minValue,
          maxValue,
        });
      };

      render() {
        const { minValue, maxValue } = this.state;
        return (
          <OriginalComponent
            {...this.props}
            minValue={minValue}
            maxValue={maxValue}
            onChange={this.onChange}
            onFinished={this.onFinished}
          />
        );
      }
    };
  }

  registerSelectFilter(OriginalComponent) {
    const filterManager = this;

    return class Buffer extends React.Component {
      static propTypes = {
        active: PropTypes.bool,
        onClick: PropTypes.func.isRequired,
      };

      constructor(props) {
        super(props);

        this.state = {
          active: props.active,
        };

        this.id = randomId();
      }

      UNSAFE_componentWillReceiveProps(newProps) {
        const { active } = this.state;
        if (newProps.active !== active) {
          this.setState({
            active: newProps.active,
          });
        }
      }

      onClick = () => {
        const { active } = this.state;
        filterManager.add(this.id, this.bindOnClick, this.resume);
        this.setState({
          active: !active,
        });
      };

      bindOnClick = () => {
        const { active: stateActive } = this.state;
        const { active: propsActive, onClick } = this.props;
        if (stateActive !== propsActive) {
          onClick();
        }
      };

      resume = () => {
        const { active } = this.props;
        this.setState({
          active,
        });
      };

      render() {
        const { active } = this.state;
        return <OriginalComponent {...this.props} active={active} onClick={this.onClick} />;
      }
    };
  }

  registerQuickshipFilter(OriginalComponent) {
    const filterManager = this;
    return class BufferedComponent extends React.Component {
      static propTypes = {
        active: PropTypes.bool,
        onClick: PropTypes.func.isRequired,
      };

      constructor(props) {
        super(props);

        this.state = {
          active: props.active,
        };
        this.id = randomId();
      }

      UNSAFE_componentWillReceiveProps(newProps) {
        const { active } = this.state;
        if (newProps.active !== active) {
          this.setState({
            active: newProps.active,
          });
        }
      }

      onClick = (checked) => {
        filterManager.add(this.id, this.bindOnClick, this.resume);
        this.setState({
          active: checked,
        });
      };

      bindOnClick = () => {
        const { active: stateActive } = this.state;
        const { onClick } = this.props;
        onClick(stateActive);
      };

      resume = () => {
        const { active } = this.props;
        this.setState({
          active,
        });
      };

      render() {
        const { active } = this.state;
        return <OriginalComponent {...this.props} active={active} onClick={this.onClick} />;
      }
    };
  }
}
