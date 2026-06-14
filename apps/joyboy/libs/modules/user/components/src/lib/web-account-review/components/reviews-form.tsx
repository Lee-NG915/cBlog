'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Checkbox,
  formHelperTextClasses,
  FormHelperText,
  useNiceModal,
  Stack,
  IconButton,
  useBreakpoints,
} from '@castlery/fortress';
import { Error, PhotoCamera, Close } from '@castlery/fortress/Icons';
import { logger } from '@castlery/observability/client';
import type { AttachmentsItemType, ReviewItem, SubmitReviewData } from '@castlery/types';
import { Controller, useForm } from 'react-hook-form';
import { useUploadAttachmentMutation } from '@castlery/modules-user-domain';
import { FortressImage, InteractiveRating, PinchZoomViewer } from '@castlery/shared-components';
import { useTranslation, LocalesNamespace } from '@castlery/monorepo-i18n';

// 图片上传组件
const ImageUploadComponent = ({
  images,
  onImagesChange,
  maxImages = 10,
  onImageIsDirty,
  imageClick,
  mobile = false,
  setImageLoading,
}: {
  images: AttachmentsItemType[];
  onImagesChange: (images: AttachmentsItemType[]) => void;
  maxImages?: number;
  onImageIsDirty: (isDirty: boolean) => void;
  imageClick: (index: number) => void;
  mobile?: boolean;
  setImageLoading: (loading: boolean) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadAttachment, { isLoading: isUploading }] = useUploadAttachmentMutation();
  const [modal, modalContextHolder] = useNiceModal();

  // 辅助函数：验证文件
  const validateFiles = (files: File[]): { validFiles: File[]; errors: string[] } => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    // 允许的图片格式
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const allowedExtensions = ['.jpeg', '.jpg', '.png'];

    files.forEach((file) => {
      // 检查文件类型是否为图片
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not a valid image file.`);
        return;
      }

      // 检查是否为允许的图片格式
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      const isAllowedType =
        allowedImageTypes.includes(file.type.toLowerCase()) || allowedExtensions.includes(fileExtension);

      if (!isAllowedType) {
        errors.push(`You cannot upload ${fileExtension} images, allowed .jpeg, .jpg, .png`);
        return;
      }

      // 检查文件大小 (10MB限制)
      if (file.size > 10 * 1024 * 1024) {
        errors.push(`${file.name} is too large. The maximum image size allowed is 10MB.`);
        return;
      }

      validFiles.push(file);
    });

    return { validFiles, errors };
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    // 提前检查文件数量限制 - 避免不必要的处理
    if (images.length + files.length > maxImages) {
      modal.warning({
        title: 'Upload Limit',
        desc: `You can upload at most ${maxImages} images.`,
        showCancelBtn: false,
        confirmText: 'OK',
      });
      // 清除input值
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // 验证文件类型和大小 - 避免无效文件的上传尝试
    const { validFiles, errors: validationErrors } = validateFiles(files);

    // 如果有验证错误，显示错误信息并返回
    if (validationErrors.length > 0) {
      modal.warning({
        title: 'File Validation Failed',
        desc: validationErrors.join('\n'),
        showCancelBtn: false,
        confirmText: 'OK',
      });
      // 清除input值
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // 如果没有有效文件，直接返回
    if (validFiles.length === 0) {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // 再次检查数量限制（防止在验证过程中数量发生变化）
    if (images.length + validFiles.length > maxImages) {
      modal.warning({
        title: 'Upload Limit',
        desc: `You can only upload up to ${maxImages} images. You currently have ${images.length} images and are trying to add ${validFiles.length} more.`,
        showCancelBtn: false,
        confirmText: 'OK',
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // 开始上传有效文件
    const uploadPromises = validFiles.map(async (file) => {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await uploadAttachment(formData).unwrap();
        return response.attachment;
      } catch (error) {
        logger.error('Review attachment upload failed', {
          error,
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
        });
        modal.warning({
          title: 'Upload Failed',
          desc: `Failed to upload ${file.name}. Please try again.`,
          showCancelBtn: false,
          confirmText: 'OK',
        });
        return null;
      }
    });

    try {
      const uploadedImages = await Promise.all(uploadPromises);
      const successfulUploads = uploadedImages.filter((img): img is AttachmentsItemType => img !== null);

      if (successfulUploads.length > 0) {
        onImagesChange([...images, ...successfulUploads]);
        onImageIsDirty(true);
      }
    } catch (error) {
      logger.error('Batch upload processing failed', { error });
    }

    // 清除input值，允许重复选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    setImageLoading(isUploading);
  }, [isUploading, setImageLoading]);

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    onImageIsDirty(true);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Box>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        multiple
        style={{ display: 'none' }}
        aria-labelledby="upload-images-label"
        aria-label="Upload images"
        onChange={handleFileSelect}
      />

      <Button
        variant="secondary"
        size="md"
        startDecorator={<PhotoCamera />}
        onClick={handleUploadClick}
        disabled={isUploading || images.length >= maxImages}
        loading={isUploading}
        aria-label="Upload images button"
      >
        upload images
      </Button>

      {/* 图片预览网格 */}
      {images.length > 0 && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, ${mobile ? '88px' : '120px'})`,
            gap: 7,
            mt: 7,
          }}
        >
          {images.map((image, index) => (
            <Box
              key={image.key}
              sx={{
                position: 'relative',
                width: mobile ? '88px' : '120px',
                height: mobile ? '88px' : '120px',
              }}
            >
              <FortressImage
                ratio={1}
                objectFit={'cover'}
                src={image.url}
                alt={`Upload ${index + 1}`}
                imageWidth={mobile ? '88px' : '120px'}
                imageHeight={mobile ? '88px' : '120px'}
                sx={{
                  cursor: 'zoom-in',
                }}
                onClick={() => imageClick(index)}
              />
              <IconButton
                size="sm"
                variant="solid"
                onClick={() => handleRemoveImage(index)}
                sx={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  minHeight: 24,
                  minWidth: 24,

                  display: 'flex',
                  backgroundColor: 'var(--fortress-palette-brand-warmLinen-200)',
                  color: 'warning.500',
                  width: '24px',
                  height: '24px',
                  justifyContent: 'center',
                  aligntems: 'center',
                  flexShrink: 0,
                }}
              >
                <Close width={14} height={14} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
      {modalContextHolder}
    </Box>
  );
};

const CreditsBanner = ({ imageNumber, contentLength }: { imageNumber: number; contentLength: number }) => {
  const { t } = useTranslation(LocalesNamespace.MODULES_USER, {
    keyPrefix: 'reviewCredits',
  });

  let creditsType = 'noCredits'; // 0: 没有达到门槛， 1：达到 text 门槛 2: 达到 image 门槛
  let color = '#BEBEBE';
  if (contentLength > 49) {
    creditsType = 'textCredits';
    color = '#844025';
    if (imageNumber > 0) {
      creditsType = 'imageCredits';
      color = '#414128';
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 5, height: '42px' }}>
      <Box sx={{ flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="82" height="42" viewBox="0 0 82 42" fill="none">
          <path d="M82 14a7 7 0 1 0 0 14v14H0V28a7 7 0 1 0 0-14V0h82v14z" fill={color} />
        </svg>
        <Box
          sx={{
            position: 'absolute',
            height: '42px',
            overflow: 'hidden',
            width: '50px',
            textOverflow: 'wrap',
            textAlign: 'center',
            top: 0,
            left: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            level="caption2"
            sx={{
              color: 'var(--fortress-palette-brand-warmLinen-500)',
            }}
          >
            {t(creditsType).creditNumber} Credits
          </Typography>
        </Box>
      </Box>
      <Typography level="body2" sx={{ color: 'var(--fortress-palette-brand-mono-700)' }}>
        {t(creditsType).description}
      </Typography>
    </Box>
  );
};

// 表单字段配置
interface ReviewFormData {
  rating: number;
  title: string;
  content: string;
  is_anonymous: boolean;
}

interface ReviewFormProps {
  /**
   * 默认评论数据（编辑模式时使用）
   */
  defaultReview?: ReviewItem;
  /**
   * 表单提交回调 - 接收组装好的数据
   */
  onSubmit: (data: SubmitReviewData) => Promise<void>;
  /**
   * 取消回调
   */
  onCancel: () => void;
  /**
   * 是否为编辑模式
   */
  isEditMode?: boolean;

  isSubmitReview?: boolean;
  modal: any;
}

export default function ReviewForm({
  defaultReview,
  onSubmit,
  onCancel,
  isEditMode = false,
  isSubmitReview = false,
  modal,
}: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [images, setImages] = useState<AttachmentsItemType[]>(defaultReview?.attachments || []);
  const [contentText, setContentText] = React.useState(defaultReview?.content || '');
  const [imageIsDirty, setImageIsDirty] = useState(false);
  const maxLength = 500;
  const { mobile } = useBreakpoints();
  const [open, setOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);
  // 默认值
  const defaultValues: ReviewFormData = {
    rating: defaultReview?.rating || 0,
    title: defaultReview?.title || '',
    content: defaultReview?.content || '',
    is_anonymous: defaultReview?.is_anonymous || false,
  };

  // 监听 defaultReview 变化，更新 images 和 contentText
  useEffect(() => {
    if (defaultReview) {
      setImages(defaultReview.attachments || []);
      setContentText(defaultReview.content || '');
    }
  }, [defaultReview]);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isDirty },
    reset,
    // watch,
  } = useForm<ReviewFormData>({
    mode: 'onChange',
    defaultValues,
  });

  // 当 defaultReview 变化时，重置表单
  useEffect(() => {
    if (defaultReview) {
      reset({
        rating: defaultReview.rating || 0,
        title: defaultReview.title || '',
        content: defaultReview.content || '',
        is_anonymous: defaultReview.is_anonymous || false,
      });
    }
  }, [defaultReview, reset]);

  const handleFormSubmit = async (data: ReviewFormData) => {
    const { rating, title, content } = data;

    if (!rating) {
      modal.confirmation({
        title: 'Please give a rating for reviewed products',
        showCancelBtn: false,
        confirmText: 'OKAY',
      });
      return;
    } else if (!title) {
      modal.confirmation({
        title: 'Please write a short title for reviewed products',
        showCancelBtn: false,
        confirmText: 'OKAY',
      });
      return;
    } else if (!content || content.length < 50) {
      modal.confirmation({
        title: 'The review description should have at least 50 characters',
        showCancelBtn: false,
        confirmText: 'OKAY',
      });
      return;
    }
    try {
      setLoading(true);
      // 组装提交数据，将扁平的表单数据包装成嵌套结构
      const attachmentKeys = images.map((img) => img.key);

      const submitData: SubmitReviewData = {
        review: {
          attachment_keys: attachmentKeys,
          rating: data.rating,
          title: data.title,
          content: data.content,
          is_anonymous: data.is_anonymous,
          variant_code: defaultReview?.variant?.sku,
        },
      };

      await onSubmit(submitData);
    } catch (error) {
      modal.warning({
        title: 'Error',
        desc: 'Failed to submit review. Please try again.',
        showCancelBtn: false,
        confirmText: 'OK',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty || imageIsDirty) {
      modal.confirmation({
        title: 'There are unsaved changes',
        desc: 'Are you sure you want to cancel? Any unsaved changes will be lost.',
        cancelText: 'Discard changes',
        confirmText: 'Continue editing',
        onCancel: onCancel,
      });
    } else {
      onCancel();
    }
  };

  return (
    <>
      <Box sx={{ width: '100%' }}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Stack gap={4}>
              {/* Credits Banner */}
              <CreditsBanner imageNumber={images.length} contentLength={contentText.length || 0} />
              <Controller
                name="rating"
                control={control}
                // rules={validationRules.rating}
                render={({ field }) => (
                  <FormControl sx={{ gap: 1 }}>
                    <Stack sx={{ width: 'fit-content' }}>
                      <InteractiveRating
                        rating={field.value}
                        onRatingChange={field.onChange}
                        size={24}
                        margin={2}
                        innerType="fill"
                        outerColor="#844025"
                        innerColor="#E0E0E0"
                      />
                    </Stack>
                    {errors.rating && (
                      <FormHelperText sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Error width={20} height={20} />
                        {errors.rating.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              {/* Title */}
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <FormControl
                    sx={{
                      gap: 1,
                      [`& .${formHelperTextClasses.root}`]: { mt: 1 },
                      '& .Mui-error': {
                        color: 'var(--fortress-palette-danger-500)',
                      },
                    }}
                  >
                    <FormLabel htmlFor="review-title">
                      <Typography level="body2">Title</Typography>
                    </FormLabel>
                    <Input
                      variant="borderplain"
                      {...field}
                      placeholder="Write a short title"
                      error={!!errors.title}
                      aria-label="Title"
                      slotProps={{
                        input: {
                          id: 'review-title',
                          maxLength: 60,
                        },
                      }}
                    />
                    {errors.title && (
                      <FormHelperText sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Error width={20} height={20} />
                        {errors.title.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <FormControl
                    sx={{
                      gap: 1,
                      [`& .${formHelperTextClasses.root}`]: { mt: 1 },
                      '& .Mui-error': {
                        color: 'var(--fortress-palette-danger-500)',
                      },
                    }}
                  >
                    <FormLabel htmlFor="review-description">
                      <Typography level="body2">Description</Typography>
                    </FormLabel>
                    <Textarea
                      variant="outlined"
                      value={contentText}
                      onChange={(event) => {
                        const value = event.target.value;
                        // 手动限制字符数
                        if (value.length <= maxLength) {
                          setContentText(value);
                          field.onChange(value); // 同步更新表单控制器的值
                        }
                      }}
                      placeholder="What do you like about this product? Please share your thoughts."
                      error={!!errors.content}
                      slotProps={{
                        textarea: {
                          id: 'review-description',
                        },
                      }}
                      endDecorator={
                        <Typography level="body2" sx={{ ml: 'auto' }}>
                          {contentText.length}/{maxLength}
                        </Typography>
                      }
                    />
                    {errors.content && (
                      <FormHelperText sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Error width={20} height={20} />
                        {errors.content.message}
                      </FormHelperText>
                    )}
                  </FormControl>
                )}
              />
            </Stack>

            {/* Image Upload */}
            <FormControl sx={{ gap: 1 }}>
              <FormLabel id="upload-images-label" sx={{ display: 'none' }}>
                <Typography level="body2">Upload images</Typography>
              </FormLabel>
              <ImageUploadComponent
                images={images}
                onImagesChange={setImages}
                maxImages={10}
                onImageIsDirty={setImageIsDirty} // 图片是否修改
                imageClick={(index) => {
                  setOpen(true);
                  setOpenIndex(index);
                }}
                mobile={mobile}
                setImageLoading={setImageLoading}
              />
            </FormControl>

            {/* Anonymous Checkbox */}
            <Controller
              name="is_anonymous"
              control={control}
              render={({ field }) => (
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    aria-label="Submit as an anonymous user"
                    label="Submit as an anonymous user"
                  />
                </FormControl>
              )}
            />

            {/* Form Actions */}
            <Box sx={{ display: 'flex', gap: mobile ? 4 : 6, flexDirection: mobile ? 'column-reverse' : 'row' }}>
              {!isSubmitReview && (
                <Button variant="outlined" color="danger" type="button" onClick={handleCancel} sx={{ minWidth: 120 }}>
                  CANCEL
                </Button>
              )}
              <Button
                variant="solid"
                color="warning"
                type="submit"
                disabled={!isValid || imageLoading || !isDirty}
                loading={loading}
                sx={{ minWidth: 120 }}
              >
                {isEditMode ? 'UPDATE REVIEW' : 'SUBMIT REVIEW'}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
      <PinchZoomViewer
        open={open}
        setOpen={setOpen}
        slideImages={images?.map((item) => ({
          src: item?.url,
          alt: 'attachment',
        }))}
        index={openIndex}
      />
    </>
  );
}
