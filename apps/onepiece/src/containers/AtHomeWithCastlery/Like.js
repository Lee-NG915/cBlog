import React from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'components/ReactSVG';
import classNames from 'classnames';
import { loadIfNeeded as load, add, remove } from 'redux/modules/messageVotes';
import { connect } from 'react-redux';

import style from './style.scss';

@connect(
  (state) => ({
    messageVotes: state.messageVotes,
  }),
  { load, add, remove }
)
export default class Like extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    messageId: PropTypes.number.isRequired,
    count: PropTypes.number,
    originalLiked: PropTypes.bool,

    messageVotes: PropTypes.object,
    add: PropTypes.func,
    remove: PropTypes.func,
    load: PropTypes.func,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    processing: false,
    // to track whether this review is liked when loaded
    originalLiked: false,
  };

  componentDidMount() {
    this.props.load();

    if (this.props.messageVotes.data) {
      this.setOriginalLiked();
    }
  }

  componentDidUpdate(prevProps) {
    // update state.originalLiked after messageVotes are loaded
    if (
      (!prevProps.messageVotes.data && this.props.messageVotes.data) ||
      prevProps.messageId !== this.props.messageId
    ) {
      this.setOriginalLiked();
    }
  }

  setOriginalLiked() {
    const { messageVotes, messageId } = this.props;
    this.setState({
      originalLiked: messageVotes.data.indexOf(messageId) > -1,
    });
  }

  toggle() {
    const { messageVotes, messageId, add, remove } = this.props;

    this.timer = setTimeout(() => {
      this.setState({
        processing: true,
      });
    }, 200);

    let request;
    if (messageVotes.data && messageVotes.data.indexOf(messageId) > -1) {
      request = remove(messageId);
    } else {
      request = add(messageId);
    }

    request
      .then(() => {
        clearTimeout(this.timer);
        this.setState({
          processing: false,
        });
      })
      .catch((error) => {
        clearTimeout(this.timer);
        this.setState({
          processing: false,
        });
        this.context.frame.openModal('response', { body: error });
      });
  }

  render() {
    const { className, messageVotes, messageId, count, originalLiked } = this.props;
    const { processing, originalLiked: _originalLiked } = this.state;

    const isLiked = messageVotes.data && messageVotes.data.indexOf(messageId) > -1;
    const oL = originalLiked === undefined ? _originalLiked : originalLiked;

    return (
      <button
        type="button"
        onClick={this.toggle.bind(this)}
        disabled={messageVotes.loading || processing}
        className={classNames('btn', className, style.like, {
          'is-liked': isLiked,
        })}
      >
        <div>
          <ReactSVG className={`${style.like}__heart`} name="heart" />
          <span>{count + (oL && !isLiked ? -1 : 0) + (!oL && isLiked ? 1 : 0)}</span>
        </div>
      </button>
    );
  }
}
