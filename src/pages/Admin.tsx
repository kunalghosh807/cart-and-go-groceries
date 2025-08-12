import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Package, ShoppingCart, AlertTriangle, DollarSign } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  stock_quantity: number;
  is_featured: boolean;
  is_deal: boolean;
  deal_price: number | null;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  payment_method: string | null;
  payment_id: string | null;
  shipping_address: any;
  created_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [quickPriceUpdate, setQuickPriceUpdate] = useState<{productId: string, currentPrice: number} | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    subcategory: '',
    description: '',
    stock_quantity: '',
    is_featured: false,
    is_deal: false,
    deal_price: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadData();
  }, [user, navigate]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadOrders()]);
    setLoading(false);
  };

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error loading products",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setProducts(data || []);
    }
  };

  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast({
        title: "Error loading orders",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setOrders(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      image: formData.image,
      category: formData.category,
      subcategory: formData.subcategory || null,
      description: formData.description || null,
      stock_quantity: parseInt(formData.stock_quantity),
      is_featured: formData.is_featured,
      is_deal: formData.is_deal,
      deal_price: formData.deal_price ? parseFloat(formData.deal_price) : null
    };

    let error;
    if (editingProduct) {
      const { error: updateError } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from('products')
        .insert([productData]);
      error = insertError;
    }

    if (error) {
      toast({
        title: "Error saving product",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: editingProduct ? "Product updated" : "Product added",
        description: "Product saved successfully",
      });
      resetForm();
      loadProducts();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      category: '',
      subcategory: '',
      description: '',
      stock_quantity: '',
      is_featured: false,
      is_deal: false,
      deal_price: ''
    });
    setEditingProduct(null);
  };

  const editProduct = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      subcategory: product.subcategory || '',
      description: product.description || '',
      stock_quantity: product.stock_quantity.toString(),
      is_featured: product.is_featured,
      is_deal: product.is_deal,
      deal_price: product.deal_price?.toString() || ''
    });
    setEditingProduct(product);
  };

  const deleteProduct = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Product deleted",
        description: "Product removed successfully",
      });
      loadProducts();
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) {
      toast({
        title: "Error updating order",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Order updated",
        description: "Order status updated successfully",
      });
      loadOrders();
    }
  };

  const markOutOfStock = async (productId: string) => {
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: 0 })
      .eq('id', productId);

    if (error) {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Product marked out of stock",
        description: "Stock quantity set to 0",
      });
      loadProducts();
    }
  };

  const quickUpdatePrice = async (productId: string, newPrice: number) => {
    const { error } = await supabase
      .from('products')
      .update({ price: newPrice })
      .eq('id', productId);

    if (error) {
      toast({
        title: "Error updating price",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Price updated",
        description: "Product price updated successfully",
      });
      loadProducts();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading admin panel...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            {/* Product Form */}
            <Card>
              <CardHeader>
                <CardTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input
                      id="image"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                      id="subcategory"
                      value={formData.subcategory}
                      onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stock_quantity">Stock Quantity</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured">Featured Product</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_deal"
                      checked={formData.is_deal}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_deal: checked })}
                    />
                    <Label htmlFor="is_deal">Deal Product</Label>
                  </div>
                  
                  {formData.is_deal && (
                    <div className="md:col-span-2">
                      <Label htmlFor="deal_price">Deal Price</Label>
                      <Input
                        id="deal_price"
                        type="number"
                        step="0.01"
                        value={formData.deal_price}
                        onChange={(e) => setFormData({ ...formData, deal_price: e.target.value })}
                      />
                    </div>
                  )}
                  
                  <div className="md:col-span-2 flex gap-2">
                    <Button type="submit">
                      {editingProduct ? 'Update Product' : 'Add Product'}
                    </Button>
                    {editingProduct && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle>Products ({products.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4 space-y-2">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-32 object-cover rounded"
                      />
                      <h3 className="font-medium">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold">₹{product.price}</span>
                        <Badge variant={product.stock_quantity > 0 ? "default" : "destructive"}>
                          Stock: {product.stock_quantity}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        {product.is_featured && <Badge variant="secondary">Featured</Badge>}
                        {product.is_deal && <Badge variant="secondary">Deal</Badge>}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        <Button size="sm" variant="outline" onClick={() => editProduct(product)}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <DollarSign className="h-3 w-3" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Update Price</DialogTitle>
                              <DialogDescription>
                                Update the price for {product.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Current Price: ₹{product.price}</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  placeholder="New price"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      const newPrice = parseFloat((e.target as HTMLInputElement).value);
                                      if (newPrice > 0) {
                                        quickUpdatePrice(product.id, newPrice);
                                      }
                                    }
                                  }}
                                />
                              </div>
                              <Button 
                                onClick={(e) => {
                                  const input = e.currentTarget.parentElement?.querySelector('input');
                                  const newPrice = parseFloat(input?.value || '0');
                                  if (newPrice > 0) {
                                    quickUpdatePrice(product.id, newPrice);
                                  }
                                }}
                              >
                                Update Price
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          onClick={() => markOutOfStock(product.id)}
                          disabled={product.stock_quantity === 0}
                        >
                          <AlertTriangle className="h-3 w-3" />
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => deleteProduct(product.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'pending' ? 'secondary' : 'destructive'
                        }>
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Total: ₹{order.total_amount}</p>
                          <p className="text-sm">Payment: {order.payment_method || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Shipping Address:</p>
                          <p className="text-sm">
                            {order.shipping_address?.name}<br />
                            {order.shipping_address?.street}<br />
                            {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          disabled={order.status === 'processing'}
                        >
                          Mark Processing
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateOrderStatus(order.id, 'shipped')}
                          disabled={order.status === 'shipped' || order.status === 'completed'}
                        >
                          Mark Shipped
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          disabled={order.status === 'completed'}
                        >
                          Mark Completed
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;