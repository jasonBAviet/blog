#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re
from datetime import datetime
from pathlib import Path

source_dir = r"c:\1. FPT\Project\Website\Source"

# Keyword map
keyword_map = {
    "03.03.2024": ["Phật giáo", "Thầy tu", "Kinh", "Tôn giáo", "Giáo pháp", "Triết học"],
    "04.11.2024": ["Quản lý", "Tâm lí", "Tin tưởng", "Set-Up-to-Fail", "Boss", "Lãnh đạo"],
    "05.07.2023": ["Ẩm thực", "Sài Gòn", "Bánh", "Kinh doanh", "Thói quen"],
    "06.10.2024": ["Phật giáo", "Tứ Y", "Lí lẽ", "Triết học", "Kinh", "Ý nghĩa"],
    "08.08.2023": ["Steve Jobs", "Khác biệt", "Sáng tạo", "Tâm lí", "Cuộc sống", "Lãnh đạo"],
    "14.07.2023": ["Phụ nữ", "Cờ vua", "Lãnh đạo", "Quyền lực", "Vua", "Quan hệ"],
    "16.05.2024": ["Phật giáo", "Mạng xã hội", "Thầy tu", "Tôn giáo", "Tâm lí", "Xã hội"],
    "17.01.2023": ["Thơ", "Mẹ", "Tình cảm", "Gia đình", "Văn học", "Yêu thương"],
    "17.07.2023": ["Triết học", "Ngã", "Tâm lí", "Suy nghĩ", "Nhận thức", "Nguy hiểm"],
    "22.05.2023": ["Thơ", "Trần Thái Tông", "Văn học", "Trí tuệ", "Diễn đạt"],
    "22.09.2024": ["Bụt", "IT", "Máy tính", "Trí thông minh nhân tạo", "Triết học", "Ngôn ngữ"],
    "23.06.2024": ["Phật giáo", "Triết học", "Ngã", "Vô ngã", "Tu tập", "Thầy tu"],
    "24.02.2024": ["Công đức", "Công phu", "Phật giáo", "Tu tập", "Từ bi", "Trí tuệ"],
    "26.05.2023": ["Âm nhạc", "Nhã nhạc", "Văn hoá", "Truyền thống", "Văn học"],
    "26.12.2023": ["Tuệ Sỹ", "Phật giáo", "Lăng Già", "Triết", "Nhà thơ"],
    "30.07.2023": ["Triết học", "Mạng xã hội", "Quan niệm", "Tư duy", "Tâm lí"],
    "31.12.2023": ["Thơ", "Sống", "Yêu", "Tim", "Tâm lí", "Hạnh phúc"],
    "13.01.2025": ["Bụt", "IT", "Máy tính", "Triết học", "Nhận thức"],
}

category_map = {
    "03.03.2024": "Buddhism",
    "04.11.2024": "Psychology",
    "05.07.2023": "Lifestyle",
    "06.10.2024": "Buddhism",
    "08.08.2023": "Philosophy",
    "14.07.2023": "Philosophy",
    "16.05.2024": "Buddhism",
    "17.01.2023": "Literature",
    "17.07.2023": "Philosophy",
    "22.05.2023": "Literature",
    "22.09.2024": "Technology",
    "23.06.2024": "Buddhism",
    "24.02.2024": "Buddhism",
    "26.05.2023": "Culture",
    "26.12.2023": "Literature",
    "30.07.2023": "Philosophy",
    "31.12.2023": "Literature",
    "13.01.2025": "Technology",
}

def parse_date(filename):
    """DD.MM.YYYY -> YYYY-MM-DD"""
    parts = filename.split(".")
    return f"{parts[2]}-{parts[1]}-{parts[0]}"

def generate_title(filename, keywords):
    """Generate title from first keyword + filename"""
    return f"{keywords[0]} ({filename})"

def create_frontmatter(date, title, tags, category):
    """Create YAML frontmatter"""
    tags_str = '", "'.join(tags)
    return f'''---
date: {date}
title: {title}
tags: ["{tags_str}"]
category: {category}
---
'''

def add_internal_links(content, keywords):
    """Add [[keyword]] links to content (first occurrence only)"""
    result = content
    for keyword in keywords:
        # Skip if already linked
        if f"[[{keyword}]]" in result:
            continue
        # Replace first occurrence only
        pattern = rf"\b({re.escape(keyword)})\b"
        result = re.sub(pattern, f"[[{keyword}]]", result, count=1)
    return result

# Process files
source_path = Path(source_dir)
text_files = sorted([f.name for f in source_path.iterdir() 
                     if f.is_file() and re.match(r'^\d{2}\.\d{2}\.\d{4}$', f.name)])

print(f"Found {len(text_files)} files to convert")

for filename in text_files:
    file_path = source_path / filename
    
    try:
        # Read content
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            content = f.read()
        
        # Parse metadata
        date_str = parse_date(filename)
        keywords = keyword_map.get(filename, [])
        category = category_map.get(filename, "General")
        
        # Generate frontmatter
        title = generate_title(filename, keywords)
        frontmatter = create_frontmatter(date_str, title, keywords, category)
        
        # Add internal links
        content_with_links = add_internal_links(content, keywords)
        
        # Create markdown
        markdown = frontmatter + content_with_links
        
        # Write .md file
        md_path = source_path / f"{filename}.md"
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(markdown)
        
        print(f"✓ {filename}.md")
    
    except Exception as e:
        print(f"✗ {filename}: {e}")

print("\nConversion complete!")
