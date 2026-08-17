import { describe, expect, it, vi } from "vitest";
import { objectKeyFor, validateUploadBytes } from "../object-storage";

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.from("fake-png-body"),
]);
const JPG = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
  Buffer.from("fake-jpg"),
]);
const WEBP = Buffer.concat([
  Buffer.from("RIFF"),
  Buffer.from([0x10, 0x00, 0x00, 0x00]),
  Buffer.from("WEBPVP8 "),
]);

describe("上传校验（SEC-005：magic bytes 判型，不信任声明的 MIME/扩展名）", () => {
  it("按内容识别 PNG/JPEG/WebP", () => {
    expect(validateUploadBytes(PNG).mime).toBe("image/png");
    expect(validateUploadBytes(JPG).mime).toBe("image/jpeg");
    expect(validateUploadBytes(WEBP).mime).toBe("image/webp");
  });

  it("拒绝 SVG、文本伪装与空文件", () => {
    expect(() =>
      validateUploadBytes(Buffer.from('<svg xmlns="..."><script/></svg>'))
    ).toThrow("不支持的图片格式");
    expect(() =>
      validateUploadBytes(Buffer.from("GIF89a-not-really".slice(5)))
    ).toThrow("不支持的图片格式");
    expect(() => validateUploadBytes(Buffer.alloc(0))).toThrow("空文件");
  });

  it("拒绝超过 10MB 的文件", () => {
    const oversized = Buffer.concat([PNG, Buffer.alloc(10 * 1024 * 1024)]);
    expect(() => validateUploadBytes(oversized)).toThrow("大小上限");
  });

  it("object key 由内容 hash 决定，服务端生成（§6.3）", () => {
    vi.stubEnv("OBJECT_STORAGE_BUCKET", "cblog");
    vi.stubEnv("OBJECT_STORAGE_ACCESS_KEY", "x");
    vi.stubEnv("OBJECT_STORAGE_SECRET_KEY", "y");
    vi.stubEnv("OBJECT_STORAGE_PUBLIC_BASE_URL", "https://cdn.test/cblog");
    const validated = validateUploadBytes(PNG);
    const key = objectKeyFor(validated);
    expect(key).toBe(
      `assets/${validated.sha256.slice(0, 2)}/${validated.sha256}.png`
    );
    expect(objectKeyFor(validateUploadBytes(PNG))).toBe(key);
    vi.unstubAllEnvs();
  });
});
