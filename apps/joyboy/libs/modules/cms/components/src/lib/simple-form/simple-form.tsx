'use client';

import { SimpleForm as SimpleFormComponent } from '@castlery/shared-components';
import { Stack } from '@castlery/fortress';
import { useEffect, useState } from 'react';

interface SimpleFormProps {
  blok: {
    title: string;
    description: string;
    columns: any[];
    submitUrl: string;
    receiveEmailCheck: boolean;
    extraTips: string;
  };
}

const SimpleForm = ({ blok }: SimpleFormProps) => {
  const { title, description, columns, submitUrl, receiveEmailCheck, extraTips } = blok;
  const [decoratedColumns, setDecoratedColumns] = useState<any[]>([]);

  useEffect(() => {
    const tempColumns: any[] = [];
    columns.forEach((row) => {
      const tempRow: any[] = [];
      row.form_field.forEach((field: any) => {
        if (field.type === 'select') {
          const tempSelectOptions: { [key: string]: string } = {};
          const tempArr = [...field.selectOption];
          tempArr.forEach((option: any) => {
            tempSelectOptions[option.key] = option.value;
          });
          field.selectOptions = tempSelectOptions;
          tempRow.push(field);
        } else if (field?.mustDisplayConditions && Array.isArray(field?.mustDisplayConditions)) {
          const tempMustDisplayConditions: any = {};
          field.mustDisplayConditions.forEach((condition: any) => {
            tempMustDisplayConditions[condition.key] = [condition.value];
          });
          field.mustDisplayConditions = tempMustDisplayConditions;
        } else {
          tempRow.push(field);
        }
      });
      tempColumns.push(tempRow);
    });
    setDecoratedColumns(tempColumns);
  }, [columns]);

  return (
    <Stack
      sx={(theme) => ({
        padding: {
          xs: `0 ${theme.spacing(6)}`,
          md: `0 ${theme.spacing(15)}`,
        },
      })}
    >
      <SimpleFormComponent
        title={title}
        description={description}
        columns={decoratedColumns}
        submitUrl={submitUrl}
        receiveEmailCheck={receiveEmailCheck}
        extraTips={extraTips === 'true'}
        inTrade={true}
      />
    </Stack>
  );
};

export { SimpleForm };
