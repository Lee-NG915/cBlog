import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { loadIfNeeded as loadSwatches } from 'redux/modules/swatches';
import { add as addToCart, process as processCart } from 'redux/modules/cart';
import Spinner from 'components/Spinner';
import classNames from 'classnames';
import ReactSVG from 'components/ReactSVG';
import ReactPicture from 'components/ReactPicture';
import { getBreakpoint } from 'utils/breakpoints';

import { ternaryExpressions } from 'utils/ternaryExpression';
import { withUseBreakpoints } from 'utils/page';
import style from './style.scss';

@connect(
  (state) => ({
    swatches: state.swatches,
    cart: state.cart,
  }),
  { loadSwatches, addToCart, processCart }
)
@withUseBreakpoints
export default class SwatchModal extends Component {
  static animation = 'plain';

  static propTypes = {
    product: PropTypes.object,
    defaultActive: PropTypes.string, // default active swatch
    showCustomized: PropTypes.bool,

    swatches: PropTypes.object,
    cart: PropTypes.object,
    loadSwatches: PropTypes.func.isRequired,
    addToCart: PropTypes.func.isRequired,
    processCart: PropTypes.func.isRequired,

    openCallback: PropTypes.func,
    closeCallback: PropTypes.func,
    breakpoints: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
  };

  static defaultProps = {
    showCustomized: false,
  };

  state = {
    activeIndex: [0, 0],
    collections: [],
    swatchesPerRow: 6,
  };

  _isMounted = false;

  listenersByQuery = [];

  componentDidMount() {
    const { openCallback, loadSwatches, product } = this.props;
    if (openCallback && typeof openCallback === 'function') {
      openCallback();
    }
    this._isMounted = true;
    this.setMediaQuery();
    loadSwatches(product.id).then(() => this.init());
  }

  componentWillUnmount() {
    const { closeCallback } = this.props;
    if (closeCallback && typeof closeCallback === 'function') {
      closeCallback();
    }
    this._isMounted = false;
    this.listenersByQuery.forEach((l) => l());
  }

  setMediaQuery() {
    const { breakpoints = {} } = this.props;
    const { desktop } = breakpoints;
    // set number of items per slide based on different resolution
    if (!desktop) {
      const mediaQueries = [
        {
          query: `(max-width: ${getBreakpoint('xs', 'max')}px)`,
          swatchesPerRow: 3,
        },
        {
          query: `(min-width: ${getBreakpoint('sm', 'min')}px) and (max-width: ${getBreakpoint('sm', 'max')}px)`,
          swatchesPerRow: 4,
        },
        {
          query: `(min-width: ${getBreakpoint('md', 'min')}px) and (max-width: ${getBreakpoint('md', 'max')}px)`,
          swatchesPerRow: 5,
        },
        {
          query: `(min-width: ${getBreakpoint('lg', 'min')}px)`,
          swatchesPerRow: 6,
        },
      ];

      mediaQueries.forEach((mediaQuery) => {
        const mql = window.matchMedia(mediaQuery.query);
        const listener = (mq) => {
          if (mq.matches) {
            this.setState({
              swatchesPerRow: mediaQuery.swatchesPerRow,
            });
          }
        };
        mql.addListener(listener);
        this.listenersByQuery.push(() => {
          mql.removeListener(listener);
        });
        listener(mql);
      });
    } else {
      this.setState({
        swatchesPerRow: 6,
      });
    }
  }

  selectSwatch(i, j) {
    this.setState(({ activeIndex }) => ({
      activeIndex: activeIndex[0] === i && activeIndex[1] === j ? [-1, -1] : [i, j],
    }));
  }

  init() {
    const { swatches, product, showCustomized, defaultActive } = this.props;
    if (this._isMounted) {
      const rawSwatches = swatches[product.id].data;
      const collections = rawSwatches.map((s) => ({
        ...s,
        variants: s.variants.filter((v) => showCustomized || !v.is_customized),
      }));

      let index = [0, 0];
      collections.some((c, i) =>
        c.variants.some((v, j) => {
          if (v.presentation === defaultActive) {
            index = [i, j];
            return true;
          }
          return false;
        })
      );

      this.setState({
        collections,
        activeIndex: index,
      });
    }
  }

  addToCart() {
    const { frame } = this.context;
    const { addToCart, product } = this.props;
    const { activeIndex, collections } = this.state;
    const activeCollection = collections[activeIndex[0]];
    const variant = activeCollection.variants[activeIndex[1]];

    addToCart({
      variant,
      quantity: 1,
      page: 'Swatch Popup',
      listName: `Swatch - ${activeCollection.presentation}`,
      listPosition: activeIndex[1],
      isSwatch: true,
      swatchRelatedProduct: product,
    }).catch((err) => frame.openModal('response', { body: err }));
  }

  removeFromCart() {
    const { frame } = this.context;
    const { processCart, cart } = this.props;
    const order = cart.data;
    const { collections, activeIndex } = this.state;

    const targetItem = order.line_items.find(
      (item) => item.variant.id === collections[activeIndex[0]].variants[activeIndex[1]].id
    );
    if (targetItem) {
      processCart(targetItem).catch((err) => frame.openModal('response', { body: err }));
    }
  }

  renderCollection(i) {
    const { cart } = this.props;
    const { collections, activeIndex, swatchesPerRow } = this.state;
    const order = cart.data;
    const collection = collections[i];

    if (collection.variants.length === 0) {
      return null;
    }

    const swatchRows = [];
    collection.variants.forEach((v, index) => {
      // initialize each row
      const rowIndex = parseInt(index / swatchesPerRow);
      if (!swatchRows[rowIndex]) {
        swatchRows[rowIndex] = [];
      }
      swatchRows[rowIndex].push(
        <div
          key={v.id}
          className={classNames(`${style.swatches}__item`, {
            'is-active': activeIndex[0] === i && activeIndex[1] === index,
          })}
        >
          <a onClick={() => this.selectSwatch(i, index)} className="btn" role="button" tabIndex="0">
            <ReactPicture
              src={v.images[0] ? v.images[0].links.small : ''}
              alt={v.name}
              loader={{ ratio: 1, size: 'cover' }}
            />
            {order && order.line_items.findIndex((item) => item.variant.id === v.id) > -1 && <ReactSVG name="check" />}
          </a>
          <label>{v.presentation}</label>
        </div>
      );
    });

    return (
      <div className={`${style.swatches}__collection`} key={collection.id}>
        <h4>{collection.presentation}</h4>
        <p>{collection.description}</p>
        {swatchRows.map((row, index) => (
          <div key={index} className={`${style.swatches}__row`}>
            <div className={`${style.swatches}__items`}>{row}</div>
            {activeIndex[0] === i && parseInt(activeIndex[1] / swatchesPerRow) === index && this.renderActiveSwatch()}
          </div>
        ))}
      </div>
    );
  }

  renderActiveSwatch() {
    const { cart, breakpoints = {} } = this.props;
    const { collections, activeIndex } = this.state;
    const { desktop } = breakpoints;
    const activeCollection = collections[activeIndex[0]];
    const activeSwatch = activeCollection && activeCollection.variants[activeIndex[1]];

    if (activeSwatch) {
      const order = cart.data;
      let isSwatchFull = false;
      let isActiveAddedToCart = false;
      if (order) {
        isSwatchFull = order.line_items.filter((item) => item.product_type === 'swatch').length >= 3;
        isActiveAddedToCart = order.line_items.findIndex((item) => item.variant.id === activeSwatch.id) > -1;
      }

      const addtoCartBtn = (
        <button
          onClick={isActiveAddedToCart ? this.removeFromCart.bind(this) : this.addToCart.bind(this)}
          type="button"
          data-selenium="swatch-modal-button"
          disabled={(isSwatchFull && !isActiveAddedToCart) || cart.loading || cart.creating || cart.processing}
          className={classNames(
            `${style.desc}__add btn btn-primary`,
            { 'is-loading': cart.loading || cart.creating || cart.processing },
            { 'is-disabled': isSwatchFull && !isActiveAddedToCart }
          )}
        >
          {
            cart.loading || cart.creating || cart.processing ? (
              <Spinner inline />
            ) : (
              ternaryExpressions(
                isActiveAddedToCart,
                'Remove From Cart',
                isSwatchFull ? 'Up To 3 Swatches' : 'Add To Cart'
              )
            ) /* ? (
            'Remove From Cart'
          ) : isSwatchFull ? (
            'Up To 3 Swatches'
          ) : (
            'Add To Cart'
          ) */
          }
        </button>
      );

      return (
        <div className={style.desc}>
          <div className={`${style.desc}__image`}>
            <ReactPicture
              srcset={activeSwatch.images[0] ? activeSwatch.images[0].links : ''}
              alt={activeSwatch.name}
              mediaQuery={
                !desktop
                  ? {
                      mediaQuery: `(min-width: ${getBreakpoint('sm', 'min')}px) 300px, 100vw`,
                      widths: [`320-${getBreakpoint('xs', 'max')}`, 300],
                    }
                  : {
                      mediaQuery: '300px',
                      widths: [300],
                    }
              }
              loader={{ ratio: 1, size: 'cover' }}
            />
            {addtoCartBtn}
          </div>
          <div className={`${style.desc}__intro`}>
            <p className={`${style.desc}__intro__name`}>{activeSwatch.presentation}</p>
            {activeCollection.product_properties.map((p, index) => {
              if (p.value) {
                return (
                  <div key={index} className={`${style.desc}__intro__section`}>
                    <label>{p.presentation}</label>
                    <p>
                      {activeSwatch.name === 'Swatch, Sand Grey' && p.name === 'fabric_composition'
                        ? '90% Polyester, 10% Linen'
                        : p.value}
                    </p>
                  </div>
                );
              }
              return null;
            })}
            <div className={`${style.desc}__intro__actions`}>
              <button type="button" className="btn btn-grey" onClick={() => this.selectSwatch(-1, -1)}>
                Close
              </button>
              {addtoCartBtn}
            </div>
          </div>
          <button type="button" className={`${style.desc}__close btn`} onClick={() => this.selectSwatch(-1, -1)}>
            <ReactSVG name="close" />
          </button>
        </div>
      );
    }
  }

  render() {
    const { collections } = this.state;
    const { frame } = this.context;

    return (
      <div
        role="menuitem"
        onClick={(e) => {
          if (e.target.classList.contains(style.modal)) {
            frame.removeModal();
          }
        }}
        className={style.modal}
      >
        <div ref={(c) => (this.container = c)} className={`${style.modal}__container`}>
          <h3 className={`${style.modal}__title`}>Free Swatches</h3>
          <p className={`${style.modal}__intro`}>
            Want to have a feel before you buy?
            <br />
            No problem, we'll send you up to 3 swatches for free! Select them below.
          </p>
          <div className={style.swatches}>
            {collections.length > 0 ? (
              collections.map((collection, index) => this.renderCollection(index))
            ) : (
              <div className={`${style.swatches}__loading`}>
                <Spinner />
              </div>
            )}
          </div>
          <button type="button" className={`${style.modal}__close btn`} onClick={() => frame.removeModal()}>
            <ReactSVG name="close" />
          </button>
        </div>
      </div>
    );
  }
}
