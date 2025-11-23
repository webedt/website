import { useState } from 'react';
import { useViewMode } from '@/hooks/useViewMode';
import ViewToggle from '@/components/ViewToggle';
import ItemGridView from '@/components/ItemViews/ItemGridView';
import ItemDetailedView from '@/components/ItemViews/ItemDetailedView';
import ItemMinimalView from '@/components/ItemViews/ItemMinimalView';

interface CommunityItem {
  id: number;
  title: string;
  description: string;
  author: string;
  likes: number;
  thumbnail: string;
}

const communityItems: CommunityItem[] = [
  {
    id: 1,
    title: 'Interactive Portfolio Template',
    description: 'A stunning portfolio website with smooth animations and dark mode',
    author: 'Sarah Chen',
    likes: 234,
    thumbnail: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=300&fit=crop',
  },
  {
    id: 2,
    title: 'E-commerce Dashboard',
    description: 'Complete admin dashboard for managing online stores',
    author: 'Alex Martinez',
    likes: 189,
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop',
  },
  {
    id: 3,
    title: 'Weather App with Maps',
    description: 'Real-time weather data visualization with interactive maps',
    author: 'Emma Wilson',
    likes: 156,
    thumbnail: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=400&h=300&fit=crop',
  },
  {
    id: 4,
    title: 'Task Management System',
    description: 'Collaborative task tracker with team features and notifications',
    author: 'Michael Brown',
    likes: 298,
    thumbnail: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
  },
  {
    id: 5,
    title: 'Music Player Interface',
    description: 'Beautiful music player with playlist management and visualizations',
    author: 'Lisa Anderson',
    likes: 412,
    thumbnail: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop',
  },
  {
    id: 6,
    title: 'Recipe Sharing Platform',
    description: 'Share and discover recipes with step-by-step instructions',
    author: 'David Kim',
    likes: 176,
    thumbnail: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&h=300&fit=crop',
  },
  {
    id: 7,
    title: 'Fitness Tracker Dashboard',
    description: 'Track workouts, nutrition, and progress with detailed analytics',
    author: 'Jessica Lee',
    likes: 267,
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop',
  },
  {
    id: 8,
    title: 'Chat Application',
    description: 'Real-time messaging app with file sharing and group chats',
    author: 'Robert Taylor',
    likes: 345,
    thumbnail: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=400&h=300&fit=crop',
  },
];

export default function Community() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useViewMode('community-view');

  // Grid/Card view renderer
  const renderCard = (item: CommunityItem) => (
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
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
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

        {/* Author and Likes */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-base-content/60">{item.author}</div>
          <div className="flex gap-3 items-center">
            {/* Likes Count */}
            <div className="flex items-center gap-1 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span>{item.likes}</span>
            </div>

            {/* Share Icon */}
            <button
              className="btn btn-ghost btn-sm btn-circle"
              onClick={() => console.log('Share:', item.title)}
              title="Share"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Detailed line view renderer
  const renderDetailedRow = (item: CommunityItem) => (
    <div
      key={item.id}
      className="flex items-center gap-4 p-4 bg-base-100 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => console.log('Open:', item.title)}
    >
      {/* Thumbnail */}
      <img
        src={item.thumbnail}
        alt={item.title}
        className="w-24 h-24 object-cover rounded"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-base-content">{item.title}</h3>
        <p className="text-sm text-base-content/70 mt-1">{item.description}</p>
        <p className="text-xs text-base-content/50 mt-2">{item.author}</p>
      </div>

      {/* Likes and Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>{item.likes}</span>
        </div>
        <button
          className="btn btn-ghost btn-sm btn-circle"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Share:', item.title);
          }}
          title="Share"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>
    </div>
  );

  // Minimal line view renderer
  const renderMinimalRow = (item: CommunityItem) => (
    <div
      key={item.id}
      className="flex items-center gap-4 p-3 bg-base-100 rounded hover:bg-base-200 transition-colors cursor-pointer"
      onClick={() => console.log('Open:', item.title)}
    >
      {/* Icon/Thumbnail */}
      <img
        src={item.thumbnail}
        alt={item.title}
        className="w-10 h-10 object-cover rounded"
      />

      {/* Title */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-base-content truncate">{item.title}</h3>
      </div>

      {/* Author */}
      <div className="text-xs text-base-content/60 hidden sm:block">{item.author}</div>

      {/* Likes */}
      <div className="flex items-center gap-1 text-xs">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span>{item.likes}</span>
      </div>

      {/* Quick Action */}
      <button
        className="btn btn-ghost btn-xs btn-circle"
        onClick={(e) => {
          e.stopPropagation();
          console.log('Share:', item.title);
        }}
        title="Share"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">Community</h1>
          <p className="text-base-content/70">
            Discover and share projects created by the WebEDT community
          </p>
        </div>

        {/* Category Filters and View Toggle */}
        <div className="mb-8 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-2">
            {['All', 'Popular', 'Recent', 'Featured', 'Trending'].map((category) => (
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

          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* Community Items - Dynamic View */}
        {viewMode === 'grid' && (
          <ItemGridView items={communityItems} renderCard={renderCard} />
        )}
        {viewMode === 'detailed' && (
          <ItemDetailedView items={communityItems} renderRow={renderDetailedRow} />
        )}
        {viewMode === 'minimal' && (
          <ItemMinimalView items={communityItems} renderRow={renderMinimalRow} />
        )}
      </div>
    </div>
  );
}
