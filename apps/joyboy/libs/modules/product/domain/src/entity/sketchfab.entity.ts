export enum SketchfabEvent {
  VIEWER_READY = 'viewerready',
  CAMERA_START = 'camerastart',
  CAMERA_STOP = 'camerastop',
  ANIMATION_START = 'animationstart',
  ANIMATION_STOP = 'animationstop',
}

// 基础类型定义
export interface VariantInfo {
  id: string;
  name: string;
  checkoutTitle: any;
  checkoutSubtitle: string;
  price: string;
}

export interface CameraPosition {
  position: [number, number, number];
  target: [number, number, number];
}

export interface BackgroundOptions {
  color: [number, number, number];
  opacity?: number;
  transparent?: boolean;
}

export interface SketchfabError {
  message: string;
  code?: number;
  type?: string;
}

export type SketchfabEventCallback = () => void;

// API 接口定义
export interface SketchfabAPI {
  start: () => void;
  stop: (callback: () => void) => void;
  startAR: () => void;
  addEventListener: (event: SketchfabEvent | string, callback: SketchfabEventCallback) => void;
  removeEventListener: (event: SketchfabEvent | string, callback: SketchfabEventCallback) => void;
  setBackground: (options: BackgroundOptions, callback?: (error?: SketchfabError) => void) => void;
  getCameraLookAt: (callback: (error: SketchfabError | null, camera?: CameraPosition) => void) => void;
  setCameraLookAt: (
    position: [number, number, number],
    target: [number, number, number],
    duration: number,
    callback?: (error: SketchfabError | null) => void
  ) => void;
}

export interface SketchfabInitOptions {
  success: (api: SketchfabAPI) => void;
  error: (error: SketchfabError) => void;
  autostart: number;
  autospin: number;
  annotation_tooltip_visible: number;
  annotations_visible: number;
  camera: number;
  ui_stop: number;
  ui_animations: number;
  ui_annotations: number;
  ui_controls: number;
  ui_fadeout: number;
  ui_hint: number;
  ui_infos: number;
  ui_loading: number;
  ui_watermark: number;
  ui_ar_help: number;
  prevent_user_light_rotation: number;
  preload: number;
  orbit_constraint_zoom_in: number;
  orbit_constraint_zoom_out: number;
  orbit_constraint_pitch_up: number;
  orbit_constraint_pitch_down: number;
}

export interface SketchfabClient {
  init: (uid: string, options: SketchfabInitOptions) => void;
}

export type SketchfabConstructor = new (version: string, element: HTMLElement) => SketchfabClient;

// 组件 Props 接口
export interface SketchfabViewerProps {
  uid: string;
  variantInfo?: VariantInfo;
  handleThreeDView: (show: boolean) => void;
  defaultStartAR?: boolean;
  onModelLoadTime?: (loadTime: string, modelId: string) => void;
  onARClick?: (label: string) => void;
  onARImpression?: (label: string) => void;
  onBack?: () => void;
  onError?: (message: string) => void;
}

// AR 模型相关类型
export interface GetARModelParams {
  uid: string;
  platform: 'ios' | 'android';
}

export interface ARModelResponse {
  url?: string;
  error?: string;
  errMsg?: string;
}

export interface ARModelError {
  message: string;
  code?: number;
  type?: 'network' | 'api' | 'validation' | 'unknown';
}

// 全局类型扩展
declare global {
  interface Window {
    Sketchfab: SketchfabConstructor;
  }
}
