import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface Category {
  id: string;
  name: string;
  order_number?: number;
  created_at: string;
  updated_at: string;
}

const CategoryManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [hasOrderColumn, setHasOrderColumn] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    order_number: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user is admin
    if (user.email !== 'kunalghosh807@yahoo.com') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    loadCategories();
  }, [user, navigate, toast]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Homepage category order from mockData.ts
      const homepageOrder = [
        "Vegetables & Fruits",
        "Atta, Rice & Dal",
        "Oil, Ghee & Masala",
        "Dairy, Bread & Eggs",
        "Bakery & Biscuits",
        "Dry Fruits & Cereals",
        "Chicken, Meat & Fish",
        "Kitchenware & Appliances",
        "Chips & Namkeen",
        "Sweets & Chocolates",
        "Drinks & Juices",
        "Tea, Coffee & Milk Drinks",
        "Instant Food",
        "Sauces & Spreads",
        "Paan Corner",
        "Cakes",
        "Bath & Body",
        "Hair",
        "Skin & Face",
        "Beauty & Cosmetics",
        "Feminine Hygiene",
        "Baby Care",
        "Health & Pharma",
        "Sexual Wellness"
      ];
      
      // First try to order by order_number to check if column exists
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_number', { ascending: true });
      
      if (error && error.code === '42703') {
        // Column doesn't exist, fallback to fetching all categories
        console.log('Order column does not exist, using fallback sorting');
        setHasOrderColumn(false);
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('categories')
          .select('*');
        
        if (fallbackError) {
          console.error('Error loading categories:', fallbackError);
          toast({
            title: "Error",
            description: "Failed to load categories",
            variant: "destructive",
          });
        } else {
          // Sort categories according to homepage order
          const sortedCategories = (fallbackData || []).sort((a, b) => {
            const aIndex = homepageOrder.indexOf(a.name);
            const bIndex = homepageOrder.indexOf(b.name);
            
            // If both categories are in homepage order, sort by their position
            if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex;
            }
            // If only one is in homepage order, prioritize it
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            // If neither is in homepage order, sort alphabetically
            return a.name.localeCompare(b.name);
          });
          setCategories(sortedCategories);
        }
      } else if (error) {
        console.error('Error loading categories:', error);
        toast({
          title: "Error",
          description: "Failed to load categories",
          variant: "destructive",
        });
      } else {
        console.log('Order column exists, using order_number sorting');
        setHasOrderColumn(true);
        // Sort categories according to homepage order, but also respect order_number
        const sortedCategories = (data || []).sort((a, b) => {
          // If both have order_number, use that
          if (a.order_number && b.order_number) {
            return a.order_number - b.order_number;
          }
          // If only one has order_number, prioritize it
          if (a.order_number) return -1;
          if (b.order_number) return 1;
          
          // Otherwise, use homepage order
          const aIndex = homepageOrder.indexOf(a.name);
          const bIndex = homepageOrder.indexOf(b.name);
          
          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
          }
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.name.localeCompare(b.name);
        });
        setCategories(sortedCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addCategory = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Invalid data",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    try {
      let insertData: any = { name: formData.name.trim() };

      if (hasOrderColumn) {
        if (!formData.order_number.trim()) {
          toast({
            title: "Invalid data",
            description: "Please enter a valid order number",
            variant: "destructive",
          });
          return;
        }

        const orderNumber = parseInt(formData.order_number);
        if (isNaN(orderNumber) || orderNumber < 1) {
          toast({
            title: "Invalid order number",
            description: "Order number must be a positive integer",
            variant: "destructive",
          });
          return;
        }

        // Check if order number already exists and auto-rearrange if needed
        const { data: existingCategory } = await supabase
          .from('categories')
          .select('id, order_number')
          .eq('order_number', orderNumber)
          .single();

        if (existingCategory) {
          // Shift all categories with order_number >= new order_number by +1
          const { error: shiftError } = await supabase.rpc('shift_category_orders', {
            start_order: orderNumber
          });

          if (shiftError) {
            // Fallback: manually shift orders
            const { data: categoriesToShift } = await supabase
              .from('categories')
              .select('id, order_number')
              .gte('order_number', orderNumber)
              .order('order_number', { ascending: false });

            if (categoriesToShift) {
              for (const cat of categoriesToShift) {
                await supabase
                  .from('categories')
                  .update({ order_number: cat.order_number + 1 })
                  .eq('id', cat.id);
              }
            }
          }
        }

        insertData.order_number = orderNumber;
      }

      const { error } = await supabase
        .from('categories')
        .insert([insertData]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Category exists",
            description: "This category name already exists",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error adding category",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: "Category added",
        description: `Category "${formData.name.trim()}" has been added${hasOrderColumn ? ` at position ${insertData.order_number}` : ''}`,
      });
      
      setFormData({ name: '', order_number: '' });
      setIsAddModalOpen(false);
      loadCategories();
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: "Error adding category",
        description: "Failed to add category",
        variant: "destructive",
      });
    }
  };

  const updateCategory = async () => {
    if (!selectedCategory || !formData.name.trim()) {
      toast({
        title: "Invalid data",
        description: "Please enter a category name",
        variant: "destructive",
      });
      return;
    }

    try {
      let updateData: any = { name: formData.name.trim() };

      if (hasOrderColumn && formData.order_number.trim()) {
        const orderNumber = parseInt(formData.order_number);
        if (isNaN(orderNumber) || orderNumber < 1) {
          toast({
            title: "Invalid order number",
            description: "Order number must be a positive integer",
            variant: "destructive",
          });
          return;
        }
        updateData.order_number = orderNumber;
      }

      const { error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', selectedCategory.id);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Category exists",
            description: "This category name already exists",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error updating category",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      toast({
        title: "Category updated",
        description: `Category "${formData.name.trim()}" has been updated`,
      });
      
      setFormData({ name: '', order_number: '' });
      setIsEditModalOpen(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({
        title: "Error updating category",
        description: "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const deleteCategory = async () => {
    if (!selectedCategory) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', selectedCategory.id);

      if (error) {
        toast({
          title: "Error deleting category",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Category deleted",
        description: `Category "${selectedCategory.name}" has been deleted`,
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Error deleting category",
        description: "Failed to delete category",
        variant: "destructive",
      });
    }
  };

  const moveCategory = async (category: Category, direction: 'up' | 'down') => {
    if (!hasOrderColumn) {
      toast({
        title: "Feature unavailable",
        description: "Order functionality requires database setup",
        variant: "destructive",
      });
      return;
    }

    const currentOrder = category.order_number || 0;
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1;

    if (newOrder < 1) return;

    try {
      // Find category at target position
      const { data: targetCategory } = await supabase
        .from('categories')
        .select('id, order_number')
        .eq('order_number', newOrder)
        .single();

      if (targetCategory) {
        // Swap positions
        await supabase
          .from('categories')
          .update({ order_number: currentOrder })
          .eq('id', targetCategory.id);
      }

      await supabase
        .from('categories')
        .update({ order_number: newOrder })
        .eq('id', category.id);

      toast({
        title: "Category moved",
        description: `Category moved ${direction}`,
      });

      loadCategories();
    } catch (error) {
      console.error('Error moving category:', error);
      toast({
        title: "Error moving category",
        description: "Failed to move category",
        variant: "destructive",
      });
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      order_number: category.order_number?.toString() || ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading categories...</div>
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
            <h1 className="text-3xl font-bold">Category Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage your product categories, their order, and organization
            </p>
          </div>
          <Button 
            onClick={() => {
              setFormData({ name: '', order_number: '' });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {!hasOrderColumn && (
          <Card className="mb-6 border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3 text-amber-800">
                <div className="text-sm flex-1">
                  <div className="font-semibold mb-2">⚠️ Database Setup Required</div>
                  <p className="mb-3">
                    The <code className="bg-amber-100 px-1 rounded text-xs">order_number</code> column is missing from the categories table. 
                    Categories are currently displayed in their creation order as a fallback.
                  </p>
                  <div className="text-xs">
                    <strong>To enable full order management and remove this warning:</strong>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Go to <a href="https://supabase.com/dashboard/project/xyacjnaftqszstykzqwp/editor" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-900">Supabase Dashboard</a></li>
                      <li>Click on "SQL Editor" in the left sidebar</li>
                      <li>Run this SQL: <code className="bg-amber-100 px-1 rounded">ALTER TABLE categories ADD COLUMN order_number INTEGER;</code></li>
                      <li>Refresh this page to enable drag-and-drop ordering</li>
                    </ol>
                    <p className="mt-2 text-amber-700">
                      <strong>Alternative:</strong> Use Table Editor → categories table → Add Column → name: order_number, type: int4
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Categories ({categories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No categories found</p>
                <Button 
                  onClick={() => {
                    setFormData({ name: '', order_number: '' });
                    setIsAddModalOpen(true);
                  }}
                  className="mt-4"
                >
                  Add Your First Category
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">
                      {hasOrderColumn ? 'Order' : 'Position'}
                      {!hasOrderColumn && (
                        <div className="text-xs font-normal text-muted-foreground">
                          (Homepage)
                        </div>
                      )}
                    </TableHead>
                    <TableHead>Category Name</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[150px]">Created</TableHead>
                    <TableHead className="w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category, index) => {
                    // Current homepage category order based on actual database categories
                    const homepageOrder = [
                      "Beauty & Personal Care",
                      "Featured Products", 
                      "Grocery & Kitchen",
                      "Grocerry & Kitchen", // Handle typo in database
                      "Snacks & Drinks",
                      "Today's Deals"
                    ];
                    
                    // Get homepage position (1-based) or use database order if order_number exists
                    let displayOrder;
                    if (hasOrderColumn && category.order_number) {
                      displayOrder = category.order_number;
                    } else {
                      // Find position in homepage order, accounting for name variations
                      let homepagePosition = homepageOrder.indexOf(category.name);
                      if (homepagePosition === -1) {
                        // Handle name variations and typos
                        const normalizedName = category.name.toLowerCase().replace(/[^a-z\s]/g, '');
                        homepagePosition = homepageOrder.findIndex(name => 
                          name.toLowerCase().replace(/[^a-z\s]/g, '') === normalizedName
                        );
                      }
                      displayOrder = homepagePosition >= 0 ? homepagePosition + 1 : index + 1;
                    }
                    
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <span>{displayOrder}</span>
                            {hasOrderColumn && (
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveCategory(category, 'up')}
                                  disabled={index === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveCategory(category, 'down')}
                                  disabled={index === categories.length - 1}
                                  className="h-6 w-6 p-0"
                                >
                                  <ArrowDown className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{category.name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(category.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(category)}
                              className="flex items-center gap-1"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(category)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Add Category Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize your products
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="categoryName">Category Name *</Label>
                <Input
                  id="categoryName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              {hasOrderColumn && (
                <div>
                  <Label htmlFor="categoryOrder">Order Number *</Label>
                  <Input
                    id="categoryOrder"
                    type="number"
                    min="1"
                    value={formData.order_number}
                    onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                    placeholder="Enter order number (1, 2, 3...)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This determines the position of the category on the home page. 
                    If the order number already exists, other categories will be automatically rearranged.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsAddModalOpen(false);
                setFormData({ name: '', order_number: '' });
              }}>
                Cancel
              </Button>
              <Button onClick={addCategory}>
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Category Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>
                Update category information
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="editCategoryName">Category Name *</Label>
                <Input
                  id="editCategoryName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              {hasOrderColumn && (
                <div>
                  <Label htmlFor="editCategoryOrder">Order Number</Label>
                  <Input
                    id="editCategoryOrder"
                    type="number"
                    min="1"
                    value={formData.order_number}
                    onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                    placeholder="Enter order number (1, 2, 3...)"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    This determines the position of the category on the home page. 
                    If the order number already exists, other categories will be automatically rearranged.
                  </p>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsEditModalOpen(false);
                setFormData({ name: '', order_number: '' });
                setSelectedCategory(null);
              }}>
                Cancel
              </Button>
              <Button onClick={updateCategory}>
                Update Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Category Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Category</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete the category "{selectedCategory?.name}"? 
                This action cannot be undone and may affect products in this category.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => {
                setIsDeleteDialogOpen(false);
                setSelectedCategory(null);
              }}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={deleteCategory} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryManagement;