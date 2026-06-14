import { Box, Typography } from '@mui/joy';
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof ScrollTestComponent> = {
  title: 'Components/Scrollbar Test',
};

export default meta;

type Story = StoryObj<typeof ScrollTestComponent>;

const ScrollTestComponent = () => {
  // 生成简单的测试内容
  const verticalItems = Array.from({ length: 50 }, (_, i) => `垂直滚动项目 ${i + 1}`);
  const horizontalItems = Array.from({ length: 30 }, (_, i) => `水平滚动项目 ${i + 1}`);

  return (
    <Box sx={{ p: 3, height: '100vh' }}>
      <Typography level="h2" sx={{ mb: 3, textAlign: 'center' }}>
        滚动条样式测试
      </Typography>

      <Typography level="body1" sx={{ mb: 4, textAlign: 'center', color: 'text.secondary' }}>
        专注测试全局滚动条样式效果
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, height: 'calc(100vh - 200px)' }}>
        {/* 垂直滚动测试 */}
        <Box sx={{ flex: 1 }}>
          <Typography level="h3" sx={{ mb: 2 }}>
            垂直滚动测试
          </Typography>

          <Box
            sx={{
              height: '100%',
              border: '2px solid',
              borderColor: 'divider',
              borderRadius: 'md',
              overflow: 'auto',
              backgroundColor: 'background.surface',
              p: 2,
            }}
          >
            {verticalItems.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  mb: 1,
                  backgroundColor: index % 2 === 0 ? 'background.level1' : 'background.surface',
                  borderRadius: 'sm',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography level="body1">{item}</Typography>
                <Typography level="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  这是测试内容，用于产生足够的垂直滚动效果来观察滚动条样式
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* 水平滚动测试 */}
        <Box sx={{ flex: 1 }}>
          <Typography level="h3" sx={{ mb: 2 }}>
            水平滚动测试
          </Typography>

          <Box
            sx={{
              height: '100%',
              border: '2px solid',
              borderColor: 'divider',
              borderRadius: 'md',
              overflow: 'auto',
              backgroundColor: 'background.surface',
              p: 2,
            }}
          >
            {/* 需要水平滚动的宽内容 */}
            <Box sx={{ width: '2000px', height: '100%' }}>
              <Box sx={{ display: 'flex', gap: 2, height: '100%', flexDirection: 'column' }}>
                {horizontalItems.map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      minWidth: '1800px',
                      p: 2,
                      backgroundColor: index % 2 === 0 ? 'background.level1' : 'background.surface',
                      borderRadius: 'sm',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                    }}
                  >
                    <Typography level="body1" sx={{ minWidth: '200px' }}>
                      {item}
                    </Typography>
                    <Typography level="body2" sx={{ color: 'text.secondary' }}>
                      这是一行很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长很长的测试内容，用于产生水平滚动效果
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* 滚动条测试说明 */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.level1', borderRadius: 'md' }}>
        <Typography level="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
          观察要点：
        </Typography>
        <Typography level="body2">
          • 滚动条的颜色、宽度和圆角 • 鼠标悬停时的变化效果 • 不同方向滚动条的一致性
        </Typography>
      </Box>
    </Box>
  );
};

export const ScrollStyleTest: Story = {
  name: '滚动样式测试',
  parameters: {
    docs: {
      description: {
        story: `
        简洁的滚动条样式测试，包含：
        
        **垂直滚动区域**：长列表内容，测试垂直滚动条样式
        
        **水平滚动区域**：超宽内容，测试水平滚动条样式
        
        专注于观察滚动条的外观和交互效果。
        `,
      },
    },
    layout: 'fullscreen',
  },
  render: () => <ScrollTestComponent />,
};
