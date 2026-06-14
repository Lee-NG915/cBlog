'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Tabs, TabList, Tab, TabPanel, Button, IconButton, Typography, tabClasses } from '@castlery/fortress';
import { Delete } from '@castlery/fortress/Icons';
import { AdjustmentType } from '@castlery/modules-order-domain';
import { KeyBoards, CalculatorKeyBoards } from '../calculator-key-boards/calculator-key-boards';
import { useAsyncFn } from 'react-use';
import { formatPercent } from './helper';
import { EcEnv } from '@castlery/config';

const currencySymbol = EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL;

export const Type = AdjustmentType;
export enum SubType {
  'deduction' = 'deduction',
  'finalPrice' = 'finalPrice',
}
export interface CalculatorFnParams {
  type: keyof typeof AdjustmentType;
  subType: keyof typeof SubType;
  discount: number;
}
export type SetDiscountFunction = (type: keyof typeof AdjustmentType, discount: number) => Promise<void>;

export interface PosDiscountCalculatorProps {
  total: number;
  defaultDiscountOrigin: number;
  setDiscount: SetDiscountFunction;
  afterSetDiscount?: () => void;
}
export function PosDiscountCalculator({
  total,
  defaultDiscountOrigin,
  setDiscount,
  afterSetDiscount,
}: PosDiscountCalculatorProps) {
  const types = Object.keys(AdjustmentType).map((key) => ({
    key,
    value: key === AdjustmentType.fixed_amount ? currencySymbol : '%',
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
    if (types[typeIndex].key === AdjustmentType.fixed_amount) {
      discount = subTypes[subTypeIndex].key === SubType.deduction ? fixedAmount : finalAmount;
    }
    if (types[typeIndex].key === AdjustmentType.percentage) {
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
    return setDiscount(types[typeIndex].key as keyof typeof Type, 0).then(() => {
      afterSetDiscount && afterSetDiscount();
    });
  }, [setDiscount, typeIndex, types, afterSetDiscount]);

  /**
   * @description confirmHandler : triggered when confirm button is clicked
   */
  const [discountState, confirmHandler] = useAsyncFn(async () => {
    let number = inputDiscount ? Number(inputDiscount) : 0;
    if (!number || typeof setDiscount !== 'function') return Promise.resolve();
    if (types[typeIndex].key === AdjustmentType.fixed_amount && subTypes[subTypeIndex].key === SubType.finalPrice) {
      number = total - number;
    }
    return setDiscount(types[typeIndex].key as keyof typeof Type, number).then(() => {
      afterSetDiscount && afterSetDiscount();
    });
  }, [setDiscount, typeIndex, types, inputDiscount, subTypes, subTypeIndex]);

  const setValue = useCallback(
    (value: string) => {
      setHasManual(true);
      if (types[typeIndex].key === AdjustmentType.fixed_amount) {
        if (subTypeIndex === 0) {
          setFixedAmount(value);
          setFinalAmount((total - Number(value)).toString());
        } else {
          setFinalAmount(value);
          setFixedAmount((total - Number(value)).toString());
        }
      }
      if (types[typeIndex].key === AdjustmentType.percentage) {
        setPercentAmount(value);
      }
    },
    [setFixedAmount, setFinalAmount, setPercentAmount, typeIndex, subTypeIndex, types, total]
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
    (event: React.ChangeEvent<any>, newValue: number) => {
      setTypeIndex(newValue);
      setPercentAmount(() => (hasManual ? '0' : formatPercent((defaultDiscount / total) * -1 * 100)));
    },
    [setTypeIndex, setPercentAmount, total, hasManual, defaultDiscount]
  );
  /**
   * @description handleSubTypeChange
   */
  const handleSubTypeChange = useCallback(
    (event: React.ChangeEvent<any>, newValue: number) => {
      setSubTypeIndex(newValue);
      if (newValue === 1) {
        const num = total - Number(fixedAmount);
        setFinalAmount(num.toString());
      }
    },
    [setSubTypeIndex, setFinalAmount, total, fixedAmount]
  );

  useEffect(() => {
    if (defaultDiscount) {
      setFinalAmount((total + defaultDiscount).toString());
      setFixedAmount(() => {
        return (defaultDiscount * -1).toString();
      });
    }
  }, [defaultDiscount, setFinalAmount, setFixedAmount, total]);

  return (
    <Box
      sx={{
        width: 278,
        boxShadow: `0 2px 4px rgba(0,0,0,.15)`,
      }}
    >
      <Tabs value={typeIndex} sx={{ bgcolor: 'transparent' }} onChange={handleTypeChange}>
        <TabList
          disableUnderline={true}
          tabFlex={6}
          sx={{
            height: 42,
            bgcolor: 'white',
            [`& .${tabClasses.root}`]: {
              color: (theme) => theme.palette.brand.charcoal[800],
              borderBottom: (theme) => `1px solid ${theme.palette.brand.charcoal[200]}`,
            },
            [`& .${tabClasses.root}[aria-selected="true"]`]: {
              bgcolor: (theme) => theme.palette.brand.terracotta[500],
              color: 'white',
              border: 'none',
            },
          }}
        >
          {types?.map((item) => (
            <Tab key={item.key}>{item.value}</Tab>
          ))}
        </TabList>
        {types?.map((item, index) => (
          <TabPanel value={index} sx={{ padding: 0 }} key={`tab_panel_${item.key}`}>
            {item.key === AdjustmentType.fixed_amount && (
              <Tabs
                variant="plain"
                key={`sub_tab_${AdjustmentType.fixed_amount}`}
                value={subTypeIndex}
                onChange={handleSubTypeChange}
              >
                <TabList
                  tabFlex={6}
                  sx={{
                    height: 42,
                    [`& .${tabClasses.root}`]: {
                      color: (theme) => theme.palette.brand.charcoal[800],
                      fontWeight: 'lg',
                    },
                  }}
                >
                  {subTypes?.map((subItem) => (
                    <Tab key={`sub_tab_${subItem.key}`}>{subItem.value}</Tab>
                  ))}
                </TabList>
              </Tabs>
            )}
            <Typography sx={{ paddingX: 2, paddingY: 0.5, textAlign: 'center', fontSize: '45px', lineHeight: 1.5 }}>
              {types[typeIndex].key === AdjustmentType.percentage
                ? inputDiscount + '%'
                : currencySymbol + inputDiscount}
            </Typography>
            <CalculatorKeyBoards onChange={keyBoardChange} />
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <IconButton
                sx={{ width: 52, height: 52, flex: 'none' }}
                loading={deleteState.loading}
                onClick={deleteHandler}
              >
                <Delete color="danger" />
              </IconButton>
              <Button sx={{ flex: 1, height: 52 }} loading={discountState.loading} onClick={confirmHandler}>
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
