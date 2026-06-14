import { fireEvent, render, screen } from '@testing-library/react';
import { ProductDetailsDrawer } from './product-details-drawer';

const mockDispatch = jest.fn();
const mockTrackPdpDetails = jest.fn((payload) => payload);

jest.mock('@castlery/fortress', () => ({
  Accordion: ({ children, onChange, expanded }: any) => (
    <div>
      <button
        data-testid={`accordion-toggle-${children[0]?.props?.children}`}
        onClick={() => onChange?.({}, !expanded)}
        type="button"
      />
      {children}
    </div>
  ),
  AccordionDetails: ({ children }: any) => <div>{children}</div>,
  AccordionSummary: ({ children }: any) => <div>{children}</div>,
  Box: ({ children }: any) => <div>{children}</div>,
  AccordionGroup: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  Divider: () => <div />,
  Drawer: ({ children, open }: any) => (open ? <div>{children}</div> : null),
  ModalClose: () => <button type="button">close</button>,
  Stack: ({ children }: any) => <div>{children}</div>,
  Typography: ({ children }: any) => <span>{children}</span>,
  useBreakpoints: () => ({ desktop: true }),
}));

jest.mock('@castlery/config', () => ({
  enableGuarantee: true,
  EcEnv: {
    NEXT_PUBLIC_COUNTRY: 'US',
  },
}));

jest.mock('@castlery/shared-redux-store', () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@castlery/modules-tracking-services', () => ({
  EVENT_PDP_DETAILS: (...args) => mockTrackPdpDetails(...args),
}));

jest.mock('./product-dimension', () => ({
  ProductDimension: () => <div>dimension</div>,
}));

jest.mock('./comfort-rating', () => ({
  ComfortRating: () => <div>comfort</div>,
}));

jest.mock('./product-property-paris', () => ({
  ProductPropertyParis: ({ propertyName }: { propertyName: string }) => <div data-testid="paris">{propertyName}</div>,
}));

jest.mock('./product-ai-property', () => ({
  ProductAIProperty: ({ aiData }: { aiData?: { aiVideos: unknown[]; aiDocs: unknown[] } }) => (
    <div data-testid="product-ai-property">{JSON.stringify(aiData)}</div>
  ),
}));

describe('ProductDetailsDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders ProductAIProperty directly for assembly', () => {
    render(
      <ProductDetailsDrawer
        open
        onClose={jest.fn()}
        initialSection="assembly"
        showAssembly
        assemblyAiData={{
          aiVideos: [{ id: 1 }],
          aiDocs: [{ id: 2 }],
        }}
      />
    );

    expect(screen.getAllByTestId('paris').map((item) => item.textContent)).toEqual([
      'product_dimensions',
      'product_details',
      'delivery_returns',
      'assembly',
    ]);
    expect(screen.getByText('Delivery, guarantee and returns')).toBeTruthy();
    expect(screen.getByTestId('product-ai-property').textContent).toContain('"aiVideos":[{"id":1}]');
  });

  it('dispatches pdp details tracking when an accordion is toggled', () => {
    render(<ProductDetailsDrawer open onClose={jest.fn()} initialSection="dimensions" />);

    fireEvent.click(screen.getByTestId('accordion-toggle-Dimensions'));

    expect(mockTrackPdpDetails).toHaveBeenCalledWith({
      action: 'Dimensions',
      label: 'close',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      action: 'Dimensions',
      label: 'close',
    });
  });

  it('normalizes seat comfort tracking action before dispatching', () => {
    render(<ProductDetailsDrawer open onClose={jest.fn()} initialSection="dimensions" />);

    fireEvent.click(screen.getByTestId('accordion-toggle-Seat comfort'));

    expect(mockTrackPdpDetails).toHaveBeenCalledWith({
      action: 'Seat comfort',
      label: 'expand',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      action: 'Seat comfort',
      label: 'expand',
    });
  });

  it('uses the new delivery tracking action copy', () => {
    render(<ProductDetailsDrawer open onClose={jest.fn()} initialSection="dimensions" />);

    fireEvent.click(screen.getByTestId('accordion-toggle-Delivery, guarantee and returns'));

    expect(mockTrackPdpDetails).toHaveBeenCalledWith({
      action: 'Delivery,warranty and returns',
      label: 'expand',
    });
    expect(mockDispatch).toHaveBeenCalledWith({
      action: 'Delivery,warranty and returns',
      label: 'expand',
    });
  });
});
