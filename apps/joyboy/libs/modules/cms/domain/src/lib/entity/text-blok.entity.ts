export interface TextBlokV2 {
  _uid: string;
  text: string;
  component: string;
  text_color: {
    value: string;
    plugin: string;
  };
  text_level: string;
  font_family: string;
  font_weight: string;
  max_text_length: string;
  _editable: string;
  [key: string]: string | { value: string; plugin: string } | any;
}

export type TextStyleBlokV2 = Pick<TextBlokV2, 'text_color' | 'text_level'> & {
  _uid: string;
  component: string;
  _editable: string;
};
