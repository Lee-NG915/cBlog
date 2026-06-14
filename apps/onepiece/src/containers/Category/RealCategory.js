import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { getTypeAccessor } from 'utils/searchkit';
import { trackFilterItems } from 'utils/tracking';
import { get as getSearchkitState, set as setSearchkitState } from 'redux/modules/searchkitState';
import { getPageByUrl, getPageByKey } from 'pages';
import ModalWrapper from 'containers/Frame/ModalWrapper';

import { SearchkitProvider, ResetFilters, GroupedSelectedFilters, RangeSlider } from 'searchkit';
import ReactSVG from 'components/ReactSVG';
import Spinner from 'components/Spinner';
import Banner from 'components/CategoryBanner';
import isEqual from 'lodash/isEqual';
import { EVENT_PRODUCT_FILTER, EVENT_PRODUCT_IMPRESSION, EVENT_PRODUCT_SORT } from 'utils/track/constants';
import { Button, CloseBtn } from 'components/Button';
import SvgIcon from 'components/SvgIcon';
import { StoryblokComponent, storyblokEditable } from '@storyblok/react';
import { enableQuickShip, globalFeatureInUS, isProd } from 'config';
import Script from 'components/Script';
import { withUseBreakpoints } from 'utils/page';
import { Container, Stack } from '@castlery/fortress';
import { camelToSnake } from 'utils/common';
import { startStoryblok } from 'containers/Storyblok/setup';
import { NotFoundWithoutWrapPage } from 'containers/NotFound';
import { Hits, Filters, Sorting } from './components';
import { CheckboxOption, ColorOption, IntRangeSlider, QuickshipSwitch, QuickshipFilter } from './searchkitComponents';
import { getHost, getLabelBySortKey, needSubFilter } from './config';
import FilterManager from './filterManager';
import { PathContext } from './CategoryContext';
import style from './style.scss';
import FilterGroup from './searchkitComponents/FilterGroup';
import EnhancedSearchkitManager from './EnhancedSearchkitManager';

@connect(
  (state) => ({
    user: state.auth.user,
    impressions: state.tracking.impressions,
  }),
  {
    getSearchkitState,
    setSearchkitState,
    trackProductSort: (result) => (dsipatch) => dsipatch({ type: EVENT_PRODUCT_SORT, result }),
    trackProductFilter: (result) => (dsipatch) => dsipatch({ type: EVENT_PRODUCT_FILTER, result }),
    trackProductImpression: () => (dsipatch) => dsipatch({ type: EVENT_PRODUCT_IMPRESSION }),
  }
)
@withUseBreakpoints
export default class Category extends Component {
  static propTypes = {
    getSearchkitState: PropTypes.func,
    setSearchkitState: PropTypes.func,
    location: PropTypes.object,
    impressions: PropTypes.array,
    trackProductSort: PropTypes.func,
    trackProductFilter: PropTypes.func,
    trackProductImpression: PropTypes.func,
    breakpoints: PropTypes.object,
    user: PropTypes.object,
  };

  static contextTypes = {
    frame: PropTypes.object,
    router: PropTypes.object,
  };

  static childContextTypes = {
    path: PropTypes.string.isRequired,
  };

  constructor(props, context) {
    super(props, context);

    this.filterRef = React.createRef();
    const { location, breakpoints } = props;
    const { desktop } = breakpoints;

    const searchkitState = props.getSearchkitState();

    const locationKey = `${location.pathname}${location.search}`;
    const current = searchkitState[locationKey]?.results ? searchkitState[locationKey] : {};

    this.sk = new EnhancedSearchkitManager(
      getHost(),
      {
        useHistory: !__SERVER__,
        searchOnLoad: !__SERVER__,
        createHistory: () => context.router,
        getLocation: () => props.location,
        timeout: 10000,
      },
      current
    );

    this.sk.setQueryProcessor((plainQueryObject) => {
      // modify post_filter before sending to ElasticSearch, check JIRA SK-369 and WW-703
      if (plainQueryObject.post_filter && plainQueryObject.post_filter.bool && plainQueryObject.post_filter.bool.must) {
        const filters = plainQueryObject.post_filter.bool.must;

        const refinedFilters = filters.reduce((acc, filter) => {
          const pathOfMust = filter.nested && filter.nested.path;
          const pathOfShould = filter.bool && filter.bool.should && filter.bool.should[0].nested.path;
          if (pathOfMust) {
            acc[pathOfMust] = acc[pathOfMust] || {};
            acc[pathOfMust].musts = acc[pathOfMust].musts || [];
            acc[pathOfMust].musts.push(filter.nested.query);
          } else if (pathOfShould) {
            acc[pathOfShould] = acc[pathOfShould] || {};
            acc[pathOfShould].musts = acc[pathOfShould].musts || [];
            acc[pathOfShould].musts.push({
              bool: {
                should: filter.bool.should.map((should) => should.nested.query),
              },
            });
          }
          return acc;
        }, {});

        plainQueryObject.post_filter.bool.must = Object.keys(refinedFilters).map((path) => ({
          nested: {
            path,
            query: {
              bool: {
                must: refinedFilters[path].musts,
              },
            },
          },
        }));
      }
      return plainQueryObject;
    });

    // if (!desktop) {
    this.filterManager = new FilterManager(); // manage filters
    /* to avoid always initialize components */
    this.bufferedComponents = {
      ColorOption: this.filterManager.registerSelectFilter(ColorOption),
      ResetButton: this.filterManager.generateResetButton(),
      CheckboxOption: this.filterManager.registerSelectFilter(CheckboxOption),
      IntRangeSlider: this.filterManager.registerRangeFilter(IntRangeSlider),
      RangeSlider: this.filterManager.registerRangeFilter(RangeSlider),
      QuickshipSwitch: this.filterManager.registerQuickshipFilter(QuickshipSwitch),
    };
    // }

    this.setTypeFilter(location);

    // add listener for loading
    this.sk.emitter.addListener(() => {
      this.setState({
        loading: this.sk.loading,
      });
    });

    // save state every time
    this.sk.addResultsListener(this.saveResult);

    this.sk.addResultsListener(this.hideFilterWhenSearch);
    let shouldFilterHidden;
    if (searchkitState[locationKey]?.results?.hits) {
      shouldFilterHidden = !this.sk.hasHits();
    } else {
      shouldFilterHidden = false;
    }
    this.state = {
      // related to desktop filters toggle
      filterHidden: shouldFilterHidden,
      // mobile filters modal
      modalVisible: false,
      // loading results
      loading: false,
      bodySection: [],
      bottomSection: [],
    };
  }

  getChildContext() {
    const {
      location: { pathname },
    } = this.props;
    return {
      path: pathname,
    };
  }

  componentDidMount() {
    startStoryblok();
    const { location } = this.props;
    const { frame } = this.context;
    const { StoryblokBridge, location: storyLocation } = window;
    if (StoryblokBridge) {
      const storyblokInstance = new StoryblokBridge();
      storyblokInstance.on(['published', 'change'], (event) => {
        if (!event.slugChanged) {
          // reload page if save or publish is clicked
          storyLocation.reload(true);
        }
      });
      storyblokInstance.on('input', (event) => {
        // Access currently changed but not yet saved content via:
        if (event?.story?.content) {
          this.setState({
            bodySection: event?.story?.content.body_section,
            bottomSection: event?.story?.content.bottom_section,
          });
        }
      });
    }
    const page = getPageByUrl(location.pathname);
    this.setState({
      bodySection: page.bodySection,
      bottomSection: page.bottomSection,
    });
    // handle Outdated Storyblok Sale page
    if (location.pathname === '/sale' && location.query?.from) {
      const saleName = getPageByKey(location.query.from)?.name;

      if (saleName) {
        const content = (
          <div className={`${style.outdatedPage}__box`}>
            <h2 className={`${style.outdatedPage}__title`}>This sale has ended!</h2>

            <div className={`${style.outdatedPage}__intro`}>
              {saleName || 'The sale'} may have ended. <br />
              We’ve rounded up some crowd–favourites and distinct designs you might want to check out!
            </div>

            <span
              className={`${style.outdatedPage}__action`}
              onClick={() => {
                frame.removeModal();
              }}
              role="button"
            >
              <span>Continue Shopping</span>
              <SvgIcon name="line-right-arrow" />
            </span>
            <CloseBtn
              onClick={() => {
                frame.removeModal();
              }}
              className={`${style.outdatedPage}__close`}
            />
          </div>
        );

        frame.openModal('textModal', {
          content,
          containerStyle: {
            maxWidth: '620px',
            borderRadius: 0,
            textAlign: 'center',
            padding: '20px',
          },
        });
      }
    }

    const filterTrackedWithDY = {
      material_filter: 'material',
      tags: 'featured',
      lead_time: 'deliver',
      color: 'color',
    };

    const allFilterKeys = [
      'category',
      'tags',
      'lead_time',
      'material_filter',
      'price',
      'color',
      'length',
      'bed_frame_size',
      'overall_sit_rating',
      'seat_depth_rating',
      'seat_height_rating',
      'seat_softness_rating',
      'sort',
      'fabric_feature',
      'fabric_type',
    ];
    const levels = {
      overall_sit_rating: ['Very relaxed', 'Relaxed', 'Medium', 'Upright', 'Very upright'],
      seat_depth_rating: ['Very shallow', 'Shallow', 'Medium', 'Deep', 'Very deep'],
      seat_height_rating: ['Very low', 'Low', 'Medium', 'High', 'Very high'],
      seat_softness_rating: ['Very soft', 'Soft', 'Medium', 'Firm', 'Very firm'],
    };
    allFilterKeys.forEach((filterKey) => {
      const accessor = this.sk.accessors.statefulAccessors[filterKey];
      if (accessor) {
        accessor.onStateChange = (oldState) => {
          const { key } = accessor;
          const currentFilterState = accessor.state.value;
          const oldFilterState = oldState[key];
          if (filterKey === 'sort') {
            if (currentFilterState && currentFilterState !== oldFilterState) {
              const label = getLabelBySortKey(currentFilterState);
              // track sort
              this.props.trackProductSort({ label });
            }
            return;
          }

          if (currentFilterState instanceof Array) {
            // only when filter condition increase
            if (currentFilterState.length > (oldFilterState ? oldFilterState.length : 0)) {
              const filterValue = currentFilterState[currentFilterState.length - 1];
              const filterType = filterTrackedWithDY[key];
              if (filterType) {
                let filterValueRepresentation;
                if (filterType === 'deliver') {
                  filterValueRepresentation = accessor.options.options.find(
                    (option) => option.key === filterValue
                  ).title;
                } else {
                  filterValueRepresentation = accessor.translations[filterValue] || filterValue;
                }
                trackFilterItems(filterType, filterValueRepresentation);
              }
              // track filters
              this.props.trackProductFilter({
                filterKey: key,
                label: accessor.translations[filterValue] || filterValue || '',
              });
            }
          } else if (currentFilterState instanceof Object) {
            if (!isEqual(currentFilterState, oldFilterState)) {
              const { min, max } = currentFilterState;
              let label = '';
              if (['price', 'length', 'bed_frame_size'].includes(key)) {
                label = `${min}-${max}`;
              } else if (+min >= 0 && +max <= 5) {
                label = `${levels[key][min - 1]}-${levels[key][max - 1]}`;
              }
              // track filters
              this.props.trackProductFilter({
                filterKey: key,
                label,
              });
            }
          }
        };
      }
    });

    // trigger event productImpression per 0.5 second
    this.impressionTimer = setInterval(() => {
      const { impressions, trackProductImpression } = this.props;
      if (impressions && impressions.length) {
        trackProductImpression();
      }
    }, 500);

    // FIXME: use forceUpdate to render GroupedSelectedFilters
    this.forceUpdate();
  }

  componentDidUpdate() {
    const { modalVisible } = this.state;
    const { breakpoints } = this.props;
    const { desktop } = breakpoints;
    if (!desktop) {
      if (modalVisible && !this.isLockBody) {
        this.isLockBody = true;
        this.disableScroll();
      } else if (!modalVisible && this.isLockBody) {
        this.isLockBody = false;
        this.enableScroll();
      }
    }
  }

  componentWillUnmount() {
    const { impressions, trackProductImpression } = this.props;
    clearInterval(this.impressionTimer);
    if (impressions && impressions.length) {
      trackProductImpression();
    }
    this.enableScroll();
  }

  disableScroll = () => {
    const html = document.documentElement;
    const { body } = document;
    html.style.position = 'relative';
    html.style.overflow = 'hidden';
    body.style.position = 'relative';
    body.style.overflow = 'hidden';
  };

  enableScroll = () => {
    const html = document.documentElement;
    const { body } = document;
    html.style.position = '';
    html.style.overflow = '';
    body.style.position = '';
    body.style.overflow = '';
  };

  // Set Type Filters silently for normal category page
  setTypeFilter = (location) => {
    // do not show product with tag ws201908 in all-products
    // determine whether to show the category filter based on permalink
    const page = getPageByUrl(location.pathname);

    this.permalink = page.permalink;
    this.isAllCategory = needSubFilter.includes(this.permalink);
    this.hasCategoryFilter = !this.permalink || this.isAllCategory;

    // if permalink is an array, score is weight + 1 / position
    if (this.typeAccessor) {
      this.sk.removeAccessor(this.typeAccessor); // remove existing type filter
    }

    this.typeAccessor = getTypeAccessor(this.permalink);
    this.sk.addAccessor(this.typeAccessor);
  };

  enhanceToggleFilters = (hideFilter) => {
    this.setState((prevState) => {
      if (typeof hideFilter === 'boolean') {
        return {
          filterHidden: hideFilter,
        };
      }
      return {
        filterHidden: !prevState.filterHidden,
      };
    });
  };

  saveResult = (results) => {
    const { location, setSearchkitState: setSearchkit } = this.props;
    setSearchkit({ [location.pathname + location.search]: { results } });
  };

  hideFilterWhenSearch = (result) => {
    const { location } = this.props;
    const { state: routeState } = location;
    const isFromSearch = typeof routeState?.isFromSearch !== 'undefined';
    if (isFromSearch) {
      this.enhanceToggleFilters(!result?.hits?.total);
    }
  };

  /*= ================================================
  =            Mobile specific functions            =
  ================================================= */

  toggleModal = () => {
    const { breakpoints } = this.props;
    const { desktop } = breakpoints;
    if (!desktop) {
      this.setState(
        (state) => ({
          modalVisible: !state.modalVisible,
        }),
        () => {
          if (!this.state.modalVisible) {
            this.filterRef?.current.focus();
          }
        }
      );
    }
  };

  applyFilters = () => {
    const { breakpoints } = this.props;
    const { desktop } = breakpoints;
    if (!desktop) {
      // use promise to not batch two setState
      Promise.resolve(this.filterManager.apply()).then(() => {
        this.toggleModal();
      });
    }
  };

  cancelFilters = () => {
    const { breakpoints } = this.props;
    const { desktop } = breakpoints;
    if (!desktop) {
      Promise.resolve(this.toggleModal()).then(() => {
        this.filterManager.cancel();
      });
    }
  };

  getSelectedFilterNumbers = () =>
    Object.keys(this.sk.state).reduce((result, key) => {
      const filter = this.sk.state[key];
      if (Array.isArray(filter)) {
        return result + filter.length;
      }
      if (typeof filter === 'object' && Object.keys(filter).length > 0) {
        return result + 1;
      }
      return result;
    }, 0);

  /*= ====  End of Mobile specific functions  ====== */

  render() {
    const { location, breakpoints, user } = this.props;
    const { desktop } = breakpoints;
    const { state: routeState } = location;
    const { modalVisible, loading, bodySection, bottomSection, filterHidden } = this.state;
    const isFromSearch = typeof routeState?.isFromSearch !== 'undefined';
    const shouldHideFilter = filterHidden || (!this.sk.hasHits() && isFromSearch);
    const page = getPageByUrl(location.pathname);
    const hasLogin = user !== undefined;

    const handleRenderBanner = () => {
      if (bodySection || page?.bodySection) {
        const section = bodySection?.length === 0 ? page?.bodySection : bodySection;
        if (section?.length) {
          return section.map((item) => {
            item = camelToSnake(item);
            return (
              <Stack {...storyblokEditable(item)} key={item._uid}>
                <StoryblokComponent blok={item} key={item._uid} />
              </Stack>
            );
          });
        }
      }
      return (
        <Banner
          page={{
            ...page,
          }}
        />
      );
    };

    const renderBottomSection = () => {
      if (bottomSection && Array.isArray(bottomSection)) {
        return bottomSection.map((item) => {
          item = camelToSnake(item);
          return <StoryblokComponent blok={item} key={item._uid} />;
        });
      }
    };

    if (page.notCanDisplay === true) {
      return <NotFoundWithoutWrapPage />;
    }

    return (
      <>
        {!isProd && <Script strategy="beforeInteractive" src="//app.storyblok.com/f/storyblok-v2-latest.js" async />}
        <SearchkitProvider searchkit={this.sk}>
          <PathContext.Provider value={location.pathname}>
            <div className={style.category}>
              <div
                className={classNames(`${style.category}__wrapper`, {
                  'is-modal-visible': modalVisible,
                })}
              >
                {handleRenderBanner()}
                {!desktop ? (
                  // mobile
                  <Container disableGutters className={style.main}>
                    {/* TODO  有些宽度是 */}
                    <div className={`${style.main}__topbar`}>
                      <div className={`${style.main}__topbar-filterAndSortContainer`}>
                        <button
                          ref={this.filterRef}
                          type="button"
                          onClick={this.toggleModal}
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          <ReactSVG name="filter" />
                          Filter
                          {(() => {
                            const selectedFilters = this.getSelectedFilterNumbers();
                            if (selectedFilters > 0) {
                              return <span>{selectedFilters}</span>;
                            }
                          })()}
                        </button>
                        <Sorting />
                      </div>
                      {enableQuickShip && (
                        <div className={`${style.main}__topbar-quickshipContainer`}>
                          <QuickshipFilter
                            id="quickship"
                            field="variants.in_stock_regions.raw"
                            fieldOptions={{
                              type: 'nested',
                              options: {
                                path: 'variants',
                              },
                            }}
                            itemComponent={QuickshipSwitch}
                          />
                        </div>
                      )}
                    </div>
                    <div>
                      <div
                        className={classNames(`${style.main}__hits`, {
                          'is-loading': loading,
                        })}
                      >
                        <Hits scrollTo={`.${style.category}__wrapper`} />
                        {loading && <Spinner className={`${style.main}__hits__spinner`} />}
                      </div>
                    </div>
                  </Container>
                ) : (
                  // desktop
                  <Container className={style.main}>
                    <div>
                      <div className={`${style.main}__topbar`}>
                        <div>
                          <div
                            role="button"
                            className={`${style.main}__topbar__toggle`}
                            onClick={this.enhanceToggleFilters}
                          >
                            <ReactSVG name="filter" />
                            {shouldHideFilter ? 'Show Filters' : 'Hide Filters'}
                          </div>
                          <Sorting />
                        </div>

                        <div>
                          <GroupedSelectedFilters groupComponent={FilterGroup} />
                          <ResetFilters
                            translations={{ 'reset.clear_all': '↻ Reset' }}
                            options={{
                              pagination: false,
                              query: true,
                              filter: true,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div
                        className={classNames(`${style.main}__body`, {
                          'is-loading': loading,
                        })}
                      >
                        <Filters
                          className={classNames(`${style.main}__filters`, {
                            'filter-hidden': shouldHideFilter,
                          })}
                          hasCategoryFilter={this.hasCategoryFilter}
                          isAllCategory={this.isAllCategory}
                          taxonomyPermalink={this.permalink}
                          collapsable
                        />
                        <div className={`${style.main}__hits`} style={{ width: shouldHideFilter ? '100%' : '80%' }}>
                          <Hits scrollTo={`.${style.category}__wrapper`} />
                        </div>
                        {loading ? <Spinner className={`${style.main}__body__loading`} /> : null}
                      </div>
                    </div>
                  </Container>
                )}
                {renderBottomSection()}
              </div>

              {!desktop && (
                <ModalWrapper
                  isEntered={modalVisible}
                  label="You can select filters in this modal"
                  style={{ height: '0px' }}
                >
                  <div
                    className={classNames(style.modal, {
                      'is-visible': modalVisible,
                    })}
                  >
                    <div className={`${style.modal}__header`}>
                      <h3>Filters</h3>
                      <CloseBtn onClick={this.cancelFilters} width="30px" />
                    </div>
                    <div className={`${style.modal}__btnGroup`}>
                      <ResetFilters
                        component={this.bufferedComponents.ResetButton}
                        options={{ pagination: false, query: true, filter: true }}
                      />
                      <Button text="Apply" color="light-accent" onClick={this.applyFilters} />
                    </div>
                    <div
                      className={classNames(`${style.modal}__body`, {
                        'is-loading': loading,
                      })}
                    >
                      <GroupedSelectedFilters groupComponent={FilterGroup} />
                      <Filters
                        hasCategoryFilter={this.hasCategoryFilter}
                        isAllCategory={this.isAllCategory}
                        taxonomyPermalink={this.permalink}
                        bufferedComponents={this.bufferedComponents}
                      />
                      {/* <div
                        className={`${style.main}__hits`}
                        style={{ width: shouldHideFilter ? '100%' : '80%', alignItems: 'stretch' }}
                      >
                        <Hits scrollTo={`.${style.category}__wrapper`} />
                      </div>
                      {loading ? <Spinner className={`${style.main}__body__loading`} /> : null} */}
                    </div>
                  </div>
                </ModalWrapper>
              )}
            </div>
          </PathContext.Provider>
        </SearchkitProvider>
      </>
    );
  }
}
