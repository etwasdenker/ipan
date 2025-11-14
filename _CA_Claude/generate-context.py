#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
IPAN Context Generator - Final Version
Запускается из папки _CA_Claude в корне проекта
"""

import os
import sys
from pathlib import Path
from datetime import datetime

def should_skip(name):
    """Пропускаем ненужные папки"""
    skip = ['node_modules', '.git', 'dist', 'build', '__pycache__', 
            '.venv', 'venv', 'env', '.next', 'out', 'coverage', 
            '.cache', '.pytest_cache', '_CA_Claude']
    return name in skip or name.startswith('.')

def get_size_str(size):
    """Форматируем размер"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.1f}{unit}"
        size /= 1024.0
    return f"{size:.1f}TB"

def count_files(root_path):
    """Считаем файлы по расширениям"""
    stats = {'total_files': 0, 'total_dirs': 0, 'by_ext': {}}
    
    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if not should_skip(d)]
        stats['total_dirs'] += len(dirs)
        
        for file in files:
            if file.startswith('.'):
                continue
            stats['total_files'] += 1
            ext = Path(file).suffix.lower() or 'no_ext'
            stats['by_ext'][ext] = stats['by_ext'].get(ext, 0) + 1
    
    return stats

def build_tree(path, prefix="", level=0, max_level=3):
    """Строим дерево до 3 уровней"""
    if level >= max_level:
        return []
    
    lines = []
    try:
        items = sorted(path.iterdir(), key=lambda x: (not x.is_dir(), x.name.lower()))
        items = [x for x in items if not should_skip(x.name)]
        
        for i, item in enumerate(items):
            is_last = i == len(items) - 1
            current = "└── " if is_last else "├── "
            next_prefix = "    " if is_last else "│   "
            
            if item.is_dir():
                lines.append(f"{prefix}{current}{item.name}/")
                subtree = build_tree(item, prefix + next_prefix, level + 1, max_level)
                lines.extend(subtree)
            else:
                try:
                    size = get_size_str(item.stat().st_size)
                    lines.append(f"{prefix}{current}{item.name} ({size})")
                except:
                    lines.append(f"{prefix}{current}{item.name}")
    except PermissionError:
        lines.append(f"{prefix}[Permission Denied]")
    
    return lines

def find_key_files(root_path):
    """Ищем важные конфигурационные файлы"""
    key_names = ['package.json', 'tsconfig.json', 'vite.config.ts', 
                 'vite.config.js', 'README.md', 'requirements.txt']
    found = {}
    
    for root, dirs, files in os.walk(root_path):
        dirs[:] = [d for d in dirs if not should_skip(d)]
        
        for file in files:
            if file in key_names:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(root_path)
                try:
                    content = file_path.read_text(encoding='utf-8')
                    found[str(rel_path)] = content[:5000]  # Первые 5000 символов
                except:
                    found[str(rel_path)] = "[Cannot read file]"
    
    return found

def main():
    print("=" * 70)
    print("IPAN Context Generator")
    print("=" * 70)
    print()
    
    # Скрипт находится в _CA_Claude/, корень проекта - папка выше
    script_dir = Path(__file__).parent.absolute()
    project_root = script_dir.parent.absolute()
    
    print(f"Папка скрипта: {script_dir}")
    print(f"Корень проекта: {project_root}")
    print()
    
    if not project_root.exists():
        print("ОШИБКА: Не найден корень проекта!")
        input("Нажмите Enter для выхода...")
        sys.exit(1)
    
    # Файл для сохранения
    output_file = script_dir / "context.md"
    
    print("Шаг 1: Подсчет файлов...")
    stats = count_files(project_root)
    print(f"  Найдено файлов: {stats['total_files']}")
    print(f"  Найдено папок: {stats['total_dirs']}")
    print()
    
    print("Шаг 2: Построение дерева...")
    tree = build_tree(project_root)
    print(f"  Создано строк: {len(tree)}")
    print()
    
    print("Шаг 3: Поиск ключевых файлов...")
    key_files = find_key_files(project_root)
    print(f"  Найдено файлов: {len(key_files)}")
    print()
    
    print("Шаг 4: Генерация отчета...")
    
    # Формируем markdown
    content = []
    content.append("# IPAN Project Context")
    content.append(f"\n**Сгенерировано:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    content.append(f"**Проект:** {project_root}")
    content.append("\n---\n")
    
    # Статистика
    content.append("## Статистика проекта")
    content.append(f"- **Всего файлов:** {stats['total_files']}")
    content.append(f"- **Всего папок:** {stats['total_dirs']}")
    content.append("")
    
    # По расширениям
    if stats['by_ext']:
        content.append("### Файлы по расширениям")
        content.append("```")
        sorted_exts = sorted(stats['by_ext'].items(), key=lambda x: x[1], reverse=True)
        for ext, count in sorted_exts[:20]:
            content.append(f"{ext:15s} {count:5d} файлов")
        content.append("```\n")
    
    # Дерево
    content.append("## Структура проекта")
    content.append("```")
    content.extend(tree)
    content.append("```\n")
    
    # Ключевые файлы
    if key_files:
        content.append("## Ключевые конфигурационные файлы\n")
        for file_path, file_content in sorted(key_files.items()):
            content.append(f"### {file_path}")
            ext = Path(file_path).suffix
            lang = "json" if ext == ".json" else "javascript" if ext in [".js", ".ts"] else ""
            content.append(f"```{lang}")
            content.append(file_content)
            content.append("```\n")
    
    content.append("---")
    content.append("_Создано IPAN Context Generator_")
    
    markdown = "\n".join(content)
    
    print(f"  Создано символов: {len(markdown)}")
    print()
    
    print("Шаг 5: Сохранение файла...")
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write(markdown)
        
        if output_file.exists():
            size = output_file.stat().st_size
            print(f"  УСПЕШНО!")
            print(f"  Файл: {output_file}")
            print(f"  Размер: {size} байт")
        else:
            print("  ОШИБКА: Файл не создан!")
    except Exception as e:
        print(f"  ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
        input("Нажмите Enter для выхода...")
        sys.exit(1)
    
    print()
    print("=" * 70)
    print("ГОТОВО!")
    print("=" * 70)
    print()
    print("Следующие шаги:")
    print(f"  1. Откройте файл: {output_file}")
    print("  2. Загрузите его в чат с Claude/ChatGPT")
    print("  3. Напишите: 'Читай context.md и помоги с проектом IPAN'")
    print()
    input("Нажмите Enter для выхода...")

if __name__ == "__main__":
    main()
