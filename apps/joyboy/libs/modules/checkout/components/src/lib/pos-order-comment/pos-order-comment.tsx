'use client';
import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { Card, Typography, Textarea, textareaClasses } from '@castlery/fortress';
import { useAppSelector } from '@castlery/shared-redux-store';
import { useDebounce } from 'react-use';

export interface PosOrderCommentProps {
  name: string;
  onChange: (value: string) => void;
}
export function PosOrderComment({ name, onChange }: PosOrderCommentProps) {
  const [inputValue, setInputValue] = useState<string>('');
  const order = useAppSelector((state) => state.order.order);
  const defaultComment = useMemo(() => order?.special_instructions || '', [order]);
  const handler = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      let value = e.target.value;
      if (value.length > 200) {
        value = value.slice(0, 200);
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
    <Card>
      <Typography level="subh1">Order comment</Typography>
      <Textarea
        name={name}
        value={inputValue}
        placeholder="Add comments"
        minRows={1}
        maxRows={3}
        onChange={handler}
        sx={{
          color: (theme) => theme.palette.text.primary,
          [`&>.${textareaClasses.textarea}`]: {
            color: (theme) => theme.palette.text.primary,
          },
        }}
      />
    </Card>
  );
}

export default PosOrderComment;
