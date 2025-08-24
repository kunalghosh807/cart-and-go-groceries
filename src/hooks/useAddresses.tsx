import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  is_default?: boolean;
}

export const useAddresses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAddresses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('addresses')
        .select('id, name, street, city, state, zip')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Handle missing columns gracefully
      const processedData = (data || []).map(addr => ({
        ...addr,
        phone: addr.phone || '',
        is_default: addr.is_default || false
      }));
      
      setAddresses(processedData);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: "Error loading addresses",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveAddress = async (addressData: Omit<Address, 'id'>) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // Only include columns that exist in the database
      const dbData = {
        name: addressData.name,
        street: addressData.street,
        city: addressData.city,
        state: addressData.state,
        zip: addressData.zip,
        user_id: user.id
      };
      
      // Insert only the columns that exist in the database
      const { error } = await supabase
        .from('addresses')
        .insert(dbData);
      
      if (error) throw error;
      
      await loadAddresses();
      toast({
        title: "Address saved",
        description: "Your address has been saved successfully.",
      });
      return true;
    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error saving address",
        description: "Please try again later.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: string, addressData: Partial<Address>) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // Only include columns that exist in the database
      const dbData: any = {};
      if (addressData.name !== undefined) dbData.name = addressData.name;
      if (addressData.street !== undefined) dbData.street = addressData.street;
      if (addressData.city !== undefined) dbData.city = addressData.city;
      if (addressData.state !== undefined) dbData.state = addressData.state;
      if (addressData.zip !== undefined) dbData.zip = addressData.zip;
      
      const { error } = await supabase
        .from('addresses')
        .update(dbData)
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await loadAddresses();
      toast({
        title: "Address updated",
        description: "Your address has been updated successfully.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error updating address",
        description: "Please try again later.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await loadAddresses();
      toast({
        title: "Address deleted",
        description: "The address has been removed from your profile.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error deleting address",
        description: "Please try again later.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (id: string) => {
    if (!user) return false;
    
    try {
      setLoading(true);
      
      // First, remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);
      
      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await loadAddresses();
      toast({
        title: "Default address updated",
        description: "Your default address has been updated.",
      });
      return true;
    } catch (error) {
      toast({
        title: "Error updating default address",
        description: "Please try again later.",
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user]);

  return {
    addresses,
    loading,
    loadAddresses,
    saveAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  };
};