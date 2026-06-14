import { createAction } from '@reduxjs/toolkit';

export type ChooseFreeGiftLabel = 'miniCart' | 'fullCart';

export interface ChooseFreeGiftClickedPayload {
  /** Cart surface that rendered the Choose your gift entry. */
  label: ChooseFreeGiftLabel;
}

/**
 * @description User clicked the Choose your gift entry to open the gift selection panel.
 * Fires on every valid expand click; no page-view or session deduping.
 */
export const chooseFreeGiftClickedEvent = createAction<ChooseFreeGiftClickedPayload>('promotion/chooseFreeGiftClicked');
