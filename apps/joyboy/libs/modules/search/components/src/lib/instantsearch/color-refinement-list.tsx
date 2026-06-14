import { useRefinementList, UseRefinementListProps } from 'react-instantsearch';
import { OptionSelector, OptionItem } from '@castlery/shared-components';

export type ColorRefinementListProps = UseRefinementListProps;

function colorToImage(color: string) {
  return `https://d1qikdlbmwrjn6.cloudfront.net/knight-color-tone/${color}-tone.jpg`;
}

export function ColorRefinementList(props: ColorRefinementListProps) {
  const { items, refine } = useRefinementList({
    limit: 20,
    ...props,
  });

  const options: OptionItem[] = items.map((item) => ({
    id: item.value,
    value: item.value,
    label: item.label,
    image: colorToImage(item.value),
    isSelected: item.isRefined,
  }));

  const handleSelect = (optionId: string) => {
    refine(optionId);
  };

  return (
    <OptionSelector
      options={options}
      maxDisplay={items.length}
      size={24}
      showAdditionalCount={false}
      onSelect={handleSelect}
      allowWrap={true}
      sx={{
        justifyContent: 'flex-start',
      }}
    />
  );
}
