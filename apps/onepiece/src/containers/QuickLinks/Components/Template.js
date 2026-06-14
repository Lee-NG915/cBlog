import React from 'react';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import Term from 'components/Term';
import Banner from './Banner';
import style from '../style.scss';

const Template = (props) => {
  const { banner, content } = props;
  return (
    <div style={!banner ? { borderTop: '1px solid #e3e3e3' } : null}>
      {banner && <Banner {...banner} />}

      <div className={`container ${style.content}`}>
        {content.map((para, index) => (
          <Term key={index} para={para} />
        ))}
      </div>
    </div>
  );
};

Template.propTypes = {
  banner: PropTypes.object,
  content: PropTypes.array.isRequired,
};

export default wrapPage()(Template);
