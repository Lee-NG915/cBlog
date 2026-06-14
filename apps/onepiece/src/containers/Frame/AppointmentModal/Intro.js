import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import book1 from './img/book1.jpg';
import book2 from './img/book2.jpg';
import book3 from './img/book3.jpg';

import style from './style.scss';

export default class Success extends PureComponent {
  static contextTypes = {
    goToStep: PropTypes.func,
  };

  render() {
    return (
      <div className={style.intro}>
        <div className={style.header}>Fix a 1-on-1 appointment with us today!</div>
        <p>
          Based on your vision and needs, the Interior Consultant will give professional advice on recommended furniture
          options & colour palette.
        </p>
        <div className={`${style.intro}__icons`}>
          <div>
            <img src={book1} alt="1-on-1 Attention" />
            <p>
              1-on-1
              <br />
              Attention
            </p>
          </div>
          <div>
            <img src={book2} alt="Home Styling Advice" />
            <p>
              Home Styling
              <br /> Advice
            </p>
          </div>
          <div>
            <img src={book3} alt="Customization Options" />
            <p>
              Customization
              <br />
              Options
            </p>
          </div>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => this.context.goToStep('studio')}>
          BOOK NOW
        </button>
      </div>
    );
  }
}
