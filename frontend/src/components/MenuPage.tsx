
import React from 'react';
import { Coffee } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: string;
  category: 'hot-drinks' | 'cold-drinks' | 'pastries' | 'snacks';
  icon: string;
}

const MenuPage: React.FC = () => {
  const menuItems: MenuItem[] = [
    // Hot Drinks
    { id: '1', name: 'Signature Espresso', description: 'Rich, bold shot of our house blend', price: '$3.50', category: 'hot-drinks', icon: '☕' },
    { id: '2', name: 'Classic Latte', description: 'Smooth espresso with steamed milk', price: '$4.75', category: 'hot-drinks', icon: '🥛' },
    { id: '3', name: 'Cappuccino Supreme', description: 'Perfect balance of espresso, steamed milk, and foam', price: '$4.50', category: 'hot-drinks', icon: '☕' },
    { id: '4', name: 'Caramel Macchiato', description: 'Vanilla-flavored drink with caramel drizzle', price: '$5.25', category: 'hot-drinks', icon: '☕' },
    
    // Cold Drinks
    { id: '5', name: 'Iced Americano', description: 'Chilled espresso over ice', price: '$3.75', category: 'cold-drinks', icon: '🧊' },
    { id: '6', name: 'Cold Brew', description: '24-hour slow-steeped perfection', price: '$4.25', category: 'cold-drinks', icon: '🧊' },
    { id: '7', name: 'Vanilla Frappé', description: 'Blended iced coffee with vanilla flavor', price: '$5.50', category: 'cold-drinks', icon: '🥤' },
    
    // Pastries
    { id: '8', name: 'Almond Croissant', description: 'Buttery pastry with almond filling', price: '$3.95', category: 'pastries', icon: '🥐' },
    { id: '9', name: 'Blueberry Scone', description: 'Fresh-baked with wild blueberries', price: '$3.25', category: 'pastries', icon: '🧁' },
    { id: '10', name: 'Chocolate Muffin', description: 'Double chocolate chip delight', price: '$3.50', category: 'pastries', icon: '🧁' },
    
    // Snacks
    { id: '11', name: 'Artisan Bagel', description: 'With cream cheese spread', price: '$4.50', category: 'snacks', icon: '🥯' },
    { id: '12', name: 'Avocado Toast', description: 'Multigrain bread with fresh avocado', price: '$6.75', category: 'snacks', icon: '🥑' }
  ];

  const categories = [
    { id: 'hot-drinks', name: 'Hot Drinks', icon: '☕' },
    { id: 'cold-drinks', name: 'Cold Drinks', icon: '🧊' },
    { id: 'pastries', name: 'Fresh Pastries', icon: '🥐' },
    { id: 'snacks', name: 'Light Bites', icon: '🥯' }
  ];

  const getItemsByCategory = (categoryId: string) => {
    return menuItems.filter(item => item.category === categoryId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-coffee-brown to-coffee-dark text-cream shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Coffee className="w-8 h-8 text-yellow-300" />
              <h1 className="text-4xl font-bold text-cream">Our Menu</h1>
              <Coffee className="w-8 h-8 text-yellow-300" />
            </div>
            <p className="text-amber-100 text-lg">
              Crafted with passion, served with love. Discover your new favorite!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {categories.map((category) => {
          const items = getItemsByCategory(category.id);
          return (
            <div key={category.id} className="mb-12">
              {/* Category Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <span className="text-3xl">{category.icon}</span>
                  <h2 className="text-3xl font-bold text-coffee-brown">{category.name}</h2>
                  <span className="text-3xl">{category.icon}</span>
                </div>
                <div className="w-24 h-1 bg-gradient-to-r from-amber-400 to-orange-400 mx-auto rounded"></div>
              </div>

              {/* Menu Items Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white rounded-xl shadow-lg border border-amber-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                        <span className="text-2xl">{item.icon}</span>
                      </div>
                      <h3 className="text-xl font-semibold text-coffee-brown mb-2">{item.name}</h3>
                      {item.description && (
                        <p className="text-coffee-light text-sm mb-3 leading-relaxed">{item.description}</p>
                      )}
                    </div>

                    <div className="text-center">
                      <div className="inline-flex items-center justify-center bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-2 rounded-full font-bold text-lg shadow-md">
                        {item.price}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-amber-100 to-orange-100 py-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h3 className="text-2xl font-bold text-coffee-brown mb-4">
            Earn CoffeeCoins with Every Purchase!
          </h3>
          <p className="text-coffee-light mb-6">
            Join our loyalty program and start earning rewards today. Every sip gets you closer to your next free treat!
          </p>
          <a href="/rewards" className="inline-flex items-center bg-coffee-brown hover:bg-coffee-dark text-cream px-6 py-3 rounded-lg font-semibold transition-colors">
            Join Rewards Program
            <Coffee className="w-5 h-5 ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;
