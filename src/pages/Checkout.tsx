import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCart } from '@/hooks/useCart';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, CreditCard, Smartphone, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AddressSelection } from '@/components/AddressSelection';
import { Address } from '@/hooks/useAddresses';
import { useAuth } from '@/contexts/AuthContext';

type CheckoutStep = 'address' | 'payment';

const Checkout = () => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const totalAmount = getTotalPrice() + 5.99;

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
  };

  const handleContinueToPayment = () => {
    if (selectedAddress) {
      setCurrentStep('payment');
    }
  };

  const handleBackToAddress = () => {
    setCurrentStep('address');
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      // Check if Razorpay is already loaded
      if (typeof (window as any).Razorpay !== 'undefined') {
        console.log('Razorpay already loaded');
        resolve(true);
        return;
      }

      // Check if script is already being loaded
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        console.log('Razorpay script already exists, waiting for load');
        existingScript.addEventListener('load', () => {
          console.log('Existing Razorpay script loaded');
          resolve(true);
        });
        existingScript.addEventListener('error', () => reject(new Error('Failed to load Razorpay script')));
        return;
      }

      console.log('Loading Razorpay script...');
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        // Wait a bit more to ensure Razorpay is fully initialized
        setTimeout(() => resolve(true), 200);
      };
      script.onerror = () => {
        console.error('Failed to load Razorpay script');
        reject(new Error('Failed to load Razorpay script'));
      };
      document.head.appendChild(script);
    });
  };

  const handlePayment = async (event?: React.MouseEvent) => {
    // Prevent any default behavior
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    if (!selectedAddress) {
      toast.error('Please select a delivery address.');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get Razorpay key from environment
      const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
      
      console.log('Razorpay Key ID:', keyId ? 'Configured' : 'Not configured');
      
      if (!keyId) {
        console.error('Razorpay key not found in environment variables');
        toast.error('Payment gateway not configured. Please contact support.');
        setIsProcessing(false);
        return;
      }

      // Load Razorpay script first
      await loadRazorpayScript();

      // Create payment details (removing order_id for simple payment flow)
      const amount = Math.round(totalAmount * 100); // Convert to paise
      const currency = 'INR';

      console.log('Payment details:', { amount, currency, keyId });

      // Declare timeout variable for modal handling
      let modalTimeout: NodeJS.Timeout;

      // Razorpay options
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'Cart & Go Groceries',
        description: 'Order Payment',
        handler: function (response: any) {
          console.log('Payment successful:', response);
          clearTimeout(modalTimeout);
          // Save order to database with address
          saveOrder(response, selectedAddress);
          toast.success('Payment successful!');
          clearCart();
          navigate('/');
          setIsProcessing(false);
        },
        prefill: {
          name: selectedAddress.name,
          contact: '',
          email: ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            console.log('Payment modal dismissed by user - resetting processing state');
            clearTimeout(modalTimeout);
            setIsProcessing(false);
          }
        }
      };

      console.log('Creating Razorpay instance with options:', options);
      
      // Create and open Razorpay checkout
      const rzp = new (window as any).Razorpay(options);
      
      // Set up payment failure handler
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed:', response);
        clearTimeout(modalTimeout);
        toast.error(`Payment failed: ${response.error?.description || 'Please try again.'}`);
        setIsProcessing(false);
      });

      // Add modal open/close event listeners for debugging
      rzp.on('payment.submit', function(response: any) {
        console.log('Payment submitted:', response);
      });

      rzp.on('payment.cancel', function(response: any) {
        console.log('Payment cancelled:', response);
        setIsProcessing(false);
      });

      // Open the payment modal with a small delay
      console.log('Opening Razorpay payment modal...');
      
      // Set a timeout to reset processing state if modal doesn't open properly
      modalTimeout = setTimeout(() => {
        console.warn('Modal timeout - resetting processing state');
        setIsProcessing(false);
        toast.error('Payment modal failed to open. Please try again.');
      }, 5000); // 5 second timeout
      
      // Open the payment modal immediately
      console.log('Opening Razorpay payment modal...');
      try {
        rzp.open();
        console.log('Modal open command executed');
      } catch (modalError) {
        console.error('Error opening modal:', modalError);
        clearTimeout(modalTimeout);
        setIsProcessing(false);
        toast.error('Failed to open payment modal. Please try again.');
      }
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error(`Failed to initiate payment: ${error instanceof Error ? error.message : 'Please try again.'}`);
      setIsProcessing(false);
    }
  };

  const saveOrder = async (paymentResponse: any, address: Address) => {
    try {
      // Create order with correct schema
      const orderData = {
        user_id: user.id,
        total_amount: totalAmount,
        shipping_address: address,
        payment_id: paymentResponse.razorpay_payment_id,
        payment_method: 'razorpay',
        status: 'confirmed'
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id.toString(),
        quantity: item.quantity || 1,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update stock quantities for each purchased item
      for (const item of cartItems) {
        // First get current stock
        const { data: currentProduct, error: fetchError } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', item.id)
          .single();

        if (fetchError) {
          console.error(`Error fetching product ${item.id}:`, fetchError);
          continue;
        }

        // Calculate new stock quantity
        const newStock = Math.max(0, currentProduct.stock_quantity - (item.quantity || 1));

        // Update stock quantity
        const { error: stockError } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.id);

        if (stockError) {
          console.error(`Error updating stock for product ${item.id}:`, stockError);
          // Continue with other items even if one fails
        }
      }

    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Failed to save order. Please contact support.');
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
              onClick={currentStep === 'address' ? () => navigate('/cart') : handleBackToAddress}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 'address' ? 'Back to Cart' : 'Back to Address'}
            </Button>
            <h1 className="text-3xl font-bold">Checkout</h1>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${
                currentStep === 'address' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {currentStep === 'payment' ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <MapPin className="h-6 w-6" />
                )}
                <span className="font-medium">Delivery Address</span>
              </div>
              <div className={`w-12 h-0.5 ${
                currentStep === 'payment' ? 'bg-green-600' : 'bg-gray-300'
              }`} />
              <div className={`flex items-center space-x-2 ${
                currentStep === 'payment' ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <CreditCard className="h-6 w-6" />
                <span className="font-medium">Payment</span>
              </div>
            </div>
          </div>

          {currentStep === 'address' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Address Selection */}
              <div className="lg:col-span-2">
                <AddressSelection
                  selectedAddressId={selectedAddress?.id}
                  onAddressSelect={handleAddressSelect}
                  onContinue={handleContinueToPayment}
                />
              </div>
            </div>
          ) : (
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
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>₹{getTotalPrice().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery</span>
                          <span>₹5.99</span>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-2">
                          <span>Total</span>
                          <span>₹{(getTotalPrice() + 5.99).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Selected Address */}
                {selectedAddress && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle>Delivery Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="font-medium">{selectedAddress.name}</p>
                        <p className="text-gray-600">
                          {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                        type="button"
                        onClick={handlePayment}
                        disabled={isProcessing || !selectedAddress}
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
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;