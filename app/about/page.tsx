import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于我",
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-3xl font-bold text-white">C</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">
          关于我
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          分享我的技术探索与生活感悟
        </p>
      </div>

      <div className="bg-white dark:bg-[#242424] rounded-xl border border-gray-100 dark:border-gray-800 p-6 md:p-8 shadow-sm">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            欢迎来到我的个人博客！这里记录着我的技术学习、日常生活、旅行见闻等各种内容。
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            我会在这里分享：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 not-prose">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/30">
              <span className="text-2xl">💻</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  技术类文章
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  编程、开发、工具使用等
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30">
              <span className="text-2xl">🌿</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  日常生活
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  生活感悟、日常记录
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800/30">
              <span className="text-2xl">📖</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  学习记录
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  学习笔记、知识总结
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/30">
              <span className="text-2xl">✈️</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  旅游
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  旅行见闻、游记分享
                </p>
              </div>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300">
            希望这些内容能对你有所帮助或启发。如果你有任何问题或建议，欢迎通过
            GitHub 联系我！
          </p>
        </div>
      </div>
    </div>
  );
}
