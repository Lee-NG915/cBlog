import React from 'react';
import PropTypes from 'prop-types';
import ApiClient from 'helpers/ApiClient';
import { connect } from 'react-redux';
import Spinner from 'components/Spinner';
import ReviewTerms from 'components/ReviewTerms';
import ReviewItem from './ReviewItem';

import style from './style.scss';

const resultArr = [
  {
    id: 25,
    country: 'US',
    title: 'Great Product',
    content: 'I love this product!',
    rating: 4,
    order_number: '12123',
    user_id: 42,
    user_name: 'Will Wu',
    is_anonymous: true,
    variant: {
      id: 111,
      code: 'Variant-9527',
      // to add more attributes
    },
    attachments: [
      {
        key: 'i75felis57cfsx76fdjo69dwr404',
        resource_type: 'image',
        url: 'http://res.cloudinary.com/castlery/image/upload/v1/knight/review/i75felis57cfsx76fdjo69dwr404',
        created_at: '2023-11-02 20:50:25',
      },
      {
        key: 'wx855tv5mepya7ustixxbomvjp60',
        resource_type: 'image',
        url: 'http://res.cloudinary.com/castlery/image/upload/v1/knight/review/wx855tv5mepya7ustixxbomvjp60',
        created_at: '2023-11-04 04:08:45',
      },
    ],
    replies: [
      {
        id: 6,
        content: 'Thank you',
        review_id: 9,
        replied_by: 'Juan (SZX)',
        created_at: '2023-11-04 05:05:45',
        attachments: [
          {
            key: 'tkgl086wuhfuwpf2v754mvegthak',
            resource_type: 'image',
            url: 'http://res.cloudinary.com/castlery/image/upload/v1/knight/review/tkgl086wuhfuwpf2v754mvegthak',
            created_at: '2023-11-04 04:56:41',
          },
        ],
      },
    ],
  },
];

@connect((state) => ({
  user: state.auth.user,
}))
export default class Reviews extends React.Component {
  static propTypes = {
    user: PropTypes.object,
  };

  state = {
    loading: false,
    error: '',

    reviews: [],
  };

  componentDidMount() {
    this.loadReviews();
  }

  client = new ApiClient();

  loadReviews() {
    const { user } = this.props;

    this.setState({
      loading: true,
    });

    this.client
      .get('/gw/reviews/by_user', {
        auth: 'strict',
        params: {
          // user_id: user.id,
          per_page: 50,
        },
      })
      .then((response) => {
        response.results.forEach((item) => {
          item.messages = [
            {
              id: item.id,
              title: item.title,
              content: item.content,
              attachments: item.attachments,
              userName: item.user_name,
              anonymous: item.is_anonymous,
            },
            ...item.replies,
          ];
        });
        this.setState({
          loading: false,
          error: '',
          // reviews: response.results,
          reviews: response.results,
        });
      })
      .catch((error) => {
        this.setState({
          loading: false,
          error,
          // error: error.errors[0].detail,
        });
      });
  }

  render() {
    const { loading, error, reviews } = this.state;

    return (
      <div className={style.reviews}>
        <h1 className={style.header}>My Reviews</h1>

        {loading ? (
          <div className={`${style.reviews}__loading`}>
            <Spinner />
          </div>
        ) : error ? (
          <p>{error}</p>
        ) : reviews.length === 0 ? (
          <p>You haven’t reviewed any products. Review now to earn vouchers for your next purchase!</p>
        ) : (
          <div className={`${style.reviews}__main`}>
            {reviews.map((review) => (
              <ReviewItem review={review} key={review.id} />
            ))}
          </div>
        )}

        <ReviewTerms className={style.terms} />
      </div>
    );
  }
}
