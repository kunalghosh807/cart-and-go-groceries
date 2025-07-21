import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Package, MapPin, CreditCard } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('personal');
  
  const handleSaveChanges = () => {
    const firstNameInput = document.getElementById('firstName') as HTMLInputElement;
    const lastNameInput = document.getElementById('lastName') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const phoneInput = document.getElementById('phone') as HTMLInputElement;
    const streetInput = document.getElementById('street') as HTMLInputElement;
    const cityInput = document.getElementById('city') as HTMLInputElement;
    const stateInput = document.getElementById('state') as HTMLInputElement;
    const zipInput = document.getElementById('zip') as HTMLInputElement;
    
    // Check if all fields are filled
    const fields = [firstNameInput, lastNameInput, emailInput, phoneInput, streetInput, cityInput, stateInput, zipInput];
    const emptyFields = fields.filter(field => !field?.value.trim());
    
    if (emptyFields.length > 0) {
      toast({
        title: "Please fill all fields",
        description: "All input fields are required.",
        variant: "destructive"
      });
      return;
    }
    
    if (streetInput && cityInput && stateInput && zipInput) {
      const newAddress = `${streetInput.value}, ${cityInput.value}, ${stateInput.value} ${zipInput.value}`;
      setAddresses(prev => [...prev, newAddress]);
      
      // Clear form
      streetInput.value = '';
      cityInput.value = '';
      stateInput.value = '';
      zipInput.value = '';
      
      toast({
        title: "Address saved successfully!",
        description: "Your new address has been added to your profile.",
      });
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
                        <Input id="firstName" placeholder="Kunal" required />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" placeholder="Ghosh" required />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="kunal.ghosh@example.com" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">+91</span>
                        <Input id="phone" type="tel" className="pl-12" placeholder="9876543210" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="street">Street Address</Label>
                        <Input id="street" placeholder="123 Main St" required />
                      </div>
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="Anytown" required />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input id="state" placeholder="CA" required />
                      </div>
                      <div>
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" placeholder="12345" required />
                      </div>
                    </div>
                    <Button 
                      className="bg-grocery-primary hover:bg-grocery-dark text-white"
                      onClick={handleSaveChanges}
                    >
                      Save Changes
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
                        addresses.map((address, index) => (
                          <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">Kunal Ghosh</p>
                              <p className="text-sm text-gray-600">{address}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                const addressParts = address.split(', ');
                                const streetInput = document.getElementById('street') as HTMLInputElement;
                                const cityInput = document.getElementById('city') as HTMLInputElement;
                                const stateInput = document.getElementById('state') as HTMLInputElement;
                                const zipInput = document.getElementById('zip') as HTMLInputElement;
                                
                                if (streetInput && cityInput && stateInput && zipInput && addressParts.length >= 3) {
                                  streetInput.value = addressParts[0] || '';
                                  cityInput.value = addressParts[1] || '';
                                  const stateZip = addressParts[2]?.split(' ') || [];
                                  stateInput.value = stateZip[0] || '';
                                  zipInput.value = stateZip[1] || '';
                                  setActiveTab('personal');
                                }
                              }}
                            >
                              Edit
                            </Button>
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
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Visa ending in 4242</p>
                          <p className="text-sm text-gray-600">Expires 12/26</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-4">
                      Add Payment Method
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;