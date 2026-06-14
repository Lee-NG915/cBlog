'use client';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Box, Typography, Textarea, textareaClasses } from '@castlery/fortress';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useDebounce } from 'react-use';

export interface PosOrderCommentV1Props {
  name: string;
  onChange: (value: string) => void;
}
export function PosOrderCommentV1({ name, onChange }: PosOrderCommentV1Props) {
  const [inputValue, setInputValue] = useState<string>('');
  const order = useAppSelector((state) => state.order.order);
  const defaultComment = useMemo(() => order?.special_instructions || '', [order]);
  const handler = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = e.target.value;
      if (value.length > 2000) {
        value = value.slice(0, 2000);
      }
      setInputValue(value);
    },
    [setInputValue]
  );

  useDebounce(
    () => {
      onChange(inputValue);
    },
    500,
    [inputValue, onChange]
  );

  useEffect(() => {
    setInputValue(defaultComment);
  }, [defaultComment, setInputValue]);

  return (
    <Box>
      <Typography level="h5">Order comment</Typography>
      <Textarea
        name={name}
        value={inputValue}
        placeholder="Add comments"
        minRows={1}
        maxRows={3}
        slotProps={{
          textarea: {
            maxLength: 2000,
          },
        }}
        onChange={handler}
        sx={{
          color: (theme) => theme.palette.text.primary,
        }}
      />
    </Box>
  );
}

export default PosOrderCommentV1;
