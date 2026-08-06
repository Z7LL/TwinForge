export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black animate-pulse">
      <div className="container mx-auto px-6 py-24">
        <div className="h-20 bg-gray-800 rounded-lg mb-8" />
        <div className="h-10 bg-gray-800 rounded-lg mb-16 max-w-2xl" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="h-64 bg-gray-800 rounded-xl" />
          <div className="h-64 bg-gray-800 rounded-xl" />
          <div className="h-64 bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
