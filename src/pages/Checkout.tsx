import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CreditCard, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const totalAmount = getTotalPrice() + 5.99;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Create Razorpay order
      const { data, error } = await supabase.functions.invoke('create-razorpay-order', {
        body: { amount: totalAmount, currency: 'INR' }
      });

      if (error) throw error;

      const { orderId, amount, currency, keyId } = data;

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        const options = {
          key: keyId,
          amount: amount,
          currency: currency,
          name: 'TechMart',
          description: 'Order Payment',
          order_id: orderId,
          handler: function (response: any) {
            toast.success('Payment successful!');
            clearCart();
            navigate('/');
          },
          prefill: {
            name: 'Customer',
            email: 'customer@example.com',
          },
          theme: {
            color: '#3B82F6'
          },
          method: {
            upi: true,
            card: true,
            netbanking: true,
            wallet: true,
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        
        rzp.on('payment.failed', function (response: any) {
          toast.error('Payment failed. Please try again.');
        });
      };
      
      document.body.appendChild(script);
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/cart')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-md"
                          />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <span className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>${getTotalPrice().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>$5.99</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>${(getTotalPrice() + 5.99).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center justify-center p-4 border rounded-lg bg-blue-50">
                        <Smartphone className="h-6 w-6 mr-2 text-blue-600" />
                        <span className="font-medium">UPI</span>
                      </div>
                      <div className="flex items-center justify-center p-4 border rounded-lg bg-green-50">
                        <CreditCard className="h-6 w-6 mr-2 text-green-600" />
                        <span className="font-medium">Cards</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                      Secure payment with UPI, Debit Cards, Credit Cards & Net Banking
                    </p>
                    <Button 
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="w-full"
                      size="lg"
                    >
                      {isProcessing ? 'Processing...' : `Pay ₹${totalAmount.toFixed(2)}`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;