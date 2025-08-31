import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Star } from 'lucide-react';
import { useAddresses, Address } from '@/hooks/useAddresses';
import { useToast } from '@/hooks/use-toast';

interface AddressSelectionProps {
  selectedAddressId?: string;
  onAddressSelect: (address: Address) => void;
  onContinue: () => void;
}

export const AddressSelection: React.FC<AddressSelectionProps> = ({
  selectedAddressId,
  onAddressSelect,
  onContinue
}) => {
  const { addresses, loading, saveAddress } = useAddresses();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zip: ''
  });
  const [saving, setSaving] = useState(false);

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.street || !newAddress.city || !newAddress.state || !newAddress.zip) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    const success = await saveAddress(newAddress);
    if (success) {
      setNewAddress({
        name: '',
        street: '',
        city: '',
        state: '',
        zip: ''
      });
      setShowAddDialog(false);
    }
    setSaving(false);
  };

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Select Delivery Address</h2>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add New Address</span>
              <span className="sm:hidden">Add Address</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newAddress.name}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="street">Street Address *</Label>
                <Input
                  id="street"
                  value={newAddress.street}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                  placeholder="Enter street address"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Enter state"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  value={newAddress.zip}
                  onChange={(e) => setNewAddress(prev => ({ ...prev, zip: e.target.value }))}
                  placeholder="Enter ZIP code"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button
                  onClick={handleAddAddress}
                  disabled={saving}
                  className="flex-1 order-2 sm:order-1"
                >
                  {saving ? 'Saving...' : 'Save Address'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="flex-1 order-1 sm:order-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p>Loading addresses...</p>
        </div>
      ) : addresses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No saved addresses</h3>
            <p className="text-gray-600 mb-4">Add your first delivery address to continue</p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <RadioGroup
            value={selectedAddressId}
            onValueChange={(value) => {
              const address = addresses.find(addr => addr.id === value);
    if (address) {
      onAddressSelect(address);
    }
            }}
            className="space-y-3 md:space-y-4"
          >
            {addresses.map((address) => (
              <Card 
                key={address.id} 
                className={`cursor-pointer transition-colors ${
                  selectedAddressId === address.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
            
                  onAddressSelect(address);
                }}
              >
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value={address.id} className="mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                        <h3 className="font-semibold text-sm md:text-base truncate">{address.name}</h3>
                        {address.is_default && (
                          <div className="flex items-center gap-1 text-yellow-600 flex-shrink-0">
                            <Star className="h-3 w-3 md:h-4 md:w-4 fill-current" />
                            <span className="text-xs font-medium">Default</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs md:text-sm break-words">
                        {address.street}, {address.city}, {address.state} {address.zip}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </RadioGroup>

          <div className="flex justify-center sm:justify-end pt-4">
            <Button
              onClick={onContinue}
              disabled={!selectedAddressId}
              size="lg"
              className="w-full sm:w-auto sm:min-w-32"
            >
              Continue to Payment
            </Button>
          </div>
        </>
      )}
    </div>
  );
};