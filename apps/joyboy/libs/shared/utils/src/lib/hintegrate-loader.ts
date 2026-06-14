/**
 * HIntegrate 脚本加载管理器
 * 确保 HIntegrate 脚本只被加载一次，避免重复定义 custom elements
 */

const HINTEGRATE_SCRIPT_ID = 'hintegrate_global_script';
const HINTEGRATE_SCRIPT_URL = 'https://castlery.hulla-cdn.com/hintegrate.js';

type LoadCallback = () => void;

class HIntegrateLoader {
  private isLoading = false;
  private isLoaded = false;
  private callbacks: LoadCallback[] = [];

  /**
   * 加载 HIntegrate 脚本
   * @returns Promise<boolean> - 返回脚本是否成功加载
   */
  async load(): Promise<boolean> {
    // 如果已经加载完成，直接返回
    if (this.isLoaded) {
      return true;
    }

    // 如果正在加载中，等待加载完成
    if (this.isLoading) {
      return new Promise((resolve) => {
        this.callbacks.push(() => resolve(true));
      });
    }

    // 检查脚本是否已经存在
    const existingScript = document.getElementById(HINTEGRATE_SCRIPT_ID);
    if (existingScript) {
      this.isLoaded = true;
      return true;
    }

    // 检查 window.HIntegrate 是否已经存在
    if (typeof window !== 'undefined' && (window as any).HIntegrate) {
      this.isLoaded = true;
      return true;
    }

    // 开始加载脚本
    this.isLoading = true;

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.id = HINTEGRATE_SCRIPT_ID;
      script.src = HINTEGRATE_SCRIPT_URL;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        this.isLoading = false;

        // 执行所有等待的回调
        this.callbacks.forEach((cb) => cb());
        this.callbacks = [];

        resolve(true);
      };

      script.onerror = () => {
        this.isLoading = false;
        console.error('Failed to load HIntegrate script');
        reject(new Error('Failed to load HIntegrate script'));
      };

      document.body.appendChild(script);
    });
  }

  /**
   * 检查脚本是否已加载
   */
  isScriptLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * 等待脚本加载完成并执行回调
   */
  async onReady(callback: LoadCallback): Promise<void> {
    if (this.isLoaded) {
      callback();
      return;
    }

    await this.load();
    callback();
  }
}

// 导出单例
export const hintegrateLoader = new HIntegrateLoader();
