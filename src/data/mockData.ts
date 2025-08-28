
export const categories = [
  {
    id: "vegetables-fruits",
    name: "Vegetables & Fruits",
    image: "/placeholder.svg",
    productCount: 68
  },
  {
    id: "atta-rice-dal",
    name: "Atta, Rice & Dal",
    image: "/placeholder.svg",
    productCount: 45
  },
  {
    id: "oil-ghee-masala",
    name: "Oil, Ghee & Masala",
    image: "/placeholder.svg",
    productCount: 35
  },
  {
    id: "dairy-bread-eggs",
    name: "Dairy, Bread & Eggs",
    image: "/placeholder.svg",
    productCount: 52
  },
  {
    id: "bakery-biscuits",
    name: "Bakery & Biscuits",
    image: "/placeholder.svg",
    productCount: 38
  },
  {
    id: "dry-fruits-cereals",
    name: "Dry Fruits & Cereals",
    image: "/placeholder.svg",
    productCount: 29
  },
  {
    id: "chicken-meat-fish",
    name: "Chicken, Meat & Fish",
    image: "/placeholder.svg",
    productCount: 24
  },
  {
    id: "kitchenware-appliances",
    name: "Kitchenware & Appliances",
    image: "/placeholder.svg",
    productCount: 67
  },
  {
    id: "chips-namkeen",
    name: "Chips & Namkeen",
    image: "/placeholder.svg",
    productCount: 42
  },
  {
    id: "sweets-chocolates",
    name: "Sweets & Chocolates",
    image: "/placeholder.svg",
    productCount: 36
  },
  {
    id: "drinks-juices",
    name: "Drinks & Juices",
    image: "/placeholder.svg",
    productCount: 48
  },
  {
    id: "tea-coffee-milk-drinks",
    name: "Tea, Coffee & Milk Drinks",
    image: "/placeholder.svg",
    productCount: 33
  },
  {
    id: "instant-food",
    name: "Instant Food",
    image: "/placeholder.svg",
    productCount: 25
  },
  {
    id: "sauces-spreads",
    name: "Sauces & Spreads",
    image: "/placeholder.svg",
    productCount: 31
  },
  {
    id: "paan-corner",
    name: "Paan Corner",
    image: "/placeholder.svg",
    productCount: 18
  },
  {
    id: "cakes",
    name: "Cakes",
    image: "/placeholder.svg",
    productCount: 41
  },
  {
    id: "bath-body",
    name: "Bath & Body",
    image: "/placeholder.svg",
    productCount: 45
  },
  {
    id: "hair",
    name: "Hair",
    image: "/placeholder.svg",
    productCount: 28
  },
  {
    id: "skin-face",
    name: "Skin & Face",
    image: "/placeholder.svg",
    productCount: 39
  },
  {
    id: "beauty-cosmetics",
    name: "Beauty & Cosmetics",
    image: "/placeholder.svg",
    productCount: 52
  },
  {
    id: "feminine-hygiene",
    name: "Feminine Hygiene",
    image: "/placeholder.svg",
    productCount: 26
  },
  {
    id: "baby-care",
    name: "Baby Care",
    image: "/placeholder.svg",
    productCount: 34
  },
  {
    id: "health-pharma",
    name: "Health & Pharma",
    image: "/placeholder.svg",
    productCount: 41
  },
  {
    id: "sexual-wellness",
    name: "Sexual Wellness",
    image: "/placeholder.svg",
    productCount: 19
  }
];





// Category-specific products
export const categoryProducts = {
  "vegetables-fruits": [
    { id: 201, name: "Fresh Tomatoes", price: 2.99, image: "/placeholder.svg", category: "Vegetables & Fruits", quantity: 0 },
    { id: 202, name: "Green Apples", price: 3.49, image: "/placeholder.svg", category: "Vegetables & Fruits", quantity: 0 },
    { id: 203, name: "Fresh Spinach", price: 1.99, image: "/placeholder.svg", category: "Vegetables & Fruits", quantity: 0 },
    { id: 204, name: "Organic Carrots", price: 2.49, image: "/placeholder.svg", category: "Vegetables & Fruits", quantity: 0 }
  ],
  "atta-rice-dal": [
    { id: 301, name: "Basmati Rice 5kg", price: 12.99, image: "/placeholder.svg", category: "Atta, Rice & Dal", quantity: 0 },
    { id: 302, name: "Whole Wheat Atta", price: 8.99, image: "/placeholder.svg", category: "Atta, Rice & Dal", quantity: 0 },
    { id: 303, name: "Toor Dal 1kg", price: 4.99, image: "/placeholder.svg", category: "Atta, Rice & Dal", quantity: 0 },
    { id: 304, name: "Moong Dal", price: 5.49, image: "/placeholder.svg", category: "Atta, Rice & Dal", quantity: 0 }
  ],
  "oil-ghee-masala": [
    { id: 401, name: "Sunflower Oil 1L", price: 6.99, image: "/placeholder.svg", category: "Oil, Ghee & Masala", quantity: 0 },
    { id: 402, name: "Pure Ghee 500g", price: 15.99, image: "/placeholder.svg", category: "Oil, Ghee & Masala", quantity: 0 },
    { id: 403, name: "Garam Masala", price: 3.99, image: "/placeholder.svg", category: "Oil, Ghee & Masala", quantity: 0 },
    { id: 404, name: "Turmeric Powder", price: 2.99, image: "/placeholder.svg", category: "Oil, Ghee & Masala", quantity: 0 }
  ],
  "dairy-bread-eggs": [
    { id: 501, name: "Fresh Milk 1L", price: 2.99, image: "/placeholder.svg", category: "Dairy, Bread & Eggs", quantity: 0 },
    { id: 502, name: "Brown Bread", price: 3.49, image: "/placeholder.svg", category: "Dairy, Bread & Eggs", quantity: 0 },
    { id: 503, name: "Farm Fresh Eggs (12)", price: 4.99, image: "/placeholder.svg", category: "Dairy, Bread & Eggs", quantity: 0 },
    { id: 504, name: "Paneer 200g", price: 3.99, image: "/placeholder.svg", category: "Dairy, Bread & Eggs", quantity: 0 }
  ]
};

// Function to get all products from all categories for search
export const getAllProducts = () => {
  const categoryProductsList = Object.values(categoryProducts).flat();
  return categoryProductsList;
};
