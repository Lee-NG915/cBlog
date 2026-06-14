export interface Link {
  id: string;
  url: string;
  linktype: string;
  fieldtype: string;
  cached_url: string;
}

export interface Icon {
  _uid: string;
  name: string;
  color: {
    value: string;
    plugin: string;
  };
  component: string;
  icon_width: string;
  icon_height: string;
  _editable: string;
}

export interface LinkBlokV2 {
  url: Link;
  _uid: string;
  component: string;
  key: string;
  display_text: string;
  isExternalUrl: boolean;
  url_external_internal: string;
  link_style: {
    underline: string;
    variant: string;
    color: any;
    text_level: string;
    mobile_font_size: string;
    tablet_font_size: string;
    desktop_font_size: string;
  }[];
  open_new_tab: boolean;
  start_decorator: Icon[];
  end_decorator: Icon[];
  _editable: string;
  [key: string]: string | boolean | Link | Icon[] | any;
  data_selenium?: string;
}
