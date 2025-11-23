import { useState } from 'react';

interface LibraryItem {
  id: number;
  title: string;
  description: string;
  author: string;
  thumbnail: string;
}

const libraryItems: LibraryItem[] = [
  {
    id: 1,
    title: 'Web Development Fundamentals',
    description: 'Learn the basics of HTML, CSS, and JavaScript for modern web development',
    author: 'WebEDT Team',
    thumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'React & TypeScript Guide',
    description: 'Master building scalable applications with React and TypeScript',
    author: 'WebEDT Team',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    title: 'Node.js Backend Development',
    description: 'Build robust server-side applications with Node.js and Express',
    author: 'WebEDT Team',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    title: 'UI/UX Design Principles',
    description: 'Create beautiful and intuitive user interfaces with modern design principles',
    author: 'WebEDT Team',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=300&fit=crop',
  },
  {
    id: 5,
    title: 'Database Design & SQL',
    description: 'Learn relational database design and SQL query optimization',
    author: 'WebEDT Team',
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=300&fit=crop',
  },
  {
    id: 6,
    title: 'API Development Best Practices',
    description: 'Design and build RESTful APIs following industry standards',
    author: 'WebEDT Team',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  },
  {
    id: 7,
    title: 'DevOps & Deployment',
    description: 'Master CI/CD pipelines and cloud deployment strategies',
    author: 'WebEDT Team',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=300&fit=crop',
  },
  {
    id: 8,
    title: '3D Graphics & WebGL',
    description: 'Create stunning 3D graphics and animations for the web',
    author: 'WebEDT Team',
    thumbnail: 'https://images.unsplash.com/photo-1614854262318-831574f15f1f?w=400&h=300&fit=crop',
  },
];

export default function Library() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">Library</h1>
          <p className="text-base-content/70">
            Browse tutorials, templates, and learning resources
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex gap-2">
          {['All', 'Tutorials', 'Templates', 'Documentation', 'Examples'].map((category) => (
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
                onClick={() => console.log('Open:', item.title)}
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
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
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

                {/* Author with Icons */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-base-content/60">{item.author}</div>
                  <div className="flex gap-3">
                    {/* Preview Icon */}
                    <button
                      className="btn btn-ghost btn-sm btn-circle"
                      onClick={() => console.log('Preview:', item.title)}
                      title="Preview"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>

                    {/* Download/Open Icon */}
                    <button
                      className="btn btn-ghost btn-sm btn-circle"
                      onClick={() => console.log('Open:', item.title)}
                      title="Open"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
