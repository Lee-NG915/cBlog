import { EcEnv } from '@castlery/config';
import {
  Dropdown,
  Link,
  ListItemDecorator,
  Sheet,
  SxProps,
  optionClasses,
  selectClasses,
  useBreakpoints,
} from '@castlery/fortress';
import { AUFlag, CAFlag, ExpandMore, SGFlag, UKFlag, USFlag } from '@castlery/fortress/Icons';
import React from 'react';
// import { Dropdown, ListItemDecorator, Sheet, SxProps, optionClasses, selectClasses } from 'fortress';
// import { AUFlag, ExpandMore, SGFlag, USFlag } from 'fortress/Icons';

export type CountrySelectorProps = {
  mode?: 'base' | 'simple';
  showIcon?: boolean;
  sx?: SxProps;
  size?: 'sm' | 'md';
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>, value: string) => void;
  defaultValue?: '/sg' | '/us' | '/au' | '/ca' | '/uk' | '/';
  countries: { route: string; name: string; [key: string]: any; code: string }[];
  inFooter?: boolean;
};
export default function CountrySelector({
  mode = 'base',
  sx = [],
  showIcon = true,
  defaultValue,
  countries,
  onClick = () => {},
  inFooter = false,
  ...props
}: CountrySelectorProps) {
  const countriesOptions = React.useRef(
    countries.map((item) => {
      let iconCom;
      switch (item.route) {
        case '/sg':
          iconCom = <SGFlag />;
          break;
        case '/us':
          iconCom = <USFlag />;
          break;
        case '/au':
          iconCom = <AUFlag />;
          break;
        case '/ca':
          iconCom = <CAFlag />;
          break;
        case '/uk':
          iconCom = <UKFlag />;
          break;
        default:
      }

      return {
        ...item,
        iconCom,
      };
    })
  );
  const renderFlag = (route: string) => {
    switch (route) {
      case '/sg':
        return <SGFlag />;
      case '/us':
        return <USFlag />;
      case '/au':
        return <AUFlag />;
      case '/ca':
        return <CAFlag />;
      case '/uk':
        return <UKFlag />;
      default:
        return null;
    }
  };
  const defaultLabel = countries.find(({ route }) => route === defaultValue)?.name;
  const { desktop, mobile, tablet } = useBreakpoints();
  return (
    <Sheet
      sx={(theme) => ({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        bgcolor: 'transparent',
        padding: mobile ? '0 !important' : '8px 12px 10px 8px !important',
        div: {
          color: (theme) => (desktop ? `${theme.palette.brand.wheat[800]} !important` : 'inherit'),
          borderBottom: 'none !important',
          padding: '0 !important',
          marginLeft: '4px',
          '&:hover': {
            borderBottom: 'none !important',
          },
          '&:active': {
            borderBottom: 'none !important',
          },
          button: {
            color: (theme) =>
              mobile || tablet ? theme.palette.brand.warmLinen[500] : theme.palette.brand.maroonVelvet[500],
          },
        },
        svg: {
          fill: desktop ? '#3C101E !important' : '#fff !important',
          '&:hover': {
            fill: desktop ? '#3C101E !important' : '#fff !important',
          },
          '&:active': {
            fill: desktop ? '#3C101E !important' : '#fff !important',
          },
        },
        [`& .${selectClasses.listbox}`]: {
          borderColor: theme.palette.brand.charcoal[300],
        },
        ...(props?.size === 'sm' && {
          // TODO why optionClasses not effect the Dropdown.Option
          [`& .${optionClasses.root}, .${selectClasses.root}`]: {
            ...theme.typography.caption2,
            color: null,
          },
        }),
        width: 'fit-content',
      })}
    >
      {/* {inFooter && renderFlag(defaultValue || '')} */}
      <Dropdown
        defaultValue={defaultValue}
        aria-label="Country Selector"
        placeholder={defaultLabel}
        name="country selector"
        indicator={mode === 'simple' ? '' : <ExpandMore fontSize="md" />}
        renderValue={(options) => {
          if (mode === 'simple') {
            return countriesOptions.current.find((item) => item.route === options?.value)?.iconCom;
          }
          return options?.label || defaultLabel;
        }}
        size={props?.size}
        getSerializedValue={(ref) => {
          const value = ref?.value || defaultLabel;
          return value;
        }}
        sx={[
          {
            marginLeft: '4px',
            width: 'fit-content',
            padding: '0 !important',
          },
          {
            color: (theme) => theme.palette.brand.wheat[700],
          },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {countriesOptions.current.map(({ name, route, iconCom }, index) => (
          <Dropdown.Option
            key={index}
            value={route}
            label={name}
            sx={(theme) => ({
              paddingLeft: theme.spacing(4),
              paddingRight: theme.spacing(4),
              ...(showIcon && {
                display: 'flex',
                justifyContent: 'flex-start',
              }),

              ...(mode === 'simple' && {
                color: theme.palette.brand.maroonVelvet[500],
              }),
              ...(props?.size === 'sm' && {
                ...theme.typography.caption2,
                color: null,
              }),
            })}
          >
            {/* TODO style outline */}
            {showIcon ? <ListItemDecorator>{iconCom}</ListItemDecorator> : null}
            {/* TODO if component has RouterLink may be it's not a UI component  */}
            <Link
              href={route}
              onClick={(event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => onClick(event, route)}
              target="_self"
              sx={{
                width: '100% !important',
                textAlign: 'center !important',
                all: 'unset',
                color:
                  route.indexOf(EcEnv.NEXT_PUBLIC_COUNTRY.toLocaleLowerCase()) > -1 ? '#844025 !important' : 'inherit',
              }}
            >
              {name}
            </Link>
          </Dropdown.Option>
        ))}
      </Dropdown>
    </Sheet>
  );
}
