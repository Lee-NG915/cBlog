'use client';

import type { Theme } from '@castlery/fortress';
import { Link, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { FortressImage, PinchZoomViewer } from '@castlery/shared-components';
import { useState } from 'react';

type ReviewContentProps = {
  title: string;
  content: string;
  attachments: {
    url: string;
  }[];
  replies: {
    content: string;
    replied_by: string;
    attachments: {
      url: string;
    }[];
  }[];
};

const ReviewContent = ({ title, content, attachments, replies }: ReviewContentProps) => {
  const [expanded, setExpanded] = useState(false);
  const [replyExpanded, setReplyExpanded] = useState<{ [key: number]: boolean }>({});
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryImages, setGalleryImages] = useState<{ url: string }[]>([]);
  const { desktop } = useBreakpoints();
  const renderContent = (text: string, maxLength: number) => {
    const isLonger = text.length > 500;
    const truncated = isLonger ? text.slice(0, maxLength).replace(/\s+$/, '') + '…' : text;
    return (
      <p>
        {expanded || !isLonger ? (
          <Typography
            level="body2"
            component="span"
            sx={(theme: Theme) => ({
              display: 'inline',
              overflowWrap: 'anywhere',
              mb: 0,
              maxHeight: {
                sx: theme.spacing(28.5),
                md: theme.spacing(33),
              },
            })}
          >
            {text}
          </Typography>
        ) : (
          <Typography
            level="body2"
            component="span"
            sx={(theme: Theme) => ({
              display: 'inline',
              mb: 0,
              maxHeight: {
                sx: theme.spacing(28.5),
                md: theme.spacing(33),
              },
            })}
          >
            {truncated}
          </Typography>
        )}
        {isLonger && (
          <Link
            onClick={() => setExpanded(!expanded)}
            sx={(theme: Theme) => ({
              ml: theme.spacing(1),
              p: 0,
              minWidth: 'auto',
              verticalAlign: 'baseline',
              textDecoration: 'none',
              color: theme.palette.brand.burntOrange[500],
            })}
            variant="text"
          >
            {expanded ? 'Show Less' : 'Read More'}
          </Link>
        )}
      </p>
    );
  };

  const renderReplyContent = (text: string, replyIndex: number, maxLength = 200) => {
    const isLonger = text.length > maxLength;
    const truncated = isLonger ? text.slice(0, maxLength).replace(/\s+$/, '') + '…' : text;
    const isExpanded = replyExpanded[replyIndex] || false;

    return (
      <div>
        {isExpanded || !isLonger ? (
          <Typography level="body2">{text}</Typography>
        ) : (
          <Typography level="body2">{truncated}</Typography>
        )}
        {isLonger && (
          <Link
            onClick={() => setReplyExpanded((prev) => ({ ...prev, [replyIndex]: !isExpanded }))}
            sx={(theme: Theme) => ({
              ml: theme.spacing(1),
              p: 0,
              minWidth: 'auto',
              textDecoration: 'none',
              color: theme.palette.brand.burntOrange[500],
              display: 'inline-block',
              mt: theme.spacing(1),
            })}
            variant="text"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </Link>
        )}
      </div>
    );
  };

  const renderImages = (images: { url: string }[]) => {
    if (desktop) {
      return (
        <Stack
          sx={(theme) => ({
            gap: {
              xs: theme.spacing(4),
              md: theme.spacing(6),
            },
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            mb: {
              xs: theme.spacing(5),
              md: theme.spacing(6),
            },
          })}
        >
          {images.map((image, index) => (
            <FortressImage
              src={image.url}
              imageWidth={120}
              imageHeight={120}
              alt={`Review thumbnail ${index + 1}`}
              objectFit="cover"
              sx={{
                cursor: 'pointer',
              }}
              onClick={() => {
                setGalleryImages(images);
                setGalleryOpen(true);
                setGalleryIndex(index);
              }}
            />
          ))}
        </Stack>
      );
    }
    return (
      <Stack
        sx={{
          overflow: 'auto',
        }}
      >
        <Stack
          sx={(theme) => ({
            gap: {
              xs: theme.spacing(4),
              md: theme.spacing(6),
            },
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'nowrap',
            mb: {
              xs: theme.spacing(5),
              md: theme.spacing(6),
            },
            width: images.length * 120 + (images.length - 1) * 16,
          })}
        >
          {images.map((image, index) => (
            <FortressImage
              src={image.url}
              imageWidth={120}
              imageHeight={120}
              alt={`Review thumbnail ${index + 1}`}
              objectFit="cover"
              sx={{
                cursor: 'pointer',
              }}
              onClick={() => {
                setGalleryImages(images);
                setGalleryOpen(true);
                setGalleryIndex(index);
              }}
            />
          ))}
        </Stack>
      </Stack>
    );
  };
  const renderReplies = (replies: { content: string; replied_by: string; attachments: { url: string }[] }[]) => {
    if (replies.length === 0) return null;
    return (
      <Stack
        sx={(theme) => ({
          mb: {
            xs: theme.spacing(5),
            md: theme.spacing(6),
          },
          gap: {
            xs: theme.spacing(4),
            md: theme.spacing(6),
          },
        })}
      >
        {replies.map((reply, index) => (
          <Stack
            key={index}
            sx={(theme) => ({
              backgroundColor: theme.palette.brand.warmLinen[500],
              padding: {
                xs: `${theme.spacing(4)} ${theme.spacing(6)}`,
                md: theme.spacing(6),
              },
              gap: {
                xs: theme.spacing(3),
                md: theme.spacing(4),
              },
            })}
          >
            <Typography level="h4">{reply.replied_by}</Typography>
            {renderReplyContent(reply.content, index)}
            {renderImages(reply.attachments)}
          </Stack>
        ))}
      </Stack>
    );
  };
  return (
    <Stack
      sx={(theme) => ({
        flex: 1,
        mb: {
          sx: theme.spacing(5),
          md: theme.spacing(8),
        },
      })}
    >
      <Typography
        level="h4"
        sx={(theme) => ({
          mb: {
            sx: theme.spacing(2),
            md: theme.spacing(4),
          },
        })}
      >
        {title}
      </Typography>
      {renderContent(content, 500)}
      {renderImages(attachments)}
      <PinchZoomViewer
        open={galleryOpen}
        setOpen={setGalleryOpen}
        slideImages={galleryImages.map((attachment, index) => ({
          src: attachment.url,
          alt: `Review image ${index + 1}`,
          width: 120,
          height: 120,
        }))}
        index={galleryIndex}
      />
      {renderReplies(replies)}
    </Stack>
  );
};

export { ReviewContent };
