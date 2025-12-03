import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            404
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            抱歉，找不到您要访问的页面
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </main>
    </div>
  );
}
