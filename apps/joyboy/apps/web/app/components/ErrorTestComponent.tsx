'use client';
import React, { useState } from 'react';
import { Button, Stack, Typography } from '@castlery/fortress';

export default function ErrorTestComponent() {
  const [shouldThrowError, setShouldThrowError] = useState(false);

  if (shouldThrowError) {
    // 故意抛出一个错误来测试错误边界
    throw new Error('这是一个测试错误，用于验证全局错误边界是否正常工作！');
  }

  return (
    <Stack spacing={2} sx={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <Typography level="h3">错误测试组件</Typography>
      <Typography level="body1">点击下面的按钮来触发一个错误，测试全局错误边界是否正常工作。</Typography>
      <Button onClick={() => setShouldThrowError(true)} variant="outlined" color="danger">
        触发错误
      </Button>
    </Stack>
  );
}
