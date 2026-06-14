import { render, screen, fireEvent } from '@testing-library/react';
import { PaymentTermsAndConditions } from './payment-terms-and-conditions';

describe('PaymentTermsAndConditions', () => {
  it('should render with default props', () => {
    render(<PaymentTermsAndConditions />);
    
    expect(screen.getByText('Terms & Conditions')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('should render checked when checked prop is true', () => {
    render(<PaymentTermsAndConditions checked={true} />);
    
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('should call onChange when checkbox is clicked', () => {
    const handleChange = jest.fn();
    render(<PaymentTermsAndConditions onChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalledWith(true);
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('should toggle checkbox state on click', () => {
    const handleChange = jest.fn();
    render(<PaymentTermsAndConditions checked={false} onChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    
    // First click - check
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
    
    // Second click - uncheck
    handleChange.mockClear();
    render(<PaymentTermsAndConditions checked={true} onChange={handleChange} />);
    const checkedBox = screen.getByRole('checkbox');
    fireEvent.click(checkedBox);
    expect(handleChange).toHaveBeenCalledWith(false);
  });

  it('should render refund policy link with correct href', () => {
    render(<PaymentTermsAndConditions refundPolicyUrl="/custom-refund" />);
    
    const refundLink = screen.getByText('refund');
    expect(refundLink).toHaveAttribute('href', '/custom-refund');
    expect(refundLink).toHaveAttribute('target', '_blank');
    expect(refundLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render delivery policy link with correct href', () => {
    render(<PaymentTermsAndConditions deliveryPolicyUrl="/custom-delivery" />);
    
    const deliveryLink = screen.getByText('delivery');
    expect(deliveryLink).toHaveAttribute('href', '/custom-delivery');
    expect(deliveryLink).toHaveAttribute('target', '_blank');
    expect(deliveryLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should render custom terms text when provided', () => {
    const customText = <span>Custom terms text</span>;
    render(<PaymentTermsAndConditions termsText={customText} />);
    
    expect(screen.getByText('Custom terms text')).toBeInTheDocument();
    expect(screen.queryByText('refund')).not.toBeInTheDocument();
  });

  it('should render default terms text when custom text is not provided', () => {
    render(<PaymentTermsAndConditions />);
    
    expect(screen.getByText(/By clicking the Place Your Order button/i)).toBeInTheDocument();
    expect(screen.getByText('refund')).toBeInTheDocument();
    expect(screen.getByText('delivery')).toBeInTheDocument();
  });

  it('should handle multiple onChange calls', () => {
    const handleChange = jest.fn();
    const { rerender } = render(
      <PaymentTermsAndConditions checked={false} onChange={handleChange} />
    );
    
    const checkbox = screen.getByRole('checkbox');
    
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(true);
    
    rerender(<PaymentTermsAndConditions checked={true} onChange={handleChange} />);
    fireEvent.click(checkbox);
    expect(handleChange).toHaveBeenCalledWith(false);
    
    expect(handleChange).toHaveBeenCalledTimes(2);
  });
});

