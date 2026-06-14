import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ResponsiveSlick from 'components/ResponsiveSlick';
import Spinner from 'components/Spinner';
import { getBreakpoint } from 'utils/breakpoints';
import { InView } from 'react-intersection-observer';
import { postProductSearch } from 'api/search';
import Product from './Product';
import style from './style.scss';

export default class ProductList extends Component {
  static propTypes = {
    products: PropTypes.array.isRequired,
    listName: PropTypes.string, // the name of the list, used in ga tracking
    link: PropTypes.bool,

    isUsedInPDP: PropTypes.bool,
  };

  static isNumOrString(data) {
    return typeof data === 'number' || typeof data === 'string';
  }

  slickRef = React.createRef();

  constructor(props) {
    super(props);
    if (props.products.length > 0 && ProductList.isNumOrString(props.products[0])) {
      this.state = {
        loaded: false,
        products: [],
      };
    } else {
      this.state = {
        products: props.products,
      };
    }
  }

  componentDidMount() {
    this._isMounted = true;
    const { products } = this.props;
    if (products.length > 0 && ProductList.isNumOrString(products[0])) {
      this.loadProducts(products);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { products } = this.props;
    if (nextProps.products !== products) {
      if (nextProps.products.length > 0 && ProductList.isNumOrString(nextProps.products[0])) {
        this.loadProducts(nextProps.products);
      } else {
        this.setState({
          products: nextProps.products,
        });
      }
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  loadProducts(products) {
    postProductSearch({
      query: {
        bool: {
          must: {
            ids: {
              values: products,
            },
          },
          filter: {
            nested: {
              path: 'variants',
              query: {
                bool: {
                  filter: {
                    exists: {
                      field: 'variants',
                    },
                  },
                },
              },
            },
          },
        },
      },
      size: 32,
    })
      .then((response) => {
        if (!this._isMounted) {
          return;
        }

        this.setState({
          loaded: true,
          products: response.hits.hits
            .sort((a, b) => products.indexOf(a._source.id) - products.indexOf(b._source.id))
            .map((h) => h._source),
        });
      })
      .catch((err) => {
        if (!this._isMounted) {
          return;
        }

        console.error(
          JSON.stringify(
            {
              message: 'ProductList component error',
              error: err instanceof Error ? { message: err?.message, stack: err?.stack } : String(err),
            },
            null,
            2
          )
        );
        this.setState({
          loaded: true,
          products: [],
        });
      });
  }

  render() {
    const { link, listName, isUsedInPDP = false } = this.props;
    const { products, loaded } = this.state;

    if (products.length > 0 || (loaded !== undefined && !loaded)) {
      if (loaded !== undefined && !loaded) {
        return (
          <div className={style.loading}>
            <Spinner />
          </div>
        );
      }
      return (
        <InView triggerOnce threshold={1}>
          {({ inView, ref }) => (
            <div ref={ref}>
              <div ref={this.slickRef}>
                <ResponsiveSlick
                  mediaQueries={[
                    {
                      query: `(max-width: ${getBreakpoint('md', 'max')}px)`,
                      numPerPage: 2,
                    },
                    {
                      query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
                      numPerPage: 4,
                    },
                  ]}
                >
                  {products.map((product, index) => (
                    <Product
                      key={index}
                      product={product}
                      listName={listName}
                      listPosition={index + 1}
                      link={link}
                      rootRef={this.slickRef}
                      isRootShown={inView}
                      isUsedInPDP={isUsedInPDP}
                    />
                  ))}
                </ResponsiveSlick>
              </div>
            </div>
          )}
        </InView>
      );
    }
    return null;
  }
}
