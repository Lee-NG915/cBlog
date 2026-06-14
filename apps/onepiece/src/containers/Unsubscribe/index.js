import React from 'react';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import ApiClient from 'helpers/ApiClient';
import Spinner from 'components/Spinner';

import { Container } from '@castlery/fortress';
import style from './style.scss';

@wrapPage({ border: true })
export default class Unsubscribe extends React.Component {
  static propTypes = {
    location: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  state = {
    loading: true,
    error: '',
    result: null,
    processing: false,
    success: false,
  };

  componentDidMount() {
    const { location } = this.props;

    this.client
      .get(`/subscriptions/${location.query.token}`)
      .then((result) => {
        this.setState({
          loading: false,
          result,
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
          error: error.errors ? error.errors[0].detail : error.toString(),
        });
      });
  }

  client = new ApiClient();

  isSubed(result) {
    const targetGroup = result.message_groups.find((g) => g.name === 'promotions');
    if (targetGroup) {
      return targetGroup.deliver_types.email;
    }
    return true;
  }

  confirm = () => {
    const { location } = this.props;
    const { result } = this.state;

    const targetGroupIndex = result.message_groups.findIndex((g) => g.name === 'promotions');
    const targetGroup = result.message_groups[targetGroupIndex];

    if (targetGroup === -1) {
      return;
    }

    const newMessageGroups = result.message_groups.slice();
    newMessageGroups.splice(targetGroupIndex, 1, {
      ...targetGroup,
      deliver_types: {
        ...targetGroup.deliver_types,
        email: false,
      },
    });

    this.setState({
      processing: true,
    });

    this.client
      .put(`/subscriptions/${location.query.token}`, {
        data: {
          unsubscribe_reason: '',
          message_groups: newMessageGroups,
        },
      })
      .then(() => {
        this.setState({
          processing: false,
          success: true,
        });
      })
      .catch((error) => {
        this.setState({
          processing: false,
        });

        this.context.frame.openModal('response', { body: error });
      });
  };

  render() {
    const { loading, error, result, processing, success } = this.state;

    return (
      <Container fixed>
        <div className={style.wrapper}>
          <h1>Unsubscribe</h1>

          {(() => {
            if (loading) {
              return (
                <div className={style.loading}>
                  <Spinner />
                </div>
              );
            }

            if (error) {
              return <div className={style.notice}>{error}</div>;
            }

            if (success) {
              return <div className={style.notice}>You have been unsubscribed successfully.</div>;
            }

            const isSubed = this.isSubed(result);

            if (!isSubed) {
              return (
                <div className={style.notice}>
                  <strong>{result.email}</strong> has already been unsubscribed from our email list.
                </div>
              );
            }

            return (
              <div className={style.main}>
                <p>
                  Please confirm that you would like to unsubscribe <strong>{result.email}</strong> from our future
                  emails
                </p>
                <button type="button" disabled={processing} className="btn btn-primary" onClick={this.confirm}>
                  {processing ? <Spinner inline /> : 'Confirm Unsubscribe'}
                </button>
              </div>
            );
          })()}
        </div>
      </Container>
    );
  }
}
