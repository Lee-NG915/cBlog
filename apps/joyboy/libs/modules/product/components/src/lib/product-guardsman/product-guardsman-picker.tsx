'use client';

import {
  resetSelectedGuardsmanPlanId,
  selectedGuardsmanPlanId,
  selectGuardsmanWarrantyPlans,
  selectVariant,
  selectWarrantyIsFetching,
  setSelectedGuardsmanPlanId,
  guardsmanWarrantyInteractionEvent,
} from '@castlery/modules-product-domain';
import { useAppDispatch, useAppSelector } from '@castlery/shared-redux-store';
import { Loading, RadioButton, RadioGroup, Stack, Typography, useBreakpoints } from '@castlery/fortress';
import { EcEnv } from '@castlery/config';

/**
 * [保险接入] CA PDP 保险 plan 选择器
 * - 数据源: warranty slice guardsmanDiscovery.plans（由 product.listener 写入）
 * - 选中 plan id 存入 selectedGuardsmanPlanId，加车时 resolvePdpLineItem → buildCartWarrantyFields 读取
 * - 再次点击已选 plan 会取消选择（resetSelectedGuardsmanPlanId）
 */
export const ProductGuardsmanPicker = () => {
  const dispatch = useAppDispatch();
  const variant = useAppSelector(selectVariant);
  const warrantyList = useAppSelector(selectGuardsmanWarrantyPlans);
  const currentWarrantyPlanId = useAppSelector(selectedGuardsmanPlanId);
  const isWarrantyListFetching = useAppSelector(selectWarrantyIsFetching);
  const { mobile, tablet } = useBreakpoints();

  return (
    <Stack px={mobile ? 6 : tablet ? 8 : undefined}>
      {warrantyList?.length > 0 && !isWarrantyListFetching && (
        <Stack mt={mobile ? 6 : 8}>
          <Stack>
            <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
              <Typography level="h5">Add furniture protection plan</Typography>
            </Stack>
            <Typography
              level="caption1"
              sx={{
                mt: 1,
              }}
            >
              Protects your product against accidental damage, spills and more for a single price
            </Typography>
          </Stack>
          <RadioGroup name="guardsman-warranty-picker" value={currentWarrantyPlanId}>
            <Stack direction="row" alignItems="center" flexWrap="wrap" mt={4} gap={3}>
              {warrantyList?.map((warranty) => {
                const yearsNum = warranty.term;
                const presentation = `${yearsNum} Year${yearsNum > 1 ? 's' : ''} - ${
                  EcEnv.NEXT_PUBLIC_CURRENCY_SYMBOL
                }${warranty.price}`;
                return (
                  <RadioButton
                    key={warranty.id}
                    value={warranty.id}
                    label={presentation}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      if (warranty.id === currentWarrantyPlanId) {
                        dispatch(resetSelectedGuardsmanPlanId());
                        return;
                      }

                      dispatch(setSelectedGuardsmanPlanId(warranty.id));
                      // [Guardsman 埋点] PDP 选 plan → select_extended_warranty
                      void dispatch(
                        guardsmanWarrantyInteractionEvent({
                          action: 'select_extended_warranty',
                          label: `${yearsNum} Year${yearsNum > 1 ? 's' : ''}`,
                          sku: variant?.sku ?? '',
                          skuName: variant?.product_name ?? variant?.name ?? '',
                          position: 'pdp',
                          price: `${warranty.price}`,
                        })
                      );
                    }}
                  />
                );
              })}
            </Stack>
          </RadioGroup>
        </Stack>
      )}
      {isWarrantyListFetching && <Loading theme="dark" />}
    </Stack>
  );
};
