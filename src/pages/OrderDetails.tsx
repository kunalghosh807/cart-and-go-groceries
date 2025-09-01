import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Package, ChevronRight } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, loading } = useOrders(user?.id);
  
  const order = orders.find(o => o.id === orderId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-grocery-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Order not found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/orders')} className="bg-grocery-primary hover:bg-grocery-primary/90">
            Back to Orders
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/orders')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order summary</h2>
            <p className="text-sm text-gray-600">Arrived at 5:25 pm</p>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-gray-600">Download invoice</span>
              <Button variant="ghost" size="sm" className="text-grocery-primary">
                ↓
              </Button>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">{order.order_items?.length || 4} Items in this order</h3>
              <div className="space-y-3">
                {order.order_items?.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product?.image || '/placeholder.svg'}
                        alt={item.product?.name || 'Product'}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                        <p className="text-sm text-gray-600">{item.quantity}g x {item.quantity}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.price.toFixed(0)}</p>
                      <p className="text-sm text-gray-600">₹{item.price.toFixed(0)}</p>
                    </div>
                  </div>
                )) || [
                  // Mock data if no items
                  <div key="1" className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center">
                        <Package className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Diet Tofu Soya Tofu</p>
                        <p className="text-sm text-gray-600">200 g x 1</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹138</p>
                      <p className="text-sm text-gray-600">₹138</p>
                    </div>
                  </div>
                ]}
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-500">⭐</span>
                <span className="font-medium">How were your ordered items?</span>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white ml-auto">
                  Rate now
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Bill details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>MRP</span>
                    <span>₹{order.total_amount.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Product discount</span>
                    <span className="text-green-600">-₹50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Item total</span>
                    <span>₹{(order.total_amount - 50).toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling charge</span>
                    <span>₹4</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery charges</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Bill total</span>
                    <span>₹{order.total_amount.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Order ID</span>
                    <span>#{order.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment</span>
                    <span>{order.payment_method || 'Paid Online'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Deliver to</span>
                    <span>{order.shipping_address?.name || 'Kunal Ghosh, Standing, Near Dakhineshwar ticket counter May'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Order placed</span>
                    <span>placed on {formatDate(order.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Need help with your order?</h4>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">💬</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Chat with us</p>
                  <p className="text-xs text-gray-600">About any query related to your order</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Repeat Order
              </Button>
              <Button variant="outline" className="w-full">
                VIEW CART ON NEXT STEP
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default OrderDetails;