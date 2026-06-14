import React from 'react';
import PropTypes from 'prop-types';
import { colorToImage } from 'utils/color';

const ColorOptions = ({ bemBlocks, active, onClick, label }) => (
  <div role="button" className={bemBlocks.option().state({ selected: active })} onClick={onClick}>
    <img src={colorToImage(label)} alt={label} />
  </div>
);

ColorOptions.propTypes = {
  bemBlocks: PropTypes.object,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  label: PropTypes.string,
};

export default ColorOptions;
