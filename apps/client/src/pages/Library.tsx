import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ShopItem {
  id: number;
  title: string;
  description: string;
  price: string;
  thumbnail: string;
  purchasedDate: string;
}

// Subset of store items that user has "purchased"
const libraryItems: ShopItem[] = [
  {
    id: 1,
    title: 'Code Editor Pro',
    description: 'Advanced code editor with syntax highlighting and auto-completion',
    price: '$19.99',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    purchasedDate: '2025-11-15',
  },
  {
    id: 3,
    title: 'Project Planner',
    description: 'Manage your projects with powerful planning and tracking tools',
    price: '$18.99',
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
    purchasedDate: '2025-11-10',
  },
  {
    id: 5,
    title: 'Design Studio',
    description: 'Create stunning mockups and prototypes for your projects',
    price: '$19.99',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
    purchasedDate: '2025-11-05',
  },
  {
    id: 6,
    title: 'Team Chat',
    description: 'Communicate seamlessly with your team in real-time',
    price: '$24.99',
    thumbnail: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=400&h=300&fit=crop',
    purchasedDate: '2025-10-28',
  },
];

export default function Library() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">My Library</h1>
          <p className="text-base-content/70">
            Your purchased apps and tools
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex gap-2">
          {['All', 'Recently Added', 'Most Used', 'Favorites'].map((category) => (
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

        {/* Library Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {libraryItems.map((item) => (
            <div
              key={item.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow"
            >
              {/* Thumbnail - Clickable to Open */}
              <figure
                className="relative h-48 overflow-hidden cursor-pointer group"
                onClick={() => navigate(`/library/${item.id}`)}
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-white transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </div>
                </div>
              </figure>

              <div className="card-body p-4">
                {/* Title */}
                <h2 className="card-title text-lg">{item.title}</h2>

                {/* Description */}
                <p className="text-sm text-base-content/70 line-clamp-2 mb-2">
                  {item.description}
                </p>

                {/* Price and Purchase Date */}
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-primary">{item.price}</div>
                  <div className="text-xs text-base-content/50">
                    Purchased {new Date(item.purchasedDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    className="btn btn-primary btn-sm flex-1"
                    onClick={() => navigate(`/library/${item.id}`)}
                  >
                    Open
                  </button>
                  <button
                    className="btn btn-ghost btn-sm btn-circle"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Download:', item.title);
                    }}
                    title="Download"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
