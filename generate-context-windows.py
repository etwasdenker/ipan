#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IPAN Context Generator - Windows Version with Debug
"""

import os
import sys
from pathlib import Path
from datetime import datetime

print("=" * 70)
print("🚀 IPAN Context Generator v2.0 (Windows Debug Version)")
print("=" * 70)
print()

# Отладка: Показываем всю информацию о запуске
print("🔍 DEBUG INFO:")
print(f"   Python version: {sys.version}")
print(f"   Platform: {sys.platform}")
print(f"   Current working directory: {os.getcwd()}")
print(f"   Script file: {__file__}")
print(f"   Script absolute path: {os.path.abspath(__file__)}")
print()

# Определяем корень проекта
script_path = Path(__file__).absolute()
print(f"📁 Script Path object: {script_path}")
print(f"   Script parent: {script_path.parent}")
print()

# Если передан аргумент - используем его
if len(sys.argv) > 1:
    project_root = Path(sys.argv[1]).absolute()
    print(f"📁 Using project root from argument: {project_root}")
else:
    # Иначе - текущая директория
    project_root = Path(os.getcwd()).absolute()
    print(f"📁 Using current working directory as project root: {project_root}")

print()
print(f"📂 Final project root: {project_root}")
print(f"   Exists: {project_root.exists()}")
print(f"   Is directory: {project_root.is_dir()}")

if not project_root.exists():
    print()
    print("❌ ERROR: Project directory does not exist!")
    input("Press Enter to exit...")
    sys.exit(1)

# Показываем что внутри
print()
print("📋 Contents of project root:")
try:
    items = list(project_root.iterdir())
    for item in items[:20]:  # Первые 20
        item_type = "DIR " if item.is_dir() else "FILE"
        print(f"   [{item_type}] {item.name}")
    if len(items) > 20:
        print(f"   ... and {len(items) - 20} more items")
except Exception as e:
    print(f"   ❌ ERROR listing directory: {e}")
    input("Press Enter to exit...")
    sys.exit(1)

print()
print("-" * 70)
print()

# Определяем папку для вывода
output_dir = project_root / "_assistant_context_claude"
output_file = output_dir / "context.md"

print(f"📂 Output directory: {output_dir}")
print(f"   Will be created at: {output_dir.absolute()}")
print()

# Создаём папку
print("📁 Creating output directory...")
try:
    output_dir.mkdir(exist_ok=True, parents=True)
    print(f"   ✅ Created/verified")
    print(f"   Exists now: {output_dir.exists()}")
    print(f"   Is directory: {output_dir.is_dir()}")
except Exception as e:
    print(f"   ❌ ERROR creating directory: {e}")
    import traceback
    traceback.print_exc()
    input("Press Enter to exit...")
    sys.exit(1)

print()

# Простая функция подсчёта файлов
def count_files_simple(path):
    """Считаем файлы"""
    skip = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.venv', 'venv']
    
    total_files = 0
    total_dirs = 0
    by_ext = {}
    
    print("🔍 Scanning directory (this may take a moment)...")
    
    for root, dirs, files in os.walk(path):
        # Пропускаем ненужные папки
        dirs[:] = [d for d in dirs if d not in skip and not d.startswith('.')]
        
        total_dirs += len(dirs)
        
        for file in files:
            if file.startswith('.'):
                continue
            total_files += 1
            ext = Path(file).suffix.lower() or 'no_ext'
            by_ext[ext] = by_ext.get(ext, 0) + 1
    
    return {'total_files': total_files, 'total_dirs': total_dirs, 'by_ext': by_ext}

# Собираем статистику
print("📊 Step 1: Counting files...")
try:
    stats = count_files_simple(project_root)
    print(f"   ✅ Found {stats['total_files']} files")
    print(f"   ✅ Found {stats['total_dirs']} directories")
except Exception as e:
    print(f"   ❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    stats = {'total_files': 0, 'total_dirs': 0, 'by_ext': {}}

print()

# Простое дерево (первые 2 уровня)
def simple_tree(path, max_items=50):
    """Простое дерево первых уровней"""
    lines = []
    skip = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.venv', 'venv']
    
    try:
        items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
        items = [x for x in items if x.name not in skip and not x.name.startswith('.')]
        
        for i, item in enumerate(items[:max_items]):
            is_last = i == len(items[:max_items]) - 1
            prefix = "└── " if is_last else "├── "
            
            if item.is_dir():
                lines.append(f"{prefix}{item.name}/")
            else:
                try:
                    size = item.stat().st_size
                    size_str = f"{size/1024:.1f}KB" if size > 1024 else f"{size}B"
                    lines.append(f"{prefix}{item.name} ({size_str})")
                except:
                    lines.append(f"{prefix}{item.name}")
    except Exception as e:
        lines.append(f"[Error: {e}]")
    
    return lines

print("🌲 Step 2: Building simple tree...")
try:
    tree = simple_tree(project_root)
    print(f"   ✅ Generated {len(tree)} lines")
except Exception as e:
    print(f"   ❌ ERROR: {e}")
    tree = ["[Error building tree]"]

print()

# Генерируем контент
print("📝 Step 3: Generating markdown content...")

content = []
content.append("# IPAN Project Context v2.0")
content.append(f"\n**Сгенерировано:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
content.append(f"**Проект:** {project_root}")
content.append("\n---\n")

content.append("## 📈 Statistics")
content.append(f"- **Files:** {stats['total_files']}")
content.append(f"- **Directories:** {stats['total_dirs']}\n")

if stats['by_ext']:
    content.append("### Files by Extension")
    content.append("```")
    sorted_exts = sorted(stats['by_ext'].items(), key=lambda x: x[1], reverse=True)
    for ext, count in sorted_exts[:15]:
        content.append(f"{ext:15s} {count:5d} files")
    content.append("```\n")

content.append("## 📂 Project Structure (Top Level)")
content.append("```")
content.extend(tree)
content.append("```\n")

content.append("---")
content.append("_Generated by IPAN Context Generator v2.0 (Windows)_")

markdown = "\n".join(content)

print(f"   ✅ Generated {len(markdown)} characters")
print(f"   ✅ Generated {len(content)} lines")
print()

# Сохраняем
print("💾 Step 4: Saving file...")
print(f"   Target file: {output_file}")
print(f"   Absolute path: {output_file.absolute()}")

try:
    # Пробуем записать
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(markdown)
    
    print(f"   ✅ File written!")
    
    # Проверяем что файл существует
    if output_file.exists():
        size = output_file.stat().st_size
        print(f"   ✅ File exists: YES")
        print(f"   ✅ File size: {size} bytes")
    else:
        print(f"   ⚠️  Warning: File does not exist after writing!")
    
except Exception as e:
    print(f"   ❌ ERROR writing file: {e}")
    import traceback
    traceback.print_exc()
    input("Press Enter to exit...")
    sys.exit(1)

print()
print("=" * 70)
print("✅ SUCCESS!")
print("=" * 70)
print()
print(f"📄 File saved: {output_file.absolute()}")
print()
print("🎯 Next steps:")
print("   1. Open the file in any text editor")
print("   2. Upload it to Claude/ChatGPT")
print("   3. Start working!")
print()
input("Press Enter to exit...")
