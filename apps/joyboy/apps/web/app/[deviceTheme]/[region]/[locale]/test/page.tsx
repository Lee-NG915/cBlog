'use client';

import {
  Stack,
  Typography,
  Box,
  Button,
  RadioGroup,
  Radio,
  RadioButton,
  AccordionGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@castlery/fortress';
import { useEffect, useState } from 'react';

interface FontSizeInfo {
  level: string;
  fontSize: string;
  computedSize: string;
}

export default function Test() {
  const [fontSizes, setFontSizes] = useState<FontSizeInfo[]>([]);
  const [radioValue, setRadioValue] = useState('option1');
  const [radioButtonValue, setRadioButtonValue] = useState('button1');

  useEffect(() => {
    // 获取所有 Typography 元素的计算字体大小
    const levels = ['h1', 'h2', 'h3', 'h4', 'h5', 'subh1', 'subh2', 'subh3', 'body1', 'body2', 'caption1', 'caption2'];
    const fontSizeData: FontSizeInfo[] = [];

    levels.forEach((level) => {
      const element = document.querySelector(`[data-testid="${level}"]`);
      if (element) {
        const computedStyle = window.getComputedStyle(element);
        const fontSize = computedStyle.fontSize;
        const fontSizePx = parseFloat(fontSize);
        const fontSizeRem = (fontSizePx / 16).toFixed(3); // 假设根字体大小是16px

        fontSizeData.push({
          level,
          fontSize: `${fontSizeRem}rem`,
          computedSize: `${fontSizePx}px`,
        });
      }
    });

    setFontSizes(fontSizeData);
  }, []);

  return (
    <Stack spacing={4} sx={{ padding: 4, maxWidth: '800px', margin: '0 auto' }}>
      <Typography level="h2" sx={{ textAlign: 'center', marginBottom: 2 }}>
        Typography Font Size Test
      </Typography>

      {['h1', 'h2', 'h3', 'h4', 'h5', 'subh1', 'subh2', 'subh3', 'body1', 'body2', 'caption1', 'caption2'].map(
        (level) => {
          const fontInfo = fontSizes.find((f) => f.level === level);
          return (
            <Box
              key={level}
              sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 2,
                padding: 1,
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                backgroundColor: '#fafafa',
              }}
            >
              <Typography level={level as any} data-testid={level} sx={{ minWidth: '200px' }}>
                {level}
              </Typography>
              <Typography
                level="body2"
                sx={{
                  color: 'text.secondary',
                  fontFamily: 'monospace',
                  minWidth: '120px',
                }}
              >
                {fontInfo ? `${fontInfo.fontSize} (${fontInfo.computedSize})` : 'Loading...'}
              </Typography>
              <Typography
                level="caption2"
                sx={{
                  color: 'text.tertiary',
                  fontStyle: 'italic',
                }}
              >
                Computed font size
              </Typography>
            </Box>
          );
        }
      )}

      {/* Button Test Section */}
      <Box sx={{ marginTop: 4, padding: 3, backgroundColor: '#f0f0f0', borderRadius: 2 }}>
        <Typography level="h3" sx={{ marginBottom: 3, textAlign: 'center' }}>
          Button Sizes Test
        </Typography>

        {/* Button Sizes */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography level="subh2" sx={{ marginBottom: 2 }}>
            Button Sizes (Responsive)
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Button size="sm">Small Button</Button>
            <Button size="md">Medium Button</Button>
            <Button size="lg">Large Button</Button>
          </Stack>
          <Typography level="caption2" sx={{ marginTop: 1, fontStyle: 'italic' }}>
            Note: Button sizes change automatically based on screen size (Mobile: sm, Tablet: md, Desktop: lg)
          </Typography>
        </Box>

        {/* Custom Variants for comparison */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography level="subh2" sx={{ marginBottom: 2 }}>
            Custom Variants (for comparison)
          </Typography>
          <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 2 }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
          </Stack>
        </Box>
      </Box>

      {/* RadioButton Test Section */}
      <Box sx={{ marginTop: 4, padding: 3, backgroundColor: '#e8f5e8', borderRadius: 2 }}>
        <Typography level="h3" sx={{ marginBottom: 3, textAlign: 'center' }}>
          RadioButton Sizes Test
        </Typography>

        {/* Standard Radio vs RadioButton */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography level="subh2" sx={{ marginBottom: 2 }}>
            Standard Radio vs RadioButton (Size Comparison)
          </Typography>
          <Stack direction="row" spacing={4} sx={{ flexWrap: 'wrap', gap: 4 }}>
            {/* Standard Radio */}
            <Box>
              <Typography level="body2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                Standard Radio
              </Typography>
              <RadioGroup value={radioValue} onChange={(event) => setRadioValue(event.target.value)}>
                <Radio value="option1" label="Option 1" />
                <Radio value="option2" label="Option 2" />
                <Radio value="option3" label="Option 3" />
              </RadioGroup>
            </Box>

            {/* RadioButton */}
            <Box>
              <Typography level="body2" sx={{ marginBottom: 1, fontWeight: 'bold' }}>
                RadioButton
              </Typography>
              <RadioGroup value={radioButtonValue} onChange={(event) => setRadioButtonValue(event.target.value)}>
                <RadioButton value="button1" label="Button 1" />
                <RadioButton value="button2" label="Button 2" />
                <RadioButton value="button3" label="Button 3" />
              </RadioGroup>
            </Box>
          </Stack>
        </Box>

        {/* RadioButton Sizes */}
        <Box sx={{ marginBottom: 3 }}>
          <Typography level="subh2" sx={{ marginBottom: 2 }}>
            RadioButton Sizes
          </Typography>
          <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap', gap: 3, alignItems: 'flex-start' }}>
            <Box>
              <Typography level="caption1" sx={{ marginBottom: 1 }}>
                Small
              </Typography>
              <RadioGroup defaultValue="sm1">
                <RadioButton value="sm1" label="Small 1" size="sm" />
                <RadioButton value="sm2" label="Small 2" size="sm" />
              </RadioGroup>
            </Box>
            <Box>
              <Typography level="caption1" sx={{ marginBottom: 1 }}>
                Medium
              </Typography>
              <RadioGroup defaultValue="md1">
                <RadioButton value="md1" label="Medium 1" size="md" />
                <RadioButton value="md2" label="Medium 2" size="md" />
              </RadioGroup>
            </Box>
            <Box>
              <Typography level="caption1" sx={{ marginBottom: 1 }}>
                Large
              </Typography>
              <RadioGroup defaultValue="lg1">
                <RadioButton value="lg1" label="Large 1" size="lg" />
                <RadioButton value="lg2" label="Large 2" size="lg" />
              </RadioGroup>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Accordion Test Section */}
      <Box sx={{ marginTop: 4, padding: 3, backgroundColor: '#f0f8ff', borderRadius: 2 }}>
        <Typography level="h3" sx={{ marginBottom: 3, textAlign: 'center' }}>
          Accordion Font Size Test
        </Typography>

        {/* Basic Accordion - to test font sizes */}
        <Box sx={{ marginBottom: 4 }}>
          <Typography level="subh2" sx={{ marginBottom: 2 }}>
            Basic Accordion (Font Size Testing)
          </Typography>
          <AccordionGroup>
            <Accordion>
              <AccordionSummary>What is Castlery?</AccordionSummary>
              <AccordionDetails>
                Castlery is a modern furniture brand that creates beautiful, functional pieces for contemporary living.
                We focus on quality craftsmanship and timeless design.
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary>Shipping Information</AccordionSummary>
              <AccordionDetails>
                We offer free shipping on orders over $299. Standard delivery takes 2-4 weeks, while express delivery is
                available for an additional fee.
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary>Return Policy</AccordionSummary>
              <AccordionDetails>
                We accept returns within 30 days of delivery. Items must be in original condition. Please contact our
                customer service team to initiate a return.
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>
        </Box>

        {/* FAQ Example - to test more content */}
        <Box sx={{ marginBottom: 4 }}>
          <Typography level="subh2" sx={{ marginBottom: 2 }}>
            FAQ Example (Multiple Items)
          </Typography>
          <AccordionGroup>
            <Accordion>
              <AccordionSummary>How do I track my order?</AccordionSummary>
              <AccordionDetails>
                Once your order ships, you&apos;ll receive a tracking number via email. You can use this number to track
                your package on our website or the carrier&apos;s site.
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary>What payment methods do you accept?</AccordionSummary>
              <AccordionDetails>
                We accept all major credit cards (Visa, MasterCard, American Express), PayPal, Apple Pay, and Google Pay
                for your convenience.
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary>Do you offer assembly services?</AccordionSummary>
              <AccordionDetails>
                Yes! We offer professional assembly services in select cities. You can add this service during checkout
                or contact us after your purchase.
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary>Can I cancel or modify my order?</AccordionSummary>
              <AccordionDetails>
                Orders can be cancelled or modified within 24 hours of placement. After this time, please contact
                customer service as changes may not be possible.
              </AccordionDetails>
            </Accordion>
          </AccordionGroup>
        </Box>
      </Box>

      <Box sx={{ marginTop: 4, padding: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
        <Typography level="body2" sx={{ fontWeight: 'bold', marginBottom: 1 }}>
          Screen Size Info:
        </Typography>
        <Typography level="caption1" sx={{ fontFamily: 'monospace' }}>
          Window width: {typeof window !== 'undefined' ? window.innerWidth : 'N/A'}px
        </Typography>
        <Typography level="caption1" sx={{ fontFamily: 'monospace' }}>
          Current breakpoint:{' '}
          {typeof window !== 'undefined'
            ? window.innerWidth <= 600
              ? 'Mobile (≤600px)'
              : window.innerWidth <= 900
              ? 'Tablet (601-900px)'
              : 'Desktop (>900px)'
            : 'N/A'}
        </Typography>
      </Box>
    </Stack>
  );
}
