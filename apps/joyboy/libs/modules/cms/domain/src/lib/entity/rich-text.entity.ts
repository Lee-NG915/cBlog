export interface RichTextV2 {
  type: string;
  content: {
    type: string;
    content: {
      text: string;
      type: string;
    }[];
  }[];
}
