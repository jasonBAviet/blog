---
date: 2026-05-10
title: Hướng Dẫn Sử Dụng Obsidian Vault
tags: ["guide", "obsidian", "instructions"]
category: Guide
---

# Hướng Dẫn Sử Dụng Obsidian Vault

## 📋 Tóm Tắt

Vault này chứa **18 bài viết tiếng Việt** về Phật giáo, Triết học, Tâm lí, Văn học, và Xã hội, được convert từ định dạng text sang markdown với:

- ✅ **Frontmatter YAML**: date, title, tags, category
- ✅ **Internal Links**: Obsidian [[keyword]] links để kết nối giữa bài
- ✅ **3 Index Hubs**: Navigation toàn cộng (_Index, _Timeline, _Topics)
- ✅ **UTF-8 Encoding**: Tiếng Việt có dấu đầy đủ

---

## 🚀 Cách Sử Dụng

### 1. Mở Vault trong Obsidian

```bash
1. Mở Obsidian
2. Click "Open folder as vault"
3. Chọn: c:\1. FPT\Project\Website\Source
4. Obsidian sẽ tự load tất cả file .md
```

**Lưu ý**: Obsidian config đã có sẵn trong `Source_blog/.obsidian/`

### 2. Khám Phá Bài Viết

#### **Cách 1: Qua Index**
- Click vào `_Index.md` để xem danh sách tất cả bài theo category
- Các link dạng `[[Phật giáo (03.03.2024)]]` sẽ đưa bạn tới bài viết

#### **Cách 2: Qua Timeline**
- Click vào `_Timeline.md` để xem bài viết theo thứ tự thời gian
- Từ năm 2023 đến 2025

#### **Cách 3: Qua Topics**
- Click vào `_Topics.md` để xem bài viết grouped by chủ đề
- Các chủ đề: Phật giáo, Triết học, Tâm lí, Văn học, Văn hoá, Công nghệ

### 3. Xem Graph View

```
1. Ngoài cùng phải, click icon "Graph View" (⊕ hoặc biểu đồ)
2. Bạn sẽ thấy sơ đồ kết nối giữa bài viết
3. Click vào bất kì node nào để zoom vào chi tiết
```

**Giải thích Graph**:
- **Các node**: Bài viết & keywords
- **Các edge**: Link giữa bài (thông qua keyword shared)
- **Centrality**: Keywords như "Phật giáo", "Triết học", "Tâm lí" là trung tâm của graph

---

## 📂 Cấu Trúc Vault

```
Source/
├── _Index.md              ← Điểm bắt đầu
├── _Timeline.md           ← Xem theo thời gian
├── _Topics.md             ← Xem theo chủ đề
│
├── 03.03.2024.md          ← 18 bài viết
├── 04.11.2024.md
├── ... (16 file khác)
├── 31.12.2023.md
├── 13.01.2025.md
│
├── *.png                  ← Ảnh (nếu có)
│
├── Source_blog/
│   └── .obsidian/         ← Obsidian config
│
└── convert-posts.py       ← Script convert (reference)
```

---

## 🏷️ Hệ Thống Tag

Mỗi bài viết có `tags` trong frontmatter, theo category:

**Chủ đề chính**:
- `Phật giáo` - Buddhism
- `Triết học` - Philosophy  
- `Tâm lí` - Psychology
- `Văn học` - Literature
- `Văn hoá` - Culture
- `Công nghệ` - Technology

**Meta tags**:
- `index` - Dùng cho _Index, _Timeline, _Topics
- `guide` - Hướng dẫn

### Cách Filter bằng Tag:
1. Nhấn `Ctrl+K` (hoặc Cmd+K trên Mac) để mở Command Palette
2. Type: `Search by tag` hoặc `tag:#Phật giáo`
3. Xem tất cả bài có tag đó

---

## 🔗 Liên Kết Bên Trong

Mỗi bài viết có link tới:
- **Keywords chính**: Ví dụ `[[Phật giáo]]`, `[[Triết học]]`
- **Bài viết khác**: Ví dụ `[[Phật giáo (03.03.2024)]]`
- **Index hubs**: `[[_Index]]`, `[[_Timeline]]`, `[[_Topics]]`

### Xem Backlinks
1. Mở một bài viết
2. Ở panel phải, tìm "Backlinks" hoặc "Linked Mentions"
3. Bạn sẽ thấy những bài khác link tới bài này

---

## 💡 Ví Dụ Cách Sử Dụng

### Scenario 1: "Tôi muốn đọc về Phật giáo"
1. Mở `_Topics.md`
2. Tìm section "### Phật Giáo (Buddhism)"
3. Click bất kì link nào trong section đó
4. Bạn sẽ thấy 8 bài viết về Phật giáo

### Scenario 2: "Tôi muốn biết những keyword chính"
1. Mở `Graph View`
2. Zoom out để thấy toàn bộ graph
3. Các keyword ở trung tâm là "hubs": Phật giáo, Triết học, Tâm lí
4. Click vào hub để thấy tất cả bài liên quan

### Scenario 3: "Tôi muốn thêm bài viết mới"
1. Tạo file `YYYY-MM-DD-Title.md` hoặc `DD.MM.YYYY.md`
2. Thêm frontmatter:
```yaml
---
date: YYYY-MM-DD
title: Your Title Here
tags: ["keyword1", "keyword2"]
category: Category Name
---
```
3. Viết nội dung, sử dụng `[[keyword]]` để link
4. Save file, Obsidian sẽ auto-index

---

## 🎯 Features

✅ **Full-text Search**: `Ctrl+Shift+F` để search content tất cả file  
✅ **Graph Visualization**: Thấy connection giữa bài  
✅ **Backlinks**: Xem bài nào link tới bài hiện tại  
✅ **Quick Switch**: `Ctrl+O` để quick open file  
✅ **Outline**: `Ctrl+P` để xem outline bài hiện tại  
✅ **Wikilinks**: `[[]]` style links (native Obsidian)

---

## ⚙️ Cấu Hình

Vault sử dụng Obsidian mặc định. Nếu bạn muốn custom:

1. Mở Settings (Ctrl+,)
2. **Appearance**: Chọn theme (light/dark)
3. **Editor**: Adjust font size, line width
4. **Core Plugins**: Kích hoạt/vô hiệu hóa features
5. **Community Plugins**: Cài thêm plugins từ community

---

## 📝 Notes

- **Images**: Nếu file ảnh có tên trùng bài (ví dụ `06.10.2024.png`), chúng sẽ được embed
- **Encoding**: Tất cả files là UTF-8, tiếng Việt có dấu đầy đủ
- **Performance**: 18 bài + 3 index files = ~41 KB tổng cộng, rất nhẹ
- **Version Control**: Các script convert (`.py`, `.ps1`) được lưu trữ trong `Source/` cho reference

---

## 🔍 Troubleshooting

### "Files không hiển thị trong Obsidian"
→ Obsidian cần reload. Click menu → "Reload vault" hoặc đóng/mở lại.

### "Accented Vietnamese characters bị lỗi"
→ Kiểm tra encoding file là UTF-8. Obsidian tự động detect UTF-8.

### "Links không hoạt động"
→ Obsidian sử dụng `[[]]` format. Kiểm tra link format là `[[keyword]]` không phải `[keyword]`.

### "Graph view quá phức tạp"
→ Trong Graph View settings, bạn có thể filter theo file type hoặc tag.

---

## 🎓 Học Tập Thêm

- **Obsidian Help**: [help.obsidian.md](https://help.obsidian.md)
- **Markdown Guide**: [markdownguide.org](https://www.markdownguide.org)
- **Wikilinks Format**: `[[page]]` hoặc `[[page|alias]]`

---

**Tạo lúc**: 2026-05-10  
**Phiên bản**: 1.0  
**Total Posts**: 18  
**Total Index Files**: 3
