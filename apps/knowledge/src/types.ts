export type Note = {
  id: string;
  slug: string;
  title: string;
  body: string;
  topic_id: string | null;
  state: "draft" | "ready" | "archived";
  visibility: "owner" | "public";
  tags: string;
  version: number;
  updated_at: string;
  deleted_at: string | null;
};
export type Group = {
  id: string;
  name: string;
  kind: "domain" | "topic" | "path" | "project";
  parent_id: string | null;
  position: number;
  version: number;
};
export type Membership = {
  group_id: string;
  note_id: string;
  position: number;
};
export type Corpus = { notes: Note[]; revision: number };
