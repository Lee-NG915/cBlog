export interface StoryRoot {
  story: Story;
  cv: number;
  rels: any[];
  links: any[];
}

export interface Story {
  name: string;
  created_at: string;
  published_at: any;
  id: number;
  uuid: string;
  content: Content;
  slug: string;
  full_slug: string;
  sort_by_date: any;
  position: number;
  tag_list: any[];
  is_startpage: boolean;
  parent_id: number;
  meta_data: any;
  group_id: string;
  first_published_at: any;
  release_id: any;
  lang: string;
  path: any;
  alternates: any[];
  default_full_slug: any;
  translated_slugs: any;
}

export interface Content {
  _uid: string;
  body: Body[];
  component: string;
  _editable: string;
}

export interface Body {
  _uid: string;
  title: string;
  cms_slug: string;
  tracking: Tracking[];
  component: string;
  menu_component_data: MenuComponentDaum[];
  _editable: string;
}

export interface Tracking {
  _uid: string;
  component: string;
  event_type: string;
  event_detail: EventDetail[];
  target_element_selector: TargetElementSelector[];
  _editable: string;
}

export interface EventDetail {
  _uid: string;
  component: string;
  event_name: string;
  customed_data: any[];
  data_template: string;
  endpoint_name: string;
  _editable: string;
}

export interface TargetElementSelector {
  _uid: string;
  slug: string;
  type: string;
  component: string;
  _editable: string;
}

export interface MenuComponentDaum {
  _uid: string;
  slug: string;
  blocks: any[];
  component: string;
  _editable: string;
}
