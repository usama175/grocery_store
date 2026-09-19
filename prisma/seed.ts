import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  "Flour, Grains & Pulses",
  "Spices & Recipe Masalas",
  "Cooking Oils & Ghee",
  "Dairy & Bakery",
  "Snacks & Biscuits",
  "Beverages & Drinks",
  "Tea, Coffee & Powders",
  "Personal Care",
  "Household & Cleaning",
];

type SeedProduct = {
  name: string;
  barcode: string;
  category: string;
  unit: "pcs" | "kg" | "pack" | "liter";
  purchaseRate: number;
  saleRate: number;
  stock: number;
  minAlert: number;
};

const PRODUCTS: SeedProduct[] = [
  // 1. Flour, Grains & Pulses
  { name: "Super Basmati Rice 1kg", barcode: "8901001", category: "Flour, Grains & Pulses", unit: "pack", purchaseRate: 280, saleRate: 340, stock: 45, minAlert: 10 },
  { name: "Super Basmati Rice 5kg", barcode: "8901002", category: "Flour, Grains & Pulses", unit: "pack", purchaseRate: 1350, saleRate: 1600, stock: 20, minAlert: 5 },
  { name: "Sella Basmati Rice 1kg", barcode: "8901003", category: "Flour, Grains & Pulses", unit: "pack", purchaseRate: 250, saleRate: 310, stock: 30, minAlert: 8 },
  { name: "Chakki Whole Wheat Atta 10kg", barcode: "8901004", category: "Flour, Grains & Pulses", unit: "pack", purchaseRate: 1200, saleRate: 1400, stock: 25, minAlert: 5 },
  { name: "Fine Atta 10kg", barcode: "8901005", category: "Flour, Grains & Pulses", unit: "pack", purchaseRate: 1150, saleRate: 1350, stock: 18, minAlert: 5 },
  { name: "White Maida 1kg", barcode: "8901006", category: "Flour, Grains & Pulses", unit: "pack", purchaseRate: 110, saleRate: 140, stock: 40, minAlert: 10 },
  { name: "Suji (Semolina) 500g", barcode: "8901007", category: "Flour, Grains & Pulses", unit: "pack", purchaseRate: 75, saleRate: 95, stock: 35, minAlert: 8 },
  { name: "Besan (Gram Flour) 1kg", barcode: "8901008", category: "Flour, Grains & Pulses", unit: "pack", purchaseRate: 210, saleRate: 260, stock: 28, minAlert: 6 },
  { name: "Daal Chana (Gram Pulse) 1kg", barcode: "8901009", category: "Flour, Grains & Pulses", unit: "kg", purchaseRate: 230, saleRate: 280, stock: 35, minAlert: 10 },
  { name: "Daal Moong Washed 1kg", barcode: "8901010", category: "Flour, Grains & Pulses", unit: "kg", purchaseRate: 260, saleRate: 320, stock: 22, minAlert: 8 },
  { name: "Daal Masoor 1kg", barcode: "8901011", category: "Flour, Grains & Pulses", unit: "kg", purchaseRate: 270, saleRate: 330, stock: 24, minAlert: 8 },
  { name: "Daal Mash Washed 1kg", barcode: "8901012", category: "Flour, Grains & Pulses", unit: "kg", purchaseRate: 380, saleRate: 460, stock: 15, minAlert: 5 },
  { name: "White Chana (Kabuli) 1kg", barcode: "8901013", category: "Flour, Grains & Pulses", unit: "kg", purchaseRate: 320, saleRate: 390, stock: 20, minAlert: 6 },
  { name: "Black Chana 1kg", barcode: "8901014", category: "Flour, Grains & Pulses", unit: "kg", purchaseRate: 220, saleRate: 270, stock: 18, minAlert: 5 },
  { name: "Sugar (Cheeni) 1kg", barcode: "8901015", category: "Flour, Grains & Pulses", unit: "kg", purchaseRate: 135, saleRate: 150, stock: 80, minAlert: 20 },

  // 2. Spices & Recipe Masalas
  { name: "Shan Bombay Biryani Masala 50g", barcode: "8902001", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 95, saleRate: 120, stock: 60, minAlert: 15 },
  { name: "Shan Sindhi Biryani Masala 50g", barcode: "8902002", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 95, saleRate: 120, stock: 55, minAlert: 15 },
  { name: "Shan Chicken Korma Masala 50g", barcode: "8902003", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 95, saleRate: 120, stock: 40, minAlert: 10 },
  { name: "Shan Chicken Karahi Masala 50g", barcode: "8902004", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 95, saleRate: 120, stock: 45, minAlert: 10 },
  { name: "Shan Nihari Masala 60g", barcode: "8902005", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 100, saleRate: 130, stock: 30, minAlert: 8 },
  { name: "Shan Haleem Masala Mix", barcode: "8902006", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 110, saleRate: 140, stock: 25, minAlert: 6 },
  { name: "National Red Chilli Powder 200g", barcode: "8902007", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 210, saleRate: 260, stock: 35, minAlert: 8 },
  { name: "National Turmeric Powder (Haldi) 100g", barcode: "8902008", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 110, saleRate: 145, stock: 40, minAlert: 10 },
  { name: "National Coriander Powder (Dhania) 200g", barcode: "8902009", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 140, saleRate: 180, stock: 30, minAlert: 8 },
  { name: "National Cumin Seeds (Zeera) 100g", barcode: "8902010", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 180, saleRate: 240, stock: 25, minAlert: 6 },
  { name: "National Garam Masala Powder 50g", barcode: "8902011", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 120, saleRate: 160, stock: 30, minAlert: 8 },
  { name: "National Iodized Salt 800g", barcode: "8902012", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 45, saleRate: 60, stock: 90, minAlert: 20 },
  { name: "Pink Himalayan Rock Salt 800g", barcode: "8902013", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 65, saleRate: 90, stock: 45, minAlert: 10 },
  { name: "National Chaat Masala 50g", barcode: "8902014", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 75, saleRate: 95, stock: 50, minAlert: 12 },
  { name: "National Kasuri Methi 50g", barcode: "8902015", category: "Spices & Recipe Masalas", unit: "pack", purchaseRate: 60, saleRate: 85, stock: 25, minAlert: 5 },

  // 3. Cooking Oils & Ghee
  { name: "Dalda Cooking Oil Pouch 1L", barcode: "8903001", category: "Cooking Oils & Ghee", unit: "liter", purchaseRate: 480, saleRate: 530, stock: 35, minAlert: 10 },
  { name: "Dalda Cooking Oil Bottle 5L", barcode: "8903002", category: "Cooking Oils & Ghee", unit: "pack", purchaseRate: 2350, saleRate: 2600, stock: 12, minAlert: 3 },
  { name: "Dalda Banaspati Ghee Pouch 1kg", barcode: "8903003", category: "Cooking Oils & Ghee", unit: "pack", purchaseRate: 470, saleRate: 520, stock: 40, minAlert: 8 },
  { name: "Habib Cooking Oil Pouch 1L", barcode: "8903004", category: "Cooking Oils & Ghee", unit: "liter", purchaseRate: 460, saleRate: 510, stock: 30, minAlert: 8 },
  { name: "Habib Banaspati Ghee 1kg", barcode: "8903005", category: "Cooking Oils & Ghee", unit: "pack", purchaseRate: 450, saleRate: 500, stock: 25, minAlert: 6 },
  { name: "Sufi Canola Cooking Oil 1L", barcode: "8903006", category: "Cooking Oils & Ghee", unit: "liter", purchaseRate: 475, saleRate: 525, stock: 20, minAlert: 5 },
  { name: "Sufi Banaspati Ghee Tin 5kg", barcode: "8903007", category: "Cooking Oils & Ghee", unit: "pack", purchaseRate: 2200, saleRate: 2450, stock: 8, minAlert: 2 },
  { name: "Mezan Cooking Oil Pouch 1L", barcode: "8903008", category: "Cooking Oils & Ghee", unit: "liter", purchaseRate: 450, saleRate: 500, stock: 25, minAlert: 6 },
  { name: "Kisan Pure Ghee Desi 500g", barcode: "8903009", category: "Cooking Oils & Ghee", unit: "pack", purchaseRate: 900, saleRate: 1100, stock: 10, minAlert: 3 },
  { name: "Mustard Oil (Sarson) 500ml", barcode: "8903010", category: "Cooking Oils & Ghee", unit: "liter", purchaseRate: 220, saleRate: 270, stock: 14, minAlert: 4 },

  // 4. Dairy & Bakery
  { name: "Olpers UHT Milk 1L", barcode: "8904001", category: "Dairy & Bakery", unit: "pack", purchaseRate: 245, saleRate: 275, stock: 48, minAlert: 12 },
  { name: "MilkPak UHT Full Cream Milk 1L", barcode: "8904002", category: "Dairy & Bakery", unit: "pack", purchaseRate: 250, saleRate: 280, stock: 52, minAlert: 12 },
  { name: "MilkPak Dairy Cream 200ml", barcode: "8904003", category: "Dairy & Bakery", unit: "pack", purchaseRate: 155, saleRate: 185, stock: 30, minAlert: 8 },
  { name: "Olpers Cream 200ml", barcode: "8904004", category: "Dairy & Bakery", unit: "pack", purchaseRate: 150, saleRate: 180, stock: 25, minAlert: 6 },
  { name: "Tarang Tea Whitener 225ml", barcode: "8904005", category: "Dairy & Bakery", unit: "pack", purchaseRate: 65, saleRate: 80, stock: 60, minAlert: 15 },
  { name: "Dawn Plain Bread (Large)", barcode: "8904006", category: "Dairy & Bakery", unit: "pack", purchaseRate: 130, saleRate: 160, stock: 15, minAlert: 4 },
  { name: "Dawn Plain Bread (Medium)", barcode: "8904007", category: "Dairy & Bakery", unit: "pack", purchaseRate: 95, saleRate: 120, stock: 18, minAlert: 5 },
  { name: "Dawn Milky Bread Large", barcode: "8904008", category: "Dairy & Bakery", unit: "pack", purchaseRate: 145, saleRate: 180, stock: 12, minAlert: 4 },
  { name: "Farm Fresh Eggs (Tray 30pcs)", barcode: "8904009", category: "Dairy & Bakery", unit: "pack", purchaseRate: 620, saleRate: 720, stock: 10, minAlert: 3 },
  { name: "Farm Fresh Eggs (Dozen)", barcode: "8904010", category: "Dairy & Bakery", unit: "pack", purchaseRate: 260, saleRate: 300, stock: 14, minAlert: 4 },
  { name: "Nurpur Salted Butter 200g", barcode: "8904011", category: "Dairy & Bakery", unit: "pack", purchaseRate: 290, saleRate: 340, stock: 16, minAlert: 4 },
  { name: "Adams Cheddar Cheese Slices 200g", barcode: "8904012", category: "Dairy & Bakery", unit: "pack", purchaseRate: 420, saleRate: 490, stock: 12, minAlert: 3 },
  { name: "Adams Mozzarella Cheese Block 200g", barcode: "8904013", category: "Dairy & Bakery", unit: "pack", purchaseRate: 440, saleRate: 520, stock: 8, minAlert: 3 },
  { name: "National Mixed Fruit Jam 440g", barcode: "8904014", category: "Dairy & Bakery", unit: "pack", purchaseRate: 280, saleRate: 340, stock: 14, minAlert: 4 },
  { name: "National Apple Jam 440g", barcode: "8904015", category: "Dairy & Bakery", unit: "pack", purchaseRate: 280, saleRate: 340, stock: 10, minAlert: 3 },

  // 5. Snacks & Biscuits
  { name: "Lays French Cheese Masala 65g", barcode: "8905001", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 78, saleRate: 100, stock: 45, minAlert: 10 },
  { name: "Lays Wavy Masala 65g", barcode: "8905002", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 78, saleRate: 100, stock: 40, minAlert: 10 },
  { name: "Lays Salted Potato Chips 65g", barcode: "8905003", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 78, saleRate: 100, stock: 35, minAlert: 8 },
  { name: "Kurkure Red Chilli Jhatpat 55g", barcode: "8905004", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 40, saleRate: 50, stock: 50, minAlert: 12 },
  { name: "Kurkure Chutney Chaska 55g", barcode: "8905005", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 40, saleRate: 50, stock: 48, minAlert: 12 },
  { name: "Cheetos Bites Masala 45g", barcode: "8905006", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 40, saleRate: 50, stock: 40, minAlert: 10 },
  { name: "Peek Freans Sooper Half Roll", barcode: "8905007", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 38, saleRate: 50, stock: 65, minAlert: 15 },
  { name: "Peek Freans Sooper Family Pack", barcode: "8905008", category: "Snacks & Biscuits", unit: "pack", purchaseRate: 115, saleRate: 140, stock: 30, minAlert: 8 },
  { name: "LU Prince Chocolate Half Roll", barcode: "8905009", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 38, saleRate: 50, stock: 55, minAlert: 12 },
  { name: "LU Prince Chocolate Family Pack", barcode: "8905010", category: "Snacks & Biscuits", unit: "pack", purchaseRate: 115, saleRate: 140, stock: 25, minAlert: 6 },
  { name: "LU Oreo Original Biscuit 115g", barcode: "8905011", category: "Snacks & Biscuits", unit: "pack", purchaseRate: 75, saleRate: 95, stock: 40, minAlert: 10 },
  { name: "Bisconni Chocolatto Pack 6s", barcode: "8905012", category: "Snacks & Biscuits", unit: "pack", purchaseRate: 120, saleRate: 150, stock: 30, minAlert: 8 },
  { name: "Bisconni Cocomo Chocolate 24s Box", barcode: "8905013", category: "Snacks & Biscuits", unit: "pack", purchaseRate: 200, saleRate: 240, stock: 22, minAlert: 5 },
  { name: "Peek Freans Rio Strawberry Cream", barcode: "8905014", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 38, saleRate: 50, stock: 35, minAlert: 8 },
  { name: "Kolson Slanty Jalapeno 35g", barcode: "8905015", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 30, saleRate: 40, stock: 45, minAlert: 10 },
  { name: "Nimko Special Dal Moth 200g", barcode: "8905016", category: "Snacks & Biscuits", unit: "pack", purchaseRate: 90, saleRate: 120, stock: 28, minAlert: 6 },
  { name: "Cadbury Dairy Milk 38g", barcode: "8905017", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 95, saleRate: 120, stock: 35, minAlert: 8 },
  { name: "KitKat 4 Finger Chocolate", barcode: "8905018", category: "Snacks & Biscuits", unit: "pcs", purchaseRate: 130, saleRate: 160, stock: 25, minAlert: 6 },

  // 6. Beverages & Drinks
  { name: "Rooh Afza Syrup 800ml Bottle", barcode: "8906001", category: "Beverages & Drinks", unit: "pack", purchaseRate: 360, saleRate: 430, stock: 30, minAlert: 8 },
  { name: "Tang Instant Drink Powder Orange 500g", barcode: "8906002", category: "Beverages & Drinks", unit: "pack", purchaseRate: 450, saleRate: 540, stock: 22, minAlert: 5 },
  { name: "Tang Instant Drink Powder Mango 500g", barcode: "8906003", category: "Beverages & Drinks", unit: "pack", purchaseRate: 450, saleRate: 540, stock: 18, minAlert: 5 },
  { name: "Coca-Cola Bottle 1.5L", barcode: "8906004", category: "Beverages & Drinks", unit: "pack", purchaseRate: 170, saleRate: 200, stock: 40, minAlert: 12 },
  { name: "Coca-Cola Tin 250ml", barcode: "8906005", category: "Beverages & Drinks", unit: "pcs", purchaseRate: 85, saleRate: 100, stock: 50, minAlert: 15 },
  { name: "Sprite Bottle 1.5L", barcode: "8906006", category: "Beverages & Drinks", unit: "pack", purchaseRate: 170, saleRate: 200, stock: 35, minAlert: 10 },
  { name: "Sprite Tin 250ml", barcode: "8906007", category: "Beverages & Drinks", unit: "pcs", purchaseRate: 85, saleRate: 100, stock: 45, minAlert: 12 },
  { name: "Fanta Orange Bottle 1.5L", barcode: "8906008", category: "Beverages & Drinks", unit: "pack", purchaseRate: 170, saleRate: 200, stock: 25, minAlert: 8 },
  { name: "Pakola Ice Cream Soda 1.5L", barcode: "8906009", category: "Beverages & Drinks", unit: "pack", purchaseRate: 165, saleRate: 195, stock: 20, minAlert: 6 },
  { name: "Sting Berry Energy Drink 300ml", barcode: "8906010", category: "Beverages & Drinks", unit: "pcs", purchaseRate: 75, saleRate: 90, stock: 60, minAlert: 15 },
  { name: "Aquafina Mineral Water 1.5L", barcode: "8906011", category: "Beverages & Drinks", unit: "pack", purchaseRate: 80, saleRate: 100, stock: 45, minAlert: 12 },
  { name: "Aquafina Mineral Water 500ml", barcode: "8906012", category: "Beverages & Drinks", unit: "pcs", purchaseRate: 45, saleRate: 60, stock: 65, minAlert: 15 },
  { name: "Nestle Pure Life Water 1.5L", barcode: "8906013", category: "Beverages & Drinks", unit: "pack", purchaseRate: 85, saleRate: 105, stock: 35, minAlert: 10 },
  { name: "Nestle Fruita Vitals Apple 1L", barcode: "8906014", category: "Beverages & Drinks", unit: "pack", purchaseRate: 290, saleRate: 350, stock: 15, minAlert: 4 },
  { name: "Nestle Fruita Vitals Chaunsa Mango 1L", barcode: "8906015", category: "Beverages & Drinks", unit: "pack", purchaseRate: 290, saleRate: 350, stock: 20, minAlert: 5 },

  // 7. Tea, Coffee & Powders
  { name: "Tapal Danedar Tea Bag 100s", barcode: "8907001", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 480, saleRate: 580, stock: 20, minAlert: 5 },
  { name: "Tapal Danedar Black Tea 430g", barcode: "8907002", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 590, saleRate: 690, stock: 35, minAlert: 8 },
  { name: "Tapal Danedar Black Tea 900g Family", barcode: "8907003", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 1200, saleRate: 1380, stock: 15, minAlert: 4 },
  { name: "Lipton Yellow Label Tea 380g", barcode: "8907004", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 580, saleRate: 680, stock: 28, minAlert: 6 },
  { name: "Vital Tea Leaf 400g", barcode: "8907005", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 540, saleRate: 640, stock: 18, minAlert: 5 },
  { name: "Nestle Everyday Milk Powder 400g Pouch", barcode: "8907006", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 580, saleRate: 670, stock: 30, minAlert: 8 },
  { name: "Nestle Everyday Milk Powder 850g Pouch", barcode: "8907007", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 1180, saleRate: 1350, stock: 15, minAlert: 4 },
  { name: "Nido Fortigrow Milk Powder 375g", barcode: "8907008", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 690, saleRate: 790, stock: 14, minAlert: 4 },
  { name: "Nescafe Classic Coffee Jar 100g", barcode: "8907009", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 850, saleRate: 1050, stock: 12, minAlert: 3 },
  { name: "Nescafe 3-in-1 Coffee Sachet 24s", barcode: "8907010", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 720, saleRate: 860, stock: 16, minAlert: 4 },
  { name: "Milo Chocolate Malt Drink 200g", barcode: "8907011", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 420, saleRate: 500, stock: 12, minAlert: 3 },
  { name: "Horlicks Malt Drink 500g", barcode: "8907012", category: "Tea, Coffee & Powders", unit: "pack", purchaseRate: 680, saleRate: 800, stock: 8, minAlert: 2 },

  // 8. Personal Care
  { name: "Lifebuoy Total Bar Soap 115g", barcode: "8908001", category: "Personal Care", unit: "pcs", purchaseRate: 90, saleRate: 110, stock: 60, minAlert: 15 },
  { name: "Lux Velvet Touch Soap 115g", barcode: "8908002", category: "Personal Care", unit: "pcs", purchaseRate: 95, saleRate: 120, stock: 50, minAlert: 12 },
  { name: "Dettol Original Soap 100g", barcode: "8908003", category: "Personal Care", unit: "pcs", purchaseRate: 105, saleRate: 130, stock: 45, minAlert: 10 },
  { name: "Dove Beauty Bar 100g", barcode: "8908004", category: "Personal Care", unit: "pcs", purchaseRate: 160, saleRate: 200, stock: 25, minAlert: 6 },
  { name: "Sunsilk Black Shine Shampoo 180ml", barcode: "8908005", category: "Personal Care", unit: "pcs", purchaseRate: 280, saleRate: 340, stock: 24, minAlert: 6 },
  { name: "Head & Shoulders Classic Clean 180ml", barcode: "8908006", category: "Personal Care", unit: "pcs", purchaseRate: 340, saleRate: 410, stock: 20, minAlert: 5 },
  { name: "Pantene Pro-V Smooth & Silky 180ml", barcode: "8908007", category: "Personal Care", unit: "pcs", purchaseRate: 310, saleRate: 380, stock: 18, minAlert: 5 },
  { name: "Colgate Maximum Cavity Protection 75ml", barcode: "8908008", category: "Personal Care", unit: "pcs", purchaseRate: 140, saleRate: 175, stock: 40, minAlert: 10 },
  { name: "Sensodyne Rapid Relief Toothpaste 100g", barcode: "8908009", category: "Personal Care", unit: "pcs", purchaseRate: 360, saleRate: 440, stock: 15, minAlert: 4 },
  { name: "Close Up Red Hot Gel 100ml", barcode: "8908010", category: "Personal Care", unit: "pcs", purchaseRate: 170, saleRate: 210, stock: 22, minAlert: 5 },
  { name: "Dettol Antiseptic Liquid 100ml", barcode: "8908011", category: "Personal Care", unit: "pcs", purchaseRate: 190, saleRate: 235, stock: 25, minAlert: 6 },
  { name: "Gillette Blue 2 Plus Disposable Razor 5s", barcode: "8908012", category: "Personal Care", unit: "pack", purchaseRate: 280, saleRate: 350, stock: 15, minAlert: 4 },
  { name: "Parachute 100% Pure Coconut Hair Oil 200ml", barcode: "8908013", category: "Personal Care", unit: "pcs", purchaseRate: 260, saleRate: 320, stock: 16, minAlert: 4 },
  { name: "Nivea Soft Cream 100ml", barcode: "8908014", category: "Personal Care", unit: "pcs", purchaseRate: 380, saleRate: 460, stock: 12, minAlert: 3 },
  { name: "Vaseline Petroleum Jelly 100ml", barcode: "8908015", category: "Personal Care", unit: "pcs", purchaseRate: 180, saleRate: 225, stock: 20, minAlert: 5 },

  // 9. Household & Cleaning
  { name: "Surf Excel Detergent Powder 1kg", barcode: "8909001", category: "Household & Cleaning", unit: "pack", purchaseRate: 440, saleRate: 510, stock: 35, minAlert: 8 },
  { name: "Ariel Detergent Powder Original 1kg", barcode: "8909002", category: "Household & Cleaning", unit: "pack", purchaseRate: 450, saleRate: 520, stock: 30, minAlert: 8 },
  { name: "Bonus Tristar Detergent 1kg", barcode: "8909003", category: "Household & Cleaning", unit: "pack", purchaseRate: 220, saleRate: 260, stock: 45, minAlert: 10 },
  { name: "Brite Maximum Washing Powder 1kg", barcode: "8909004", category: "Household & Cleaning", unit: "pack", purchaseRate: 270, saleRate: 320, stock: 25, minAlert: 6 },
  { name: "Vim Dishwash Bar 200g with Free Scrubber", barcode: "8909005", category: "Household & Cleaning", unit: "pcs", purchaseRate: 70, saleRate: 90, stock: 70, minAlert: 15 },
  { name: "Max All in One Lemon Liquid 475ml", barcode: "8909006", category: "Household & Cleaning", unit: "pcs", purchaseRate: 210, saleRate: 260, stock: 25, minAlert: 6 },
  { name: "Harpic Power Plus Toilet Cleaner 500ml", barcode: "8909007", category: "Household & Cleaning", unit: "pcs", purchaseRate: 240, saleRate: 295, stock: 30, minAlert: 8 },
  { name: "Dettol Surface Cleaner Citrus 1L", barcode: "8909008", category: "Household & Cleaning", unit: "liter", purchaseRate: 390, saleRate: 470, stock: 15, minAlert: 4 },
  { name: "Rose Petal Zeno Pop-Up Facial Tissues", barcode: "8909009", category: "Household & Cleaning", unit: "pack", purchaseRate: 160, saleRate: 200, stock: 40, minAlert: 10 },
  { name: "Rose Petal Kitchen Towel 2 Rolls", barcode: "8909010", category: "Household & Cleaning", unit: "pack", purchaseRate: 240, saleRate: 290, stock: 25, minAlert: 6 },
  { name: "Mortein Powergard Insect Spray 400ml", barcode: "8909011", category: "Household & Cleaning", unit: "pcs", purchaseRate: 480, saleRate: 580, stock: 16, minAlert: 4 },
  { name: "Heavy Duty Garbage Trash Bags (30s)", barcode: "8909012", category: "Household & Cleaning", unit: "pack", purchaseRate: 180, saleRate: 240, stock: 30, minAlert: 6 },
];

const SEED_CUSTOMERS = [
  { name: "Haji Muhammad Rasheed", phone: "03001234567", address: "House 14, Street 3, Block B", balance: 2450 },
  { name: "Tariq Mehmood", phone: "03219876543", address: "Flat 202, Al-Rahman Heights", balance: 1200 },
  { name: "Baji Shamim Akhtar", phone: "03335551212", address: "Main Bazaar, Corner Shop", balance: 650 },
  { name: "Chaudhry Zulfiqar", phone: "03454443322", address: "Farmhouse Road, Sector 7", balance: 4800 },
  { name: "Kamran Akram", phone: "03123344556", address: "Street 9, Phase 2", balance: 0 },
];

async function main() {
  console.log("Seeding categories...");
  const catMap = new Map<string, number>();

  for (const name of CATEGORIES) {
    let cat = await prisma.category.findFirst({ where: { name } });
    if (!cat) {
      cat = await prisma.category.create({ data: { name } });
    }
    catMap.set(name, cat.id);
  }

  console.log(`Seeding ${PRODUCTS.length} grocery products...`);
  for (const p of PRODUCTS) {
    const existing = await prisma.product.findUnique({
      where: { barcode: p.barcode },
    });
    if (!existing) {
      await prisma.product.create({
        data: {
          name: p.name,
          barcode: p.barcode,
          categoryId: catMap.get(p.category),
          unit: p.unit,
          purchaseRate: p.purchaseRate,
          saleRate: p.saleRate,
          currentStock: p.stock,
          minStockAlert: p.minAlert,
        },
      });
    }
  }

  console.log("Seeding registered customers & Khata balances...");
  for (const c of SEED_CUSTOMERS) {
    const existing = await prisma.customer.findUnique({
      where: { phone: c.phone },
    });
    if (!existing) {
      await prisma.customer.create({
        data: {
          name: c.name,
          phone: c.phone,
          address: c.address,
          balance: c.balance,
        },
      });
    }
  }

  // Seed initial ledger inflows so account balances start with working capital
  const existingTxns = await prisma.accountTransaction.count();
  if (existingTxns === 0) {
    console.log("Seeding initial ledger opening balances...");
    await prisma.accountTransaction.createMany({
      data: [
        {
          accountType: "cash",
          transactionType: "inflow",
          amount: 25000,
          description: "Opening cash register float",
        },
        {
          accountType: "jazzcash",
          transactionType: "inflow",
          amount: 15000,
          description: "Opening JazzCash merchant balance",
        },
        {
          accountType: "easypaisa",
          transactionType: "inflow",
          amount: 12000,
          description: "Opening Easypaisa merchant balance",
        },
        {
          accountType: "bank",
          transactionType: "inflow",
          amount: 75000,
          description: "Opening Meezan Bank store account balance",
        },
      ],
    });
  }

  console.log("Seeding admin user...");
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminEmail && adminPassword) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaUser = (prisma as any).user;
    const firstUser = await prismaUser.findFirst();
    if (firstUser) {
      await prismaUser.update({
        where: { id: firstUser.id },
        data: {
          email: adminEmail,
          password: adminPassword,
          name: "Admin User",
        },
      });
      console.log(`Admin user updated to: ${adminEmail}`);
    } else {
      await prismaUser.create({
        data: {
          email: adminEmail,
          password: adminPassword,
          name: "Admin User",
        },
      });
      console.log(`Admin user created: ${adminEmail}`);
    }
  } else {
    console.log("Skipped seeding admin user: ADMIN_EMAIL or ADMIN_PASSWORD not set in .env");
  }

  console.log("Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
