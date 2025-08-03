import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddPaymentMethodForm: React.FC<{ onSuccess: () => void; onClose: () => void }> = ({ onSuccess, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    name: ''
  });
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.cardNumber || !formData.expiryMonth || !formData.expiryYear || !formData.cvv || !formData.name) {
        throw new Error('Please fill all fields');
      }

      // For demo purposes, we'll just save to localStorage
      // In a real app, you'd integrate with Razorpay's saved cards API
      const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
      const newCard = {
        id: Date.now().toString(),
        last4: formData.cardNumber.slice(-4),
        brand: getCardBrand(formData.cardNumber),
        exp_month: formData.expiryMonth,
        exp_year: formData.expiryYear,
        name: formData.name
      };
      
      savedCards.push(newCard);
      localStorage.setItem('savedCards', JSON.stringify(savedCards));

      toast({
        title: "Success",
        description: "Payment method added successfully!",
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error adding payment method:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCardBrand = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'visa';
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard';
    if (number.startsWith('6')) return 'rupay';
    if (number.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Cardholder Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter cardholder name"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <Input
            id="cardNumber"
            name="cardNumber"
            type="text"
            value={formatCardNumber(formData.cardNumber)}
            onChange={(e) => setFormData(prev => ({ ...prev, cardNumber: e.target.value }))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Supports Visa, Mastercard, RuPay, and American Express
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div>
            <Label htmlFor="expiryMonth">Month</Label>
            <Input
              id="expiryMonth"
              name="expiryMonth"
              type="text"
              value={formData.expiryMonth}
              onChange={handleInputChange}
              placeholder="MM"
              maxLength={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="expiryYear">Year</Label>
            <Input
              id="expiryYear"
              name="expiryYear"
              type="text"
              value={formData.expiryYear}
              onChange={handleInputChange}
              placeholder="YY"
              maxLength={2}
              required
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              name="cvv"
              type="text"
              value={formData.cvv}
              onChange={handleInputChange}
              placeholder="123"
              maxLength={4}
              required
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Payment Method"}
        </Button>
      </div>
    </form>
  );
};

export const AddPaymentMethodModal: React.FC<AddPaymentMethodModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
        </DialogHeader>
        <AddPaymentMethodForm onSuccess={onSuccess} onClose={onClose} />
      </DialogContent>
    </Dialog>
  );
};