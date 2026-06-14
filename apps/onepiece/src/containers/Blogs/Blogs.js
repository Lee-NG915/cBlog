import React from 'react';
import PropTypes from 'prop-types';
import { wrapPage } from 'utils/page';
import Bem from 'utils/bem';
import Spinner from 'components/Spinner';
import { GhostArrowBtn } from 'components/Button';
import { load, loadIfNeeded, clean } from 'redux/modules/blogs';
import { asyncLoad } from 'components/AsyncLoad/utils';
import { connect } from 'react-redux';
import Banner from 'components/Banner';
import { Container } from '@castlery/fortress';
import CoverList from './CoverList';
import style from './style.scss';

const PER_PAGE = 10;
@asyncLoad([({ store: { dispatch } }) => dispatch(loadIfNeeded(1))])
@connect(
  (state) => ({
    blogs: state.blogs,
  }),
  { clean, load }
)
@wrapPage({ pageType: 'Blog' })
export default class Blogs extends React.Component {
  static propTypes = {
    blogs: PropTypes.object,
    clean: PropTypes.func,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      needLoadMore: true,
      realBlogList: [],
      loading: false,
    };
  }

  componentDidMount() {
    this.updateRealBlogList(this.props.blogs.data);
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      blogs: { data: blogs },
    } = this.props;
    if (prevState.page !== this.state.page && blogs.length) {
      this.updateRealBlogList(blogs);
    }
  }

  updateRealBlogList = (blogs) => {
    const startIndex = (this.state.page - 1) * PER_PAGE;
    const endIndex = this.state.page * PER_PAGE;
    const newBlogs = blogs.slice(startIndex, endIndex);

    this.setState((prevState) => {
      const updatedRealBlogList = prevState.page === 1 ? newBlogs : [...prevState.realBlogList, ...newBlogs];

      const needLoadMore = blogs.length > updatedRealBlogList.length;

      return {
        realBlogList: updatedRealBlogList,
        needLoadMore,
      };
    });
  };

  componentWillUnmount() {
    this.props.clean();
  }

  loadMore = () => {
    this.setState(
      {
        loading: true,
      },
      () => {
        setTimeout(() => {
          this.setState((prevState) => ({
            page: prevState.page + 1,
            loading: false,
          }));
        }, 1000);
      }
    );
  };

  render() {
    const { blogs: _blogs } = this.props;
    const { data: blogs } = _blogs;
    const { realBlogList, needLoadMore, loading } = this.state;

    const block = new Bem(style.blogs);

    return (
      <>
        <Container>
          <Banner
            mediaQueries={[
              {
                breakpoint: 'xs',
                srcset:
                  'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1673855218/marketing/Cross-Market/listing%20page%20banner/Owen_Chaise_ListingBanner_Mobile.jpg',
                loader: { ratio: 0.371 },
              },
              {
                breakpoint: 'lg',
                srcset:
                  'https://res.cloudinary.com/castlery/image/upload/f_auto,q_auto/v1673855219/marketing/Cross-Market/listing%20page%20banner/Owen_Chaise_ListingBanner_Desktop.jpg',
                loader: { ratio: 0.208 },
              },
            ]}
            lazy={false}
            title="Blog"
          >
            <div className={block.elm('banner')}>
              <h1>Blog</h1>
              <div>Discover the latest interior design trends and furniture tips on our blog.</div>
            </div>
          </Banner>
        </Container>

        <div className={block}>
          <Container fixed>
            {blogs.length === 0 && loading && (
              <div className={block.elm('loading')}>
                <Spinner />
              </div>
            )}

            {blogs.length > 0 && (
              <>
                <CoverList blogs={realBlogList.length === 0 ? blogs.slice(0, PER_PAGE) : realBlogList} />
                {needLoadMore ? (
                  <div className={block.elm('loadMore')}>
                    <GhostArrowBtn
                      onClick={this.loadMore}
                      loading={loading}
                      hasArrow={false}
                      size="medium"
                      text="Load More"
                      width={150}
                    />
                  </div>
                ) : (
                  <div className={block.elm('end')}>
                    <span>The End</span>
                  </div>
                )}
              </>
            )}
          </Container>
        </div>
      </>
    );
  }
}
