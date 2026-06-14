'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stack, useBreakpoints, Box, Button, Typography } from '@castlery/fortress';
import { Search, Close } from '@castlery/fortress/Icons';
import debounce from 'lodash.debounce';
import Autosuggest from 'react-autosuggest';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { currentSearchList, handleSearchWordChange } from '@castlery/modules-product-domain';
import { CloseLeft, CloseRight } from '@castlery/fortress/Icons';
import { NextFortressLink } from '@castlery/shared-components';
import { selectCMSCollectionData, selectCMSOriginalMenuData } from '@castlery/modules-cms-domain';
import { EcEnv } from '@castlery/config';
import {
  EVENT_DY_KEYWORD_SEARCH,
  EVENT_SUGGESTIONS_RESULT,
  EVENT_SUGGESTIONS_SELECT,
} from '@castlery/modules-tracking-services';
import { useDebounce } from 'react-use';

type Suggestion = {
  name: string;
  name_highlight: string;
  type: 'product' | 'category' | 'collection' | 'customized';
  slug: string;
  default_taxon?: string;
  image?: string;
  pathname: string;
  position?: number;
};

type Section = {
  title: string;
  suggestions: Suggestion[];
};

type SearchInputProps = {
  isHidden?: boolean;
  onClose?: () => void;
  placeholder?: React.ReactNode;
  suggestionPadding?: boolean;
  onChange?: (oldValue: string, newValue: string, event: React.ChangeEvent<any>) => void;
  onClickSuggestion?: () => void;
  handleClose: () => void;
};

// TODO 这个组件被我弄坏了....
const SearchInput = ({
  isHidden = false,
  onClose,
  placeholder,
  suggestionPadding = true,
  onChange,
  onClickSuggestion,
  handleClose,
}: SearchInputProps) => {
  const { desktop } = useBreakpoints();
  const searchResult = useAppSelector(currentSearchList);
  // const searchValue = useAppSelector(currentSearchName);
  const [value, setValue] = useState<string>('');
  const [suggestions, setSuggestions] = useState<Section[]>([]);
  const [noSuggestions, setNoSuggestions] = useState<boolean>(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState<boolean>(false);
  const [realSearchResult, setRealSearchResult] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const _mount = useRef<boolean>(false);
  const prevSearchResultRef = useRef<any[]>([]);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [collectionsList, setCollectionsList] = useState<any[]>([]);
  const collectionsData = useAppSelector(selectCMSCollectionData);
  const menuData = useAppSelector(selectCMSOriginalMenuData);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (collectionsData?.children) {
      setCollectionsList(collectionsData?.children);
    }
  }, [collectionsData?.children]);

  useEffect(() => {
    if (menuData?.children) {
      setCategoryList(menuData?.children);
    }
  }, [menuData?.children]);

  // 当 value 变化时立即清空搜索结果并设置 isFetching 为 true
  useEffect(() => {
    if (value.trim().length > 0) {
      setIsFetching(true);
    }
    setRealSearchResult([]);
  }, [value]);

  useEffect(() => {
    if (desktop && !isHidden) {
      setDesktopSearchOpen(true);
    }
  }, [desktop, isHidden]);

  const escapeRegexCharacters = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // const trackKeywordSearch = debounce((keywords: string) => {
  //   // console.log('keywords', keywords);
  //   dispatch(EVENT_DY_KEYWORD_SEARCH({ keywords }));
  // }, 2000);

  useDebounce(
    () => {
      dispatch(EVENT_DY_KEYWORD_SEARCH({ keywords: value }));
    },
    2000,
    [value]
  );

  const onSuggestionsFetchRequested = useMemo(
    () =>
      debounce(({ value }: { value: string }) => {
        const isInputBlank = value.trim().length === 0;
        const escapedValue = escapeRegexCharacters(value.trim());
        if (escapedValue.length !== 0) {
          dispatch(handleSearchWordChange({ name: escapedValue }));
        } else {
          setSuggestions([]);
          setNoSuggestions(!isInputBlank);
        }
      }, 500),
    [dispatch]
  );

  useEffect(() => {
    _mount.current = true;
    if (!isHidden && containerRef.current) {
      containerRef.current.querySelector('input')?.focus();
    }
    return () => {
      _mount.current = false;
      // 清理未完成的 debounced 调用
      onSuggestionsFetchRequested.cancel();
    };
  }, [isHidden, onSuggestionsFetchRequested]);

  const findCategorySlug = useCallback(
    (slug: string) => {
      let findSlug = '';
      categoryList?.forEach((item: any) => {
        if (item.permalink === slug) {
          findSlug = item.url;
        }
        item.children?.forEach((subItem: any) => {
          if (subItem.permalink === slug) {
            findSlug = subItem.url;
          }
        });
      });
      return findSlug;
    },
    [categoryList]
  );

  const findCollectionSlug = useCallback(
    (slug: string) => {
      let findSlug = '';
      collectionsList?.forEach((item: any) => {
        if (item.permalink === slug) {
          findSlug = item.url;
        }
      });
      return findSlug;
    },
    [collectionsList]
  );

  // 计算 suggestionCount
  const suggestionCount = useMemo(() => {
    let count = 0;
    realSearchResult.forEach((r) => {
      if (r.type === 'product') {
        count++;
      } else if (r.type === 'category') {
        if (findCategorySlug(r.slug) !== '') {
          count++;
        }
      } else if (r.type === 'collection') {
        if (findCollectionSlug(r.slug) !== '') {
          count++;
        }
      }
    });
    return count;
  }, [realSearchResult, findCategorySlug, findCollectionSlug]);

  // 当 searchResult 更新时同步到 realSearchResult 并设置 isFetching 为 false
  useEffect(() => {
    // 判断 searchResult 是否真的更新了（通过比较引用或长度）
    const hasUpdated =
      prevSearchResultRef.current !== searchResult || prevSearchResultRef.current.length !== searchResult.length;

    if (hasUpdated) {
      if (value.trim().length > 0) {
        const calcSuggestionCount = () => {
          let count = 0;
          searchResult.forEach((r) => {
            if (r.type === 'product') {
              count++;
            } else if (r.type === 'category') {
              if (findCategorySlug(r.slug) !== '') {
                count++;
              }
            } else if (r.type === 'collection') {
              if (findCollectionSlug(r.slug) !== '') {
                count++;
              }
            }
          });
          return count;
        };
        dispatch(EVENT_SUGGESTIONS_RESULT({ searchTerm: value.trim(), suggestionCount: calcSuggestionCount() }));
      }
      setRealSearchResult(searchResult);
      setIsFetching(false);
      prevSearchResultRef.current = searchResult;
    }
  }, [searchResult]);

  useEffect(() => {
    const isInputBlank = value.trim().length === 0;
    const escapedValue = escapeRegexCharacters(value.trim());
    const sections: Section[] = [
      { title: 'PRODUCT', suggestions: [] },
      { title: 'CATEGORY', suggestions: [] },
      { title: 'COLLECTION', suggestions: [] },
    ];

    let position = 1;

    realSearchResult.forEach((r) => {
      if (r.type === 'product') {
        const suggestion: Suggestion = {
          ...r,
          pathname: `products/${r.slug}`,
          position,
        };
        // r.pathname = getProductLink(r.slug);
        sections[0].suggestions.push(suggestion);
        position++;
      } else if (r.type === 'category') {
        // const page = r.slug;
        if (findCategorySlug(r.slug) !== '') {
          const suggestion: Suggestion = {
            ...r,
            pathname: findCategorySlug(r.slug) || '',
            position,
          };
          sections[1].suggestions.push(suggestion);
          position++;
        }
        // }
      } else if (r.type === 'collection') {
        if (findCollectionSlug(r.slug) !== '') {
          const suggestion: Suggestion = {
            ...r,
            pathname: findCollectionSlug(r.slug) || '',
            position,
          };
          sections[2].suggestions.push(suggestion);
          position++;
        }
      }
    });

    if (sections[0].suggestions.length > 0) {
      sections[0].suggestions.push({
        type: 'customized',
        name: escapedValue,
        name_highlight: 'View all products',
        pathname: `search?q=${encodeURIComponent(escapedValue)}`,
        slug: escapedValue,
      });
    }

    if (_mount.current) {
      // TODO 这里有重新渲染的问题
      setSuggestions(sections.filter((section) => section.suggestions.length > 0));
      if (isFetching) {
        setNoSuggestions(false);
      } else {
        setNoSuggestions(!isInputBlank && realSearchResult.length === 0);
      }
    }
  }, [realSearchResult, value, findCategorySlug, findCollectionSlug, isFetching]);

  // useEffect(() => {
  //   setTimeout(() => {
  //     const oInput = document.querySelector('.react-autosuggest__container');
  //     console.log(oInput?.getBoundingClientRect);
  //   }, 1000);
  // }, []);

  const onSuggestionsClearRequested = () => {
    // setSuggestions([]);
    setNoSuggestions(false);
  };

  const clearSuggestionAndFetchRequested = ({ value }: { value: string }) => {
    onSuggestionsClearRequested();
    onSuggestionsFetchRequested({ value });
  };

  const getSectionSuggestions = (section: Section) => section.suggestions;

  const getSuggestionValue = (suggestion: Suggestion) => suggestion.name;

  const clickSuggestion = (event: React.MouseEvent, suggestion: Suggestion) => {
    event.stopPropagation();
    dispatch(
      EVENT_SUGGESTIONS_SELECT({
        searchTerm: value.trim(),
        suggestionType: suggestion.type,
        suggestionText: suggestion.name,
        position: suggestion?.position || 0,
      })
    );
    if (onClickSuggestion) onClickSuggestion();
    onClose && onClose();
  };

  const renderSuggestion = (suggestion: Suggestion) => {
    return (
      <NextFortressLink
        href={`/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}${
          suggestion.pathname.startsWith('/') ? suggestion.pathname : `/${suggestion.pathname}`
        }`}
        onClick={(e) => clickSuggestion(e, suggestion)}
        key={suggestion.name + suggestion.slug}
      >
        {suggestion.image && <img src={suggestion.image} alt={suggestion.name} />}
        {suggestion.name_highlight ? (
          <span dangerouslySetInnerHTML={{ __html: suggestion.name_highlight }} />
        ) : (
          suggestion.name
        )}
      </NextFortressLink>
    );
  };

  const renderSectionTitle = (section: Section) => (
    <span
      style={{
        fontFamily: `var(--font-sanoma-sans,"SanomatSans"),var(--fortress-fontFamily-fallback)`,
        backgroundColor: '#FBF9F4',
        fontSize: '12px',
        fontWeight: 400,
        color: '#844025',
        width: '100%',
        letterSpacing: '1px',
      }}
    >
      {section.title}
    </span>
  );

  const onSuggestionSelected = (e: React.KeyboardEvent, { suggestion, method }: any) => {
    if (method === 'enter') {
      e.preventDefault();
      onClose && onClose();
      // history.push({
      //   pathname: suggestion.pathname,
      //   ...(suggestion.query && { query: suggestion.query }),
      //   state: { isFromSearch: true },
      // });
    }
  };

  // const onSubmit = (e: FormEvent) => {
  //   e.preventDefault();
  //   if (formRef.current?.elements.namedItem('q')?.nodeValue?.trim()) {
  //     onClose && onClose();
  //     // history.push({
  //     //   pathname: `/search`,
  //     //   query: { q: value },
  //     //   state: { isFromSearch: true },
  //     // });
  //   }
  // };

  const inputProps = {
    type: 'search',
    placeholder: placeholder || 'Type to search...',
    className: 'form-control',
    value,
    name: 'q',
    maxLength: 100,
    autoCorrect: 'off' as const,
    spellCheck: false as const,
    onChange: (event: React.ChangeEvent<HTMLInputElement>, { newValue }: any) => {
      setValue(newValue);
      onChange && onChange(value, newValue, event);
    },
    onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const trimmedValue = value.trim();
        if (!trimmedValue) {
          return;
        }
        const encodedValue = encodeURIComponent(trimmedValue);
        window.location.href = `/${EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()}/search?q=${encodedValue}`;
      }
    },
    'data-selenium': 'header-search-input',
    'aria-label': 'Type to search...',
  };

  return (
    <Stack
      sx={{
        width: !desktop ? '100%' : '308px',
        paddingLeft: '10px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        background: desktop ? 'linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(246,243,231) 5%)' : '#F6F3E7',
        borderBottom: !desktop ? 'none' : '1px solid #ddd',
      }}
    >
      <Search
        sx={{
          width: 22,
          height: 22,
          opacity: 1,
          paddingBottom: !desktop ? 0 : '5px',
          transform: isHidden && desktop ? 'translateX(80px)' : 'translateX(0)',
          transition:
            'transform cubic-bezier(0.11393, 0.8644, 0.14684, 1) 0.3s, opacity cubic-bezier(0.67, 0, 0.33, 1) 0.2s',
          fill: '#3C101E',
        }}
      />
      <Stack
        sx={{
          input: {
            width: '100%',
          },
          flex: 1,
          paddingLeft: !desktop ? '15px' : '5px',
          '.react-autosuggest__container': {
            position: 'relative',
            input: {
              appearance: 'none',
              fontSize: 16,
              border: 'none',
              background: 'none',
              paddingBottom: !desktop ? 0 : '5px',
              fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
              '&:focus': {
                outline: 'none',
              },
              color: '#3C101E',
            },
            'input::-webkit-search-cancel-button': {
              display: 'none',
            },
            '.react-autosuggest__suggestions-container': {
              backgroundColor: '#FBF9F4',
              position: 'absolute',
              top: desktop ? 'calc(100% + .5px)' : 'calc(100% + 10px)',
              left: desktop ? '-30px' : '-52px',
              right: desktop ? '-20px' : '-52px',
              zIndex: 999,
              border: desktop ? '1px solid #ddd' : 'none',
              borderTop: 'none',
              '.react-autosuggest__section-title': {
                fontSize: 12,
                paddingLeft: desktop ? '10px' : '15px',
                paddingTop: desktop ? '0.375rem' : '0.5rem',
                fontWeight: 600,
              },
              ul: {
                margin: 0,
                listStyle: 'none',
                padding: desktop ? '0.375rem 0' : '0.5rem 20px',
                paddingBottom: 0,
                li: {
                  paddingTop: '10px',
                  paddingBottom: '10px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  '&:hover': {
                    backgroundColor: '#F6F3E7',
                  },
                  a: {
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    textDecorationLine: 'none !important',
                    '&:hover': {
                      textDecorationLine: 'none !important',
                    },
                    img: {
                      width: '80px',
                      marginRight: '5px',
                      height: 'auto',
                      flex: '0 0 auto',
                    },
                    span: {
                      flex: '1 1 auto',
                      color: '#3C101E',
                      '&:hover': {
                        color: (theme) => theme.palette.brand.terracotta[500],
                      },
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      em: {
                        fontStyle: 'normal',
                        fontWeight: 600,
                      },
                    },
                  },
                },
                '.react-autosuggest__suggestion:nth-child(6)': {
                  paddingTop: '12px',
                  '&:hover': {
                    backgroundColor: '#FBF9F4',
                    a: {
                      span: {
                        color: '#844025 !important',
                        textDecorationColor: '#844025 !important',
                      },
                    },
                  },
                  a: {
                    span: {
                      color: '#D25C1B !important',
                      textDecoration: 'underline',
                      fontFamily: `var(--font-aime, "Aime"),var(--fortress-fontFamily-fallback)`,
                      textDecorationColor: '#D25C1B !important',
                    },
                  },
                },
              },
            },
            '.react-autosuggest__section-container:not(:last-of-type)': {
              borderBottom: '.5px dotted #000',
            },
          },
        }}
        ref={containerRef}
      >
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={clearSuggestionAndFetchRequested}
          onSuggestionsClearRequested={onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          multiSection
          renderSectionTitle={renderSectionTitle}
          getSectionSuggestions={getSectionSuggestions}
          onSuggestionSelected={onSuggestionSelected}
          focusInputOnSuggestionClick={false}
          inputProps={inputProps}
        />
        {placeholder && !value && placeholder}
        {noSuggestions && (
          <Stack
            sx={{
              position: 'absolute',
              top: desktop ? 'calc(100% + 5px)' : '50px',
              left: desktop ? '10px' : 0,
              right: desktop ? '10px' : 0,
              border: desktop ? '1px solid #ddd' : 'none',
              padding: '8px 12px',
              backgroundColor: '#FBF9F4',
            }}
          >
            <Typography
              sx={{
                color: '#8e8e8e',
              }}
            >
              Sorry, no result is found.
            </Typography>
          </Stack>
        )}
      </Stack>
      {!desktop && (
        <Button
          aria-label="Close search"
          title="Close search"
          sx={[
            {
              position: 'relative',
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              width: !desktop ? 52 : 24,
              height: 24,
              minHeight: 0,
              '&:hover': {
                backgroundColor: 'transparent',
              },
              '&:active:hover': {
                boxShadow: 'none',
              },
              svg: {
                fill: '#778379',
              },
              div: {
                // transition: 'transform 0.2s, opacity 0.2s',
                position: 'absolute',
                opacity: 0.8,
              },
            },
          ]}
          onClick={handleClose}
        >
          <Close stroke="#778379" />
        </Button>
      )}
      {desktop && desktopSearchOpen && (
        <Button
          aria-label="Close search"
          title="Close search"
          sx={[
            {
              position: 'relative',
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              width: !desktop ? 52 : 24,
              height: 24,
              minHeight: 0,
              '&:hover': {
                backgroundColor: 'transparent',
              },
              '&:active:hover': {
                boxShadow: 'none',
              },
              svg: {
                fill: '#778379',
              },
              div: {
                // transition: 'transform 0.2s, opacity 0.2s',
                position: 'absolute',
                opacity: 0.8,
              },
            },
            !isHidden && {
              div: {
                transition: 'transform 0.2s, opacity 0.2s',
                opacity: 1,
              },
            },
          ]}
          onClick={() => {
            setDesktopSearchOpen(false);
            handleClose();
          }}
        >
          <Box
            sx={[
              {
                transform: 'rotate(-45deg)',
                transformOrigin: '0 100%',
              },
              !isHidden && {
                transform: 'rotate(0deg)',
              },
            ]}
          >
            <CloseLeft
              sx={{
                width: 14,
                height: 14,
              }}
            />
          </Box>
          <Box
            sx={[
              {
                transform: 'rotate(45deg)',
                transformOrigin: '100% 100%',
              },
              !isHidden && {
                transform: 'rotate(0deg)',
              },
            ]}
          >
            <CloseRight
              sx={{
                width: 14,
                height: 14,
              }}
            />
          </Box>
        </Button>
      )}
    </Stack>
  );
};

export { SearchInput };
