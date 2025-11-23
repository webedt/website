import { useParams, useNavigate } from 'react-router-dom';

interface LibraryItem {
  id: number;
  title: string;
  description: string;
  author: string;
  thumbnail: string;
}

// Same items as in Library
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

export default function LibraryItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const item = libraryItems.find((item) => item.id === Number(id));

  if (!item) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-base-content mb-4">Resource Not Found</h1>
          <button className="btn btn-primary" onClick={() => navigate('/library')}>
            Back to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          className="btn btn-ghost mb-6"
          onClick={() => navigate('/library')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Library
        </button>

        {/* Item Details */}
        <div className="card bg-base-100 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image Section */}
            <div>
              <figure className="rounded-lg overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-96 object-cover"
                />
              </figure>
            </div>

            {/* Details Section */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold text-base-content mb-4">
                  {item.title}
                </h1>

                {/* Author */}
                <div className="flex items-center gap-2 mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-base-content/60"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-lg text-base-content/70">
                    By {item.author}
                  </span>
                </div>

                <p className="text-lg text-base-content/70 mb-6">
                  {item.description}
                </p>

                {/* Placeholder Content */}
                <div className="border-t border-base-300 pt-6 mb-6">
                  <h2 className="text-2xl font-semibold mb-4">What You'll Learn</h2>
                  <ul className="list-disc list-inside space-y-2 text-base-content/70">
                    <li>Comprehensive coverage of core concepts</li>
                    <li>Hands-on examples and exercises</li>
                    <li>Best practices and industry standards</li>
                    <li>Real-world project demonstrations</li>
                  </ul>
                </div>

                <div className="border-t border-base-300 pt-6">
                  <h2 className="text-2xl font-semibold mb-4">Prerequisites</h2>
                  <ul className="list-disc list-inside space-y-2 text-base-content/70">
                    <li>Basic understanding of web technologies</li>
                    <li>Access to a modern web browser</li>
                    <li>Active account</li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-8">
                <button className="btn btn-primary flex-1">
                  Open Resource
                </button>
                <button className="btn btn-outline flex-1">
                  Save to My Library
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 card bg-base-100 shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-4">About This Resource</h2>
          <p className="text-base-content/70 leading-relaxed">
            This is a placeholder library item page. In a real application, this would contain
            detailed information about the learning resource, including table of contents,
            estimated completion time, difficulty level, related resources, user ratings and
            reviews, and more comprehensive learning objectives.
          </p>
        </div>
      </div>
    </div>
  );
}
