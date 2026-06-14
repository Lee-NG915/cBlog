import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WebPaymentBillingAddressSelector } from './web-payment-billing-address-selector';

// Mock the hooks and components
jest.mock('@castlery/modules-checkout-domain', () => ({
  useGetCheckoutAddressListQuery: jest.fn(() => ({
    data: {
      data: [
        {
          id: 1,
          firstname: 'John',
          lastname: 'Doe',
          address1: '123 Main St',
          city: 'Singapore',
          zipcode: '123456',
        },
      ],
    },
    isLoading: false,
  })),
}));

jest.mock('@castlery/modules-composite-components', () => ({
  CheckoutAddressList: ({ onSelect }: any) => (
    <div data-testid="address-list">
      <button onClick={() => onSelect({ id: 1 })}>Select Address</button>
    </div>
  ),
}));

jest.mock('@castlery/modules-user-components', () => ({
  WebAddNewAddress: ({ onSaved }: any) => (
    <button data-testid="add-new-address" onClick={() => onSaved(2)}>
      Add New Address
    </button>
  ),
}));

describe('WebPaymentBillingAddressSelector', () => {
  it('should render with default props', () => {
    render(<WebPaymentBillingAddressSelector />);

    expect(screen.getByText('Billing address')).toBeInTheDocument();
    expect(screen.getByText('Use my shipping address')).toBeInTheDocument();
  });

  it('should have checkbox checked by default', () => {
    render(<WebPaymentBillingAddressSelector />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('should render with custom defaultUseShippingAddress', () => {
    render(<WebPaymentBillingAddressSelector defaultUseShippingAddress={false} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('should hide address list when checkbox is checked', () => {
    render(<WebPaymentBillingAddressSelector defaultUseShippingAddress={true} />);

    expect(screen.queryByTestId('address-list')).not.toBeInTheDocument();
  });

  it('should show address list when checkbox is unchecked', async () => {
    render(<WebPaymentBillingAddressSelector defaultUseShippingAddress={false} />);

    await waitFor(() => {
      expect(screen.getByTestId('address-list')).toBeInTheDocument();
    });
  });

  it('should call onUseShippingAddressChange when checkbox changes', () => {
    const handleChange = jest.fn();
    render(<WebPaymentBillingAddressSelector onUseShippingAddressChange={handleChange} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('should call onAddressSelect with null when checkbox is checked', () => {
    const handleSelect = jest.fn();
    render(<WebPaymentBillingAddressSelector defaultUseShippingAddress={false} onAddressSelect={handleSelect} />);

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleSelect).toHaveBeenCalledWith(null);
  });

  it('should toggle checkbox state on click', () => {
    render(<WebPaymentBillingAddressSelector />);

    const checkbox = screen.getByRole('checkbox');

    // Initial state - checked
    expect(checkbox).toBeChecked();

    // Click to uncheck
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();

    // Click to check again
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('should show address list after unchecking checkbox', async () => {
    render(<WebPaymentBillingAddressSelector />);

    const checkbox = screen.getByRole('checkbox');

    // Initially hidden
    expect(screen.queryByTestId('address-list')).not.toBeInTheDocument();

    // Uncheck to show
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(screen.getByTestId('address-list')).toBeInTheDocument();
    });
  });

  it('should call onAddressSelect when address is selected', async () => {
    const handleSelect = jest.fn();
    render(<WebPaymentBillingAddressSelector defaultUseShippingAddress={false} onAddressSelect={handleSelect} />);

    await waitFor(() => {
      expect(screen.getByTestId('address-list')).toBeInTheDocument();
    });

    const selectButton = screen.getByText('Select Address');
    fireEvent.click(selectButton);

    expect(handleSelect).toHaveBeenCalledWith({ id: 1 });
  });

  it('should show add new address button when checkbox is unchecked', async () => {
    render(<WebPaymentBillingAddressSelector defaultUseShippingAddress={false} />);

    await waitFor(() => {
      expect(screen.getByTestId('add-new-address')).toBeInTheDocument();
    });
  });

  // Regression: defaultUseShippingAddress is a non-controlled initial value.
  // The parent (PaymentMainContent) must gate render on isLoading; if anyone adds
  // a useEffect to sync prop -> state here, this test will fail and force them
  // to re-examine the parent-side fix in payment-main-content.tsx.
  it('should NOT sync defaultUseShippingAddress prop change after mount', () => {
    const { rerender } = render(<WebPaymentBillingAddressSelector defaultUseShippingAddress={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();

    rerender(<WebPaymentBillingAddressSelector defaultUseShippingAddress={false} />);
    expect(checkbox).toBeChecked();
  });

  it('should maintain selectedAddressId prop', () => {
    const { rerender } = render(
      <WebPaymentBillingAddressSelector defaultUseShippingAddress={false} selectedAddressId={123} />
    );

    // Verify component renders with selectedAddressId
    expect(screen.getByText('Billing address')).toBeInTheDocument();

    // Update selectedAddressId
    rerender(<WebPaymentBillingAddressSelector defaultUseShippingAddress={false} selectedAddressId={456} />);

    expect(screen.getByText('Billing address')).toBeInTheDocument();
  });
});
