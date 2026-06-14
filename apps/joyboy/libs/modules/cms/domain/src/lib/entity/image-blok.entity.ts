export interface ImageV2 {
  id: string | null;
  alt: string | null;
  name: string;
  focus: string;
  title: string | null;
  source: string | null;
  filename: string;
  copyright: string | null;
  fieldtype: string;
  meta_data: Record<string, unknown>;
  is_external_url: boolean;
}
