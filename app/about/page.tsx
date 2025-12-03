import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">
            关于我
          </h1>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
              欢迎来到我的个人博客！这里记录着我的技术学习、日常生活、旅行见闻等各种内容。
            </p>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              我会在这里分享：
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
              <li>技术类文章：编程、开发、工具使用等</li>
              <li>日常生活：生活感悟、日常记录</li>
              <li>学习记录：学习笔记、知识总结</li>
              <li>旅游：旅行见闻、游记分享</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300">
              希望这些内容能对你有所帮助或启发。如果你有任何问题或建议，欢迎通过
              GitHub 联系我！
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
