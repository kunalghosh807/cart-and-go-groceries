import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSubcategories } from '@/hooks/useSubcategories';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Edit, Trash2, Search, Package } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Subcategory } from '@/hooks/useSubcategories';

const SubcategoryManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subcategories, loading, refreshSubcategories } = useSubcategories(true);
  const { categories } = useCategories(true);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    image: '',
    active: true
  });
  const [productFormData, setProductFormData] = useState({
    name: '',
    price: '',
    image: '',
    category_id: '',
    description: '',
    stock_quantity: '0',
    deal_price: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (user.email !== 'kunalghosh807@yahoo.com') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
  }, [user, navigate, toast]);



  // Get categories that can have subcategories (empty categories or categories with existing subcategories)
  const getCategoriesAvailableForSubcategories = () => {
    // Filter categories based on category_type from database
    // Include: empty_category and subcategory_category
    // Exclude: productcard_category
    const filteredCategories = categories.filter(category => 
      category.category_type === 'empty_category' || 
      category.category_type === 'subcategory_category'
    );
    

    
    return filteredCategories;
  };

  const addSubcategory = async () => {
    if (!formData.name.trim() || !formData.category_id) {
      toast({
        title: "Invalid data",
        description: "Please enter a subcategory name and select a category",
        variant: "destructive",
      });
      return;
    }

    try {
      const insertData = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        image: formData.image.trim() || null,
        active: formData.active
      };

      const { error } = await supabase
        .from('subcategories')
        .insert([insertData]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Subcategory exists",
            description: "This subcategory name already exists in the selected category",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error adding subcategory",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      const categoryName = categories.find(cat => cat.id === formData.category_id)?.name || 'Unknown';
      toast({
        title: "Subcategory added",
        description: `Subcategory "${formData.name.trim()}" has been added to "${categoryName}"`,
      });
      
      setFormData({ name: '', category_id: '', image: '', active: true });
      setIsAddModalOpen(false);
      refreshSubcategories();
    } catch (error) {
      console.error('Error adding subcategory:', error);
      toast({
        title: "Error adding subcategory",
        description: "Failed to add subcategory",
        variant: "destructive",
      });
    }
  };

  const updateSubcategory = async () => {
    if (!selectedSubcategory || !formData.name.trim() || !formData.category_id) {
      toast({
        title: "Invalid data",
        description: "Please enter a subcategory name and select a category",
        variant: "destructive",
      });
      return;
    }

    try {
      const updateData = {
        name: formData.name.trim(),
        category_id: formData.category_id,
        image: formData.image.trim() || null,
        active: formData.active
      };

      const { error } = await supabase
        .from('subcategories')
        .update(updateData)
        .eq('id', selectedSubcategory.id);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Subcategory exists",
            description: "This subcategory name already exists in the selected category",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error updating subcategory",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: "Subcategory updated",
        description: `Subcategory "${formData.name.trim()}" has been updated`,
      });
      
      setFormData({ name: '', category_id: '', image: '', active: true });
      setIsEditModalOpen(false);
      setSelectedSubcategory(null);
      refreshSubcategories();
    } catch (error) {
      console.error('Error updating subcategory:', error);
      toast({
        title: "Error updating subcategory",
        description: "Failed to update subcategory",
        variant: "destructive",
      });
    }
  };

  const deleteSubcategory = async () => {
    if (!selectedSubcategory) return;

    try {
      const { error } = await supabase
        .from('subcategories')
        .delete()
        .eq('id', selectedSubcategory.id);

      if (error) {
        toast({
          title: "Error deleting subcategory",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Subcategory deleted",
        description: `Subcategory "${selectedSubcategory.name}" has been deleted`,
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedSubcategory(null);
      refreshSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast({
        title: "Error deleting subcategory",
        description: "Failed to delete subcategory",
        variant: "destructive",
      });
    }
  };

  const toggleSubcategoryStatus = async (subcategory: Subcategory, active: boolean) => {
    try {
      const { error } = await supabase
        .from('subcategories')
        .update({ active })
        .eq('id', subcategory.id);

      if (error) {
        toast({
          title: "Error updating subcategory",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Subcategory updated",
        description: `Subcategory "${subcategory.name}" has been ${active ? 'activated' : 'deactivated'}`,
      });

      refreshSubcategories();
    } catch (error) {
      console.error('Error toggling subcategory status:', error);
      toast({
        title: "Error updating subcategory",
        description: "Failed to update subcategory status",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (subcategory: Subcategory) => {
    setSelectedSubcategory(subcategory);
    setFormData({
      name: subcategory.name,
      category_id: subcategory.category_id,
      image: subcategory.image || '',
      active: subcategory.active !== false
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (subcategory: any) => {
    setSelectedSubcategory(subcategory);
    setIsDeleteDialogOpen(true);
  };

  // Get categories that have no subcategories (can have direct products)
  const getCategoriesWithoutSubcategories = () => {
    return categories.filter(category => {
      const hasSubcategories = subcategories.some(sub => sub.category_id === category.id);
      return !hasSubcategories;
    });
  };

  const openProductModal = () => {
    setProductFormData({
        name: '',
        price: '',
        image: '',
        category_id: '',
        description: '',
        stock_quantity: '0',
        deal_price: ''
      });
    setIsProductModalOpen(true);
  };

  const addProductDirectly = async () => {
    if (!productFormData.name.trim() || !productFormData.price || !productFormData.category_id || !productFormData.image.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields including image URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedCat = categories.find(cat => cat.id === productFormData.category_id);
      
      const insertData = {
        name: productFormData.name.trim(),
        price: parseFloat(productFormData.price),
        image: productFormData.image || 'https://via.placeholder.com/300x300?text=No+Image',
        category: selectedCat?.name || '',
        category_id: productFormData.category_id,
        subcategory_id: null, // Direct to category, no subcategory
        description: productFormData.description.trim() || null,
        stock_quantity: parseInt(productFormData.stock_quantity) || 0,
        deal_price: productFormData.deal_price ? parseFloat(productFormData.deal_price) : null
      };

      const { error } = await supabase
        .from('products')
        .insert([insertData]);

      if (error) {
        toast({
          title: "Error adding product",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Product added",
        description: `Product "${productFormData.name.trim()}" has been added to ${selectedCat?.name}`,
      });
      
      setIsProductModalOpen(false);
      setProductFormData({
        name: '',
        price: '',
        image: '',
        category_id: '',
        description: '',
        stock_quantity: '0',
        deal_price: ''
      });
    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error adding product",
        description: "Failed to add product",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading subcategories...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Subcategory Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your product subcategories and their organization
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={openProductModal}
              variant="outline"
              className="flex items-center gap-2"
              disabled={getCategoriesWithoutSubcategories().length === 0}
            >
              <Package className="h-4 w-4" />
              Add Products Directly
            </Button>
            <Button 
              onClick={() => {
                setFormData({ name: '', category_id: '', image: '', active: true });
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Subcategory
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subcategories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                {subcategories.filter(subcategory => {
                  const matchesSearch = subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       (subcategory.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesCategory = categoryFilter === 'all' || subcategory.category_id === categoryFilter;
                  return matchesSearch && matchesCategory;
                }).length} subcategories
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subcategories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Subcategories</CardTitle>
          </CardHeader>
          <CardContent>
            {subcategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No subcategories found</p>
                <Button 
                  onClick={() => {
                    setFormData({ name: '', category_id: '', image: '', active: true });
                    setIsAddModalOpen(true);
                  }}
                  className="mt-4"
                >
                  Add Your First Subcategory
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subcategory Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="w-[100px]">Active</TableHead>
                    <TableHead className="w-[150px]">Created</TableHead>
                    <TableHead className="w-[80px]">Edit</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subcategories.filter(subcategory => {
                    const matchesSearch = subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         (subcategory.categories?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesCategory = categoryFilter === 'all' || subcategory.category_id === categoryFilter;
                    return matchesSearch && matchesCategory;
                  }).map((subcategory) => (
                    <TableRow key={subcategory.id}>
                      <TableCell className="font-medium">{subcategory.name}</TableCell>
                      <TableCell>{subcategory.categories?.name || 'Unknown'}</TableCell>
                      <TableCell>
                        <Switch
                          checked={subcategory.active !== false}
                          onCheckedChange={(checked) => toggleSubcategoryStatus(subcategory, checked)}
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(subcategory.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditModal(subcategory)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(subcategory)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subcategory</DialogTitle>
              <DialogDescription>
                Add a new subcategory to organize your products
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="categorySelect">Select Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoriesAvailableForSubcategories().map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subcategoryName">Subcategory Name *</Label>
                <Input
                  id="subcategoryName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter subcategory name"
                />
              </div>
              
              <div>
                <Label htmlFor="subcategoryImage">Subcategory Image URL (optional)</Label>
                <Input
                  id="subcategoryImage"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="subcategoryActive"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="subcategoryActive">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddModalOpen(false);
                setFormData({ name: '', category_id: '', image: '', active: true });
              }}>
                Cancel
              </Button>
              <Button onClick={addSubcategory}>
                Add Subcategory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subcategory</DialogTitle>
              <DialogDescription>
                Update subcategory information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCategorySelect">Select Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoriesAvailableForSubcategories().map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="editSubcategoryName">Subcategory Name *</Label>
                <Input
                  id="editSubcategoryName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter subcategory name"
                />
              </div>
              
              <div>
                <Label htmlFor="editSubcategoryImage">Subcategory Image URL (optional)</Label>
                <Input
                  id="editSubcategoryImage"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="editSubcategoryActive"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                />
                <Label htmlFor="editSubcategoryActive">Active</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditModalOpen(false);
                setFormData({ name: '', category_id: '', image: '', active: true });
                setSelectedSubcategory(null);
              }}>
                Cancel
              </Button>
              <Button onClick={updateSubcategory}>
                Update Subcategory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subcategory</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the subcategory "{selectedSubcategory?.name}"? 
                This action cannot be undone and may affect products in this subcategory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedSubcategory(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={deleteSubcategory} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Add Product Directly Modal */}
        <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Product Directly to Category</DialogTitle>
              <DialogDescription>
                Add a product directly to a category that has no subcategories
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="productCategory">Select Category *</Label>
                <Select
                  value={productFormData.category_id}
                  onValueChange={(value) => setProductFormData({ ...productFormData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category without subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCategoriesWithoutSubcategories().map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-1">
                  Only categories without subcategories are shown
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    value={productFormData.name}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="productPrice">Price *</Label>
                  <Input
                    id="productPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productFormData.price}
                    onChange={(e) => setProductFormData({ ...productFormData, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="productImage">Product Image URL *</Label>
                <Input
                  id="productImage"
                  value={productFormData.image}
                  onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                  placeholder="Enter image URL"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="productDescription">Description</Label>
                <Textarea
                  id="productDescription"
                  value={productFormData.description}
                  onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                  placeholder="Enter product description (optional)"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productStock">Stock Quantity</Label>
                  <Input
                    id="productStock"
                    type="number"
                    min="0"
                    value={productFormData.stock_quantity}
                    onChange={(e) => setProductFormData({ ...productFormData, stock_quantity: e.target.value })}
                    placeholder="Enter stock quantity"
                  />
                </div>
                
                <div>
                  <Label htmlFor="productDealPrice">Deal Price (optional)</Label>
                  <Input
                    id="productDealPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={productFormData.deal_price}
                    onChange={(e) => setProductFormData({ ...productFormData, deal_price: e.target.value })}
                    placeholder="Enter deal price"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsProductModalOpen(false);
                setProductFormData({
                  name: '',
                  price: '',
                  image: '',
                  category_id: '',
                  description: '',
                  stock_quantity: '0',
                  deal_price: ''
                });
              }}>
                Cancel
              </Button>
              <Button onClick={addProductDirectly}>
                Add Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default SubcategoryManagement;