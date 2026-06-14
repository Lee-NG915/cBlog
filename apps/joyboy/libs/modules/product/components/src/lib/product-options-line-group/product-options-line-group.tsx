import { List } from '@castlery/fortress';
import ProductOptionsLine, {
  ButtonItemOption,
  OptionSelectChangeValueType,
  calcActionType,
} from './product-options-line';
import { OptionValue } from '@castlery/modules-product-domain';

/* eslint-disable-next-line */
export interface ProductOptionsLineGroupProps {
  optionTypes: {
    id?: number;
    name?: string;
    presentation: string;
    values?: OptionValue[];
  }[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optionSelected?: Record<string, any>;
  onOptionSelectChange?: (name: string, value: OptionSelectChangeValueType) => void;
}

export function ProductOptionsLineGroup(props: ProductOptionsLineGroupProps) {
  const { optionTypes, optionSelected, onOptionSelectChange } = props;
  const handleOptionSelectChange = (name: string, value: { id?: number; calcAction?: calcActionType }) => {
    if (onOptionSelectChange) {
      onOptionSelectChange(name || '', value);
    }
  };
  if (!optionTypes || optionTypes.length === 0 || !optionSelected) {
    return null;
  }
  return (
    <List>
      {optionTypes.map((item, index) => {
        let selectedId = -1;
        if (item?.name) {
          selectedId = optionSelected[item?.name];
        }
        return (
          <ProductOptionsLine
            key={item.id}
            selectedId={selectedId}
            displayType={ButtonItemOption.Button}
            quantity={selectedId === -1 ? optionSelected.quantity : undefined}
            onOptionSelectChange={(value) => handleOptionSelectChange(item.name || '', value)}
            {...item}
          />
        );
      })}
    </List>
  );
}

export default ProductOptionsLineGroup;
