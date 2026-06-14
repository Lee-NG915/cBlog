'use client';

import { Dropdown, Input, Stack, Textarea, Typography, useBreakpoints, inputClasses } from '@castlery/fortress';
import { Error } from '@castlery/fortress/Icons';
import { useEffect, useState, useMemo, useRef, type ClipboardEvent, type KeyboardEvent } from 'react';
import { ImageUploader } from './image-uploader';
import { TextMaskAdapter } from '@castlery/fortress/HookForm/components/Input/iMaskAdapter';
import { ABN_MAX_DIGITS, sanitizeAbnInput } from '../validations/validations';

interface FormFieldProps {
  fieldKey: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'images' | 'render_tips' | 'textarea' | 'text_with_tips' | 'order_number';
  placeholder: string;
  required: boolean;
  helperText?: string;
  errorText?: string;
  error?: boolean;
  selectOptions?: {
    [key: string]: string;
  };
  hiddenConditions?: {
    [key: string]: string[];
  };
  mustDisplayConditions?: {
    [key: string]: string[];
  };
  includeInJson?: string;
  selectOptionsImplement?: {
    [key: string]: string;
  };
  imageList?: string[];
  onChange?: (fieldKey: string, value: string) => void;
  onBlur?: (fieldKey: string) => void;
  onImageSelect?: (file: File, fieldKey: string, imageKey: string) => void;
  onImageRemove?: (fieldKey: string, imageKey: string) => void;
  imageFiles?: { [fieldKey: string]: { [imageKey: string]: File } };
  renderElement?: React.ReactNode;
  value?: string;
  endDecorator?: React.ReactNode;
  imaskProps?: Record<string, any>;
  digitsOnly?: boolean;
}

const FormField = ({
  fieldKey,
  label,
  type,
  placeholder,
  required,
  helperText,
  errorText,
  error,
  selectOptions,
  hiddenConditions,
  selectOptionsImplement,
  imageList,
  onChange,
  onBlur,
  onImageSelect,
  onImageRemove,
  imageFiles,
  renderElement,
  value,
  endDecorator,
  imaskProps,
  digitsOnly = false,
}: FormFieldProps) => {
  const [helperTextVisible, setHelperTextVisible] = useState(false);
  const [errorTextVisible, setErrorTextVisible] = useState(false);
  const previousUrlsRef = useRef<{ [key: string]: string }>({});
  const { desktop } = useBreakpoints();

  // 缓存图片URL，避免在字段值变化时重新创建
  const imageUrls = useMemo(() => {
    if (type !== 'images' || !imageList || !imageFiles?.[fieldKey]) {
      return {};
    }

    const urls: { [key: string]: string } = {};
    imageList.forEach((imageKey) => {
      const file = imageFiles[fieldKey][imageKey];
      if (file) {
        // 如果之前已经有这个文件的URL，复用它
        if (previousUrlsRef.current[imageKey]) {
          urls[imageKey] = previousUrlsRef.current[imageKey];
        } else {
          urls[imageKey] = URL.createObjectURL(file);
        }
      }
    });

    // 清理不再使用的URL
    Object.keys(previousUrlsRef.current).forEach((key) => {
      if (!urls[key]) {
        URL.revokeObjectURL(previousUrlsRef.current[key]);
      }
    });

    previousUrlsRef.current = urls;
    return urls;
  }, [type, imageList, imageFiles, fieldKey]);

  // 组件卸载时清理所有URL
  useEffect(() => {
    return () => {
      Object.values(previousUrlsRef.current).forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);
  const handleChange = (value: string) => {
    if (onChange) {
      onChange(fieldKey, value);
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(fieldKey);
    }
  };

  const getDigitsOnlyInputProps = () => {
    if (!digitsOnly) {
      return {};
    }

    return {
      inputMode: 'numeric' as const,
      pattern: '[0-9]*',
      maxLength: ABN_MAX_DIGITS,
      onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.ctrlKey || event.metaKey || event.altKey) {
          return;
        }

        const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
        if (allowedKeys.includes(event.key)) {
          return;
        }

        if (!/^\d$/.test(event.key)) {
          event.preventDefault();
        }
      },
      onPaste: (event: ClipboardEvent<HTMLInputElement>) => {
        event.preventDefault();
        const pastedDigits = sanitizeAbnInput(event.clipboardData.getData('text'));
        const input = event.currentTarget;
        const start = input.selectionStart ?? 0;
        const end = input.selectionEnd ?? 0;
        const currentValue = value || '';
        const nextValue = sanitizeAbnInput(`${currentValue.slice(0, start)}${pastedDigits}${currentValue.slice(end)}`);
        handleChange(nextValue);
      },
    };
  };

  // 将 File 对象转换为 base64 字符串
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 更新显示逻辑：
  // errorText: required=true且field为空时显示
  // helperText: 非valid且不为空时显示；若缺失则回退到 errorText（包含提交时）
  useEffect(() => {
    const shouldShowError = !!(error && errorText && required && (value === '' || value === undefined));
    const shouldShowHelper = !!(error && (helperText || errorText) && value && value !== '');

    setErrorTextVisible(shouldShowError);
    setHelperTextVisible(shouldShowHelper);
  }, [error, errorText, helperText, required, value]);
  const renderFieldContent = () => {
    if (type === 'text_with_tips') {
      return (
        <Input
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          sx={(theme) => ({
            mb: theme.spacing(1),
            '& input::placeholder': {
              color: theme.palette.brand.mono[400], // 设置 placeholder 颜色
            },
          })}
          endDecorator={endDecorator}
        />
      );
    }
    if (type === 'textarea') {
      return (
        <Textarea
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          sx={{
            '& textarea': {
              fontSize: {
                xs: '16px',
                md: '18px',
              },
            },
            textarea: {
              '--Textarea-placeholderColor': errorTextVisible ? '#B88A8F !important' : 'rgb(165, 145, 152)',
              '--Textarea-placeholderOpacity': errorTextVisible ? 1 : 0.64,
            },
            '& textarea:hover::placeholder': {
              color: 'rgb(60, 16, 30)',
              opacity: 0.64,
            },
          }}
        />
      );
    }
    if (type === 'render_tips') {
      return renderElement;
    }
    if (type === 'images') {
      return (
        <Stack direction="row" alignItems="center" gap={6} sx={(theme) => ({ mt: theme.spacing(4), flexWrap: 'wrap' })}>
          {imageList?.map((item, index) => {
            const imageUrl = imageUrls[item] || null;

            return (
              <ImageUploader
                key={item}
                name={item}
                onImageSelect={(file) => onImageSelect?.(file, fieldKey, item)}
                onImageRemove={() => onImageRemove?.(fieldKey, item)}
                initialImage={imageUrl}
              />
            );
          })}
        </Stack>
      );
    }
    if (type === 'select') {
      if (!selectOptions) {
        return null;
      }
      return (
        <Dropdown
          value={value !== undefined ? value : ''}
          onChange={(e: any, newValue: string | null) => {
            if (newValue !== null) {
              handleChange(newValue);
            }
          }}
          onBlur={handleBlur}
        >
          {Object.keys(selectOptions).map((key, index) => {
            const implementText = selectOptionsImplement?.[key];
            return (
              <Dropdown.Option key={index} value={key}>
                <Stack
                  direction={desktop ? 'row' : 'column'}
                  alignItems={desktop ? 'center' : 'flex-start'}
                  sx={{ textWrap: 'wrap', maxWidth: desktop ? 'auto' : '90vw' }}
                >
                  <Typography level="body2">{selectOptions[key]}</Typography>
                  {implementText && (
                    <Typography
                      level="caption1"
                      sx={(theme) => ({
                        color: theme.palette.brand.mono[600],
                        ml: theme.spacing(0.5),
                        textWrap: 'wrap',
                      })}
                    >
                      {implementText}
                    </Typography>
                  )}
                </Stack>
              </Dropdown.Option>
            );
          })}
        </Dropdown>
      );
    }
    if (type === 'tel') {
      return (
        <Input
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          sx={(theme) => ({
            mb: theme.spacing(1),
          })}
          slotProps={
            imaskProps
              ? {
                  input: {
                    component: TextMaskAdapter,
                    imaskProps: imaskProps,
                  },
                }
              : undefined
          }
        />
      );
    }
    return (
      <Input
        placeholder={placeholder}
        value={value || ''}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        {...getDigitsOnlyInputProps()}
        sx={(theme) => ({
          mb: theme.spacing(1),
        })}
      />
    );
  };
  return (
    <Stack
      sx={{
        [`.${inputClasses.root}`]: {
          '--Input-placeholderColor': errorTextVisible ? '#B88A8F !important' : 'rgb(165, 145, 152)',
          '--Input-placeholderOpacity': errorTextVisible ? 1 : 0.64,
          '&:hover': {
            '--Input-placeholderColor': 'rgb(60, 16, 30) !important',
            '--Input-placeholderOpacity': '0.64 !important',
          },
        },
      }}
    >
      {label && (
        <Typography level="body2" sx={(theme) => ({ mb: theme.spacing(1) })}>
          {`${label} ${required ? '*' : ''}`}
        </Typography>
      )}
      {renderFieldContent()}
      <Stack
        direction="row"
        alignItems="center"
        sx={{ visibility: helperTextVisible || errorTextVisible ? 'visible' : 'hidden' }}
      >
        <Error
          sx={(theme) => ({
            width: 20,
            height: 20,
            mr: theme.spacing(1),
            color: theme.palette.brand.rosewood[500],
          })}
        />
        <Typography
          level="body2"
          sx={(theme) => ({
            mt: theme.spacing(1),
            color: theme.palette.brand.rosewood[500],
          })}
        >
          {errorTextVisible ? errorText : helperText || errorText}
        </Typography>
      </Stack>
    </Stack>
  );
};

export { FormField, FormFieldProps };
