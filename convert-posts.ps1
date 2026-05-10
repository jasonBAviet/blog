# Convert Source posts to Markdown with Obsidian links

$sourceDir = "c:\1. FPT\Project\Website\Source"

# Keyword map: file -> [keywords]
$keywordMap = @{
    "03.03.2024" = @("Phật giáo", "Thầy tu", "Kinh", "Tôn giáo", "Giáo pháp", "Triết học")
    "04.11.2024" = @("Quản lý", "Tâm lí", "Tin tưởng", "Set-Up-to-Fail", "Boss", "Lãnh đạo")
    "05.07.2023" = @("Ẩm thực", "Sài Gòn", "Bánh", "Kinh doanh", "Thói quen")
    "06.10.2024" = @("Phật giáo", "Tứ Y", "Lí lẽ", "Triết học", "Kinh", "Ý nghĩa")
    "08.08.2023" = @("Steve Jobs", "Khác biệt", "Sáng tạo", "Tâm lí", "Cuộc sống", "Lãnh đạo")
    "14.07.2023" = @("Phụ nữ", "Cờ vua", "Lãnh đạo", "Quyền lực", "Vua", "Quan hệ")
    "16.05.2024" = @("Phật giáo", "Mạng xã hội", "Thầy tu", "Tôn giáo", "Tâm lí", "Xã hội")
    "17.01.2023" = @("Thơ", "Mẹ", "Tình cảm", "Gia đình", "Văn học", "Yêu thương")
    "17.07.2023" = @("Triết học", "Ngã", "Tâm lí", "Suy nghĩ", "Nhận thức", "Nguy hiểm")
    "22.05.2023" = @("Thơ", "Trần Thái Tông", "Văn học", "Trí tuệ", "Diễn đạt")
    "22.09.2024" = @("Bụt", "IT", "Máy tính", "Trí thông minh nhân tạo", "Triết học", "Ngôn ngữ")
    "23.06.2024" = @("Phật giáo", "Triết học", "Ngã", "Vô ngã", "Tu tập", "Thầy tu")
    "24.02.2024" = @("Công đức", "Công phu", "Phật giáo", "Tu tập", "Từ bi", "Trí tuệ")
    "26.05.2023" = @("Âm nhạc", "Nhã nhạc", "Văn hoá", "Truyền thống", "Văn học")
    "26.12.2023" = @("Tuệ Sỹ", "Phật giáo", "Lăng Già", "Triết", "Nhà thơ")
    "30.07.2023" = @("Triết học", "Mạng xã hội", "Quan niệm", "Tư duy", "Tâm lí")
    "31.12.2023" = @("Thơ", "Sống", "Yêu", "Tim", "Tâm lí", "Hạnh phúc")
    "13.01.2025" = @("Bụt", "IT", "Máy tính", "Triết học", "Nhận thức")
}

# Category map
$categoryMap = @{
    "03.03.2024" = "Buddhism"
    "04.11.2024" = "Psychology"
    "05.07.2023" = "Lifestyle"
    "06.10.2024" = "Buddhism"
    "08.08.2023" = "Philosophy"
    "14.07.2023" = "Philosophy"
    "16.05.2024" = "Buddhism"
    "17.01.2023" = "Literature"
    "17.07.2023" = "Philosophy"
    "22.05.2023" = "Literature"
    "22.09.2024" = "Technology"
    "23.06.2024" = "Buddhism"
    "24.02.2024" = "Buddhism"
    "26.05.2023" = "Culture"
    "26.12.2023" = "Literature"
    "30.07.2023" = "Philosophy"
    "31.12.2023" = "Literature"
    "13.01.2025" = "Technology"
}

# Images to embed
$imageMap = @{
    "06.10.2024" = "06.10.2024.1.png", "06.10.2024.2.png"
    "16.05.2024" = ""
    "22.09.2024" = ""
    "31.12.2023" = ""
}

function ConvertDateFormat {
    param([string]$dateStr)
    # DD.MM.YYYY -> YYYY-MM-DD
    $parts = $dateStr -split '\.'
    return "$($parts[2])-$($parts[1])-$($parts[0])"
}

function GenerateTitle {
    param([string]$filename, [string[]]$keywords)
    # First keyword becomes title + filename
    $firstKeyword = $keywords[0]
    return "$firstKeyword (${filename})"
}

function CreateFrontmatter {
    param(
        [string]$date,
        [string]$title,
        [string[]]$tags,
        [string]$category
    )
    
    $tagsStr = $tags -join '", "'
    
    return @"
---
date: $date
title: $title
tags: ["$tagsStr"]
category: $category
---

"@
}

# Get all text files matching DD.MM.YYYY pattern
$files = Get-ChildItem $sourceDir -File | Where-Object { 
    $_.Name -match '^\d{2}\.\d{2}\.\d{4}$' 
}

Write-Host "Found $($files.Count) files to convert" -ForegroundColor Cyan

foreach ($file in $files) {
    $filename = $file.Name
    $filePath = $file.FullName
    
    Write-Host "Processing: $filename" -ForegroundColor Yellow
    
    # Read content
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    
    # Parse date
    $dateStr = ConvertDateFormat $filename
    $keywords = $keywordMap[$filename]
    $category = $categoryMap[$filename]
    
    # Generate metadata
    $title = GenerateTitle $filename $keywords
    $frontmatter = CreateFrontmatter $dateStr $title $keywords $category
    
    # Create markdown link versions of keywords for body text
    $contentWithLinks = $content
    
    # Add links for each keyword (avoid duplicates)
    foreach ($keyword in $keywords) {
        # Use word boundary regex to match whole words only
        $pattern = "(?<![[\w])($([regex]::Escape($keyword)))(?![\w\]]])"
        
        # Check if already linked
        if ($contentWithLinks -match "\[\[$keyword\]\]") {
            continue
        }
        
        # Replace first occurrence only to avoid over-linking
        $contentWithLinks = $contentWithLinks -replace $pattern, "[[$keyword]]", 1
    }
    
    # Add image embeds if they exist
    $imageFiles = $imageMap[$filename]
    $imageSection = ""
    if ($imageFiles) {
        foreach ($img in $imageFiles) {
            if ($img -and (Test-Path "$sourceDir\$img")) {
                $imageSection += "`n![]($img)`n"
            }
        }
    }
    
    # Combine markdown
    $markdown = $frontmatter + $contentWithLinks + $imageSection
    
    # Write to .md file (replace original)
    $mdPath = "$sourceDir\${filename}.md"
    Set-Content -Path $mdPath -Value $markdown -Encoding UTF8
    
    Write-Host "Created: ${filename}.md" -ForegroundColor Green
}

Write-Host "Conversion complete!" -ForegroundColor Cyan
