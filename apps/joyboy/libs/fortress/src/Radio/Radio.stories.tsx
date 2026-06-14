import { Radio } from '.';
import type { RadioProps } from '.';
import type { Meta, StoryObj } from '@storybook/react';
import { Box, Button, FormControl, FormLabel, Typography, CircularProgress } from '@mui/joy';
import RadioGroup from '@mui/joy/RadioGroup';
import React from 'react';
import { Favorite } from '../Icons';
import { RadioIcon } from './RadioIcon';

const meta: Meta<RadioProps> = {
  title: 'Components/Radio',
  component: Radio,
};
export default meta;

type Story = StoryObj<RadioProps>;

export const Basics: Story = {
  args: {
    label: 'Label',
  },
  parameters: {},

  render: ({ ...args }) => (
    <FormControl>
      <RadioGroup defaultValue="medium" name="radio-buttons-group">
        <Radio value="1" {...args} />
        <Radio value="2" {...args} />
      </RadioGroup>
    </FormControl>
  ),
};

const buttonStyles = {
  width: '200px',
  height: '32px',
  borderWidth: '1px',
  '&:hover': {
    borderWidth: '1px',
  },
} as const;

const ButtonRadioGroup = () => {
  const [selectedValue, setSelectedValue] = React.useState('1');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl>
        <FormLabel>尺寸: sm</FormLabel>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="sm"
            variant={selectedValue === '1' ? 'solid' : 'outlined'}
            color="primary"
            onClick={() => setSelectedValue('1')}
            sx={buttonStyles}
          >
            Button 1
          </Button>
          <Button
            size="sm"
            variant={selectedValue === '2' ? 'solid' : 'outlined'}
            color="primary"
            onClick={() => setSelectedValue('2')}
            sx={buttonStyles}
          >
            Button 2
          </Button>
        </Box>
      </FormControl>
    </Box>
  );
};

export const ButtonStyleRadio: Story = {
  render: () => <ButtonRadioGroup />,
};

const IconRadioGroup = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <FormControl>
        <FormLabel>Icon Radio</FormLabel>
        <RadioGroup defaultValue="1" name="icon-radio-group" orientation="horizontal">
          <Box sx={{ display: 'flex', gap: 2 }}>
            <RadioIcon value="1" variant="outlined" overlay uncheckedIcon={<Favorite />} checkedIcon={<Favorite />} />
            <RadioIcon value="2" variant="outlined" overlay uncheckedIcon={<Favorite />} checkedIcon={<Favorite />} />
            <RadioIcon
              value="3"
              variant="outlined"
              overlay
              uncheckedIcon={<Favorite />}
              checkedIcon={<Favorite />}
              disabled
            />
          </Box>
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export const IconStyleRadio: Story = {
  name: 'Icon Radio',
  parameters: {
    docs: {
      description: {
        story: '使用图标作为选择指示器的单选按钮组。',
      },
    },
  },
  render: () => <IconRadioGroup />,
};

const ControlledIconRadioGroup = () => {
  const [selectedValue, setSelectedValue] = React.useState('1');
  const [loading, setLoading] = React.useState<string | null>(null);
  const [lastAction, setLastAction] = React.useState<string>('');

  const handleRadioClick = async (value: string) => {
    if (loading) return; // 防止重复点击

    setLoading(value);
    setLastAction(`正在处理选项 ${value}...`);

    try {
      // 模拟异步处理（比如 API 调用）
      await new Promise((resolve) => setTimeout(resolve, 150000));

      // 模拟可能的失败情况
      if (Math.random() < 0.5) {
        throw new Error('处理失败');
      }

      // 只有在异步处理成功后才更新状态
      setSelectedValue(value);
      setLastAction(`成功选择选项 ${value}`);
    } catch (error) {
      setLastAction(`选择选项 ${value} 失败，保持原状态`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormControl>
        <FormLabel>受控 Icon Radio - 异步处理演示</FormLabel>
        <Typography fontSize="sm" sx={{ mb: 2, color: 'text.secondary' }}>
          点击选项会触发异步处理，只有处理成功后才会更新选中状态
        </Typography>

        {/* 状态显示 */}
        <Box sx={{ mb: 2, minHeight: '1.5em' }}>
          <Typography fontSize="sm" color={lastAction.includes('失败') ? 'danger' : 'success'}>
            {lastAction}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {['1', '2', '3'].map((value) => (
            <Box key={value} sx={{ position: 'relative' }}>
              <RadioIcon
                value={value}
                checked={selectedValue === value}
                variant="outlined"
                overlay
                uncheckedIcon={<Favorite />}
                checkedIcon={<Favorite />}
                disabled={loading !== null}
                onClick={() => handleRadioClick(value)}
              />

              {/* 加载指示器 */}
              {loading === value && (
                <CircularProgress
                  size="sm"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        <Typography fontSize="xs" sx={{ mt: 2, color: 'text.tertiary' }}>
          当前选中: {selectedValue} |{loading ? ` 正在处理: ${loading}` : ' 空闲状态'} | 约20%概率处理失败
        </Typography>
      </FormControl>

      {/* 重置按钮 */}
      <Button
        size="sm"
        variant="outlined"
        onClick={() => {
          setSelectedValue('1');
          setLastAction('状态已重置');
        }}
        disabled={loading !== null}
        sx={{ alignSelf: 'flex-start' }}
      >
        重置状态
      </Button>
    </Box>
  );
};

export const ControlledIconRadio: Story = {
  name: 'Controlled Icon Radio',
  parameters: {
    docs: {
      description: {
        story:
          '演示受控的 Icon Radio 组件。点击后会触发异步处理，只有处理成功后才会更新选中状态。这对于需要后端验证或API调用的场景很有用。',
      },
      source: {
        type: 'code',
        code: `const ControlledIconRadioGroup = () => {
  const [selectedValue, setSelectedValue] = React.useState('1');
  const [loading, setLoading] = React.useState<string | null>(null);
  const [lastAction, setLastAction] = React.useState<string>('');

  const handleRadioClick = async (value: string) => {
    if (loading) return; // 防止重复点击

    setLoading(value);
    setLastAction(\`正在处理选项 \${value}...\`);

    try {
      // 模拟异步处理（比如 API 调用）
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 模拟可能的失败情况
      if (Math.random() < 0.5) {
        throw new Error('处理失败');
      }

      // 只有在异步处理成功后才更新状态
      setSelectedValue(value);
      setLastAction(\`成功选择选项 \${value}\`);
    } catch (error) {
      setLastAction(\`选择选项 \${value} 失败，保持原状态\`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <FormControl>
        <FormLabel>受控 Icon Radio - 异步处理演示</FormLabel>
        <Typography fontSize="sm" sx={{ mb: 2, color: 'text.secondary' }}>
          点击选项会触发异步处理，只有处理成功后才会更新选中状态
        </Typography>

        {/* 状态显示 */}
        <Box sx={{ mb: 2, minHeight: '1.5em' }}>
          <Typography fontSize="sm" color={lastAction.includes('失败') ? 'danger' : 'success'}>
            {lastAction}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {['1', '2', '3'].map((value) => (
            <Box key={value} sx={{ position: 'relative' }}>
              <RadioIcon
                value={value}
                checked={selectedValue === value}
                variant="outlined"
                overlay
                uncheckedIcon={<Favorite />}
                checkedIcon={<FavoriteFilled />}
                disabled={loading !== null}
                onClick={() => handleRadioClick(value)}
              />

              {/* 加载指示器 */}
              {loading === value && (
                <CircularProgress
                  size="sm"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10,
                  }}
                />
              )}
            </Box>
          ))}
        </Box>

        <Typography fontSize="xs" sx={{ mt: 2, color: 'text.tertiary' }}>
          当前选中: {selectedValue} |{loading ? \` 正在处理: \${loading}\` : ' 空闲状态'} | 约20%概率处理失败
        </Typography>
      </FormControl>

      {/* 重置按钮 */}
      <Button
        size="sm"
        variant="outlined"
        onClick={() => {
          setSelectedValue('1');
          setLastAction('状态已重置');
        }}
        disabled={loading !== null}
        sx={{ alignSelf: 'flex-start' }}
      >
        重置状态
      </Button>
    </Box>
  );
};`,
        language: 'tsx',
      },
    },
  },
  render: () => <ControlledIconRadioGroup />,
};
