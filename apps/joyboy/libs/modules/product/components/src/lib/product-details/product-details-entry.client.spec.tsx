import { fireEvent, render, screen } from '@testing-library/react';
import { ProductDetailsEntryClient } from './product-details-entry.client';

jest.mock('@castlery/fortress', () => ({
  Box: ({ children, ...rest }: any) => <div {...rest}>{children}</div>,
  Stack: ({ children, onClick }: any) => <div onClick={onClick}>{children}</div>,
  Typography: ({ children }: any) => <span>{children}</span>,
}));

jest.mock('@castlery/fortress/Icons', () => ({
  ChevronRight: () => <svg data-testid="chevron-right" />,
}));

jest.mock('@castlery/modules-product-domain', () => ({
  selectProduct: Symbol('selectProduct'),
  selectVariant: Symbol('selectVariant'),
  selectVariantIds: Symbol('selectVariantIds'),
  selectWarrantyList: Symbol('selectWarrantyList'),
  selectHasWarrantyPlans: Symbol('selectHasWarrantyPlans'),
  selectAssemblyAiData: Symbol('selectAssemblyAiData'),
}));

const mockUseAppSelector = jest.fn();
const mockDispatch = jest.fn();

jest.mock('@castlery/shared-redux-store', () => ({
  useAppSelector: (selector: unknown) => mockUseAppSelector(selector),
  useAppDispatch: () => mockDispatch,
}));

jest.mock('@castlery/modules-product-services', () => ({
  getAssemblerInstructionCommand: jest.fn(() => ({ type: 'getAssemblerInstructionCommand' })),
}));

jest.mock('@castlery/shared-services', () => ({
  sharedFeatureService: {
    enabledOrderV2: true,
    isGuardsmanEnabled: () => false,
    isMulberryEnabled: () => true,
  },
}));

jest.mock('./components/product-details-trigger', () => ({
  ProductDetailsTrigger: ({ onOpen, showAssembly }: { onOpen: (section: string) => void; showAssembly?: boolean }) => (
    <div>
      <button onClick={() => onOpen('materials')}>Materials</button>
      {showAssembly ? <button onClick={() => onOpen('assembly')}>Assembly</button> : null}
    </div>
  ),
}));

jest.mock('./components/product-details-drawer', () => ({
  ProductDetailsDrawer: ({
    open,
    initialSection,
    showAssembly,
  }: {
    open: boolean;
    initialSection: string;
    showAssembly?: boolean;
  }) =>
    open ? (
      <div data-testid="product-details-drawer" data-section={initialSection} data-show-assembly={showAssembly}>
        drawer-open
      </div>
    ) : null,
}));

describe('ProductDetailsEntryClient', () => {
  beforeEach(() => {
    mockUseAppSelector.mockReturnValue(undefined);
    mockDispatch.mockReturnValue({
      unwrap: jest.fn(),
    });
  });

  afterEach(() => {
    mockUseAppSelector.mockReset();
    mockDispatch.mockReset();
  });

  it('opens the drawer with the clicked section', () => {
    render(<ProductDetailsEntryClient />);

    expect(screen.queryByTestId('product-details-drawer')).toBeNull();

    fireEvent.click(screen.getByText('Materials'));

    expect(screen.getByTestId('product-details-drawer').getAttribute('data-section')).toBe('materials');
  });

  it('shows the assembly trigger and passes assembly visibility to drawer when ai data exists', () => {
    mockUseAppSelector.mockImplementation((selector) => {
      if (typeof selector === 'symbol' && selector.description === 'selectVariantIds') {
        return [1];
      }
      return undefined;
    });

    render(<ProductDetailsEntryClient />);

    fireEvent.click(screen.getByText('Assembly'));

    expect(screen.getByTestId('product-details-drawer').getAttribute('data-section')).toBe('assembly');
    expect(screen.getByTestId('product-details-drawer').getAttribute('data-show-assembly')).toBe('true');
  });

  it('keeps the assembly trigger visible when ai data is absent in phase 1', () => {
    render(<ProductDetailsEntryClient />);

    expect(screen.queryByText('Assembly')).not.toBeNull();
  });
});
