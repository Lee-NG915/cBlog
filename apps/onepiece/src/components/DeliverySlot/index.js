import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Bem from 'utils/bem';
import classNames from 'classnames';
import { getDate } from 'utils/time';
import { animate } from 'utils/animate';
import { toPrice } from 'utils/number';

import style from './style.scss';

export default class DeliverySlot extends Component {
  static propTypes = {
    selectSlot: PropTypes.func.isRequired,
    slots: PropTypes.array,
    selectedSlot: PropTypes.object,
    className: PropTypes.string,
  };

  static defaultProps = {
    selectedSlot: {},
    slots: [],
  };

  selectedSlotRef = null;

  containerRef = null;

  componentDidMount() {
    const { slots } = this.props;

    if (slots.length !== 0) {
      this.scrollToSelected();
    }
  }

  setSelectedSlotRef = (isSelected) => {
    if (isSelected) {
      return (element) => {
        this.selectedSlotRef = element;
      };
    }
  };

  animateTo = (containerRef, slotRef) => {
    const { selectedSlot } = this.props;
    if (selectedSlot && containerRef && slotRef) {
      animate({
        from: containerRef.offsetLeft,
        to: slotRef.offsetLeft,
        duration: 500,
        func: 'easeInOutQuad',
        callback: (d) => {
          containerRef.scrollLeft = d;
        },
      });
    }
  };

  scrollToSelected = () => {
    this.animateTo(this.containerRef, this.selectedSlotRef);
  };

  formatTime = (dateString) => {
    const date = getDate(dateString);
    if (date.minute() === 0) {
      return date.format('ha');
    }
    return date.format('h:ma');
  };

  render() {
    const block = new Bem(style.deliverySlot);
    const { selectedSlot, selectSlot, slots, className } = this.props;
    const validSlotDate = selectedSlot.date || slots.find((s) => !!s.data.find((slot) => slot.is_available)).date;

    return (
      <div className={block.mix(className)}>
        <div className={block.elm('container')}>
          <div className={block.elm('table')} ref={(ele) => (this.containerRef = ele)}>
            {slots.map((s) => (
              <div
                className={block.elm('column').state('is-empty', s.data.length === 0)}
                key={s.date}
                ref={this.setSelectedSlotRef(s.date === validSlotDate)}
              >
                <div className={block.elm('column').elm('header')}>
                  <span>{getDate(s.date).format('ddd')}</span>
                  <span>{getDate(s.date).format('D MMM')}</span>
                </div>
                <div className={block.elm('column').elm('body')}>
                  {s.data.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      className={classNames('btn', {
                        'is-selected': slot.id === selectedSlot.id,
                      })}
                      onClick={() => selectSlot(slot)}
                      disabled={!slot.is_available}
                    >
                      {this.formatTime(slot.start_time)} - {this.formatTime(slot.end_time)}
                      {slot.is_premium && (
                        <span
                          className={block
                            .elm('premium-slot')
                            .mod(
                              slot.id !== selectedSlot.id ? (slot.is_available ? 'available' : 'disabled') : 'selected'
                            )}
                        >
                          +{toPrice(slot.price)}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className={block.elm('legend')}>
            <div className={block.elm('legend').elm('available')}>Available</div>
            <div className={block.elm('legend').elm('full')}>Not Available</div>
            <div className={block.elm('legend').elm('selected')}>Selected</div>
          </div>
        </div>
      </div>
    );
  }
}
