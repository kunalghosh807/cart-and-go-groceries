import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, MapPin, Plus, Edit, Trash2, Home, Building, Star } from 'lucide-react';
import { useAddresses, Address } from '@/hooks/useAddresses';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SavedAddresses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addresses, loading, addAddress, updateAddress, deleteAddress } = useAddresses();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    type: 'home' as 'home' | 'work' | 'other'
  });

  if (!user) {
    navigate('/auth');
    return null;
  }

  const resetForm = () => {
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      zip: '',
      type: 'home'
    });
    setEditingAddress(null);
  };

  const handleAddAddress = async () => {
    if (!formData.name || !formData.street || !formData.city || !formData.state || !formData.zip) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setSaving(true);
      if (editingAddress) {
        await updateAddress(editingAddress.id, formData);
        toast.success('Address updated successfully');
      } else {
        await addAddress(formData);
        toast.success('Address added successfully');
      }
      setShowAddDialog(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      type: address.type || 'home'
    });
    setShowAddDialog(true);
  };

  const handleDeleteAddress = async (addressId: string, addressName: string) => {
    if (window.confirm(`Are you sure you want to delete the address "${addressName}"?`)) {
      try {
        await deleteAddress(addressId);
        toast.success('Address deleted successfully');
      } catch (error) {
        toast.error('Failed to delete address');
      }
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'work':
        return <Building className="h-4 w-4" />;
      case 'other':
        return <Star className="h-4 w-4" />;
      default:
        return <Home className="h-4 w-4" />;
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case 'work':
        return 'bg-blue-100 text-blue-800';
      case 'other':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Saved Addresses</h1>
              <p className="text-gray-600 mt-1">
                {addresses.length > 0 
                  ? `${addresses.length} address${addresses.length > 1 ? 'es' : ''} saved`
                  : 'Manage your delivery addresses'
                }
              </p>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="bg-grocery-primary hover:bg-grocery-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                    placeholder="House no, Building, Street"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="zip">PIN Code</Label>
                  <Input
                    id="zip"
                    value={formData.zip}
                    onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                    placeholder="400001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Address Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'home' | 'work' | 'other' }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-grocery-primary focus:border-transparent"
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleAddAddress}
                    disabled={saving}
                    className="flex-1 bg-grocery-primary hover:bg-grocery-primary/90"
                  >
                    {saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Addresses List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-grocery-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No saved addresses</h3>
              <p className="text-gray-600 mb-6">Add your first delivery address to get started</p>
              <Button 
                onClick={() => setShowAddDialog(true)} 
                className="bg-grocery-primary hover:bg-grocery-primary/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {addresses.map((address) => (
              <Card key={address.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-full ${getAddressTypeColor(address.type || 'home')}`}>
                        {getAddressTypeIcon(address.type || 'home')}
                      </div>
                      <CardTitle className="text-lg">{address.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAddress(address.id, address.name)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-gray-600">
                        <p>{address.street}</p>
                        <p>{address.city}, {address.state} {address.zip}</p>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAddressTypeColor(address.type || 'home')}`}>
                        {getAddressTypeIcon(address.type || 'home')}
                        {(address.type || 'home').charAt(0).toUpperCase() + (address.type || 'home').slice(1)}
                      </span>
                    </div>
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

export default SavedAddresses;