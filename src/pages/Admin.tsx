import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Edit, 
  Package, 
  Search, 
  Plus, 
  ImageIcon, 
  DollarSign,
  ArrowUpDown,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { categories } from '@/data/mockData';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  subcategory: string | null;
  description: string | null;
  stock_quantity: number;
  deal_price: number | null;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: '',
    category: '',
    subcategory: '',
    description: '',
    stock_quantity: '',
    deal_price: ''
  });

  const [priceUpdateData, setPriceUpdateData] = useState({
    productId: '',
    currentPrice: 0,
    newPrice: ''
  });

  const [imageUpdateData, setImageUpdateData] = useState({
    productId: '',
    currentImage: '',
    newImage: ''
  });

  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    order_number: ''
  });
  const [newSubcategoryData, setNewSubcategoryData] = useState({
    category: '',
    subcategory: '',
    image: ''
  });

  // Database categories and subcategories state
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbSubcategories, setDbSubcategories] = useState<any[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    // Check if user is admin (specific email address)
    if (user.email !== 'kunalghosh807@yahoo.com') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    loadProducts();
    loadCategories();
    loadSubcategories();
  }, [user, navigate, toast]);

  const loadProducts = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      // First try to order by order_number
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_number', { ascending: true });
      
      if (error && error.code === '42703') {
        // Column doesn't exist, fallback to ordering by name
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('categories')
          .select('*')
          .order('name', { ascending: true });
        
        if (fallbackError) {
          console.error('Error loading categories:', fallbackError);
        } else {
          setDbCategories(fallbackData || []);
        }
      } else if (error) {
        console.error('Error loading categories:', error);
      } else {
        setDbCategories(data || []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadSubcategories = async () => {
    const { data, error } = await supabase
      .from('subcategories')
      .select(`
        *,
        categories (
          id,
          name
        )
      `)
      .order('name');
    
    if (error) {
      // Error handled silently in production
    } else {
      setDbSubcategories(data || []);
    }
  };

  // Get unique categories from products
  const uniqueCategories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category))];
    return cats.sort();
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'in_stock' && product.stock_quantity > 0) ||
                           (statusFilter === 'out_of_stock' && product.stock_quantity === 0);

      return matchesSearch && matchesCategory && matchesStatus;
    });

    // Sort products
    filtered.sort((a, b) => {
      let aValue = a[sortBy as keyof Product];
      let bValue = b[sortBy as keyof Product];

      if (sortBy === 'price' || sortBy === 'stock_quantity') {
        aValue = Number(aValue);
        bValue = Number(bValue);
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [products, searchTerm, categoryFilter, statusFilter, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      image: '',
      category: '',
      subcategory: '',
      description: '',
      stock_quantity: '',
      deal_price: ''
    });
    setEditingProduct(null);
  };

  // Get main categories from database
  const mainCategories = dbCategories.map(cat => cat.name);

  // Get subcategories for selected category from database
  const getSubcategoriesForCategory = (category: string) => {
    const categoryFromDb = dbCategories.find(cat => cat.name === category);
    if (!categoryFromDb) return [];
    return dbSubcategories
      .filter(sub => sub.category_id === categoryFromDb.id)
      .map(sub => sub.name);
  };

  // Add new category
  const addCategory = async () => {
    if (!newCategoryData.name.trim()) {
      toast({
        title: "Invalid data",
        description: "Please enter a valid category name",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if order_number column exists by trying to fetch categories with order_number
      const { data: testCategories } = await supabase
        .from('categories')
        .select('order_number')
        .limit(1);

      const hasOrderColumn = testCategories && testCategories.length > 0 && 
        testCategories[0].hasOwnProperty('order_number');

      let insertData = { name: newCategoryData.name.trim() };

      if (hasOrderColumn) {
        // Order number validation only if column exists
        if (!newCategoryData.order_number.trim()) {
          toast({
            title: "Invalid data",
            description: "Please enter a valid order number",
            variant: "destructive",
          });
          return;
        }

        const orderNumber = parseInt(newCategoryData.order_number);
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
      } else {
        // If order_number column doesn't exist, show a warning but still allow category creation
        console.warn('order_number column not found in categories table. Please add it manually.');
      }

      const { error } = await supabase
        .from('categories')
        .insert([insertData]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
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
        description: `Category "${newCategoryData.name.trim()}" has been added${hasOrderColumn ? ` at position ${insertData.order_number}` : ''}`,
      });
      
      setNewCategoryData({ name: '', order_number: '' });
      setIsCategoryModalOpen(false);
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

  // Add new subcategory
  const addSubcategory = async () => {
    if (!newSubcategoryData.category || !newSubcategoryData.subcategory.trim()) {
      toast({
        title: "Invalid data",
        description: "Please select a category and enter a subcategory name",
        variant: "destructive",
      });
      return;
    }

    const category = dbCategories.find(cat => cat.name === newSubcategoryData.category);
    if (!category) {
      toast({
        title: "Category not found",
        description: "Selected category does not exist",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('subcategories')
      .insert([{
        name: newSubcategoryData.subcategory.trim(),
        category_id: category.id,
        image: newSubcategoryData.image.trim() || null
      }]);

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        toast({
          title: "Subcategory exists",
          description: "This subcategory already exists in the selected category",
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
    
    toast({
      title: "Subcategory added",
      description: `Subcategory "${newSubcategoryData.subcategory.trim()}" has been added to "${newSubcategoryData.category}"`,
    });
    
    setNewSubcategoryData({ category: '', subcategory: '', image: '' });
    setIsSubcategoryModalOpen(false);
    loadSubcategories();
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setFormData({
      name: product.name,
      price: product.price.toString(),
      image: product.image,
      category: product.category,
      subcategory: product.subcategory || '',
      description: product.description || '',
      stock_quantity: product.stock_quantity.toString(),
      deal_price: product.deal_price?.toString() || ''
    });
    setEditingProduct(product);
    setIsEditModalOpen(true);
  };

  const openPriceModal = (product: Product) => {
    setPriceUpdateData({
      productId: product.id,
      currentPrice: product.price,
      newPrice: ''
    });
    setIsPriceModalOpen(true);
  };

  const openImageModal = (product: Product) => {
    setImageUpdateData({
      productId: product.id,
      currentImage: product.image,
      newImage: ''
    });
    setIsImageModalOpen(true);
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
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      resetForm();
      loadProducts();
    }
  };

  const updatePrice = async () => {
    const newPrice = parseFloat(priceUpdateData.newPrice);
    if (newPrice <= 0) {
      toast({
        title: "Invalid price",
        description: "Price must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ price: newPrice })
      .eq('id', priceUpdateData.productId);

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
      setIsPriceModalOpen(false);
      setPriceUpdateData({ productId: '', currentPrice: 0, newPrice: '' });
      loadProducts();
    }
  };

  const updateImage = async () => {
    if (!imageUpdateData.newImage) {
      toast({
        title: "Invalid image",
        description: "Please provide a valid image URL",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('products')
      .update({ image: imageUpdateData.newImage })
      .eq('id', imageUpdateData.productId);

    if (error) {
      toast({
        title: "Error updating image",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Image updated",
        description: "Product image updated successfully",
      });
      setIsImageModalOpen(false);
      setImageUpdateData({ productId: '', currentImage: '', newImage: '' });
      loadProducts();
    }
  };

  const toggleStock = async (productId: string, currentStock: number) => {
    const newStock = currentStock > 0 ? 0 : 10; // Set to 10 if out of stock, 0 if in stock
    
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newStock })
      .eq('id', productId);

    if (error) {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Stock updated",
        description: `Product ${newStock > 0 ? 'marked in stock' : 'marked out of stock'}`,
      });
      loadProducts();
    }
  };

  const updateStockQuantity = async (productId: string, newQuantity: number) => {
    const { error } = await supabase
      .from('products')
      .update({ stock_quantity: newQuantity })
      .eq('id', productId);

    if (error) {
      toast({
        title: "Error updating stock",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Stock updated",
        description: "Stock quantity updated successfully",
      });
      loadProducts();
    }
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

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Product Management</h1>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/admin/banners')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Banner
            </Button>
            <Button 
              onClick={() => navigate('/admin/categories')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Category
            </Button>
            <Button 
              onClick={() => navigate('/admin/subcategories')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Subcategory
            </Button>
            <Button onClick={openAddModal} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={(value) => {
                setCategoryFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Package className="h-4 w-4" />
                {filteredAndSortedProducts.length} products
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 w-[100px]"
                    onClick={() => handleSort('category')}
                  >
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead className="w-[80px]">Image</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    Product Name
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 w-[100px]"
                    onClick={() => handleSort('stock_quantity')}
                  >
                    Stock
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 w-[100px]"
                    onClick={() => handleSort('price')}
                  >
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4 inline" />
                  </TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[80px]">Edit</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {product.subcategory}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={product.stock_quantity}
                        onChange={(e) => {
                          const newQuantity = parseInt(e.target.value) || 0;
                          updateStockQuantity(product.id, newQuantity);
                        }}
                        className="w-16 h-8"
                        min="0"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">₹{product.price}</div>
                      {product.deal_price && (
                        <div className="text-sm text-green-600">
                          Deal: ₹{product.deal_price}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.stock_quantity > 0}
                          onCheckedChange={() => toggleStock(product.id, product.stock_quantity)}
                        />
                        <span className="text-xs">
                          {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => openEditModal(product)}
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
                          <DropdownMenuItem onClick={() => openPriceModal(product)}>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Update Price
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openImageModal(product)}>
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Update Image
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                className="text-destructive cursor-pointer"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{product.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteProduct(product.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
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
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
            
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => {
          if (!open) {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update product information' : 'Add a new product to your store'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ 
                    ...formData, 
                    category: value,
                    subcategory: '' // Reset subcategory when category changes
                  })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {mainCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="price">Price *</Label>
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
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="image">Image URL *</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={formData.subcategory}
                    onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                    disabled={!formData.category || getSubcategoriesForCategory(formData.category).length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {getSubcategoriesForCategory(formData.category).map((subcategory) => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="deal_price">Deal Price (optional)</Label>
                  <Input
                    id="deal_price"
                    type="number"
                    step="0.01"
                    value={formData.deal_price}
                    onChange={(e) => setFormData({ ...formData, deal_price: e.target.value })}
                    placeholder="Enter deal price"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
                

              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Price Update Modal */}
        <Dialog open={isPriceModalOpen} onOpenChange={setIsPriceModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Price</DialogTitle>
              <DialogDescription>
                Update the price for this product
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Current Price: ₹{priceUpdateData.currentPrice}</Label>
              </div>
              <div>
                <Label htmlFor="newPrice">New Price</Label>
                <Input
                  id="newPrice"
                  type="number"
                  step="0.01"
                  value={priceUpdateData.newPrice}
                  onChange={(e) => setPriceUpdateData({
                    ...priceUpdateData,
                    newPrice: e.target.value
                  })}
                  placeholder="Enter new price"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPriceModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updatePrice}>
                Update Price
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Update Modal */}
        <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Image</DialogTitle>
              <DialogDescription>
                Update the product image
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Current Image:</Label>
                <img 
                  src={imageUpdateData.currentImage} 
                  alt="Current product"
                  className="w-32 h-32 object-cover rounded mt-2"
                />
              </div>
              <div>
                <Label htmlFor="newImage">New Image URL</Label>
                <Input
                  id="newImage"
                  value={imageUpdateData.newImage}
                  onChange={(e) => setImageUpdateData({
                    ...imageUpdateData,
                    newImage: e.target.value
                  })}
                  placeholder="Enter new image URL"
                />
              </div>
              {imageUpdateData.newImage && (
                <div>
                  <Label>Preview:</Label>
                  <img 
                    src={imageUpdateData.newImage} 
                    alt="New product preview"
                    className="w-32 h-32 object-cover rounded mt-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsImageModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={updateImage}>
                Update Image
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Category Modal */}
        <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
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
                  value={newCategoryData.name}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, name: e.target.value })}
                  placeholder="Enter category name"
                />
              </div>
              <div>
                <Label htmlFor="categoryOrder">Order Number (optional)</Label>
                <Input
                  id="categoryOrder"
                  type="number"
                  min="1"
                  value={newCategoryData.order_number}
                  onChange={(e) => setNewCategoryData({ ...newCategoryData, order_number: e.target.value })}
                  placeholder="Enter order number (1, 2, 3...)"
                />
                <p className="text-sm text-gray-500 mt-1">
                  This determines the position of the category on the home page. If the order number already exists, other categories will be automatically rearranged.
                  <br />
                  <span className="text-amber-600">Note: Order functionality requires database setup. Categories will be ordered by name if order numbers are not available.</span>
                </p>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCategoryModalOpen(false);
                setNewCategoryData({ name: '', order_number: '' });
              }}>
                Cancel
              </Button>
              <Button onClick={addCategory}>
                Add Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Subcategory Modal */}
        <Dialog open={isSubcategoryModalOpen} onOpenChange={setIsSubcategoryModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subcategory</DialogTitle>
              <DialogDescription>
                Add a new subcategory to an existing category
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="categorySelect">Select Category *</Label>
                <Select
                  value={newSubcategoryData.category}
                  onValueChange={(value) => setNewSubcategoryData({
                    ...newSubcategoryData,
                    category: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainCategories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="subcategoryName">Subcategory Name *</Label>
                <Input
                  id="subcategoryName"
                  value={newSubcategoryData.subcategory}
                  onChange={(e) => setNewSubcategoryData({
                    ...newSubcategoryData,
                    subcategory: e.target.value
                  })}
                  placeholder="Enter subcategory name"
                />
              </div>
              
              <div>
                <Label htmlFor="subcategoryImage">Subcategory Image URL (optional)</Label>
                <Input
                  id="subcategoryImage"
                  value={newSubcategoryData.image}
                  onChange={(e) => setNewSubcategoryData({
                    ...newSubcategoryData,
                    image: e.target.value
                  })}
                  placeholder="Enter image URL"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsSubcategoryModalOpen(false);
                setNewSubcategoryData({ category: '', subcategory: '', image: '' });
              }}>
                Cancel
              </Button>
              <Button onClick={addSubcategory}>
                Add Subcategory
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
};

export default Admin;