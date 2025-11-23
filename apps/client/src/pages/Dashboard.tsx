import { useState } from 'react';

interface ShopItem {
  id: number;
  title: string;
  description: string;
  price: string;
  thumbnail: string;
}

const shopItems: ShopItem[] = [
  {
    id: 1,
    title: 'Code Editor Pro',
    description: 'Advanced code editor with syntax highlighting and auto-completion',
    price: '$19.99',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'Data Visualizer',
    description: 'Create stunning data visualizations and interactive charts',
    price: '$24.99',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    title: 'Project Planner',
    description: 'Manage your projects with powerful planning and tracking tools',
    price: '$18.99',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    title: 'API Tester',
    description: 'Test and debug your APIs with an intuitive interface',
    price: '$23.99',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
  },
  {
    id: 5,
    title: 'Design Studio',
    description: 'Create stunning mockups and prototypes for your projects',
    price: '$19.99',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
  },
  {
    id: 6,
    title: 'Team Chat',
    description: 'Communicate seamlessly with your team in real-time',
    price: '$24.99',
    thumbnail: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=400&h=300&fit=crop',
  },
  {
    id: 7,
    title: 'CRM Insights',
    description: 'Manage customer relationships with powerful analytics tools',
    price: '$24.89',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  },
  {
    id: 8,
    title: 'Web Builder',
    description: 'Create and deploy responsive websites with no-code tools',
    price: '$24.99',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop',
  },
];

export default function Dashboard() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">Discover Apps</h1>
          <p className="text-base-content/70">
            Browse and manage applications available in your workspace
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex gap-2">
          {['All', 'Productivity', 'Development', 'Analytics', 'Design'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`btn btn-sm ${
                selectedCategory === category ? 'btn-primary' : 'btn-ghost'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {shopItems.map((item) => (
            <div
              key={item.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              {/* Thumbnail */}
              <figure className="h-48 overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </figure>

              <div className="card-body p-4">
                {/* Title */}
                <h2 className="card-title text-lg">{item.title}</h2>

                {/* Description */}
                <p className="text-sm text-base-content/70 line-clamp-2 mb-2">
                  {item.description}
                </p>

                {/* Price */}
                <div className="text-xl font-bold text-primary mb-3">{item.price}</div>

                {/* Action Buttons */}
                <div className="card-actions justify-between items-center">
                  <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm">Trailer</button>
                    <button className="btn btn-outline btn-sm">Open</button>
                  </div>
                  <button className="btn btn-primary btn-sm">Play</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
