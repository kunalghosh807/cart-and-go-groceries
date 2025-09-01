import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Package, MapPin, CreditCard, MoreVertical, Heart, Gift, HelpCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AddPaymentMethodModal } from '@/components/AddPaymentMethodModal';

const Profile = () => {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [paymentMethods, setPaymentMethods] = useState([]);
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

  // Load payment methods when tab changes
  useEffect(() => {
    if (activeTab === 'payments' && user) {
      loadPaymentMethods();
    }
  }, [activeTab, user, toast]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };



  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      // Load from localStorage for demo - supports Indian cards better
      const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
      setPaymentMethods(savedCards);
    } catch (error) {
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
  const handleAddPaymentMethod = () => {
    setShowAddPaymentModal(true);
  };

  // Delete payment method
  const handleDeletePaymentMethod = async (paymentMethodId) => {
    try {
      setLoading(true);
      // Delete from localStorage for demo
      const savedCards = JSON.parse(localStorage.getItem('savedCards') || '[]');
      const updatedCards = savedCards.filter((card) => card.id !== paymentMethodId);
      localStorage.setItem('savedCards', JSON.stringify(updatedCards));
      setPaymentMethods(updatedCards);
      
      toast({
        title: "Payment method deleted",
        description: "The payment method has been removed from your account."
      });
    } catch (error) {
      toast({
        title: "Error deleting payment method",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      toast({
        title: "Error signing out",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Header */}
          <div className="bg-white px-4 py-6 border-b">
            <div className="flex items-center mb-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(-1)}
                className="mr-3"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <h1 className="text-2xl font-semibold text-gray-900">Your account</h1>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">{user?.email || 'useremail@gmail.com'}</p>
            </div>
            
            {/* Quick Action Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center justify-center space-y-2 border-gray-200"
                onClick={() => navigate('/orders')}
              >
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-sm font-medium">Orders</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center justify-center space-y-2 border-gray-200"
                onClick={() => navigate('/wishlist')}
              >
                <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span className="text-sm font-medium">Wishlist</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center justify-center space-y-2 border-gray-200"
                onClick={() => setActiveTab('coupons')}
              >
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span className="text-sm font-medium">Coupons</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="h-16 flex flex-col items-center justify-center space-y-2 border-gray-200"
                onClick={() => setActiveTab('help')}
              >
                <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Help Center</span>
              </Button>
            </div>
          </div>
          
          {/* Menu Items */}
          <div className="bg-white">
            <Button 
              variant="ghost" 
              className="w-full justify-between px-4 py-4 h-auto border-b border-gray-100"
              onClick={() => navigate('/saved-addresses')}
            >
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                <span className="font-medium">Saved Addresses</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-between px-4 py-4 h-auto border-b border-gray-100"
              onClick={() => setActiveTab('prescriptions')}
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="font-medium">Your Prescriptions</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <div className="border-b border-gray-100 py-3">
              <p className="px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">OTHER INFORMATION</p>
            </div>
            
            <Button 
              variant="ghost" 
              className="w-full justify-between px-4 py-4 h-auto border-b border-gray-100"
              onClick={() => setActiveTab('share')}
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                <span className="font-medium">Share the app</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-between px-4 py-4 h-auto border-b border-gray-100"
              onClick={() => setActiveTab('about')}
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">About us</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-between px-4 py-4 h-auto border-b border-gray-100"
              onClick={() => setActiveTab('privacy')}
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="font-medium">Account privacy</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-between px-4 py-4 h-auto border-b border-gray-100"
              onClick={() => setActiveTab('notifications')}
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5z" />
                </svg>
                <span className="font-medium">Notification preferences</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-between px-4 py-4 h-auto"
              onClick={handleSignOut}
            >
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Log out</span>
              </div>
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden md:block max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
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
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => navigate('/orders')}
                    >
                      <Package className="h-4 w-4 mr-3" />
                      My Orders
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => navigate('/saved-addresses')}
                    >
                      <MapPin className="h-4 w-4 mr-3" />
                      Saved Addresses
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => navigate('/wishlist')}
                    >
                      <Heart className="h-4 w-4 mr-3" />
                      Wishlist
                    </Button>
                    
                    <Button 
                      variant={activeTab === 'payments' ? 'default' : 'ghost'} 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('payments')}
                    >
                      <CreditCard className="h-4 w-4 mr-3" />
                      Payment Methods
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleSignOut}
                    >
                      <User className="h-4 w-4 mr-3" />
                      Log out
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
                        placeholder="kunal@example.com" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required 
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        placeholder="+91 98765 43210" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        required 
                      />
                    </div>
                    
                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-4">Address Information</h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="street">Street Address</Label>
                          <Input 
                            id="street" 
                            placeholder="123 Main Street" 
                            value={formData.street}
                            onChange={(e) => handleInputChange('street', e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input 
                              id="city" 
                              placeholder="Mumbai" 
                              value={formData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State</Label>
                            <Input 
                              id="state" 
                              placeholder="Maharashtra" 
                              value={formData.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label htmlFor="zip">ZIP Code</Label>
                            <Input 
                              id="zip" 
                              placeholder="400001" 
                              value={formData.zip}
                              onChange={(e) => handleInputChange('zip', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full">Save Changes</Button>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'wishlist' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Wishlist</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <p className="text-gray-500 text-lg mb-2">Your wishlist is empty</p>
                      <p className="text-sm text-gray-400">Save items you love to your wishlist</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'coupons' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Coupons & Offers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <svg className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                      <p className="text-gray-500 text-lg mb-2">No coupons available</p>
                      <p className="text-sm text-gray-400">Check back later for exciting offers</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'help' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Help Center</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Frequently Asked Questions</h3>
                        <p className="text-sm text-gray-600">Find answers to common questions about orders, delivery, and more.</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Contact Support</h3>
                        <p className="text-sm text-gray-600">Get in touch with our customer support team for personalized help.</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h3 className="font-medium mb-2">Order Issues</h3>
                        <p className="text-sm text-gray-600">Report problems with your orders or track delivery status.</p>
                      </div>
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
                          <p className="text-gray-500">No payment methods saved</p>
                          <p className="text-sm text-gray-400 mt-2">Add a payment method to make checkout faster</p>
                        </div>
                      ) : (
                        paymentMethods.map((method) => (
                          <div key={method.id} className="border rounded-lg p-4 flex justify-between items-center">
                            <div className="flex items-center">
                              <CreditCard className="h-8 w-8 text-gray-400 mr-3" />
                              <div>
                                <p className="font-medium">**** **** **** {method.last4}</p>
                                <p className="text-sm text-gray-600">{method.brand} • Expires {method.exp_month}/{method.exp_year}</p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleDeletePaymentMethod(method.id)}
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