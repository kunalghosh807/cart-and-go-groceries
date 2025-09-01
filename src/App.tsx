
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/hooks/useCart";
import { AuthProvider } from "@/contexts/AuthContext";
import ScrollToTop from "@/components/ScrollToTop";
import ErrorBoundary from "@/components/ErrorBoundary";
import MobileFooter from "@/components/MobileFooter";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Wishlist from "./pages/Wishlist";
import SavedAddresses from "./pages/SavedAddresses";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import SubcategoryProducts from "./pages/SubcategoryProducts";
import ProductDetail from "./pages/ProductDetail";

import Auth from "./pages/Auth";
import Search from "./pages/Search";
import Admin from "./pages/Admin";
import BannerManagement from "./pages/BannerManagement";
import CategoryManagement from "./pages/CategoryManagement";
import SubcategoryManagement from "./pages/SubcategoryManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/orders/:orderId" element={<OrderDetails />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/saved-addresses" element={<SavedAddresses />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/categories/:categoryId" element={<CategoryProducts />} />
              <Route path="/categories/:categoryId/:subcategoryId" element={<SubcategoryProducts />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/search" element={<Search />} />

              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/banners" element={<BannerManagement />} />
              <Route path="/admin/categories" element={<CategoryManagement />} />
              <Route path="/admin/subcategories" element={<SubcategoryManagement />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
            <MobileFooter />
          </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
