const mongoose = require("mongoose");
const { Product } = require("./models/product");

// Connect to MongoDB
const dbUri = "mongodb://localhost:27017/clothing-biz"; // Replace with your database name
mongoose
  .connect(dbUri)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// Generate a random rating (in 0.5 increments)
function getRandomRating() {
  const possibleRatings = [0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0];
  return possibleRatings[Math.floor(Math.random() * possibleRatings.length)];
}

// Products array with at least 20 entries
const products = [
  {
    image: "/images/products/leather-jacket.jpeg",
    name: "Genuine Leather Jacket",
    rating: { stars: getRandomRating(), count: 120 },
    priceCents: 850000,
    type: "clothing",
    sizeChartLink: "/size-charts/jackets.html",
    keywords: ["leather", "jacket", "clothing", "Kenyan leather"],
    categorySlug: "jackets",
  },
  {
    image: "/images/products/ankara-dress.jpg",
    name: "Stylish Ankara Dress",
    rating: { stars: getRandomRating(), count: 210 },
    priceCents: 500000,
    type: "clothing",
    sizeChartLink: "/size-charts/dresses.html",
    keywords: ["ankara", "dress", "Kenyan fashion", "clothing"],
    categorySlug: "dresses",
  },
  {
    image: "/images/products/leather-shoes.jpeg",
    name: "Handmade Leather Shoes",
    rating: { stars: getRandomRating(), count: 95 },
    priceCents: 650000,
    type: "product",
    keywords: ["leather", "shoes", "handmade", "Kenyan products"],
    categorySlug: "shoes",
  },
  {
    image: "/images/products/beaded-sandals.jpeg",
    name: "Beaded Maasai Sandals",
    rating: { stars: getRandomRating(), count: 130 },
    priceCents: 300000,
    type: "product",
    keywords: ["sandals", "beaded", "Maasai", "Kenyan fashion"],
    categorySlug: "sandals",
  },
  {
    image: "/images/products/leather-bag.jpeg",
    name: "Premium Leather Handbag",
    rating: { stars: getRandomRating(), count: 80 },
    priceCents: 950000,
    type: "product",
    keywords: ["leather", "handbag", "Kenyan leather", "accessories"],
    categorySlug: "bags",
  },
  {
    image: "/images/products/denim-jeans.jpeg",
    name: "Classic Denim Jeans",
    rating: { stars: getRandomRating(), count: 150 },
    priceCents: 450000,
    type: "clothing",
    sizeChartLink: "/size-charts/jeans.html",
    keywords: ["denim", "jeans", "classic", "Kenyan fashion"],
    categorySlug: "pants",
  },
  {
    image: "/images/products/leather-wallet.jpeg",
    name: "Kenyan Leather Wallet",
    rating: { stars: getRandomRating(), count: 50 },
    priceCents: 200000,
    type: "product",
    keywords: ["wallet", "leather", "Kenyan leather", "accessories"],
    categorySlug: "accessories",
  },
  {
    image: "/images/products/scarf.jpeg",
    name: "Handwoven Scarf",
    rating: { stars: getRandomRating(), count: 75 },
    priceCents: 150000,
    type: "clothing",
    keywords: ["scarf", "handwoven", "Kenyan fashion", "accessories"],
    categorySlug: "scarves",
  },
  {
    image: "/images/products/denim-jacket.jpeg",
    name: "Denim Jacket",
    rating: { stars: getRandomRating(), count: 90 },
    priceCents: 700000,
    type: "clothing",
    sizeChartLink: "/size-charts/jackets.html",
    keywords: ["denim", "jacket", "Kenyan fashion"],
    categorySlug: "jackets",
  },
  {
    image: "/images/products/leather-belt.jpeg",
    name: "Genuine Leather Belt",
    rating: { stars: getRandomRating(), count: 60 },
    priceCents: 250000,
    type: "product",
    keywords: ["leather", "belt", "Kenyan leather", "accessories"],
    categorySlug: "accessories",
  },
  {
    image: "/images/products/kitenge-shirt.jpeg",
    name: "Kitenge Print Shirt",
    rating: { stars: getRandomRating(), count: 110 },
    priceCents: 400000,
    type: "clothing",
    sizeChartLink: "/size-charts/shirts.html",
    keywords: ["kitenge", "shirt", "Kenyan fashion"],
    categorySlug: "shirts",
  },
  {
    image: "/images/products/leather-backpack.jpeg",
    name: "Durable Leather Backpack",
    rating: { stars: getRandomRating(), count: 85 },
    priceCents: 850000,
    type: "product",
    keywords: ["leather", "backpack", "Kenyan leather", "bags"],
    categorySlug: "bags",
  },
  {
    image: "/images/products/safari-hat.jpeg",
    name: "Classic Safari Hat",
    rating: { stars: getRandomRating(), count: 40 },
    priceCents: 300000,
    type: "clothing",
    keywords: ["hat", "safari", "Kenyan fashion", "accessories"],
    categorySlug: "accessories",
  },
  {
    image: "/images/products/maxi-dress.jpeg",
    name: "Flowy Maxi Dress",
    rating: { stars: getRandomRating(), count: 140 },
    priceCents: 600000,
    type: "clothing",
    sizeChartLink: "/size-charts/dresses.html",
    keywords: ["dress", "maxi", "Kenyan fashion"],
    categorySlug: "dresses",
  },
  {
    image: "/images/products/leather-gloves.jpeg",
    name: "Leather Driving Gloves",
    rating: { stars: getRandomRating(), count: 35 },
    priceCents: 450000,
    type: "product",
    keywords: ["leather", "gloves", "Kenyan leather", "accessories"],
    categorySlug: "accessories",
  },
  {
    image: "/images/products/ankara-skirt.jpeg",
    name: "Ankara Print Skirt",
    rating: { stars: getRandomRating(), count: 65 },
    priceCents: 350000,
    type: "clothing",
    sizeChartLink: "/size-charts/skirts.html",
    keywords: ["ankara", "skirt", "Kenyan fashion"],
    categorySlug: "skirts",
  },
  {
    image: "/images/products/canvas-shoes.jpeg",
    name: "Canvas Shoes",
    rating: { stars: getRandomRating(), count: 120 },
    priceCents: 400000,
    type: "product",
    keywords: ["canvas", "shoes", "Kenyan fashion"],
    categorySlug: "shoes",
  },
  {
    image: "/images/products/leather-sling-bag.jpeg",
    name: "Leather Sling Bag",
    rating: { stars: getRandomRating(), count: 70 },
    priceCents: 500000,
    type: "product",
    keywords: ["leather", "sling bag", "Kenyan leather", "bags"],
    categorySlug: "bags",
  },
  {
    image: "/images/products/sweatshirt.jpeg",
    name: "Cozy Sweatshirt",
    rating: { stars: getRandomRating(), count: 80 },
    priceCents: 350000,
    type: "clothing",
    sizeChartLink: "/size-charts/sweatshirts.html",
    keywords: ["sweatshirt", "Kenyan fashion", "clothing"],
    categorySlug: "sweaters",
  },
];

// Function to seed the database
async function seedDatabase() {
  try {
    await Product.deleteMany({});
    console.log("Existing products cleared.");
    await Product.insertMany(products);
    console.log("Products added successfully.");
  } catch (error) {
    console.error("Error seeding the database:", error);
  } finally {
    mongoose.disconnect();
    console.log("Database connection closed.");
  }
}

// Run the seeding function
seedDatabase();
