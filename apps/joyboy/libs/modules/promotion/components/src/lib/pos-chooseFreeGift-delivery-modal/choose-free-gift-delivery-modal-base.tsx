import {
  Modal,
  Sheet,
  Typography,
  Button,
  Box,
  Stack,
  FormControl,
  FormLabel,
  Select,
  Option,
  CircularProgress,
} from '@castlery/fortress';
import { Close } from '@castlery/fortress/Icons';

export interface ChooseFreeGiftDeliveryModalBaseProps {
  open: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  locations: { id: string; name: string }[] | undefined;
  deliveryMethods: string[];
  location: string;
  onLocationChange: (value: string) => void;
  deliveryMethod: string | null;
  onDeliveryMethodChange: (value: string | null) => void;
  loading: boolean;
  /** Inventory check in progress: full-sheet overlay, not the confirm button spinner */
  inventoryChecking?: boolean;
  inStock?: boolean;
  confirmText?: string;
}

export const ChooseFreeGiftDeliveryModalBase = ({
  open,
  onDismiss,
  onConfirm,
  locations,
  deliveryMethods,
  location,
  onLocationChange,
  deliveryMethod,
  onDeliveryMethodChange,
  loading,
  inventoryChecking = false,
  inStock,
  confirmText,
}: ChooseFreeGiftDeliveryModalBaseProps) => {
  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={open}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        '&:focus-visible': { outline: 'none' },
      }}
    >
      <Sheet
        sx={{
          width: 576,
          px: 4,
          py: 3,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {inventoryChecking && (
          <Box
            aria-busy
            aria-live="polite"
            sx={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.45)' : 'rgba(255, 255, 255, 0.72)'),
              pointerEvents: 'auto',
            }}
          >
            <CircularProgress size="lg" color="neutral" />
          </Box>
        )}
        <Box
          onClick={onDismiss}
          sx={{
            position: 'absolute',
            top: 24,
            right: 16,
            zIndex: 11,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
          }}
        >
          <Close sx={{ width: 24, height: 24, fill: (theme) => theme.palette.brand.wheat[500] }} />
        </Box>

        <Typography id="modal-title" level="h2" textAlign="center" sx={{ mt: 3 }}>
          Gift will be added to cart.
        </Typography>

        <Typography
          id="modal-desc"
          level="body2"
          sx={{
            textAlign: 'center',
            color: 'text.primary',
            mt: 1,
            width: '100%',
          }}
        >
          Please choose a collection or delivery method.
        </Typography>

        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, py: 2, mb: 3 }}>
          <FormControl required>
            <FormLabel>
              <Typography sx={{ color: (theme) => theme.palette.brand.charcoal[500], marginBottom: 1 }}>
                Location
              </Typography>
            </FormLabel>
            <Select
              name="location"
              value={location}
              variant="borderplain"
              disabled={loading}
              onChange={(_, value) => onLocationChange(value as string)}
              sx={{ boxShadow: 'none' }}
            >
              {locations && locations.length > 0 ? (
                locations.map(({ id, name }) => (
                  <Option key={id} value={id + ''}>
                    {name}
                  </Option>
                ))
              ) : (
                <Option key="Warehouse" value="Warehouse">
                  Warehouse
                </Option>
              )}
            </Select>
          </FormControl>

          <FormControl required>
            <FormLabel>
              <Typography sx={{ color: (theme) => theme.palette.brand.charcoal[500], marginBottom: 1 }}>
                Collection/Delivery Method
              </Typography>
            </FormLabel>
            <Select
              name="deliveryMethod"
              variant="borderplain"
              value={deliveryMethod}
              onChange={(_, value) => onDeliveryMethodChange(value as string | null)}
              sx={{ boxShadow: 'none' }}
            >
              {deliveryMethods.map((method) => (
                <Option key={method} value={method}>
                  {method}
                </Option>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Stack direction="row" spacing={2} width="100%">
          <Button
            variant="secondary"
            color="neutral"
            fullWidth
            onClick={onDismiss}
            sx={{ py: 1.5, fontSize: 'body1.fontSize' }}
          >
            Cancel
          </Button>
          <Button
            loading={loading}
            variant="solid"
            color="primary"
            fullWidth
            type="submit"
            disabled={inStock === false || !deliveryMethod}
            onClick={onConfirm}
            sx={{
              py: 1.5,
              fontSize: 'body1.fontSize',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            {confirmText ? confirmText : 'Add To Cart'}
          </Button>
        </Stack>
      </Sheet>
    </Modal>
  );
};

export default ChooseFreeGiftDeliveryModalBase;
