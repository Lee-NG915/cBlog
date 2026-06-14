'use client';
import {
  Autocomplete,
  AutocompleteOption,
  Box,
  Button,
  Typography,
  Drawer,
  Stack,
  DialogContent,
} from '@castlery/fortress';
import { Search } from '@castlery/fortress/Icons';
import {
  selectedCurrentCustomer,
  selectedCustomerName,
  setCustomer,
  useGetUsersQuery,
} from '@castlery/modules-user-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDebounce } from 'react-use';
import { usePathname } from 'next/navigation';
import PosAddNewCustomer from '../pos-add-new-customer/pos-add-new-customer';
import { trackViewContent } from '@castlery/modules-tracking-domain';
import { trackOfflineAccountSignIn, trackOfflineAtc } from '@castlery/modules-tracking-services';
import { PosCreateNewCustomer } from '../pos-create-new-customer/pos-create-new-customer';
import { sharedFeatureService } from '@castlery/shared-services';
import { POS_UMS_PERMISSIONS } from '@castlery/modules-user-services';
import { useHasPosUmsPermission } from '@castlery/shared-components';

const enabledOrderV2 = sharedFeatureService.enabledOrderV2;

const autocompleteOptionSx = {
  display: 'flex',
  justifyContent: 'space-between',
  p: 1,
  '&:not(:last-child)': {
    borderBottom: (theme: any) => `1px solid ${theme.palette.brand.wheat[500]}`,
  },
};

const optionStackSx = {
  width: '100%',
  '&>span': {
    width: '100%',
    overflow: 'hidden',
    wordWrap: 'break-word',
    wordBreak: 'break-all',
  },
};

const bottomBoxSx = {
  position: 'absolute',
  bottom: 42, //留mobile上的底部安全距离
  left: 0,
  right: 0,
  m: 2,
};

const selectCustomerStackSx = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingX: 1,
};

const searchButtonSx = {
  p: 0,
  m: 0,
  flex: 1,
  justifyContent: 'flex-start',
};

const searchTypographySx = {
  width: '100%',
  height: '100%',
  textAlign: 'left',
  textTransform: 'none',
  color: (theme: any) => theme.palette.brand.maroonVelvet[200],
  borderBottom: (theme: any) => `0.5px solid ${theme.palette.brand.mono[300]}`,
};

const searchIconSx = {
  '--Icon-fontSize': '24px',
  color: (theme: any) => theme.palette.brand.mono[900],
};

export interface PosSelectCustomerContentProps {
  onChange: (value: any) => void;
  closeDrawer?: () => void;
  drawerOpen?: boolean;
}
export const PosSelectCustomerContent = ({ onChange, closeDrawer, drawerOpen }: PosSelectCustomerContentProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [params, setParams] = useState({
    page: 1,
    q: '',
  });
  useDebounce(
    () => {
      setParams({ q: inputValue, page: 1 });
    },
    500,
    [inputValue]
  );

  const { currentData, isFetching } = useGetUsersQuery(params, {
    skip: !params.q,
  });

  const options = currentData?.results || [];

  useEffect(() => {
    if (drawerOpen && inputRef.current) {
      // Use setTimeout to ensure the drawer animation is complete before focusing
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [drawerOpen]);

  const handleAutocompleteChange = useCallback(
    (_: React.SyntheticEvent, value: any) => {
      onChange({ value });
    },
    [onChange]
  );

  const handleInputChange = useCallback((_: React.SyntheticEvent, value: string, reason: string) => {
    if (reason === 'input') {
      setInputValue(value);
    }
  }, []);

  const filterOptions = useCallback((options: any[], params: any) => {
    return options.filter((option) => {
      const name = `${option.firstname} ${option.lastname}`;
      const query = params.inputValue.toLowerCase();
      return option.email.toLowerCase().includes(query) || name.toLowerCase().includes(query);
    });
  }, []);

  const renderOption = useCallback((props: any, option: any) => {
    return (
      <AutocompleteOption {...props} key={option.email} sx={autocompleteOptionSx}>
        <Stack direction={'column'} sx={optionStackSx}>
          <Typography level="caption1" sx={{ textTransform: 'capitalize' }}>
            {option.firstname} {option.lastname}
          </Typography>
          <Typography level="caption1">{option.email}</Typography>
        </Stack>
      </AutocompleteOption>
    );
  }, []);

  return (
    <>
      <Autocomplete
        clearOnEscape
        autoComplete
        clearOnBlur={false}
        sx={{ width: '100%' }}
        options={options}
        onChange={handleAutocompleteChange}
        variant="outlined"
        startDecorator={<Search />}
        placeholder="Search for customer"
        loading={isFetching}
        getOptionLabel={(option) => option.email}
        slotProps={{ input: { ref: inputRef } }}
        onInputChange={handleInputChange}
        filterOptions={filterOptions}
        renderOption={renderOption}
      />
      <Box sx={bottomBoxSx}>
        {enabledOrderV2 ? (
          <PosCreateNewCustomer afterAddCustomer={closeDrawer} />
        ) : (
          <PosAddNewCustomer afterAddCustomer={closeDrawer} />
        )}
      </Box>
    </>
  );
};

export const PosSelectCustomer = () => {
  const clickDisabled = usePathname().includes('/checkout');
  const name = useAppSelector(selectedCustomerName);
  const customer = useAppSelector(selectedCurrentCustomer);
  const [open, setOpen] = useState(false);
  const dispatch = useAppDispatch();
  const hasSelectCustomerPermission = useHasPosUmsPermission(POS_UMS_PERMISSIONS.posTransactionAccess);

  const closeDrawer = useCallback(() => setOpen(false), []);

  const handleOpenDrawer = useCallback(() => {
    if (clickDisabled) return;
    if (!hasSelectCustomerPermission) {
      console.log('no permission');
      return;
    }
    setOpen(true);
  }, [clickDisabled]);

  const handleCustomerChange = useCallback(
    async ({ value }: { value: any }) => {
      if (value) {
        dispatch(setCustomer(value));
        await dispatch(trackViewContent());
        await dispatch(trackOfflineAccountSignIn());
        await dispatch(trackOfflineAtc());
        setOpen(false);
      }
    },
    [dispatch]
  );

  return (
    <React.Fragment>
      <Stack
        sx={{
          ...selectCustomerStackSx,
          ...(hasSelectCustomerPermission
            ? {
                cursor: 'pointer',
              }
            : {
                cursor: 'not-allowed',
              }),
        }}
      >
        {customer ? (
          <Box role="button" onClick={handleOpenDrawer}>
            <Typography level="h5" sx={{ textTransform: 'capitalize', fontWeight: 700 }}>
              {name}
            </Typography>
            <Typography level="caption1">{customer.email}</Typography>
          </Box>
        ) : (
          <Button
            variant="tertiary"
            sx={{
              ...searchButtonSx,
              ...(hasSelectCustomerPermission
                ? {
                    cursor: 'pointer',
                  }
                : {
                    cursor: 'not-allowed',
                    svg: {
                      color: 'var(--fortress-palette-brand-mono-500)',
                    },
                  }),
            }}
            onClick={handleOpenDrawer}
          >
            <Typography level="body1" sx={searchTypographySx} startDecorator={<Search sx={searchIconSx} />}>
              Search for a customer
            </Typography>
          </Button>
        )}
        {enabledOrderV2 ? (
          <PosCreateNewCustomer iconButton defaultStep="Add New Customer" afterAddCustomer={closeDrawer} />
        ) : (
          <PosAddNewCustomer iconButton defaultStep="Add New Customer" afterAddCustomer={closeDrawer} />
        )}
      </Stack>

      <Drawer title="Select Customer" showCloseButton open={open} onClose={closeDrawer} size="md">
        <DialogContent>
          <PosSelectCustomerContent onChange={handleCustomerChange} closeDrawer={closeDrawer} drawerOpen={open} />
        </DialogContent>
      </Drawer>
    </React.Fragment>
  );
};
