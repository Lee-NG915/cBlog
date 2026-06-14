'use client';

import { EcEnv } from '@castlery/config';
import { Button, Checkbox, NiceModal, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { useEffect, useRef, useState } from 'react';
import { Grepcaptcha, GrepcaptchaRef } from '../grecaptcha';
import { FormField, FormFieldProps } from './components/form-field';
import {
  EMAIL_STRICT,
  PHONE_VALIDATORS,
  ORDER_NUMBER_REGEX,
  isAbnValid,
  formatAbn,
  isAuAbnApplicable,
  isAuPhoneValid,
  sanitizeAbnInput,
} from './validations/validations';

interface SimpleFormProps {
  title?: string;
  description?: string;
  columns: FormFieldProps[][];
  submitUrl: string;
  receiveEmailCheck?: boolean;
  extraTips?: boolean;
  inTrade?: boolean;
}

const SimpleForm = ({
  title,
  description,
  columns,
  submitUrl,
  receiveEmailCheck = false,
  extraTips = false,
  inTrade = false,
}: SimpleFormProps) => {
  const recaptchaRef = useRef<GrepcaptchaRef>(null);
  const formData = useRef<{ [key: string]: string | number }>({});
  const initialFormData = useRef<{ [key: string]: string | number }>({});
  const [errorFields, setErrorFields] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<{ [fieldKey: string]: { [imageKey: string]: File } }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [confirmReceiveEmail, setConfirmReceiveEmail] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [userInteractedFields, setUserInteractedFields] = useState<Set<string>>(new Set());
  const [fieldVisibilityState, setFieldVisibilityState] = useState<{ [key: string]: boolean }>({});
  const [fieldConfigState, setFieldConfigState] = useState<{ [key: string]: any }>({});
  const { desktop } = useBreakpoints();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState<{
    title: string;
    type: 'success' | 'error';
    confirmText?: string;
    desc?: string;
  }>({
    title: 'Thank you!',
    type: 'success',
    confirmText: 'GOT IT',
    desc: 'Your message has been successfully sent.',
  });
  const [imageNotEnough, setImageNotEnough] = useState(false);
  useEffect(() => {
    columns.forEach((column) => {
      column.forEach((field) => {
        if (field.type === 'select' && field.selectOptions) {
          formData.current[field.fieldKey] = Object.keys(field.selectOptions)[0];
          initialFormData.current[field.fieldKey] = Object.keys(field.selectOptions)[0];
        } else {
          formData.current[field.fieldKey] = '';
          initialFormData.current[field.fieldKey] = '';
        }
      });
    });
  }, [columns]);

  // 更新字段可见性和配置状态
  useEffect(() => {
    const newVisibilityState: { [key: string]: boolean } = {};
    const newConfigState: { [key: string]: any } = {};

    columns.flat().forEach((field) => {
      const isVisible = !shouldHideField(field);
      newVisibilityState[field.fieldKey] = isVisible;

      if (field.type === 'select' && field.selectOptions) {
        newConfigState[field.fieldKey] = field.selectOptions;
      }
    });

    setFieldVisibilityState(newVisibilityState);
    setFieldConfigState(newConfigState);
  }, [forceUpdate]);

  const isPhoneValid = (phoneNumber: string) => {
    if (EcEnv.NEXT_PUBLIC_COUNTRY === 'AU') {
      return isAuPhoneValid(phoneNumber);
    }

    const phoneRegex = PHONE_VALIDATORS[EcEnv.NEXT_PUBLIC_COUNTRY as keyof typeof PHONE_VALIDATORS];
    return phoneRegex.test(phoneNumber);
  };

  const isBusinessWebsiteValid = (website: string) => {
    return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/.test(website.trim());
  };

  const isEmailValid = (email: string) => {
    const normalizedEmail = email.trim();

    // Guard against malformed values even before regex check.
    if (!normalizedEmail.includes('@') || normalizedEmail.split('@').length !== 2) {
      return false;
    }

    return EMAIL_STRICT.test(normalizedEmail);
  };

  const isEmailLikeField = (field: FormFieldProps) => {
    return field.fieldKey.toLowerCase().includes('email') || field.label.toLowerCase().includes('email');
  };

  const handleValidate = (formData: { [key: string]: string }, fieldKey?: string) => {
    let isValid = true;
    const errorFields: string[] = [];

    if (fieldKey) {
      // 如果指定了fieldKey，只验证该单个字段
      const field = columns.flat().find((field) => field.fieldKey === fieldKey);
      if (field && !shouldHideField(field)) {
        switch (field.type) {
          case 'text':
            if (field.fieldKey === 'ABN' && isAuAbnApplicable()) {
              const abnValue = (formData[field.fieldKey] || '').trim();
              if (abnValue === '' || !isAbnValid(abnValue)) {
                isValid = false;
                errorFields.push(field.fieldKey);
              }
              break;
            }
            if (field.fieldKey === 'Business Website' && EcEnv.NEXT_PUBLIC_COUNTRY === 'AU') {
              const websiteValue = (formData[field.fieldKey] || '').trim();
              if (field.required) {
                if (websiteValue === '' || !isBusinessWebsiteValid(websiteValue)) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              } else if (websiteValue !== '' && !isBusinessWebsiteValid(websiteValue)) {
                isValid = false;
                errorFields.push(field.fieldKey);
              }
              break;
            }
            if (isEmailLikeField(field)) {
              if (field.required) {
                if (formData[field.fieldKey] === '') {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                } else if (!isEmailValid(formData[field.fieldKey])) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              } else if (formData[field.fieldKey] !== '' && !isEmailValid(formData[field.fieldKey])) {
                isValid = false;
                errorFields.push(field.fieldKey);
              }
              break;
            }
            if (field.required) {
              if (formData[field.fieldKey] === '') {
                isValid = false;
                errorFields.push(field.fieldKey);
              }
            }
            break;
          case 'tel':
            if (field.required) {
              if (formData[field.fieldKey] === '') {
                isValid = false;
                errorFields.push(field.fieldKey);
              } else {
                if (!isPhoneValid(formData[field.fieldKey])) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              }
            } else {
              if (formData[field.fieldKey] !== '') {
                if (!isPhoneValid(formData[field.fieldKey])) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              }
            }
            break;
          case 'email':
            if (field.required) {
              if (formData[field.fieldKey] === '') {
                isValid = false;
                errorFields.push(field.fieldKey);
              } else {
                if (!isEmailValid(formData[field.fieldKey])) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              }
            } else {
              if (formData[field.fieldKey] !== '') {
                if (!isEmailValid(formData[field.fieldKey])) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              }
            }
            break;
          case 'textarea':
            if (field.required) {
              if (formData[field.fieldKey] === '') {
                isValid = false;
                errorFields.push(field.fieldKey);
              }
            }
            break;
          case 'select':
            if (field.required) {
              // 对于 select 字段，只有当用户已经交互过且选择的是空字符串时才显示错误
              if (formData[field.fieldKey] === '' && userInteractedFields.has(field.fieldKey)) {
                isValid = false;
                errorFields.push(field.fieldKey);
              }
            }
            break;
          case 'order_number':
            if (field.required) {
              if (formData[field.fieldKey] === '') {
                isValid = false;
                errorFields.push(field.fieldKey);
              } else {
                if (!ORDER_NUMBER_REGEX.test(formData[field.fieldKey])) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              }
            } else {
              if (formData[field.fieldKey] !== '') {
                if (!ORDER_NUMBER_REGEX.test(formData[field.fieldKey])) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              }
            }
            break;
        }
      }
    } else {
      // 如果没有指定fieldKey，验证所有字段
      Object.keys(formData).forEach((key) => {
        const fields = columns.find((column) => column.some((field) => field.fieldKey === key));
        if (fields) {
          fields.forEach((field) => {
            // 检查字段是否应该被隐藏，如果被隐藏则跳过验证
            if (shouldHideField(field)) {
              return;
            }

            switch (field.type) {
              case 'text':
                if (field.fieldKey === 'ABN' && isAuAbnApplicable()) {
                  const abnValue = (formData[field.fieldKey] || '').trim();
                  if (abnValue === '' || !isAbnValid(abnValue)) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                  break;
                }
                if (field.fieldKey === 'Business Website' && EcEnv.NEXT_PUBLIC_COUNTRY === 'AU') {
                  const websiteValue = (formData[field.fieldKey] || '').trim();
                  if (field.required) {
                    if (websiteValue === '' || !isBusinessWebsiteValid(websiteValue)) {
                      isValid = false;
                      errorFields.push(field.fieldKey);
                    }
                  } else if (websiteValue !== '' && !isBusinessWebsiteValid(websiteValue)) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                  break;
                }
                if (isEmailLikeField(field)) {
                  if (field.required) {
                    if (formData[field.fieldKey] === '') {
                      isValid = false;
                      errorFields.push(field.fieldKey);
                    } else if (!isEmailValid(formData[field.fieldKey])) {
                      isValid = false;
                      errorFields.push(field.fieldKey);
                    }
                  } else if (formData[field.fieldKey] !== '' && !isEmailValid(formData[field.fieldKey])) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                  break;
                }
                if (field.required) {
                  if (formData[field.fieldKey] === '') {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                }
                break;
              case 'tel':
                if (field.required) {
                  if (formData[field.fieldKey] === '') {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  } else {
                    if (!isPhoneValid(formData[field.fieldKey])) {
                      isValid = false;
                      errorFields.push(field.fieldKey);
                    }
                  }
                } else {
                  if (formData[field.fieldKey] !== '') {
                    if (!isPhoneValid(formData[field.fieldKey])) {
                      isValid = false;
                      errorFields.push(field.fieldKey);
                    }
                  }
                }
                break;
              case 'email':
                if (field.required) {
                  if (formData[field.fieldKey] === '') {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  } else {
                    if (!isEmailValid(formData[field.fieldKey])) {
                      isValid = false;
                      errorFields.push(field.fieldKey);
                    }
                  }
                } else {
                  if (formData[field.fieldKey] !== '') {
                    if (!isEmailValid(formData[field.fieldKey])) {
                      isValid = false;
                      errorFields.push(field.fieldKey);
                    }
                  }
                }
                break;
              case 'textarea':
                if (field.required) {
                  if (formData[field.fieldKey] === '') {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                }
                break;
              case 'select':
                if (field.required) {
                  // 对于 select 字段，只有当用户已经交互过且选择的是空字符串时才显示错误
                  if (formData[field.fieldKey] === '' && userInteractedFields.has(field.fieldKey)) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                }
                break;
              case 'order_number':
                if (field.required) {
                  if (formData[field.fieldKey] === '') {
                    console.log(' 4', formData[field.fieldKey]);
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  } else {
                    if (!ORDER_NUMBER_REGEX.test(formData[field.fieldKey])) {
                      isValid = false;
                      errorFields.push(field.fieldKey);
                    }
                  }
                } else {
                  if (formData[field.fieldKey] !== '') {
                    if (!ORDER_NUMBER_REGEX.test(formData[field.fieldKey])) {
                      isValid = false;
                      errorFields.push(field.fieldKey);
                    }
                  }
                }
                break;
            }
          });
        }
      });
    }
    return { isValid, errorFields };
  };

  // 提交时的验证函数，强制检查所有字段
  const handleValidateForSubmit = (formData: { [key: string]: string }) => {
    let isValid = true;
    const errorFields: string[] = [];

    // 验证所有字段
    Object.keys(formData).forEach((key) => {
      const fields = columns.find((column) => column.some((field) => field.fieldKey === key));
      if (fields) {
        fields.forEach((field) => {
          // 检查字段是否应该被隐藏，如果被隐藏则跳过验证
          if (shouldHideField(field)) {
            return;
          }

          switch (field.type) {
            case 'text':
              if (field.fieldKey === 'ABN' && isAuAbnApplicable()) {
                const abnValue = (formData[field.fieldKey] || '').trim();
                if (abnValue === '' || !isAbnValid(abnValue)) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
                break;
              }
              if (field.fieldKey === 'Business Website' && EcEnv.NEXT_PUBLIC_COUNTRY === 'AU') {
                const websiteValue = (formData[field.fieldKey] || '').trim();
                if (field.required) {
                  if (websiteValue === '' || !isBusinessWebsiteValid(websiteValue)) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                } else if (websiteValue !== '' && !isBusinessWebsiteValid(websiteValue)) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
                break;
              }
              if (isEmailLikeField(field)) {
                if (field.required) {
                  if (formData[field.fieldKey] === '') {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  } else if (!isEmailValid(formData[field.fieldKey])) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                } else if (formData[field.fieldKey] !== '' && !isEmailValid(formData[field.fieldKey])) {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
                break;
              }
              if (field.required) {
                if (formData[field.fieldKey] === '') {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              }
              break;
            case 'tel':
              if (field.required) {
                if (formData[field.fieldKey] === '') {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                } else {
                  if (!isPhoneValid(formData[field.fieldKey])) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                }
              } else {
                if (formData[field.fieldKey] !== '') {
                  if (!isPhoneValid(formData[field.fieldKey])) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                }
              }
              break;
            case 'email':
              if (field.required) {
                if (formData[field.fieldKey] === '') {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                } else {
                  if (!isEmailValid(formData[field.fieldKey])) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                }
              } else {
                if (formData[field.fieldKey] !== '') {
                  if (!isEmailValid(formData[field.fieldKey])) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                }
              }
              break;
            case 'textarea':
              if (field.required) {
                if (formData[field.fieldKey] === '') {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              }
              break;
            case 'select':
              if (field.required) {
                // 提交时，无论用户是否交互过，都检查是否为空字符串
                if (formData[field.fieldKey] === '') {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              }
              break;
            case 'order_number':
              if (field.required) {
                if (formData[field.fieldKey] === '') {
                  isValid = false;
                  errorFields.push(field.fieldKey);
                } else {
                  if (!ORDER_NUMBER_REGEX.test(formData[field.fieldKey])) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                }
              } else {
                if (formData[field.fieldKey] !== '') {
                  if (!ORDER_NUMBER_REGEX.test(formData[field.fieldKey])) {
                    isValid = false;
                    errorFields.push(field.fieldKey);
                  }
                }
              }
              break;

            case 'images':
              if (field.fieldKey === 'image_urls_in_return') {
                if (!imageFiles[field.fieldKey] || Object.values(imageFiles[field.fieldKey]).length < 5) {
                  setImageNotEnough(true);
                  isValid = false;
                  errorFields.push(field.fieldKey);
                }
              }
              break;
          }
        });
      }
    });

    return { isValid, errorFields };
  };

  // 示例：如何使用 getToken 方法
  const handleSubmit = async () => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const token = recaptchaRef.current?.getToken();
    if (token) {
      setErrorFields([]);
      // 提交时强制检查所有字段，包括初始状态的 select 字段
      const { isValid, errorFields } = handleValidateForSubmit(formData.current as { [key: string]: string });
      if (!isValid) {
        setErrorFields(errorFields);
        setIsLoading(false);
        return;
      }
      const body = { ...formData.current };

      // 处理 includeInJson 字段
      const jsonFields: { [key: string]: any } = {};
      const regularFields: { [key: string]: any } = {};

      // 分离需要包装在 JSON 中的字段和普通字段
      Object.keys(formData.current).forEach((key) => {
        // 查找对应的字段配置
        const fieldConfig = columns.flat().find((field) => field.fieldKey === key);
        let value = formData.current[key];

        if (key === 'ABN' && isAuAbnApplicable() && value) {
          value = formatAbn(String(value));
        }

        if (fieldConfig?.includeInJson) {
          // 如果字段有 includeInJson 配置，将其添加到对应的 JSON 对象中
          if (!jsonFields[fieldConfig.includeInJson]) {
            jsonFields[fieldConfig.includeInJson] = {};
          }
          jsonFields[fieldConfig.includeInJson][key] = value;
        } else {
          // 普通字段直接添加到 body 中
          regularFields[key] = value;
        }
      });

      // 合并所有字段到最终的 body 中
      const finalBody = { ...regularFields, ...jsonFields };

      if (receiveEmailCheck) {
        finalBody.subscription_status = confirmReceiveEmail ? 'SUBSCRIBED' : 'NEVER_SUBSCRIBED';
      }

      // 动态根据 type 获取对应的图片列表
      const currentType = formData.current.type as string;

      // 查找所有图片类型的字段
      const imageFields = columns.flat().filter((field) => field.type === 'images');

      // 根据当前 type 和字段的 hiddenConditions 确定应该使用哪个图片字段
      let activeImageField = null;

      for (const imageField of imageFields) {
        if (imageField.hiddenConditions && imageField.hiddenConditions.type) {
          // 如果当前 type 不在隐藏条件中，说明这个字段应该显示
          if (!imageField.hiddenConditions.type.includes(currentType)) {
            activeImageField = imageField;
            break;
          }
        }
      }

      // 如果有对应的图片字段且有上传的图片，添加到最终数据中
      if (activeImageField && imageFiles[activeImageField.fieldKey]) {
        const uploadedImages = Object.values(imageFiles[activeImageField.fieldKey]).filter(
          (file): file is File => file !== undefined
        );
        if (uploadedImages.length > 0) {
          // 创建 FormData 对象来发送文件
          const imageData = new FormData();

          // 添加图片文件到 FormData
          uploadedImages.forEach((file) => {
            imageData.append('image[]', file);
          });

          // 添加文件夹名称
          imageData.append('folder', 'customer_damages');

          // 添加选项配置
          imageData.append(
            'options',
            JSON.stringify({
              use_filename: false,
              unique_filename: true,
            })
          );

          const imageResponse = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}/cloudinary_images`, {
            method: 'POST',
            body: imageData,
          });

          // 处理响应，类似成功案例中的 const { body } = data
          const responseData = await imageResponse.json();
          finalBody['image_urls'] = responseData.map((item: any) => item.secure_url);
        }
      }

      // 根据字段类型动态删除不需要的字段
      columns.flat().forEach((field) => {
        if (field.type === 'images' || field.type === 'render_tips') {
          delete finalBody[field.fieldKey];
        }
      });

      if (finalBody.reason_other && finalBody.data.reason === 'Others') {
        finalBody.data.reason = `Others - ${finalBody.reason_other}`;
        delete finalBody.reason_other;
      }

      if (finalBody.reason_other !== undefined) {
        delete finalBody.reason_other;
      }

      if (finalBody?.data?.reason === '') {
        delete finalBody.data;
      }
      if (
        finalBody.order_number1 !== '' &&
        [
          'Shipping / Order Status',
          'Change / Cancel My Order',
          'Damages / Repairs',
          'Request Return',
          'Price Protection',
          'Data Privacy',
        ].includes(finalBody.type)
      ) {
        finalBody.order_number = finalBody.order_number1;
        delete finalBody.order_number1;
      }
      if (finalBody.order_number1 !== undefined) {
        delete finalBody.order_number1;
      }
      finalBody.name = finalBody.firstName + ' ' + finalBody.lastName;
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'trackEvent',
          'eventDetails.category': 'contact_form_fillup',
          'eventDetails.action': finalBody.email,
          'eventDetails.label': finalBody.name,
          'eventDetails.method': finalBody.phone_number,
        });
      }
      if (inTrade) {
        finalBody.type = 'Sales Enquiry';
        const fields = [
          'firstName',
          'lastName',
          'phoneNumber',
          'email',
          'Trading Name',
          'UEN Number',
          'Registered Address',
          'Industry',
          'Business Website',
          'Business Facebook/Instagram',
          'Additional Enquiries',
          'ABN',
          'Business Number',
          'IndustryOther',
        ];
        finalBody.comment = '';
        fields.forEach((field) => {
          if (finalBody[field]) {
            finalBody.comment += `${field}: ${finalBody[field]}<br/>`;
          }
        });
      }

      const response = await fetch(`${EcEnv.NEXT_PUBLIC_API_HOST}${submitUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Captcha: token,
        },
        body: JSON.stringify(finalBody),
      });

      // 解析响应内容
      try {
        const responseData = await response.json();
        setModalOpen(true);
        setModalInfo({
          title: 'Thank you!',
          type: 'success',
          confirmText: 'GOT IT',
          desc: 'Your message has been successfully sent.',
        });
        setIsLoading(false);
        formData.current = { ...initialFormData.current };
        setImageFiles({}); // 清除所有上传的图片
        recaptchaRef.current?.reset();
      } catch (error) {
        setModalInfo({
          title: 'Oops!',
          type: 'error',
          confirmText: 'GOT IT',
          desc: 'Must something wrong, please try again later.',
        });
        setIsLoading(false);
        formData.current = { ...initialFormData.current };
        setImageFiles({}); // 清除所有上传的图片
        recaptchaRef.current?.reset();
      }
      // 在这里处理表单提交逻辑
    } else {
      console.log('reCAPTCHA not completed');
      setIsLoading(false);
    }
  };

  // 示例：如何使用 reset 方法
  const handleReset = () => {
    recaptchaRef.current?.reset();
  };

  const handleChange = (fieldKey: string, value: string) => {
    const sanitizedValue = fieldKey === 'ABN' && isAuAbnApplicable() ? sanitizeAbnInput(value) : value;
    formData.current[fieldKey] = sanitizedValue;

    // 记录用户已经与这个字段交互过
    setUserInteractedFields((prev) => new Set([...prev, fieldKey]));

    // 对于 select 字段，如果用户选择了空字符串，立即显示错误
    const field = columns.flat().find((field) => field.fieldKey === fieldKey);
    if (field && field.type === 'select' && field.required && sanitizedValue === '') {
      setErrorFields((prev) => [...prev.filter((field) => field !== fieldKey), fieldKey]);
    } else {
      setErrorFields((prev) => prev.filter((field) => field !== fieldKey));
    }

    // 只有当当前字段是 select 类型时，才检查其他 select 字段是否需要重置
    if (field && field.type === 'select') {
      columns.flat().forEach((otherField) => {
        if (otherField.type === 'select' && otherField.fieldKey !== fieldKey) {
          // 检查该字段是否因为当前字段的变化而需要重置
          const isVisible = !shouldHideField(otherField);
          const wasVisible = fieldVisibilityState[otherField.fieldKey];

          // 检查字段配置是否发生变化（相同 fieldKey 但不同的 selectOptions）
          const configChanged = hasFieldConfigChanged(otherField);

          // 当字段从隐藏变为可见，或者字段配置发生变化时，需要重置
          // 对于相同 fieldKey 的字段，即使用户已经交互过，如果配置发生变化也需要重置
          if ((isVisible && !wasVisible) || configChanged) {
            // 如果字段配置发生变化，或者用户从未与该字段交互过，则重置
            if (configChanged || !userInteractedFields.has(otherField.fieldKey)) {
              if (otherField.selectOptions && Object.keys(otherField.selectOptions).length > 0) {
                const firstKey = Object.keys(otherField.selectOptions)[0];
                formData.current[otherField.fieldKey] = firstKey;
                // 清除该字段的错误状态
                setErrorFields((prev) => prev.filter((errorField) => errorField !== otherField.fieldKey));
              }
            }
          }
        }
      });
    }

    // 触发重新渲染以更新条件显示/隐藏的字段
    setForceUpdate((prev) => prev + 1);
  };

  const handleBlur = (fieldKey: string) => {
    // 对于非 select 字段，在失焦时进行验证
    const field = columns.flat().find((field) => field.fieldKey === fieldKey);
    if (field && field.type !== 'select') {
      // 确保用户交互状态在失焦时也被考虑
      if (!userInteractedFields.has(fieldKey)) {
        setUserInteractedFields((prev) => new Set([...prev, fieldKey]));
      }

      const { isValid, errorFields } = handleValidate(formData.current as { [key: string]: string }, fieldKey);
      if (!isValid) {
        setErrorFields((prev) => [...prev.filter((field) => field !== fieldKey), ...errorFields]);
      } else {
        setErrorFields((prev) => prev.filter((field) => field !== fieldKey));
      }
    }
  };

  const handleImageSelect = (file: File, fieldKey: string, imageKey: string) => {
    setImageFiles((prev) => {
      const newFiles = { ...prev };
      if (!newFiles[fieldKey]) {
        newFiles[fieldKey] = {};
      }
      newFiles[fieldKey][imageKey] = file;
      return newFiles;
    });
  };

  const handleImageRemove = (fieldKey: string, imageKey: string) => {
    setImageFiles((prev) => {
      const newFiles = { ...prev };
      if (newFiles[fieldKey]) {
        delete newFiles[fieldKey][imageKey];
        // 如果该字段下没有图片了，删除整个字段
        if (Object.keys(newFiles[fieldKey]).length === 0) {
          delete newFiles[fieldKey];
        }
      }
      return newFiles;
    });
  };

  // 判断字段是否应该被隐藏
  const shouldHideField = (field: FormFieldProps): boolean => {
    // 首先检查隐藏条件
    if (field.hiddenConditions) {
      // 检查每个隐藏条件
      for (const [conditionField, hiddenValues] of Object.entries(field.hiddenConditions)) {
        const currentValue = formData.current[conditionField];
        if (hiddenValues.includes(currentValue as string)) {
          return true;
        }
      }
    }

    // 然后检查显示条件
    if (field.mustDisplayConditions) {
      // 检查每个显示条件
      for (const [conditionField, displayValues] of Object.entries(field.mustDisplayConditions)) {
        const currentValue = formData.current[conditionField];
        // 如果当前值不在显示条件数组中，则隐藏字段
        if (!displayValues.includes(currentValue as string)) {
          return true;
        }
      }
    }

    return false;
  };

  // 判断整行是否应该被隐藏（当行中所有字段都被隐藏时）
  const shouldHideRow = (column: FormFieldProps[]): boolean => {
    return column.every((field) => shouldHideField(field));
  };

  // 检查字段配置是否发生变化
  const hasFieldConfigChanged = (field: FormFieldProps): boolean => {
    if (field.type !== 'select' || !field.selectOptions) return false;

    const previousConfig = fieldConfigState[field.fieldKey];
    const currentConfig = field.selectOptions;

    // 如果没有之前的配置，说明是新字段，不需要重置
    if (!previousConfig) return false;

    // 比较配置是否发生变化
    return JSON.stringify(previousConfig) !== JSON.stringify(currentConfig);
  };

  return (
    <>
      <Stack
        sx={(theme: any) => ({
          width: '100%',
          mb: theme.spacing(10),
          padding: {
            xs: `0 ${theme.spacing(6)}`,
            md: 0,
          },
        })}
        alignItems="center"
      >
        <Stack
          sx={(theme: any) => ({
            alignItems: 'center',
            padding: {
              xs: theme.spacing(6),
              md: 0,
            },
            mb: {
              xs: 0,
              md: theme.spacing(10),
            },
          })}
        >
          <Typography
            level="h3"
            sx={(theme: any) => ({
              mb: {
                xs: 2,
                md: 4,
              },
              textAlign: 'center',
            })}
          >
            {title}
          </Typography>
          {description && description !== '' && (
            <Typography
              level="body1"
              sx={(theme: any) => ({
                textAlign: 'center',
                color: theme.palette.brand.mono[700],
              })}
            >
              {description}
            </Typography>
          )}
        </Stack>
        <Stack
          sx={(theme: any) => ({
            width: '100%',
            mb: receiveEmailCheck ? theme.spacing(5) : theme.spacing(10),
          })}
        >
          {columns.map((column, index) => {
            // 检查整行是否应该被隐藏
            if (shouldHideRow(column)) {
              return null;
            }

            return (
              <Stack
                key={index}
                sx={(theme: any) => ({
                  display: 'grid',
                  gridTemplateColumns: {
                    sx: '1fr',
                    md: (() => {
                      // 计算实际可见的字段数量
                      const visibleFieldsCount = column.filter((field) => !shouldHideField(field)).length;
                      return visibleFieldsCount > 1 ? '1fr 1fr' : '1fr';
                    })(),
                  },
                  mb: {
                    sx: theme.spacing(4),
                    md: theme.spacing(6),
                  },
                  gap: {
                    xs: 0,
                    md: theme.spacing(15),
                  },
                })}
              >
                {column.map((field, subIndex) => {
                  // 检查字段是否应该被隐藏
                  if (shouldHideField(field)) {
                    return null;
                  }

                  return (
                    <FormField
                      key={subIndex}
                      {...field}
                      digitsOnly={field.fieldKey === 'ABN' && isAuAbnApplicable()}
                      value={formData.current[field.fieldKey] as string}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onImageSelect={handleImageSelect}
                      onImageRemove={handleImageRemove}
                      imageFiles={imageFiles}
                      error={errorFields.includes(field.fieldKey)}
                    />
                  );
                })}
              </Stack>
            );
          })}
        </Stack>

        {receiveEmailCheck && (
          <Stack sx={(theme: any) => ({ width: '100%', mb: theme.spacing(10) })}>
            <Checkbox
              checked={confirmReceiveEmail}
              onChange={(e) => {
                setConfirmReceiveEmail(e.target.checked);
              }}
              label="Yes, l would like to receive marketing emails and special offers from Castlery."
            />
          </Stack>
        )}
        <Grepcaptcha ref={recaptchaRef} />
        <Button
          loading={isLoading}
          sx={(theme: any) => ({
            mt: {
              xs: theme.spacing(8),
              md: theme.spacing(10),
            },
          })}
          onClick={handleSubmit}
        >
          SUBMIT FORM
        </Button>

        {extraTips && (
          <Stack
            sx={(theme: any) => ({
              width: '100%',
              mt: {
                xs: theme.spacing(5),
                md: theme.spacing(9),
              },
            })}
            alignItems="center"
          >
            <Typography
              level="caption1"
              sx={(theme: any) => ({
                color: theme.palette.brand.mono[700],
                textAlign: 'center',
              })}
            >
              All applications are subject to approval and require 3 working days for approval.
              {desktop && <br />}
              By signing up as our Trade Partner, you agree to be included in our marketing newsletter.
            </Typography>
          </Stack>
        )}

        {/* 示例按钮，展示如何使用 recaptchaRef */}
        {/* <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <button onClick={handleSubmit}>提交表单</button>
        <button onClick={handleReset}>重置 reCAPTCHA</button>
      </Stack> */}
      </Stack>
      <NiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalInfo.title}
        showCancelBtn={false}
        success={modalInfo.type === 'success'}
        danger={modalInfo.type === 'error'}
        confirmText={modalInfo.confirmText}
        desc={modalInfo.desc}
        onConfirm={() => {
          setModalOpen(false);
        }}
      />
      <NiceModal
        open={imageNotEnough}
        onClose={() => setImageNotEnough(false)}
        title="OOPS!"
        desc="Please upload all required photos"
        showCancelBtn={false}
        confirmText="GOT IT"
        success={false}
        danger={true}
      />
    </>
  );
};

export { SimpleForm };
