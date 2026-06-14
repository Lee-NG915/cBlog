'use client';
import { enableZipCode, posRoutes } from '@castlery/config';
import { Autocomplete, AutocompleteOption, Box, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { Search } from '@castlery/fortress/Icons';
import {
  ProductOption,
  currentAutoCompleteList,
  getPlpListSearch,
  useGetProductOptionsQuery,
} from '@castlery/modules-product-domain';
import { FortressImage } from '@castlery/shared-components';
import { makePersistenceHandles } from '@castlery/shared-persistence-kit';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import {
  // useParams,
  useRouter,
} from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce } from 'react-use';

const highlightOccurrencesIgnoreCase = (keyword: string, text: string) => {
  if (!keyword.trim()) return [{ text, type: 'normal' }];

  let startIndex = 0;
  const matches = [];
  const result = [];
  const keywordLower = keyword.toLowerCase();
  const textLower = text.toLowerCase();

  // Find all matches
  let index = textLower.indexOf(keywordLower, startIndex);
  while (index !== -1) {
    matches.push([index, index + keywordLower.length - 1]);
    startIndex = index + 1;
    index = textLower.indexOf(keywordLower, startIndex);
  }

  // Build result with highlight information
  let matchIndex = 0;
  for (let i = 0; i < text.length; i++) {
    if (matchIndex < matches.length && i >= matches[matchIndex][0] && i <= matches[matchIndex][1]) {
      result.push({ text: text[i], type: 'bold' });
      if (i === matches[matchIndex][1]) matchIndex++;
    } else {
      result.push({ text: text[i], type: 'normal' });
    }
  }
  return result;
};

export const ProductOptionItem = ({
  options,
  selected,
  keyword,
}: {
  options: ProductOption;
  selected: boolean;
  keyword: string;
}) => {
  const { mobile } = useBreakpoints();

  const richNameList = useMemo(() => {
    return highlightOccurrencesIgnoreCase(keyword, options.name);
  }, [options.name, keyword]);

  // Group consecutive characters with the same type to avoid rendering issues
  const groupedSegments = useMemo(() => {
    if (richNameList.length === 0) return [];

    const segments: Array<{ text: string; type: 'normal' | 'bold' }> = [];
    let currentSegment: { text: string; type: 'normal' | 'bold' } = {
      text: richNameList[0].text,
      type: richNameList[0].type as 'normal' | 'bold',
    };

    for (let i = 1; i < richNameList.length; i++) {
      const currentType = richNameList[i].type as 'normal' | 'bold';
      if (currentType === currentSegment.type) {
        currentSegment.text += richNameList[i].text;
      } else {
        segments.push(currentSegment);
        currentSegment = { text: richNameList[i].text, type: currentType };
      }
    }
    segments.push(currentSegment);

    return segments;
  }, [richNameList]);

  return (
    <Stack direction={'row'} alignItems={'center'} gap={2}>
      {options.image ? (
        <FortressImage
          src={options.image}
          imageWidth={mobile ? 32 : 56}
          imageHeight={mobile ? 32 : 56}
          alt={options.name}
        />
      ) : (
        <Box
          sx={{
            width: mobile ? 32 : 56,
            height: mobile ? 32 : 56,
          }}
        />
      )}
      <Typography
        level={'subh2'}
        sx={{
          fontSize: mobile ? '12px' : '16px',
        }}
      >
        {groupedSegments.map((segment, index) => {
          if (segment.type === 'bold') {
            return (
              <span key={index} style={{ fontWeight: 'bold' }}>
                {segment.text}
              </span>
            );
          }
          return <span key={index}>{segment.text}</span>;
        })}
      </Typography>
    </Stack>
  );
};

export interface ProductSearchInputProps {
  onFocused?: (focused: boolean) => void;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
}

export function ProductSearchInput(props: ProductSearchInputProps) {
  const { onFocused, onValueChange, defaultValue } = props;
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { mobile } = useBreakpoints();

  // State management
  const [keyword, setKeyword] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Get product options from store
  useGetProductOptionsQuery(keyword, {
    skip: !keyword,
  });
  const productOptions = useAppSelector(currentAutoCompleteList)[keyword] || [];
  const filteredOptions = useMemo(() => productOptions.filter(({ type }) => type === 'product'), [productOptions]);

  // Initialize with default value
  useEffect(() => {
    if (defaultValue) {
      setInputValue(defaultValue);
      setKeyword(defaultValue);
    }
  }, [defaultValue]);

  // Debounced keyword update
  useDebounce(
    () => {
      if (inputValue.trim()) {
        setKeyword(inputValue.trim());
      } else {
        setKeyword('');
      }
    },
    600,
    [inputValue]
  );

  // Navigation handlers
  const navigateToProduct = useCallback(
    (slug: string) => {
      const productUrl = `${posRoutes.products}/${slug}`;
      router.push(productUrl);
    },
    [router]
  );

  const navigateToSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) return;

      const productsUrl = new URL(posRoutes.products, window.location.origin);
      productsUrl.searchParams.set('q', searchTerm.trim());

      // Pre-fetch search results
      await dispatch(getPlpListSearch.initiate({ name: searchTerm.trim() }, { forceRefetch: true }));

      router.push(productsUrl.toString());
    },
    [dispatch, router]
  );

  // Event handlers
  const handleInputChange = useCallback(
    (event: React.SyntheticEvent | null, value: string) => {
      setInputValue(value);
      // open when there is some input; actual open also depends on options count
      setIsOpen(!!value.trim());
      onValueChange?.(value);
    },
    [onValueChange]
  );

  const handleOptionSelect = useCallback(
    (event: React.SyntheticEvent, value: ProductOption | string | null, reason: string) => {
      if (reason === 'selectOption' && value && typeof value !== 'string' && value.slug) {
        setIsOpen(false);
        navigateToProduct(value.slug);
      }
    },
    [navigateToProduct]
  );

  const handleKeyDown = useCallback(
    async (event: React.KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;

      // Handle Enter key
      if (key === 'Enter') {
        // Check for highlighted option using multiple selectors to be more robust
        const autocompleteElement = event.currentTarget;

        // Try different selectors based on W3C ARIA patterns and MUI implementation
        const selectors = [
          '.MuiOption-highlighted', // MUI Joy UI specific
          '[role="option"][aria-selected="true"]', // W3C ARIA standard
          '.Mui-focused', // Alternative MUI class
          '[data-focus="true"]', // Potential data attribute
        ];

        let highlightedOption: Element | null = null;
        for (const selector of selectors) {
          highlightedOption = autocompleteElement.querySelector(selector);
          if (highlightedOption) break;
        }

        if (highlightedOption) {
          // Prevent default behavior and stop propagation to avoid conflicts
          event.preventDefault();
          event.stopPropagation();

          // Find the corresponding product option and navigate directly
          const optionElement = highlightedOption.closest('[data-option-index]');
          if (optionElement) {
            const optionIndex = parseInt(optionElement.getAttribute('data-option-index') || '0');
            const selectedOption = filteredOptions[optionIndex];
            if (selectedOption && selectedOption.slug) {
              setIsOpen(false);
              navigateToProduct(selectedOption.slug);
              return;
            }
          }

          // Fallback: let MUI handle the selection
          setIsOpen(false);
          return;
        }

        // No highlighted option, perform search
        const target = event.target as HTMLInputElement;
        const searchValue = target?.value || inputValue;

        if (searchValue.trim()) {
          event.preventDefault();
          setIsOpen(false);
          await navigateToSearch(searchValue.trim());
        }
      }

      // Handle Escape key - follows W3C ARIA guidelines
      else if (key === 'Escape') {
        // Let MUI handle closing the popup
        // Optionally clear the input if popup is already closed
        const autocompleteElement = event.currentTarget;
        const popup = autocompleteElement.querySelector('[role="listbox"]');
        if (!popup || popup.getAttribute('aria-hidden') === 'true') {
          // Popup is already closed, clear the input
          setInputValue('');
          setKeyword('');
        }
        setIsOpen(false);
      }

      // Handle Arrow keys - let MUI handle navigation
      else if (['ArrowDown', 'ArrowUp'].includes(key)) {
        // MUI will handle focus management within the popup
        // This follows the W3C ARIA pattern for combobox navigation
      }
    },
    [inputValue, navigateToSearch, filteredOptions, navigateToProduct]
  );

  const handleFocus = useCallback(() => {
    onFocused?.(true);
  }, [onFocused]);

  const handleBlur = useCallback(() => {
    onFocused?.(false);
  }, [onFocused]);

  return (
    <Autocomplete
      freeSolo
      placeholder="Search products"
      autoFocus={mobile}
      inputValue={inputValue}
      options={filteredOptions}
      sx={{
        flexGrow: 1,
      }}
      variant="outlined"
      startDecorator={<Search />}
      loading={Boolean(keyword && filteredOptions.length === 0)}
      onInputChange={handleInputChange}
      onChange={handleOptionSelect}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      // Control popup open/close
      open={isOpen && filteredOptions.length > 0 && keyword.trim().length > 0}
      onOpen={() => setIsOpen(true)}
      onClose={() => setIsOpen(false)}
      // ARIA properties following W3C guidelines
      aria-label="Search for products"
      aria-autocomplete="list"
      aria-expanded={isOpen && filteredOptions.length > 0 && keyword.trim().length > 0}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return option.name || '';
      }}
      filterOptions={(options) => {
        // Return options as-is since filtering is done by the API
        return options;
      }}
      renderOption={(props, option, { selected }) => {
        if (!keyword.trim()) {
          return null;
        }

        return (
          <AutocompleteOption
            {...props}
            variant="outlined"
            key={option.slug}
            // Add ARIA properties for better accessibility
            role="option"
            aria-selected={selected}
          >
            <ProductOptionItem options={option} selected={selected} keyword={keyword} />
          </AutocompleteOption>
        );
      }}
      // Improve no options display
      noOptionsText={keyword.trim() ? 'No products found' : 'Start typing to search'}
    />
  );
}
