// PDP selector navigation structures
export interface SpuIndexEntry {
  spuGroupId: string;
  spuGroupTitle: string;
  layoutGroupId: string;
  layoutGroupTitle: string;
  categoryGroupId: string;
  categoryGroupTitle: string;
  groupKey: string; // 'fabric' | 'leather' | 'default'
}

export interface SpuItem {
  slug: string;
  name: string;
  image: string; // placeholder, resolved lazily
  isCurrent: boolean;
  attributeTag?: string; // normalized attribute_tag from Storyblok SPU
}

// Product categories, e.g. Sofa, Sofa with Ottoman
export interface CategoryGroup {
  id: string;
  title: string;
  icon?: string; // Storyblok asset URL (icon.filename)
  dimension?: string;
  groupKey?: string; // optional identifier; material buckets carry real keys
  groupKeys?: string[]; // aggregated keys within this category
  groupKeyBuckets?: GroupKeyBucket[]; // aggregated products by groupKey within this category
  showGroupOptions?: boolean; // whether this category has multiple groupKey buckets (buttons)
  activeGroupKey?: string;
  defaultLink?: string;
  isActive?: boolean;
}

// Aggregated by groupKey (e.g. Fabric / Leather)
export interface GroupKeyBucket {
  groupKey: string;
  products: SpuItem[];
  defaultLink: string;
}

// Layout shapes, e.g. L-shape, U-shape, 3-Seater
export interface LayoutGroup {
  id: string;
  title: string;
  defaultLink: string;
  activeCategoryGroupId?: string;
  categoryGroups: CategoryGroup[];
  isActive: boolean;
}

// Top-level SPU grouping (product family)
export interface SpuGroup {
  id: string;
  title: string;
  defaultLink: string;
  layoutGroups: LayoutGroup[];
  isActive: boolean;
  categoryCount: number; // Total number of Category Groups across all Layout Groups in this SPU Group
}

export interface NavigationState {
  spuGroups: SpuGroup[] | null;
}

export interface PDPConfig {
  indexMap: Record<string, SpuIndexEntry>;
  uiTree: NavigationState;
  raw: any; // PdpSelectorConfigStoryblok | null
}

// Product tool interfaces
export interface VideoInfo {
  videoPath: string;
}

export interface ModularTool {
  modular_tool_url?: string;
  configuratorToolBannerDesktop?: string | VideoInfo;
  configuratorToolBannerMobile?: string | VideoInfo;
}

export interface NewRoomTool {
  furniture_tool_url?: string;
  roomDesignerBannerDesktop?: string | VideoInfo;
  roomDesignerBannerMobile?: string | VideoInfo;
}

export type ProductDetailsSectionKey = 'dimensions' | 'seat-comfort' | 'materials' | 'delivery' | 'assembly';
