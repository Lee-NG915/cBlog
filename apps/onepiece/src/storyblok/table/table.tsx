import React, { useRef } from 'react';
import { Typography, Box, useTheme, Container } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react';
import { Table as MUITable } from '@mui/joy';
import { useAnchorScroll } from '../hooks/anchor';

type TableData = {
  _uid?: string;
  value?: string;
  emptyCellsCount?: number;
};

type TableProps = {
  blok: {
    _uid?: string;
    table?: {
      thead?: TableData[];
      tbody?: {
        _uid?: string;
        body: TableData[];
      }[];
    };
    anchor_link?: string;
    text_color?: string;
    table_border_color?: string;
  };
};

function Table({ blok }: TableProps) {
  const { _uid, table, anchor_link, text_color, table_border_color } = blok || {};
  const { thead, tbody } = table || {};
  const theme = useTheme();
  const textColor = text_color || theme.palette.brand.charcoal[800];
  const borderColor = table_border_color || theme.palette.brand.charcoal[800];

  function findConsecutiveZerosAfterText(arr: TableData[]): TableData[] {
    const result: TableData[] = [];
    let emptyCellsCount = 0;

    for (let i = arr.length - 1; i > 0; i--) {
      if (arr[i].value) {
        result.push({ ...arr[i], emptyCellsCount });
        emptyCellsCount = 0;
      } else {
        emptyCellsCount++;
      }
    }
    result.push({ value: arr[0].value, emptyCellsCount });

    return result.reverse();
  }

  const filteredThead = findConsecutiveZerosAfterText(thead || []);

  const filteredTbody = tbody?.map((tbodyItem) => ({
    ...tbodyItem,
    body: findConsecutiveZerosAfterText(tbodyItem.body),
  }));

  const blokRef = useRef(null);
  useAnchorScroll({
    ref: blokRef,
    anchorLink: anchor_link,
  });

  return (
    <Container {...storyblokEditable(blok)} key={_uid} ref={blokRef} id={anchor_link?.slice(1)}>
      <MUITable
        borderAxis="both"
        sx={() => ({
          maxWidth: '922px',
          margin: '0 auto',
          '& tr': {
            textAlign: 'center',
            th: {
              fontWeight: 400,
              borderColor,
              textAlign: 'center',
              py: theme.spacing(1.75),
              wordWrap: 'break-word',
              whiteSpace: 'pre-line',
              verticalAlign: 'middle',
              '&:last-of-type[colspan]': {
                borderRight: `1px solid ${borderColor}`,
              },
              ':not([colspan])': {
                borderWidth: '1px',
              },
            },
            td: {
              borderColor,
              py: theme.spacing(1.75),
              wordWrap: 'break-word',
              '&:last-of-type[colspan]': {
                borderRight: `1px solid ${borderColor}`,
              },
            },
          },
        })}
      >
        {thead?.length === 2 && (
          <colgroup>
            <col style={{ width: '33.18%' }} />
            <col style={{ width: '66.82%' }} />
          </colgroup>
        )}

        <thead>
          <tr>
            {filteredThead?.map((headItem) => {
              const { _uid, emptyCellsCount, value } = headItem || {};
              return (
                <th
                  key={_uid}
                  {...(emptyCellsCount && {
                    colSpan: emptyCellsCount + 1,
                  })}
                >
                  <Typography
                    level="body2"
                    sx={{
                      color: textColor,
                    }}
                  >
                    {value}
                  </Typography>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {filteredTbody?.map((tbodyItem) => {
            const { _uid, body } = tbodyItem || {};
            return (
              <tr key={_uid}>
                {body.map((bodyItem) => {
                  const { _uid, emptyCellsCount, value } = bodyItem || {};

                  return (
                    <td
                      key={_uid}
                      {...(emptyCellsCount && {
                        colSpan: emptyCellsCount + 1,
                      })}
                    >
                      <Typography
                        level="body2"
                        sx={{
                          color: textColor,
                        }}
                      >
                        {value}
                      </Typography>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </MUITable>
    </Container>
  );
}

export { Table };
