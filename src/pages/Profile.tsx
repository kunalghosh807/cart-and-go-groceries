import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Package, MapPin, CreditCard, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AddPaymentMethodModal } from '@/components/AddPaymentMethodModal';

const Profile = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<{id: string, name: string, street: string, city: string, state: string, zip: string}[]>([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Load addresses from database
  useEffect(() => {
    const loadAddresses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setAddresses(data || []);
      } catch (error) {
        console.error('Error loading addresses:', error);
        toast({
          title: "Error loading addresses",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    };

    if (user) {
      loadAddresses();
    }
  }, [user, toast]);

  // Load payment methods when payments tab is active
  useEffect(() => {
    const loadPaymentMethods = async () => {
      try {
        setLoading(true);
        // Load from localStorage for demo - supports Indian cards better
        const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
        setPaymentMethods(savedCards);
      } catch (error) {
        console.error('Error loading payment methods:', error);
        toast({
          title: "Error loading payment methods",
          description: "Please try again later.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'payments' && user) {
      loadPaymentMethods();
    }
  }, [activeTab, user, toast]);

  // If still loading auth or no user, show loading
  if (authLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }
  
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadAddresses = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setAddresses(data || []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: "Error loading addresses",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleSaveChanges = async () => {
    console.log('handleSaveChanges called, editingIndex:', editingIndex);
    // Check if all fields are filled
    const requiredFields = Object.entries(formData);
    const emptyFields = requiredFields.filter(([key, value]) => !value.trim());
    
    if (emptyFields.length > 0) {
      toast({
        title: "Please fill all fields",
        description: "All input fields are required.",
        variant: "destructive"
      });
      return;
    }

    // Validate email
    if (!validateEmail(formData.email)) {
      toast({
        title: "Invalid email format",
        description: "Please enter a valid email address with domain name.",
        variant: "destructive"
      });
      return;
    }

    // Validate phone number
    if (!validatePhone(formData.phone)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a 10-digit phone number.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      if (editingIndex !== null) {
        console.log('Updating address at index:', editingIndex);
        const addressToUpdate = addresses[editingIndex];
        
        const { error } = await supabase
          .from('addresses')
          .update({
            name: `${formData.firstName} ${formData.lastName}`,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip
          })
          .eq('id', addressToUpdate.id);
          
        if (error) throw error;
        
        setEditingIndex(null);
        toast({
          title: "Address updated successfully!",
          description: "Your address has been updated.",
        });
      } else {
        console.log('Adding new address');
        
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: user!.id,
            name: `${formData.firstName} ${formData.lastName}`,
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip
          });
          
        if (error) throw error;
        
        toast({
          title: "Address saved successfully!",
          description: "Your new address has been added to your profile.",
        });
      }
      
      // Reload addresses from database
      await loadAddresses();
      
      // Clear address form fields only
      setFormData(prev => ({
        ...prev,
        street: '',
        city: '',
        state: '',
        zip: ''
      }));
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error saving address",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (addressObj: {id: string, name: string, street: string, city: string, state: string, zip: string}, index: number) => {
    console.log('handleEditAddress called with index:', index);
    const nameParts = addressObj.name.split(' ');
    setFormData(prev => ({
      ...prev,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      street: addressObj.street || '',
      city: addressObj.city || '',
      state: addressObj.state || '',
      zip: addressObj.zip || ''
    }));
    setEditingIndex(index);
    setActiveTab('personal');
  };

  const handleDeleteAddress = async (addressToDelete: {id: string, name: string, street: string, city: string, state: string, zip: string}) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressToDelete.id);
        
      if (error) throw error;
      
      // Reload addresses from database
      await loadAddresses();
      
      toast({
        title: "Address deleted",
        description: "The address has been removed from your profile.",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error deleting address",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      // Load from localStorage for demo - supports Indian cards better
      const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
      setPaymentMethods(savedCards);
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast({
        title: "Error loading payment methods",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add payment method
  const handleAddPaymentMethod = async () => {
    setShowAddPaymentModal(true);
  };

  // Delete payment method
  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    try {
      setLoading(true);
      // Delete from localStorage for demo
      const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
      const updatedCards = savedCards.filter((card: any) => card.id !== paymentMethodId);
      localStorage.setItem('savedCards', JSON.stringify(updatedCards));
      
      toast({
        title: "Payment method deleted",
        description: "The payment method has been removed.",
      });
      
      // Refresh payment methods
      loadPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error deleting payment method",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button 
                      variant={activeTab === 'personal' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('personal')}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Personal Info
                    </Button>
                    <Button 
                      variant={activeTab === 'orders' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('orders')}
                    >
                      <Package className="h-4 w-4 mr-3" />
                      Order History
                    </Button>
                    <Button 
                      variant={activeTab === 'addresses' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('addresses')}
                    >
                      <MapPin className="h-4 w-4 mr-3" />
                      Addresses
                    </Button>
                    <Button 
                      variant={activeTab === 'payments' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('payments')}
                    >
                      <CreditCard className="h-4 w-4 mr-3" />
                      Payment Methods
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Content */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'personal' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="Kunal" 
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Ghosh" 
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="kunal.ghosh@example.com" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">+91</span>
                        <Input 
                          id="phone" 
                          type="tel" 
                          className="pl-12" 
                          placeholder="9876543210" 
                          value={formData.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                            if (value.length <= 10) {
                              handleInputChange('phone', value);
                            }
                          }}
                          maxLength={10}
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input 
                          id="street" 
                          placeholder="123 Main St" 
                          value={formData.street}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input 
                          id="city" 
                          placeholder="Anytown" 
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input 
                          id="state" 
                          placeholder="CA" 
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input 
                          id="zip" 
                          placeholder="12345" 
                          value={formData.zip}
                          onChange={(e) => handleInputChange('zip', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    <Button 
                      className="bg-grocery-primary hover:bg-grocery-dark text-white"
                      onClick={handleSaveChanges}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : editingIndex !== null ? 'Update Address' : 'Save Changes'}
                    </Button>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'addresses' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Saved Addresses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {addresses.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No saved addresses</p>
                          <p className="text-sm text-gray-400 mt-2">Add an address in Personal Info to see it here</p>
                        </div>
                      ) : (
                        addresses.map((addressObj, index) => (
                          <div key={addressObj.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">{addressObj.name}</p>
                              <p className="text-sm text-gray-600">{addressObj.street}, {addressObj.city}, {addressObj.state} {addressObj.zip}</p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditAddress(addressObj, index)}>
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteAddress(addressObj)}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'orders' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-500">No orders found</p>
                      <p className="text-sm text-gray-400 mt-2">Your order history will appear here once you make a purchase</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'payments' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {loading ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">Loading payment methods...</p>
                        </div>
                      ) : paymentMethods.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">No payment methods found</p>
                          <p className="text-sm text-gray-400 mt-2">Add a payment method to get started</p>
                        </div>
                      ) : (
                        paymentMethods.map((pm) => (
                          <div key={pm.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">
                                {pm.brand?.charAt(0).toUpperCase() + pm.brand?.slice(1)} ending in {pm.last4}
                              </p>
                              <p className="text-sm text-gray-600">
                                Expires {pm.exp_month}/{pm.exp_year}
                              </p>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => handleDeletePaymentMethod(pm.id)}
                                  className="text-red-600 focus:text-red-600"
                                  disabled={loading}
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={handleAddPaymentMethod}
                      disabled={loading}
                    >
                      {loading ? "Processing..." : "Add Payment Method"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      <AddPaymentMethodModal 
        isOpen={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        onSuccess={() => {
          loadPaymentMethods();
          setShowAddPaymentModal(false);
        }}
      />
    </div>
  );
};

export default Profile;