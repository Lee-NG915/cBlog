import React from 'react';
import PropTypes from 'prop-types';
import ReactPicture from 'components/ReactPicture';
import { formatDate } from 'utils/time';
import { withUseBreakpoints } from 'utils/page';
import ReadMore from './ReadMore';

import style from './style.scss';

@withUseBreakpoints
export default class Messages extends React.Component {
  static propTypes = {
    review: PropTypes.object.isRequired,
    className: PropTypes.string,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  showImageModal(images, index) {
    const { frame } = this.context;
    frame.openModal('image', {
      images,
      initialIndex: index,
    });
  }

  render() {
    const { review, className, breakpoints = {} } = this.props;
    const { desktop } = breakpoints;

    review.messages = [
      {
        id: review.id,
        title: review.title,
        content: review.content,
        attachments: review.attachments,
        userName: review.user_name,
      },
      ...review.replies,
    ];

    if (review.messages.length > 0) {
      return (
        <div className={className}>
          {review.messages.map((message, index) => (
            <div key={message.id} className={style.message}>
              <div className={`${style.message}__body`}>
                {message.title && <h3 className={`${style.message}__title`}>{message.title}</h3>}
                {index > 0 && (
                  <p className={`${style.message}__user`}>
                    <span>{message.is_official ? 'Castlery' : message.user_name}</span>
                    {' replied'}
                    {message.target_user && <span> {message.user_name}</span>}:
                  </p>
                )}
                {message.content && (
                  <p className={`${style.message}__content`}>
                    <ReadMore content={message.content} />
                  </p>
                )}
                {message.attachments.length > 0 && (
                  <div className={`${style.message}__images`}>
                    <div>
                      {message.attachments.map((image, index) => (
                        <div
                          role="menuitem"
                          className={`${style.message}__images__item`}
                          onClick={() =>
                            this.showImageModal(
                              message.attachments.map(
                                (image) =>
                                  `${image.url.replace(
                                    /upload\//,
                                    !desktop ? 'upload/w_1000,f_auto,q_auto/' : 'upload/w_2000,f_auto,q_auto/'
                                  )}`
                              ),
                              index
                            )
                          }
                          key={index}
                        >
                          <ReactPicture
                            srcset={image.url}
                            alt={`review from ${message.userName} ${index + 1}`}
                            loader={{ ratio: 1, size: 'cover' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* <div className={`${style.message}__footer`}>
                <span className={`${style.message}__date`}>{formatDate(message.updated_at)}</span>
              </div> */}
            </div>
          ))}
        </div>
      );
    }
    return null;
  }
}
