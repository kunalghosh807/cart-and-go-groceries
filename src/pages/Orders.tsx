import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Calendar, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { useOrders } from '@/hooks/useOrders';
import { useAuth } from '@/contexts/AuthContext';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orders, loading } = useOrders(user?.id);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600 mt-1">Track and manage your orders</p>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-grocery-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-6">Your order history will appear here once you make a purchase</p>
              <Button onClick={() => navigate('/')} className="bg-grocery-primary hover:bg-grocery-primary/90">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Card 
                key={order.id} 
                className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 text-lg">✓</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {order.status === 'delivered' ? 'Order arrived' : 'Arrived in 16 minutes'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ₹{order.total_amount.toFixed(0)} • {formatDate(order.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {order.order_items?.slice(0, 4).map((item, index) => (
                          <img
                            key={item.id}
                            src={item.product?.image || '/placeholder.svg'}
                            alt={item.product?.name || 'Product'}
                            className="w-8 h-8 object-cover rounded border-2 border-white"
                          />
                        )) || [
                          // Mock product images if no items
                          <div key="1" className="w-8 h-8 bg-green-100 rounded border-2 border-white flex items-center justify-center">
                            <Package className="h-4 w-4 text-green-600" />
                          </div>,
                          <div key="2" className="w-8 h-8 bg-blue-100 rounded border-2 border-white flex items-center justify-center">
                            <Package className="h-4 w-4 text-blue-600" />
                          </div>,
                          <div key="3" className="w-8 h-8 bg-yellow-100 rounded border-2 border-white flex items-center justify-center">
                            <Package className="h-4 w-4 text-yellow-600" />
                          </div>,
                          <div key="4" className="w-8 h-8 bg-red-100 rounded border-2 border-white flex items-center justify-center">
                            <Package className="h-4 w-4 text-red-600" />
                          </div>
                        ]}
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs">
                        ⋮
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Reorder
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                      Rate order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Orders;