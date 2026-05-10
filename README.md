# Personal Blog

Blog cá nhân xây dựng bằng Next.js App Router, TypeScript và Tailwind CSS.

## 1. Giới thiệu

Website hiển thị danh sách bài viết, trang chi tiết và danh mục. Dữ liệu bài viết được đọc từ thư mục `Source/` và ảnh minh họa được phục vụ từ `public/source-images/`.

Điểm nổi bật:

- Giao diện tối ưu cho tiếng Việt (font chữ hiển thị tiếng Việt tốt).
- Hỗ trợ ảnh bìa và thư viện ảnh trong từng bài.
- Dễ thêm nội dung mới bằng cách thêm file vào `Source/`.

## 2. Công nghệ sử dụng

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS + `@tailwindcss/typography`
- `next-themes` cho theme

## 3. Cài đặt và chạy dự án

Yêu cầu:

- Node.js 18+ (khuyến nghị Node.js LTS mới)
- npm

Cài đặt:

```bash
npm install
```

Chạy môi trường phát triển:

```bash
npm run dev
```

Build production:

```bash
npm run build
```

Chạy bản production sau khi build:

```bash
npm run start
```

Kiểm tra lint:

```bash
npm run lint
```

## 4. Các script chính

- `npm run dev`: chạy Next.js ở chế độ phát triển.
- `npm run watch`: theo dõi thay đổi trong thư mục `Source/` và gọi API revalidate.
- `npm run dev:watch`: chạy đồng thời `dev` và `watch`.
- `npm run build`: build ứng dụng cho production.
- `npm run start`: chạy ứng dụng production.
- `npm run lint`: kiểm tra quy tắc mã nguồn.

## 5. Cấu trúc thư mục chính

```text
app/                    # Trang chủ, trang danh mục, trang chi tiết bài viết
components/             # Các component giao diện
lib/                    # Tiện ích và dữ liệu (bao gồm đọc dữ liệu từ Source)
public/source-images/   # Ảnh minh họa cho bài viết
Source/                 # Nguồn nội dung bài viết dạng text/markdown
types/                  # Kiểu dữ liệu TypeScript dùng chung
```

## 6. Quy ước dữ liệu bài viết

### 6.1. Nội dung bài

- Đặt file nội dung trong thư mục `Source/`.
- Tên file nên theo định dạng ngày để dễ sắp xếp, ví dụ: `13-01-2025.txt` hoặc `13-01-2025.md`.

### 6.2. Ảnh bài viết

- Đặt ảnh trong `public/source-images/`.
- Nên dùng cùng tiền tố ngày với bài viết để hệ thống ghép ảnh đúng bài.
- Ví dụ:
	- Bài: `13-01-2025.md`
	- Ảnh: `13-01-2025.png`, `13-01-2025-1.png`, `13-01-2025-2.png`

## 7. Hướng dẫn thêm bài mới

1. Tạo file bài viết mới trong `Source/` theo quy ước tên ngày.
2. Thêm ảnh tương ứng vào `public/source-images/` (nếu có).
3. Chạy `npm run dev` để kiểm tra hiển thị.
4. Mở trang chủ và trang chi tiết bài để kiểm tra nội dung, ảnh và định dạng.

## 8. Lưu ý khi phát triển

- Nếu cổng `3000` đang bận, Next.js sẽ tự chuyển sang cổng khác (ví dụ `3001`, `3002`).
- Nếu gặp lỗi bất thường do cache (ví dụ lỗi runtime/hot reload không ổn định), hãy thử:

```bash
rm -rf .next
npm run dev
```

Trên Windows PowerShell:

```powershell
if (Test-Path '.next') { Remove-Item '.next' -Recurse -Force }
npm run dev
```

## 9. Định hướng mở rộng

- Kết nối CMS hoặc cơ sở dữ liệu thay cho dữ liệu file tĩnh.
- Bổ sung tìm kiếm toàn văn.
- Bổ sung sitemap, metadata nâng cao và tối ưu SEO sâu hơn.
- Viết test cho các hàm xử lý dữ liệu trong `lib/`.

## 10. Bản quyền

Dự án phục vụ mục đích học tập và phát triển cá nhân.