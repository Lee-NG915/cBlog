'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Button,
  IconButton,
  Typography,
  tabClasses,
  Divider,
} from '@castlery/fortress';
import { Delete } from '@castlery/fortress/Icons';
import { KeyBoards, CalculatorKeyBoards } from '../calculator-key-boards/calculator-key-boards';
import { useAsyncFn } from 'react-use';
import { formatPercent } from './helper';
import { EcEnv } from '@castlery/config';
import { AdjustmentType_V2 } from '@castlery/types';

const currencySymbol = EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL;

export enum ManualSetDiscountType {
  'fixed_amount' = AdjustmentType_V2.fixed_amount,
  'percentage' = AdjustmentType_V2.percentage,
}

export enum SubType {
  'deduction' = 'deduction',
  'finalPrice' = 'finalPrice',
}
export interface CalculatorFnParams {
  type: keyof typeof ManualSetDiscountType;
  subType: keyof typeof SubType;
  discount: number;
}
export type SetDiscountFunction = (type: keyof typeof ManualSetDiscountType, discount: number) => Promise<void>;

export interface PosDiscountCalculatorProps {
  defaultDiscountOrigin: number;
  originalPriceTotal: number;
  setDiscount: SetDiscountFunction;
  afterSetDiscount?: () => void;
}
export function PosDiscountCalculator({
  defaultDiscountOrigin,
  originalPriceTotal,
  setDiscount,
  afterSetDiscount,
}: PosDiscountCalculatorProps) {
  const types = Object.keys(ManualSetDiscountType).map((key) => ({
    key,
    value: key === ManualSetDiscountType.fixed_amount ? currencySymbol : '%',
  }));
  const subTypes = Object.keys(SubType).map((key) => ({
    key,
    value: key === SubType.finalPrice ? 'Final Price' : 'Deduction',
  }));
  const [typeIndex, setTypeIndex] = useState<number>(0);
  const [subTypeIndex, setSubTypeIndex] = useState<number>(0);
  const [hasManual, setHasManual] = useState<boolean>(false);
  const defaultDiscount = defaultDiscountOrigin || 0;

  const [fixedAmount, setFixedAmount] = useState<string>('0');
  const [percentAmount, setPercentAmount] = useState<string>('0');
  const [finalAmount, setFinalAmount] = useState<string>('0');

  const inputDiscount = useMemo(() => {
    let discount = '';
    if (types[typeIndex].key === ManualSetDiscountType.fixed_amount) {
      discount = subTypes[subTypeIndex].key === SubType.deduction ? fixedAmount : finalAmount;
    }
    if (types[typeIndex].key === ManualSetDiscountType.percentage) {
      discount = percentAmount;
    }
    return discount;
  }, [fixedAmount, finalAmount, percentAmount, typeIndex, subTypeIndex, types, subTypes]);

  const confirmButtonText = useMemo(
    () => (!!typeIndex || !subTypeIndex ? 'Set Discount' : 'Set Final Price'),
    [typeIndex, subTypeIndex]
  );
  /**
   * @description reset : triggered when delete button is clicked
   */
  const [deleteState, deleteHandler] = useAsyncFn(async () => {
    if (typeof setDiscount !== 'function') return Promise.resolve();
    return setDiscount(types[typeIndex].key as keyof typeof ManualSetDiscountType, 0).then(() => {
      afterSetDiscount && afterSetDiscount();
    });
  }, [setDiscount, typeIndex, types, afterSetDiscount]);

  /**
   * @description confirmHandler : triggered when confirm button is clicked
   */
  const [discountState, confirmHandler] = useAsyncFn(async () => {
    let number = inputDiscount ? Number(inputDiscount) : 0;
    if (!number || typeof setDiscount !== 'function') return Promise.resolve();
    if (
      types[typeIndex].key === ManualSetDiscountType.fixed_amount &&
      subTypes[subTypeIndex].key === SubType.finalPrice
    ) {
      number = originalPriceTotal - number;
    }
    return setDiscount(types[typeIndex].key as keyof typeof ManualSetDiscountType, number).then(() => {
      afterSetDiscount && afterSetDiscount();
    });
  }, [setDiscount, typeIndex, types, inputDiscount, subTypes, subTypeIndex]);

  const setValue = useCallback(
    (value: string) => {
      setHasManual(true);
      if (types[typeIndex].key === ManualSetDiscountType.fixed_amount) {
        if (subTypeIndex === 0) {
          setFixedAmount(value);
          setFinalAmount((originalPriceTotal - Number(value)).toString());
        } else {
          setFinalAmount(value);
          setFixedAmount((originalPriceTotal - Number(value)).toString());
        }
      }
      if (types[typeIndex].key === ManualSetDiscountType.percentage) {
        setPercentAmount(value);
      }
    },
    [setFixedAmount, setFinalAmount, setPercentAmount, typeIndex, subTypeIndex, types, originalPriceTotal]
  );

  const keyBoardChange = (key: keyof typeof KeyBoards) => {
    const letter = KeyBoards[key];
    const keyValue = KeyBoards[key];
    let str = inputDiscount;
    if (!hasManual) {
      setValue(letter);
      return;
    }
    if (keyValue === KeyBoards.key_dot) {
      str = str.includes('.') ? str : str ? str + '.' : '0.';
      setValue(str);
      return;
    }
    if (keyValue === KeyBoards.key_reset) {
      str = str?.substring(0, str.length - 1);
      setValue(str);
      return;
    }
    str += letter;
    if (str.length === 2 && str.startsWith('0') && !str.startsWith('0.')) {
      str = str.substring(1);
    }
    setValue(str);
  };

  /**
   * @description handleTypeChange
   */
  const handleTypeChange = useCallback(
    (_event: React.SyntheticEvent | null, newValue: string | number | null) => {
      if (typeof newValue !== 'number') return;
      setTypeIndex(newValue);
      setPercentAmount(() => (hasManual ? '0' : formatPercent((defaultDiscount / originalPriceTotal) * 100)));
    },
    [setTypeIndex, setPercentAmount, originalPriceTotal, hasManual, defaultDiscount]
  );
  /**
   * @description handleSubTypeChange
   */
  const handleSubTypeChange = useCallback(
    (_event: React.SyntheticEvent | null, newValue: string | number | null) => {
      if (typeof newValue !== 'number') return;
      setSubTypeIndex(newValue);
      if (newValue === 1) {
        const num = originalPriceTotal - Number(fixedAmount);
        setFinalAmount(num.toString());
      }
    },
    [setSubTypeIndex, setFinalAmount, originalPriceTotal, fixedAmount]
  );

  useEffect(() => {
    if (defaultDiscount) {
      setFinalAmount((originalPriceTotal + defaultDiscount).toString());
      setFixedAmount(() => {
        return defaultDiscount.toString();
      });
    }
  }, [defaultDiscount, setFinalAmount, setFixedAmount, originalPriceTotal]);

  const confirmDisabled = useMemo(() => {
    if (types[typeIndex].key === ManualSetDiscountType.fixed_amount) {
      if (subTypes[subTypeIndex].key === SubType.finalPrice) {
        return Number(inputDiscount) > originalPriceTotal;
      }
      if (subTypes[subTypeIndex].key === SubType.deduction) {
        return Number(inputDiscount) > originalPriceTotal || Number(inputDiscount) <= 0;
      }
    }
    if (types[typeIndex].key === ManualSetDiscountType.percentage) {
      return Number(inputDiscount) > 100 || Number(inputDiscount) <= 0;
    }
    return false;
  }, [types, typeIndex, subTypes, subTypeIndex, inputDiscount, originalPriceTotal]);

  return (
    <Box
      sx={{
        width: 282,
        overflow: 'hidden',
        boxShadow: '0 12px 24px rgba(31, 22, 15, 0.18)',
        border: 'solid 1px var(--fortress-palette-brand-mono-300)',
      }}
    >
      <Tabs
        value={typeIndex}
        onChange={handleTypeChange}
        sx={{
          borderRadius: 'unset',
          border: 'unset',
        }}
      >
        <TabList
          disableUnderline={true}
          tabFlex={6}
          sx={{
            height: 38,
            border: 'unset',
            borderBottom: 'solid 1px var(--fortress-palette-brand-mono-300)',
            [`& .${tabClasses.root}`]: {
              borderRadius: 'unset',
              '&::after': {
                // backgroundColor: 'var(--fortress-palette-brand-mono-300)',
                content: '""',
                height: 0,
              },
            },
            [`& .${tabClasses.root}[aria-selected="true"]`]: {
              backgroundColor: 'var(--fortress-palette-brand-terracotta-500)',
              color: 'var(--fortress-palette-brand-mono-50)',
            },
            [`& .${tabClasses.root}:not(.Mui-selected, [aria-selected="true"]):hover`]: {
              backgroundColor: 'transparent',
              color: 'var(--fortress-palette-brand-maroonVelvet-500)',
            },
            // [`& .${tabClasses.root}:nth-of-type(2)`]: {
            //   borderLeft: 'solid 1px var(--fortress-palette-brand-mono-300)',
            // },
          }}
        >
          {types?.map((item, index) => (
            <>
              <Tab key={item.key}>{item.value}</Tab>
              {index < 1 && (
                <Divider
                  sx={{ height: '100%', width: '1px', backgroundColor: 'var(--fortress-palette-brand-mono-300)' }}
                />
              )}
            </>
          ))}
        </TabList>
        {types?.map((item, index) => (
          <TabPanel value={index} sx={{ padding: 0, border: 'unset' }} key={`tab_panel_${item.key}`}>
            {item.key === ManualSetDiscountType.fixed_amount && (
              <Tabs
                variant="plain"
                key={`sub_tab_${ManualSetDiscountType.fixed_amount}`}
                value={subTypeIndex}
                onChange={handleSubTypeChange}
                sx={{ border: 'unset' }}
              >
                <TabList
                  disableUnderline={true}
                  tabFlex={6}
                  sx={{
                    height: 42,
                    border: 'unset',
                    borderRadius: 0,
                    borderBottom: 'solid 1px var(--fortress-palette-brand-mono-300)',
                    color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                    [`& .${tabClasses.root}`]: {
                      borderRadius: 'unset',
                      '&::after': {
                        content: '""',
                        height: 0,
                      },
                    },
                    [`& .${tabClasses.root}[aria-selected="true"]`]: {
                      backgroundColor: 'transparent',
                      color: 'var(--fortress-palette-brand-maroonVelvet-500)',
                      '&::after': {
                        height: '4px',
                        backgroundColor: 'var(--fortress-palette-brand-terracotta-500)',
                      },
                    },
                  }}
                >
                  {subTypes?.map((subItem, index) => (
                    <>
                      <Tab
                        key={`sub_tab_${subItem.key}`}
                        sx={{
                          borderRadius: 0,
                          textTransform: 'capitalize',
                          textAlign: 'center',
                          [`& .${tabClasses.root}`]: {
                            borderRadius: 'unset',
                            textTransform: 'capitalize',
                            textAlign: 'center',
                            '&::after': {
                              content: '""',
                              height: 0,
                            },
                          },
                        }}
                      >
                        <Typography level="body2">{subItem.value}</Typography>
                      </Tab>
                      {index < 1 && (
                        <Divider
                          sx={{
                            height: '100%',
                            width: '1px',
                            backgroundColor: 'var(--fortress-palette-brand-mono-300)',
                          }}
                        />
                      )}
                    </>
                  ))}
                </TabList>
              </Tabs>
            )}
            <Typography
              level="h2"
              sx={{
                width: '100%',
                whiteSpace: 'nowrap',
                height: '72px',
                textAlign: 'center',
                lineHeight: '72px',
              }}
            >
              {types[typeIndex].key === ManualSetDiscountType.percentage
                ? inputDiscount + '%'
                : currencySymbol + inputDiscount}
            </Typography>
            <CalculatorKeyBoards onChange={keyBoardChange} />
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <IconButton
                sx={{
                  width: 94,
                  height: 56,
                  flex: 'none',
                  borderRadius: 0,
                  '&:hover': {},
                }}
                loading={deleteState.loading}
                onClick={deleteHandler}
              >
                <Delete sx={{ color: '#2E2A27', width: 18, height: 18 }} />
              </IconButton>
              <Button
                sx={{
                  '&:hover': {},
                  '&:disabled': {},
                }}
                loading={discountState.loading}
                disabled={confirmDisabled}
                onClick={confirmHandler}
              >
                {confirmButtonText}
              </Button>
            </Box>
          </TabPanel>
        ))}
      </Tabs>
    </Box>
  );
}

export default PosDiscountCalculator;
