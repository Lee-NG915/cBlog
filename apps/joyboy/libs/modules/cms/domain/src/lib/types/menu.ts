export type MenuItemBlockType = {
  link: string;
  published_at: string;
  ended_at: string;
};

export type MenuItemType = {
  slug: string;
  _uid: string;
  limit_num?: number;
  blocks: MenuItemBlockType[];
};

export type MenuType = {
  story: {
    content: {
      items: MenuItemType[];
    };
  };
};
