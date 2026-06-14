import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { designers } from 'config';
import Designer from './designer';
import NotFound from '../../NotFound';

export default class Index extends Component {
  static propTypes = {
    routeParams: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
  };

  render() {
    const designerKey = this.props.routeParams.designer;
    if (designerKey && designers.find((designer) => designer.key === designerKey && !designer.disabled)) {
      return <Designer designer={designerKey} location={this.props.location} />;
    }
    return <NotFound location={this.props.location} />;
  }
}
