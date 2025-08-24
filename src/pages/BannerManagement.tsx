import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Edit, Trash2, MoreHorizontal, ImageIcon } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
  created_at?: string;
}

const BannerManagement = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    display_order: 1,
    is_active: true
  });

  // Load banners from database
  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
      toast({
        title: "Error loading banners",
        description: "Failed to load banners from database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // Open add modal
  const openAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      display_order: banners.length + 1,
      is_active: true
    });
    setIsModalOpen(true);
  };

  // Open edit modal
  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      image_url: banner.image_url,
      display_order: banner.display_order,
      is_active: banner.is_active
    });
    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.image_url.trim()) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingBanner) {
        // Update existing banner with automatic order reordering
        const newOrder = formData.display_order;
        const currentOrder = editingBanner.display_order;
        
        // If order is changing, handle reordering
        if (newOrder !== currentOrder) {
          if (newOrder < currentOrder) {
             // Moving up: increment orders of banners between newOrder and currentOrder-1
             const { data: bannersToUpdate, error: fetchError } = await supabase
               .from('banners')
               .select('id, display_order')
               .gte('display_order', newOrder)
               .lt('display_order', currentOrder)
               .neq('id', editingBanner.id);
             
             if (fetchError) throw fetchError;
             
             if (bannersToUpdate && bannersToUpdate.length > 0) {
               for (const banner of bannersToUpdate) {
                 const { error: updateError } = await supabase
                   .from('banners')
                   .update({ display_order: banner.display_order + 1 })
                   .eq('id', banner.id);
                 
                 if (updateError) throw updateError;
               }
             }
          } else {
            // Moving down: decrement orders of banners between currentOrder+1 and newOrder
            const { data: bannersToUpdate, error: fetchError } = await supabase
              .from('banners')
              .select('id, display_order')
              .gt('display_order', currentOrder)
              .lte('display_order', newOrder)
              .neq('id', editingBanner.id);
            
            if (fetchError) throw fetchError;
            
            if (bannersToUpdate && bannersToUpdate.length > 0) {
              for (const banner of bannersToUpdate) {
                const { error: updateError } = await supabase
                  .from('banners')
                  .update({ display_order: banner.display_order - 1 })
                  .eq('id', banner.id);
                
                if (updateError) throw updateError;
              }
            }
          }
        }
        
        // Now update the banner itself
        const { error } = await supabase
          .from('banners')
          .update({
            title: formData.title.trim(),
            description: formData.description.trim(),
            image_url: formData.image_url.trim(),
            display_order: newOrder,
            is_active: formData.is_active
          })
          .eq('id', editingBanner.id);

        if (error) throw error;

        toast({
          title: "Banner updated",
          description: "Banner has been updated successfully with automatic order reordering",
        });
      } else {
        // Add new banner with automatic order reordering
        const newOrder = formData.display_order;
        
        // Check if there are existing banners with the same or higher order
        const { data: existingBanners, error: fetchError } = await supabase
          .from('banners')
          .select('id, display_order')
          .gte('display_order', newOrder)
          .order('display_order', { ascending: true });

        if (fetchError) throw fetchError;

        // If there are existing banners with same or higher order, increment their orders
        if (existingBanners && existingBanners.length > 0) {
          for (const banner of existingBanners) {
            const { error: updateError } = await supabase
              .from('banners')
              .update({ display_order: banner.display_order + 1 })
              .eq('id', banner.id);
            
            if (updateError) throw updateError;
          }
        }

        // Now insert the new banner with the desired order
        const { error } = await supabase
          .from('banners')
          .insert([{
            title: formData.title.trim(),
            description: formData.description.trim(),
            image_url: formData.image_url.trim(),
            display_order: newOrder,
            is_active: formData.is_active
          }]);

        if (error) throw error;

        toast({
          title: "Banner added",
          description: "New banner has been added successfully with automatic order reordering",
        });
      }

      setIsModalOpen(false);
      loadBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast({
        title: "Error saving banner",
        description: "Failed to save banner. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Delete banner
  const deleteBanner = async (bannerId: string) => {
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', bannerId);

      if (error) throw error;

      toast({
        title: "Banner deleted",
        description: "Banner has been deleted successfully",
      });
      
      loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast({
        title: "Error deleting banner",
        description: "Failed to delete banner. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Toggle banner active status
  const toggleBannerStatus = async (bannerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !currentStatus })
        .eq('id', bannerId);

      if (error) throw error;

      toast({
        title: "Banner status updated",
        description: `Banner has been ${!currentStatus ? 'activated' : 'deactivated'}`,
      });
      
      loadBanners();
    } catch (error) {
      console.error('Error updating banner status:', error);
      toast({
        title: "Error updating banner",
        description: "Failed to update banner status. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading banner management...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin
            </Button>
            <h1 className="text-3xl font-bold">Banner Management</h1>
          </div>
          <Button onClick={openAddModal} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Banner
          </Button>
        </div>

        {/* Banners Table */}
        <Card>
          <CardHeader>
            <CardTitle>Homepage Banners</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[100px]">Order</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[80px]">Edit</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <img 
                        src={banner.image_url} 
                        alt={banner.title}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell className="text-muted-foreground">{banner.description}</TableCell>
                    <TableCell>{banner.display_order}</TableCell>
                    <TableCell>
                      <Button
                        variant={banner.is_active ? "default" : "secondary"}
                        size="sm"
                        onClick={() => toggleBannerStatus(banner.id, banner.is_active)}
                      >
                        {banner.is_active ? 'Active' : 'Inactive'}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditModal(banner)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-background">
                          <DropdownMenuItem onClick={() => openEditModal(banner)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Banner
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => e.preventDefault()}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the banner.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteBanner(banner.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {banners.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No banners found. Add your first banner to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add/Edit Banner Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
              <DialogDescription>
                {editingBanner ? 'Update banner information' : 'Add a new banner to your homepage'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter banner title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter banner description"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="image_url">Image URL *</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                  id="display_order"
                  type="number"
                  min="1"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBanner ? 'Update Banner' : 'Add Banner'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default BannerManagement;