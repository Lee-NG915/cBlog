'use client';

import React from 'react';
import { Typography, Box, useTheme, useBreakpoints, Container } from '@castlery/fortress';
import { storyblokEditable } from '@storyblok/react';
import { Table as MUITable } from '@mui/joy';
import { DtStack } from '@castlery/modules-tracking-components';
import { deepClone } from '@castlery/modules-product-components';

type TableData = {
  _uid: string;
  value?: string;
  rowMergeNum?: number;
  colMergeNum?: number;
  needHide?: boolean;
};

type LastSameValueProps = {
  value: string | undefined;
  index: number | undefined;
  count: number;
};

type LastSameValueInRowProps = {
  value: string | undefined;
  index: number | undefined;
  count: number;
  hasMergeInRow: boolean;
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
    border_color?: { value: string };
    header_background_color?: { value: string };
  };
};

const BlogTable = ({ blok }: TableProps) => {
  const { _uid, table, border_color, header_background_color } = blok || {};
  const { thead, tbody } = table || {};
  const { value: borderColor } = border_color || {};
  const { value: headerBackgroundColor } = header_background_color || {};
  const theme = useTheme();

  const { desktop } = useBreakpoints();

  const cloneTbody = deepClone(tbody);

  const verticalMerging = (arr: TableData[][]) => {
    // const rowNum = arr.length;
    const columnNum = arr[0].length;
    const verticalArr = Array.from(new Array(columnNum), () => []);
    let count = -1;
    const filledVerticalArr = verticalArr.map(() => {
      count++;
      return arr.map((arrItem) => arrItem[count]);
    });
    filledVerticalArr.forEach((item) => {
      let lastSameValue: LastSameValueProps = {
        value: undefined,
        index: undefined,
        count: 0,
      };
      item.forEach((subItem, index) => {
        if (subItem.value === lastSameValue.value) {
          lastSameValue.count++;
          subItem.needHide = true;
        } else {
          lastSameValue = {
            value: subItem.value,
            index,
            count: 1,
          };
        }
        if (lastSameValue.count > 1 && lastSameValue.index !== undefined) {
          item[lastSameValue.index].rowMergeNum = lastSameValue.count;
        }
      });
    });
  };

  const horizontalMerging = (arr: TableData[][]) => {
    arr.forEach((item) => {
      let lastSameValue: LastSameValueInRowProps = {
        value: undefined,
        index: undefined,
        count: 0,
        hasMergeInRow: false,
      };
      item.forEach((subItem, index) => {
        if (subItem.value === lastSameValue.value) {
          lastSameValue.count++;
          if (!lastSameValue.hasMergeInRow) {
            subItem.needHide = true;
          }
        } else {
          lastSameValue = {
            value: subItem.value,
            index,
            count: 1,
            hasMergeInRow: !!subItem.needHide,
          };
        }
        if (lastSameValue.count > 1 && lastSameValue.index !== undefined) {
          item[lastSameValue.index].colMergeNum = lastSameValue.count;
        }
      });
    });
  };

  verticalMerging(cloneTbody?.map((tbodyItem) => tbodyItem.body) || []);
  horizontalMerging(cloneTbody?.map((tbodyItem) => tbodyItem.body) || []);

  return (
    <DtStack useImpression {...storyblokEditable(blok)} key={_uid} uid={_uid} componentName="blog-table">
      <Container>
        <Box
          sx={{
            margin: '0 auto',
            // minWidth: desktop ? '922px' : 0,
            // maxWidth: '922px',
            display: 'flex',
            justifyContent: desktop ? 'center' : 'flex-start',
            overflowX: 'auto',
          }}
        >
          <MUITable
            borderAxis="both"
            sx={() => ({
              maxWidth: '922px',
              width: 'auto',
              marginBottom: theme.spacing(3),
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
                {thead?.map((headItem) => {
                  const { _uid, value } = headItem || {};
                  return (
                    <th
                      key={_uid}
                      style={{
                        backgroundColor: headerBackgroundColor,
                      }}
                    >
                      <Typography
                        level="body2"
                        sx={{
                          color: theme.palette.brand.charcoal[900],
                          textAlign: 'left',
                          '& a': {
                            color: '#4768cb',
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        <span
                          style={{
                            width: '100%',
                          }}
                          dangerouslySetInnerHTML={{ __html: value || '' }}
                        />
                      </Typography>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {cloneTbody?.map((tbodyItem) => {
                const { _uid, body } = tbodyItem || {};
                return (
                  <tr key={_uid}>
                    {body.map((bodyItem) => {
                      const { _uid, value } = bodyItem || {};
                      return (
                        <td
                          key={_uid}
                          rowSpan={bodyItem.rowMergeNum || 1}
                          colSpan={bodyItem.colMergeNum || 1}
                          style={{
                            display: bodyItem.needHide ? 'none' : 'table-cell',
                          }}
                        >
                          <Typography
                            level="body2"
                            sx={{
                              color: theme.palette.brand.charcoal[900],
                              textAlign: 'left',
                              '& a': {
                                color: '#4768cb',
                                textDecoration: 'underline',
                              },
                            }}
                          >
                            <span
                              style={{
                                width: '100%',
                              }}
                              dangerouslySetInnerHTML={{ __html: value || '' }}
                            />
                          </Typography>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </MUITable>
        </Box>
      </Container>
    </DtStack>
  );
};

export { BlogTable };
