import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

console.log('URL:', supabaseUrl);
console.log('KEY:', supabaseKey.slice(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// ─── Step 1: Users ───────────────────────────────────────────────────────────

const users = [
    { email: 'daily.crumb@zeroooh.com',   password: 'Password123!', isBusiness: true },
    { email: 'cafe.mocha@zeroooh.com',    password: 'Password123!', isBusiness: true },
    { email: 'sushi.wave@zeroooh.com',    password: 'Password123!', isBusiness: true },
    { email: 'pizza.posto@zeroooh.com',   password: 'Password123!', isBusiness: true },
    { email: 'green.leaf@zeroooh.com',    password: 'Password123!', isBusiness: true },
    { email: 'bread.basket@zeroooh.com',  password: 'Password123!', isBusiness: true },
    { email: 'noodle.house@zeroooh.com',  password: 'Password123!', isBusiness: true },
    { email: 'fresh.squeeze@zeroooh.com', password: 'Password123!', isBusiness: true },
    { email: 'customer@zeroooh.com',      password: 'Password123!', isBusiness: false },
];

// ─── Step 2: Business Profiles ───────────────────────────────────────────────

const businessProfiles: Record<string, {
    business_name: string;
    phone: string;
    address: string;
    suburb: string;
    postcode: string;
}> = {
    'daily.crumb@zeroooh.com': {
        business_name: 'Daily Crumb Bakery',
        phone: '0242345601',
        address: '12 Crown Street',
        suburb: 'Wollongong',
        postcode: '2500',
    },
    'cafe.mocha@zeroooh.com': {
        business_name: 'Cafe Mocha',
        phone: '0242345602',
        address: '34 Keira Street',
        suburb: 'Wollongong',
        postcode: '2500',
    },
    'sushi.wave@zeroooh.com': {
        business_name: 'Sushi Wave',
        phone: '0242345603',
        address: '56 Crown Street',
        suburb: 'Wollongong',
        postcode: '2500',
    },
    'pizza.posto@zeroooh.com': {
        business_name: 'Pizza Posto',
        phone: '0291234604',
        address: '78 King Street',
        suburb: 'Newtown',
        postcode: '2042',
    },
    'green.leaf@zeroooh.com': {
        business_name: 'Green Leaf Cafe',
        phone: '0291234605',
        address: '23 Oxford Street',
        suburb: 'Darlinghurst',
        postcode: '2010',
    },
    'bread.basket@zeroooh.com': {
        business_name: 'The Bread Basket',
        phone: '0291234606',
        address: '90 George Street',
        suburb: 'Sydney',
        postcode: '2000',
    },
    'noodle.house@zeroooh.com': {
        business_name: 'Noodle House',
        phone: '0242345607',
        address: '15 Globe Lane',
        suburb: 'Wollongong',
        postcode: '2500',
    },
    'fresh.squeeze@zeroooh.com': {
        business_name: 'Fresh Squeeze',
        phone: '0291234608',
        address: '45 Glebe Point Road',
        suburb: 'Glebe',
        postcode: '2037',
    },
};

// ─── Step 3: Products ────────────────────────────────────────────────────────
// Each product has original_price_cents (retail) and discounted_price_cents
// (surplus price ~40–70% off). pickup_start/end is today + a few hours.

interface ProductSeed {
    email: string;
    product_name: string;
    short_description: string;
    long_description: string;
    category_name: 'Bakery' | 'Cafe' | 'Meals' | 'Drinks' | 'Grocery';
    original_price_cents: number;
    discounted_price_cents: number;
    stock: number;
    pickup_start_offset_hours: number; // hours from now
    pickup_end_offset_hours: number;
    image_url: string;
}

const products: ProductSeed[] = [
    // ── Daily Crumb Bakery (Bakery) ──────────────────────────────────────────
    {
        email: 'daily.crumb@zeroooh.com',
        product_name: 'Morning Pastry Pack',
        short_description: 'Assorted fresh pastries',
        long_description: 'A mix of buttery croissants, pain au chocolat and Danish pastries baked fresh this morning. Perfect with your morning coffee.',
        category_name: 'Bakery',
        original_price_cents: 1200,
        discounted_price_cents: 399,
        stock: 8,
        pickup_start_offset_hours: 4,
        pickup_end_offset_hours: 6,
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop',
    },
    {
        email: 'daily.crumb@zeroooh.com',
        product_name: 'Sourdough Loaf',
        short_description: 'Artisan sourdough loaf',
        long_description: 'Slow-fermented sourdough with a crackling crust and chewy crumb. Baked fresh daily in our stone-deck oven.',
        category_name: 'Bakery',
        original_price_cents: 900,
        discounted_price_cents: 350,
        stock: 5,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800&auto=format&fit=crop',
    },
    {
        email: 'daily.crumb@zeroooh.com',
        product_name: 'Mixed Muffin Box',
        short_description: '4 freshly baked muffins',
        long_description: 'A box of four muffins — blueberry, choc chip, banana walnut and raspberry white choc. Made from scratch each morning.',
        category_name: 'Bakery',
        original_price_cents: 1400,
        discounted_price_cents: 499,
        stock: 6,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=800&auto=format&fit=crop',
    },
    {
        email: 'daily.crumb@zeroooh.com',
        product_name: 'Croissant Pack ×3',
        short_description: 'Three butter croissants',
        long_description: 'Three all-butter croissants made with French laminated dough. Flaky, golden and still warm from the oven.',
        category_name: 'Bakery',
        original_price_cents: 1000,
        discounted_price_cents: 349,
        stock: 10,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 6,
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop',
    },
    {
        email: 'daily.crumb@zeroooh.com',
        product_name: 'Focaccia Slice',
        short_description: 'Rosemary sea salt focaccia',
        long_description: 'Thick-cut focaccia drizzled in extra virgin olive oil with fresh rosemary and flaky sea salt. Great as a side or snack.',
        category_name: 'Bakery',
        original_price_cents: 600,
        discounted_price_cents: 199,
        stock: 12,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?w=800&auto=format&fit=crop',
    },

    // ── Cafe Mocha (Cafe) ────────────────────────────────────────────────────
    {
        email: 'cafe.mocha@zeroooh.com',
        product_name: 'Latte + Muffin Combo',
        short_description: 'Oat latte with blueberry muffin',
        long_description: 'A creamy oat latte paired with a freshly baked blueberry muffin. The perfect afternoon pick-me-up before we close.',
        category_name: 'Cafe',
        original_price_cents: 1200,
        discounted_price_cents: 450,
        stock: 7,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&auto=format&fit=crop',
    },
    {
        email: 'cafe.mocha@zeroooh.com',
        product_name: 'Avocado Toast',
        short_description: 'Smashed avo on sourdough',
        long_description: 'Smashed avocado with feta, cherry tomatoes and dukkah on thick sourdough. A café classic done right.',
        category_name: 'Cafe',
        original_price_cents: 1800,
        discounted_price_cents: 699,
        stock: 4,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1603046891744-1f4f5c4b6d1b?w=800&auto=format&fit=crop',
    },
    {
        email: 'cafe.mocha@zeroooh.com',
        product_name: 'Acai Bowl',
        short_description: 'Blended acai with toppings',
        long_description: 'Blended acai base topped with granola, banana, fresh berries and honey. Made fresh daily — too good to waste.',
        category_name: 'Cafe',
        original_price_cents: 1500,
        discounted_price_cents: 550,
        stock: 5,
        pickup_start_offset_hours: 1,
        pickup_end_offset_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop',
    },
    {
        email: 'cafe.mocha@zeroooh.com',
        product_name: 'Banana Bread Slice',
        short_description: 'Warm banana bread',
        long_description: 'Our house-made banana bread loaded with walnuts and a hint of cinnamon. Served warm with a side of butter.',
        category_name: 'Cafe',
        original_price_cents: 700,
        discounted_price_cents: 249,
        stock: 9,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop',
    },
    {
        email: 'cafe.mocha@zeroooh.com',
        product_name: 'Matcha Latte',
        short_description: 'Ceremonial grade matcha',
        long_description: 'Ceremonial grade matcha whisked with oat milk and a touch of honey. Earthy, creamy and calming.',
        category_name: 'Drinks',
        original_price_cents: 800,
        discounted_price_cents: 299,
        stock: 8,
        pickup_start_offset_hours: 1,
        pickup_end_offset_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?w=800&auto=format&fit=crop',
    },

    // ── Sushi Wave (Meals) ───────────────────────────────────────────────────
    {
        email: 'sushi.wave@zeroooh.com',
        product_name: 'Sushi Set (12 pcs)',
        short_description: 'Chef selection sushi',
        long_description: 'Twelve pieces of chef-selected sushi including salmon nigiri, tuna roll and prawn tempura maki. Made fresh today.',
        category_name: 'Meals',
        original_price_cents: 2200,
        discounted_price_cents: 799,
        stock: 6,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1617196034183-421b4040ed20?w=800&auto=format&fit=crop',
    },
    {
        email: 'sushi.wave@zeroooh.com',
        product_name: 'Teriyaki Chicken Bowl',
        short_description: 'Rice bowl with teriyaki chicken',
        long_description: 'Steamed Japanese rice topped with glazed teriyaki chicken, edamame, pickled ginger and sesame seeds.',
        category_name: 'Meals',
        original_price_cents: 1600,
        discounted_price_cents: 599,
        stock: 8,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&auto=format&fit=crop',
    },
    {
        email: 'sushi.wave@zeroooh.com',
        product_name: 'Salmon Sashimi (8 pcs)',
        short_description: 'Premium Atlantic salmon',
        long_description: 'Eight slices of sashimi-grade Atlantic salmon with wasabi, pickled ginger and soy sauce.',
        category_name: 'Meals',
        original_price_cents: 2000,
        discounted_price_cents: 799,
        stock: 5,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 6,
        image_url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&auto=format&fit=crop',
    },
    {
        email: 'sushi.wave@zeroooh.com',
        product_name: 'Edamame + Gyoza',
        short_description: 'Salted edamame & pan-fried gyoza',
        long_description: 'Lightly salted edamame alongside four pan-fried pork and cabbage gyoza with ponzu dipping sauce.',
        category_name: 'Meals',
        original_price_cents: 1400,
        discounted_price_cents: 499,
        stock: 10,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&auto=format&fit=crop',
    },
    {
        email: 'sushi.wave@zeroooh.com',
        product_name: 'Miso Ramen',
        short_description: 'Rich miso broth ramen',
        long_description: 'Miso-based pork broth with ramen noodles, chashu pork, a soft-boiled egg and nori. Comfort in a bowl.',
        category_name: 'Meals',
        original_price_cents: 1900,
        discounted_price_cents: 699,
        stock: 7,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop',
    },

    // ── Pizza Posto (Meals) ──────────────────────────────────────────────────
    {
        email: 'pizza.posto@zeroooh.com',
        product_name: 'Margherita Pizza (whole)',
        short_description: 'San Marzano tomato & fior di latte',
        long_description: 'Our classic Neapolitan margherita — San Marzano tomato, fior di latte mozzarella and fresh basil on a hand-stretched thin crust.',
        category_name: 'Meals',
        original_price_cents: 2400,
        discounted_price_cents: 899,
        stock: 4,
        pickup_start_offset_hours: 4,
        pickup_end_offset_hours: 6,
        image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop',
    },
    {
        email: 'pizza.posto@zeroooh.com',
        product_name: 'Pasta al Pomodoro',
        short_description: 'Fresh pasta in tomato sauce',
        long_description: 'Hand-rolled spaghetti in our slow-simmered San Marzano tomato sauce with fresh basil and aged parmigiano.',
        category_name: 'Meals',
        original_price_cents: 1800,
        discounted_price_cents: 699,
        stock: 6,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1598866594240-46fb93cc9f79?w=800&auto=format&fit=crop',
    },
    {
        email: 'pizza.posto@zeroooh.com',
        product_name: 'Tiramisu',
        short_description: 'Classic Italian dessert',
        long_description: 'House-made tiramisu with savoiardi ladyfingers, mascarpone cream and a dusting of dark cocoa.',
        category_name: 'Meals',
        original_price_cents: 1200,
        discounted_price_cents: 449,
        stock: 8,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 6,
        image_url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&auto=format&fit=crop',
    },
    {
        email: 'pizza.posto@zeroooh.com',
        product_name: 'Garlic Bread ×4',
        short_description: 'Toasted ciabatta with garlic butter',
        long_description: 'Four slices of ciabatta toasted with house garlic butter, fresh parsley and a sprinkle of parmesan.',
        category_name: 'Bakery',
        original_price_cents: 800,
        discounted_price_cents: 299,
        stock: 12,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=800&auto=format&fit=crop',
    },
    {
        email: 'pizza.posto@zeroooh.com',
        product_name: 'Arancini ×3',
        short_description: 'Crispy risotto balls',
        long_description: 'Three golden arancini stuffed with mozzarella and slow-cooked ragù, served with house marinara.',
        category_name: 'Meals',
        original_price_cents: 1400,
        discounted_price_cents: 499,
        stock: 9,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop',
    },

    // ── Green Leaf Cafe (Cafe / Meals) ───────────────────────────────────────
    {
        email: 'green.leaf@zeroooh.com',
        product_name: 'Buddha Bowl',
        short_description: 'Roasted veggie grain bowl',
        long_description: 'Quinoa and brown rice base with roasted sweet potato, chickpeas, avocado, pickled red cabbage and tahini dressing.',
        category_name: 'Meals',
        original_price_cents: 1900,
        discounted_price_cents: 699,
        stock: 5,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop',
    },
    {
        email: 'green.leaf@zeroooh.com',
        product_name: 'Overnight Oats',
        short_description: 'Chia oats with fresh fruit',
        long_description: 'Rolled oats soaked overnight with chia seeds, almond milk, topped with seasonal fruit, coconut flakes and raw honey.',
        category_name: 'Cafe',
        original_price_cents: 1100,
        discounted_price_cents: 399,
        stock: 7,
        pickup_start_offset_hours: 1,
        pickup_end_offset_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1571748982800-fa51082c2224?w=800&auto=format&fit=crop',
    },
    {
        email: 'green.leaf@zeroooh.com',
        product_name: 'Green Smoothie',
        short_description: 'Spinach, banana & mango blend',
        long_description: 'A nourishing blend of baby spinach, banana, frozen mango and coconut water. Cold-pressed and ready to go.',
        category_name: 'Drinks',
        original_price_cents: 900,
        discounted_price_cents: 349,
        stock: 10,
        pickup_start_offset_hours: 1,
        pickup_end_offset_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&auto=format&fit=crop',
    },
    {
        email: 'green.leaf@zeroooh.com',
        product_name: 'Poke Bowl',
        short_description: 'Salmon poke with sushi rice',
        long_description: 'Sushi rice topped with marinated salmon, edamame, cucumber, mango, avocado and sriracha mayo.',
        category_name: 'Meals',
        original_price_cents: 2100,
        discounted_price_cents: 799,
        stock: 4,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop',
    },
    {
        email: 'green.leaf@zeroooh.com',
        product_name: 'Granola Bar ×4',
        short_description: 'House-made oat & honey bars',
        long_description: 'Four chewy granola bars made with rolled oats, honey, almonds, dried cranberries and dark chocolate chips.',
        category_name: 'Grocery',
        original_price_cents: 800,
        discounted_price_cents: 299,
        stock: 15,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop',
    },

    // ── The Bread Basket (Bakery) ────────────────────────────────────────────
    {
        email: 'bread.basket@zeroooh.com',
        product_name: 'Mixed Pastry Box',
        short_description: '5 assorted pastries',
        long_description: 'Five pastries fresh from the oven — two croissants, one pain au raisin, one almond danish and one chocolate twist.',
        category_name: 'Bakery',
        original_price_cents: 1500,
        discounted_price_cents: 499,
        stock: 8,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop',
    },
    {
        email: 'bread.basket@zeroooh.com',
        product_name: 'Rye Loaf',
        short_description: 'Dense seeded rye loaf',
        long_description: 'A hearty dark rye loaf packed with sunflower, pumpkin and sesame seeds. Great for open-faced sandwiches.',
        category_name: 'Bakery',
        original_price_cents: 1000,
        discounted_price_cents: 399,
        stock: 4,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=800&auto=format&fit=crop',
    },
    {
        email: 'bread.basket@zeroooh.com',
        product_name: 'Cinnamon Scroll ×3',
        short_description: 'Glazed cinnamon scrolls',
        long_description: 'Three fluffy cinnamon scrolls with cream cheese glaze. Baked fresh this morning — pick up before they are gone.',
        category_name: 'Bakery',
        original_price_cents: 1100,
        discounted_price_cents: 399,
        stock: 6,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=800&auto=format&fit=crop',
    },
    {
        email: 'bread.basket@zeroooh.com',
        product_name: 'Baguette Duo',
        short_description: 'Two classic French baguettes',
        long_description: 'Two thin crusty baguettes with a fluffy, airy interior. Perfect with cheese and a glass of wine.',
        category_name: 'Bakery',
        original_price_cents: 700,
        discounted_price_cents: 249,
        stock: 10,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 6,
        image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=800&auto=format&fit=crop',
    },
    {
        email: 'bread.basket@zeroooh.com',
        product_name: 'Quiche Slice',
        short_description: 'Lorraine quiche slice',
        long_description: 'A generous slice of quiche Lorraine with bacon lardons, gruyère and a silky egg custard in a buttery shortcrust.',
        category_name: 'Meals',
        original_price_cents: 1100,
        discounted_price_cents: 399,
        stock: 6,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&auto=format&fit=crop',
    },

    // ── Noodle House (Meals) ─────────────────────────────────────────────────
    {
        email: 'noodle.house@zeroooh.com',
        product_name: 'Pad Thai',
        short_description: 'Classic stir-fried rice noodles',
        long_description: 'Rice noodles stir-fried with egg, bean sprouts, peanuts, dried shrimp and tamarind sauce. Choice of tofu or prawn.',
        category_name: 'Meals',
        original_price_cents: 1800,
        discounted_price_cents: 699,
        stock: 8,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800&auto=format&fit=crop',
    },
    {
        email: 'noodle.house@zeroooh.com',
        product_name: 'Dumplings ×8',
        short_description: 'Steamed pork & ginger dumplings',
        long_description: 'Eight steamed pork and ginger dumplings with a light soy and chilli dipping sauce. Made fresh daily.',
        category_name: 'Meals',
        original_price_cents: 1400,
        discounted_price_cents: 499,
        stock: 10,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&auto=format&fit=crop',
    },
    {
        email: 'noodle.house@zeroooh.com',
        product_name: 'Pho Bo',
        short_description: 'Vietnamese beef broth noodle soup',
        long_description: 'Aromatic 12-hour bone broth with flat rice noodles, sliced beef, bean sprouts, fresh basil and hoisin sauce.',
        category_name: 'Meals',
        original_price_cents: 1900,
        discounted_price_cents: 749,
        stock: 6,
        pickup_start_offset_hours: 3,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&auto=format&fit=crop',
    },
    {
        email: 'noodle.house@zeroooh.com',
        product_name: 'Spring Roll ×4',
        short_description: 'Crispy pork & veggie spring rolls',
        long_description: 'Four crispy spring rolls packed with pork, glass noodles and cabbage. Served with sweet chilli sauce.',
        category_name: 'Meals',
        original_price_cents: 900,
        discounted_price_cents: 349,
        stock: 14,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1548869190-2911a2ae95fa?w=800&auto=format&fit=crop',
    },
    {
        email: 'noodle.house@zeroooh.com',
        product_name: 'Fried Rice',
        short_description: 'Wok-fried jasmine rice',
        long_description: 'Wok-tossed jasmine rice with egg, spring onion, peas and a choice of chicken or tofu in light soy sauce.',
        category_name: 'Meals',
        original_price_cents: 1200,
        discounted_price_cents: 449,
        stock: 9,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&auto=format&fit=crop',
    },

    // ── Fresh Squeeze (Drinks / Cafe) ────────────────────────────────────────
    {
        email: 'fresh.squeeze@zeroooh.com',
        product_name: 'Cold Press Juice Trio',
        short_description: '3 x 350ml cold-pressed juices',
        long_description: 'Three 350ml cold-pressed juices — orange carrot ginger, green apple celery spinach, and pineapple mint cucumber.',
        category_name: 'Drinks',
        original_price_cents: 1800,
        discounted_price_cents: 699,
        stock: 10,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 4,
        image_url: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&auto=format&fit=crop',
    },
    {
        email: 'fresh.squeeze@zeroooh.com',
        product_name: 'Protein Smoothie',
        short_description: 'Banana, peanut butter & oat smoothie',
        long_description: 'A thick smoothie blended with banana, natural peanut butter, oats, honey and oat milk. Post-workout ready.',
        category_name: 'Drinks',
        original_price_cents: 1100,
        discounted_price_cents: 399,
        stock: 8,
        pickup_start_offset_hours: 1,
        pickup_end_offset_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1579722820408-a1ef40d47ba5?w=800&auto=format&fit=crop',
    },
    {
        email: 'fresh.squeeze@zeroooh.com',
        product_name: 'Fresh Orange Juice (1L)',
        short_description: 'Freshly squeezed oranges',
        long_description: 'One litre of freshly squeezed Valencia orange juice — no added sugar, no preservatives. Pressed this morning.',
        category_name: 'Drinks',
        original_price_cents: 900,
        discounted_price_cents: 350,
        stock: 12,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&auto=format&fit=crop',
    },
    {
        email: 'fresh.squeeze@zeroooh.com',
        product_name: 'Kombucha ×2',
        short_description: 'House-brewed kombucha',
        long_description: 'Two 330ml bottles of house-brewed kombucha — one passionfruit and one raspberry rose. Live cultures, low sugar.',
        category_name: 'Drinks',
        original_price_cents: 1200,
        discounted_price_cents: 449,
        stock: 9,
        pickup_start_offset_hours: 2,
        pickup_end_offset_hours: 5,
        image_url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&auto=format&fit=crop',
    },
    {
        email: 'fresh.squeeze@zeroooh.com',
        product_name: 'Smoothie Bowl',
        short_description: 'Thick blended smoothie bowl',
        long_description: 'Thick blended strawberry and mango base topped with granola, chia seeds, sliced banana and shredded coconut.',
        category_name: 'Cafe',
        original_price_cents: 1400,
        discounted_price_cents: 549,
        stock: 6,
        pickup_start_offset_hours: 1,
        pickup_end_offset_hours: 3,
        image_url: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop',
    },
];

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Returns a UTC ISO string offset from now by `hours` hours.
 */
function hoursFromNow(hours: number): string {
    return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

// ─── Main Seed Function ───────────────────────────────────────────────────────

async function seed() {
    console.log('🌱 Starting Zeroooh seed...\n');

    // ── Step 1: Create users ─────────────────────────────────────────────────
    console.log('👤 Creating users...');
    const userIdMap: Record<string, string> = {};

    for (const user of users) {
        const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true,
            phone_confirm: true,
            user_metadata: { isBusiness: user.isBusiness },
        });

        if (error) {
            console.error(`  ❌ Failed: ${user.email} — ${error.message}`);
        } else {
            userIdMap[user.email] = data.user.id;
            console.log(`  ✅ Created: ${user.email}`);
        }
    }

    // ── Step 2: Update business profiles ────────────────────────────────────
    console.log('\n🏪 Updating business profiles...');
    for (const [email, profile] of Object.entries(businessProfiles)) {
        const userId = userIdMap[email];
        if (!userId) { console.error(`  ❌ No user ID for ${email}`); continue; }

        const { error } = await supabase
            .from('business_profiles')
            .update(profile)
            .eq('user_id', userId);

        if (error) console.error(`  ❌ Failed: ${email} — ${error.message}`);
        else console.log(`  ✅ Updated: ${profile.business_name}`);
    }

    // ── Step 2.5: Update customer user profile ───────────────────────────────
    console.log('\n👤 Updating customer profile...');
    const customerUserId = userIdMap['customer@zeroooh.com'];
    if (!customerUserId) {
        console.error('  ❌ No user ID for customer@zeroooh.com');
    } else {
        const { error } = await supabase
            .from('user_profiles')
            .update({ first_name: 'Alex', last_name: 'Johnson', default_role: 'user', is_superuser: false })
            .eq('user_id', customerUserId);

        if (error) console.error(`  ❌ Failed: customer profile — ${error.message}`);
        else console.log('  ✅ Updated: customer@zeroooh.com (Alex Johnson)');
    }

    // ── Step 3: Fetch lookup IDs ─────────────────────────────────────────────
    console.log('\n🔍 Fetching category & status IDs...');

    const { data: categories, error: catError } = await supabase
        .from('product_categories')
        .select('id, name');
    if (catError) { console.error('  ❌ Failed to fetch categories:', catError.message); return; }

    const { data: statuses, error: stError } = await supabase
        .from('product_status')
        .select('id, status_name');
    if (stError) { console.error('  ❌ Failed to fetch statuses:', stError.message); return; }

    const categoryIdMap: Record<string, string> = {};
    for (const c of categories ?? []) categoryIdMap[c.name] = c.id;

    const activeStatusId = (statuses ?? []).find((s: any) => s.status_name === 'active')?.id ?? null;
    console.log('  ✅ Categories:', Object.keys(categoryIdMap).join(', '));
    console.log('  ✅ Active status ID:', activeStatusId);

    // ── Step 4: Insert products ──────────────────────────────────────────────
    console.log('\n🍱 Inserting products...');
    const productIdMap: Record<string, string> = {};

    for (const product of products) {
        const userId = userIdMap[product.email];
        if (!userId) { console.error(`  ❌ No user ID for ${product.email}`); continue; }

        const categoryId = categoryIdMap[product.category_name] ?? null;

        const { data, error } = await supabase
            .from('products')
            .insert({
                user_id: userId,
                category_id: categoryId,
                status_id: activeStatusId,
                product_name: product.product_name,
                short_description: product.short_description,
                long_description: product.long_description,
                original_price_cents: product.original_price_cents,
                discounted_price_cents: product.discounted_price_cents,
                stock: product.stock,
                pickup_start: hoursFromNow(product.pickup_start_offset_hours),
                pickup_end: hoursFromNow(product.pickup_end_offset_hours),
                updated_at: new Date().toISOString(),
            })
            .select('id')
            .single();

        if (error) {
            console.error(`  ❌ Failed: ${product.product_name} — ${error.message}`);
        } else {
            productIdMap[product.product_name] = data.id;
            console.log(`  ✅ Inserted: ${product.product_name}`);
        }
    }

    // ── Step 5: Insert product images ────────────────────────────────────────
    console.log('\n🖼️  Inserting product images...');

    for (const product of products) {
        const productId = productIdMap[product.product_name];
        if (!productId) continue;

        const { error } = await supabase
            .from('product_images')
            .insert({
                product_id: productId,
                image_url: product.image_url,
                display_order: 0,
            });

        if (error) console.error(`  ❌ Failed image: ${product.product_name} — ${error.message}`);
        else console.log(`  ✅ Image: ${product.product_name}`);
    }

    console.log('\n✅ Zeroooh seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📱 Customer login:');
    console.log('   email:    customer@zeroooh.com');
    console.log('   password: Password123!');
    console.log('🏪 Business login (example):');
    console.log('   email:    daily.crumb@zeroooh.com');
    console.log('   password: Password123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

seed().catch((err) => {
    console.error('💥 Seed failed:', err);
    process.exit(1);
});
