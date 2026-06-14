import { OptionValue } from '@castlery/modules-product-domain';
import { ListItem, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { IconButton, ListDivider, ListItemContent, Radio, RadioGroup, Sheet } from '@castlery/fortress';
import { Add, Remove } from '@castlery/fortress/Icons';

export enum ButtonItemOption {
  Button = 'Button',
  Image = 'Image',
  Quantity = 'Quantity',
  DateRange = 'DateRange',
}

export enum calcActionType {
  Add = 'Add',
  Remove = 'Remove',
}

export type OptionSelectChangeValueType = {
  id?: number;
  calcAction?: calcActionType;
};

/* eslint-disable-next-line */
export interface ProductOptionsLineProps {
  selectedId?: number;
  displayType?: ButtonItemOption;
  id?: number;
  name?: string;
  presentation: string;
  values?: OptionValue[];
  quantity?: number;
  hasFetching?: boolean;
  dateRangeStr?: string;
  onOptionSelectChange?: (value: OptionSelectChangeValueType) => void;
}

export function ProductOptionsLine(props: ProductOptionsLineProps) {
  const { presentation, displayType, values, quantity, selectedId, onOptionSelectChange, dateRangeStr = '' } = props;
  const { desktop } = useBreakpoints();
  const handleBtnClick = (value: OptionSelectChangeValueType) => {
    if (onOptionSelectChange) {
      if (displayType === ButtonItemOption.Button && value?.id) {
        onOptionSelectChange({ id: value.id });
      }
      if (displayType === ButtonItemOption.Quantity && value?.calcAction) {
        onOptionSelectChange({ calcAction: value.calcAction });
      }
    }
  };
  return (
    <>
      <ListItem
        sx={{
          paddingX: 3,
        }}
      >
        <ListItemContent
          sx={[
            {
              minWidth: desktop ? 150 : 200,
              textWrap: 'nowrap',
              color: (theme) => theme.palette.brand.charcoal[800],
              marginRight: 3,
              width: 'fit-content',
              flex: '0',
            },
          ]}
        >
          {presentation}
        </ListItemContent>
        {displayType === ButtonItemOption.Button && (
          <RadioGroup
            orientation="horizontal"
            sx={[
              {
                gap: 1,
                flexWrap: 'wrap',
                flexDirection: 'row',
                alignItems: 'center',
                paddingY: 1,
              },
            ]}
          >
            {values &&
              values.length > 0 &&
              values.map((item) => {
                const hadSelected = selectedId === item.id;
                return (
                  <Sheet
                    key={item.id}
                    sx={(theme) => ({
                      height: 40,
                      paddingX: 2,
                      paddingY: 1,
                      borderRadius: 0,
                      span: {
                        borderColor: (theme) =>
                          hadSelected
                            ? `${theme.palette.brand.terracotta[700]} !important`
                            : theme.palette.brand.charcoal[300],
                      },
                      label: {
                        color: (theme) =>
                          hadSelected
                            ? `${theme.palette.brand.terracotta[700]} !important`
                            : theme.palette.brand.charcoal[800],
                      },
                    })}
                  >
                    <Radio
                      overlay
                      disableIcon
                      onClick={() => handleBtnClick({ id: item.id })}
                      value={item.presentation}
                      label={item.presentation}
                    />
                  </Sheet>
                );
              })}
          </RadioGroup>
        )}
        {displayType === ButtonItemOption.Quantity && (
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              mt: -1,
            }}
          >
            <IconButton
              sx={[
                {
                  boxSizing: 'border-box',
                  border: (theme) => `1px ${theme.palette.brand.wheat[500]} solid`,
                  width: 24,
                  height: 24,
                  minWidth: 0,
                  minHeight: 0,
                  marginRight: 1,
                  marginLeft: 1,
                },
              ]}
              onClick={() => handleBtnClick({ calcAction: calcActionType.Remove })}
            >
              <Remove
                sx={[
                  {
                    color: (theme) => theme.palette.brand.wheat[500],
                  },
                ]}
              />
            </IconButton>
            <Typography
              sx={[
                {
                  width: 48,
                  height: 40,
                  textAlign: 'center',
                  lineHeight: '40px',
                  fontSize: 18,
                  color: (theme) => theme.palette.brand.charcoal[800],
                },
              ]}
            >
              {quantity}
            </Typography>
            <IconButton
              sx={[
                {
                  border: (theme) => `1px ${theme.palette.brand.wheat[500]} solid`,
                  width: 24,
                  height: 24,
                  minWidth: 0,
                  minHeight: 0,
                  marginLeft: 1,
                },
              ]}
              onClick={() => handleBtnClick({ calcAction: calcActionType.Add })}
            >
              <Add
                sx={[
                  {
                    color: (theme) => theme.palette.brand.wheat[500],
                  },
                ]}
              />
            </IconButton>
          </Stack>
        )}
        {displayType === ButtonItemOption.DateRange && (
          <Typography
            sx={{
              marginLeft: 1,
              paddingY: 1,
            }}
          >
            {dateRangeStr}
          </Typography>
        )}
      </ListItem>
      <ListDivider />
    </>
  );
}

export default ProductOptionsLine;
