import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ProductDetailsTrigger } from './product-details-trigger';

const mockDispatch = jest.fn();
const mockTrackPdpDetails = jest.fn((payload) => payload);

jest.mock('@castlery/fortress', () => ({
  Box: ({ children }: any) => <div>{children}</div>,
  Divider: () => <div />,
  Stack: ({ children, onClick }: any) => (
    <button onClick={onClick} type="button">
      {children}
    </button>
  ),
  Typography: ({ children }: any) => <span>{children}</span>,
  useBreakpoints: () => ({ desktop: true, mobile: false }),
}));

jest.mock('@castlery/fortress/Icons', () => ({
  ChevronRight: () => <svg data-testid="chevron-right" />,
}));

jest.mock('@castlery/config', () => ({
  enableGuarantee: true,
}));

jest.mock('@castlery/shared-redux-store', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@castlery/modules-tracking-services', () => ({
  EVENT_PDP_DETAILS: (...args) => mockTrackPdpDetails(...args),
}));

describe('ProductDetailsTrigger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks pdp details click with the mapped action before opening the section', async () => {
    const onOpen = jest.fn();

    render(<ProductDetailsTrigger onOpen={onOpen} />);

    fireEvent.click(screen.getByText('Materials'));

    expect(mockTrackPdpDetails).toHaveBeenCalledWith({
      action: 'Materials',
      label: 'click',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      action: 'Materials',
      label: 'click',
    });
    await waitFor(() => {
      expect(onOpen).toHaveBeenCalledWith('materials');
    });
  });

  it('uses the shared mapped delivery action copy', () => {
    render(<ProductDetailsTrigger onOpen={jest.fn()} />);

    fireEvent.click(screen.getByText('Delivery, guarantee and returns'));

    expect(mockTrackPdpDetails).toHaveBeenCalledWith({
      action: 'Delivery,warranty and returns',
      label: 'click',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      action: 'Delivery,warranty and returns',
      label: 'click',
    });
  });
});
