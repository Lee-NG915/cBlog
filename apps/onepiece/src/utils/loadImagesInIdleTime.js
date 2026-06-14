import { requestIdleCallback } from './request-idle-callback';
import { loadImages } from './image';

/**
 *
 * @param {*} images
 * @param {*} callback
 * @param {*} batchSize
 */
export function loadImagesInIdleTime(images, callback = () => {}, batchSize = 2, maxRetryCount = 3) {
  if (!Array.isArray(images)) return;
  let currentIndex = 0;
  let endIndex = 0;
  let remainingImages = [];
  let errorFlag = false;
  let loading = false;
  let retryCount = 0; // 记录重试次数
  let shouldCancel = false;
  function errorHandler(loadNextImage) {
    retryCount++; // 增加重试次数
    loading = false;
    if (retryCount <= maxRetryCount) {
      // 还未达到最大重试次数，则进行重试
      return requestIdleCallback(loadNextImage);
    }
    // 达到最大重试次数，设置errorFlag为true
    errorFlag = true;
  }
  function loadHandler(loadNextImage) {
    retryCount = 0; // 重置重试次数
    loading = false;
    currentIndex = endIndex;
    remainingImages = [];
    if (currentIndex < images.length) {
      return requestIdleCallback(loadNextImage);
    }
  }
  function loadNextImage(deadline) {
    if (!deadline) {
      return requestIdleCallback(loadNextImage);
    }
    if (shouldCancel) {
      return;
    }
    while (deadline?.timeRemaining() > 0 && currentIndex < images.length) {
      if (errorFlag || loading) return;
      endIndex = Math.min(currentIndex + batchSize, images.length);
      loading = true;
      if (remainingImages.length > 0) {
        loadImages(remainingImages)
          // eslint-disable-next-line no-loop-func
          .then(() => {
            loadHandler(loadNextImage);
          })
          // eslint-disable-next-line no-loop-func
          .catch((error) => {
            console.error(
              JSON.stringify({ message: 'Error loading remaining images', error: error.toString() }, null, 2)
            );
            errorHandler(loadNextImage);
          });
      } else {
        const startIndex = currentIndex;
        const imagesToLoad = images.slice(startIndex, endIndex);
        remainingImages = imagesToLoad;
        loadImages(imagesToLoad)
          // eslint-disable-next-line no-loop-func
          .then(() => {
            loadHandler(loadNextImage);
          })
          // eslint-disable-next-line no-loop-func
          .catch((error) => {
            console.error(JSON.stringify({ message: 'Error loading images', error: error.toString() }, null, 2));
            errorHandler(loadNextImage);
          });
      }
    }
    if (currentIndex >= images.length && remainingImages.length === 0) {
      callback();
    }
  }

  loadNextImage();

  return function cancel() {
    shouldCancel = true;
  };
}
