# -*- coding: utf-8 -*-
from __future__ import annotations
import os, sys, json, argparse, subprocess
from pathlib import Path
from datetime import datetime
from typing import List

try:
    import pathspec  # optional
    HAS_PATHSPEC = True
except Exception:
    HAS_PATHSPEC = False

DEFAULT_MANIFEST = {
  "projectRoot": ".",
  "mode": "nested",
  "respectGitIgnore": True,
  "followSymlinks": False,
  "includeGlobs": [
    "backend/**",
    "frontend/ipan/src/**",
    "frontend/ipan/public/brand/**",
    "docs/**",
    "*.md",
    "start-dev.ps1",
    ".gitignore"
  ],
  "excludeGlobs": [
    "**/node_modules/**",
    "**/.vite/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/.cache/**",
    "**/.turbo/**",
    "**/.parcel-cache/**",
    "**/__pycache__/**",
    "**/.venv/**",
    "**/.pytest_cache/**",
    "**/.mypy_cache/**",
    "**/*.map",
    "**/*.min.*",
    "**/*.log",
    "**/.DS_Store"
  ],
  "binaryGlobs": [
    "**/*.png", "**/*.jpg", "**/*.jpeg", "**/*.gif", "**/*.ico", "**/*.svg",
    "**/*.pdf", "**/*.zip", "**/*.7z", "**/*.gz", "**/*.tar", "**/*.rar"
  ],
  "textFileMaxKB": 96,
  "listDirMaxEntries": 500,
  "diffAgainstGitHead": True,
  "emitRuntimeBlock": True,
  "emitGitBlock": True,
  "title": "Assistant Context — snapshot (nested, filtered)"
}

def load_manifest(project_root: Path):
    man_path = project_root / "_assistant_context" / "manifest.json"
    if man_path.exists():
        try:
            data = json.loads(man_path.read_text(encoding="utf-8"))
            cfg = dict(DEFAULT_MANIFEST)
            cfg.update(data)
            return cfg, True
        except Exception as e:
            print(f"[warn] manifest.json parse error: {e}; using defaults", file=sys.stderr)
    return DEFAULT_MANIFEST, False

def run_git(project_root: Path, args: List[str]) -> str:
    try:
        out = subprocess.check_output(["git"] + args, cwd=project_root, stderr=subprocess.DEVNULL)
        return out.decode("utf-8", "ignore").strip()
    except Exception:
        return ""

def get_git_info(project_root: Path):
    info = {
        "branch": run_git(project_root, ["rev-parse", "--abbrev-ref", "HEAD"]),
        "commit": run_git(project_root, ["rev-parse", "HEAD"]),
        "status": run_git(project_root, ["status", "--porcelain"]),
    }
    info["clean"] = (info["status"] == "")
    return info

def compile_gitignore(project_root: Path):
    if not HAS_PATHSPEC:
        return None
    gi = project_root / ".gitignore"
    if gi.exists():
        try:
            spec = pathspec.PathSpec.from_lines("gitwildmatch", gi.read_text(encoding="utf-8").splitlines())
            return spec
        except Exception:
            return None
    return None

def match_globs(rel: str, patterns):
    from pathlib import Path as P
    for pat in patterns or []:
        if P(rel).match(pat):
            return True
    return False

def is_binary_by_glob(rel: str, binary_globs):
    return match_globs(rel, binary_globs)

def detect_text(path: Path, size_limit_kb: int):
    try:
        b = path.read_bytes()
    except Exception:
        return False, None, 0
    if b[:4096].find(b"\x00") != -1:
        return False, None, len(b)
    kb = len(b) / 1024.0
    if kb > size_limit_kb:
        return True, None, len(b)
    try:
        s = b.decode("utf-8")
    except UnicodeDecodeError:
        s = b.decode("utf-8", "ignore")
    return True, s, len(b)

def file_sha1(path: Path) -> str:
    import hashlib
    h = hashlib.sha1()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def walk_files(project_root: Path, cfg):
    include = cfg.get("includeGlobs") or ["**/*"]
    exclude = cfg.get("excludeGlobs") or []
    respect_gitignore = cfg.get("respectGitIgnore", True)
    follow_symlinks = cfg.get("followSymlinks", False)

    gi = compile_gitignore(project_root) if respect_gitignore and HAS_PATHSPEC else None

    # expand include candidates
    cands = []
    for pat in include:
        cands += list(project_root.glob(pat))

    files = []
    for p in cands:
        if p.is_dir():
            for sub in p.rglob("*"):
                if sub.is_dir():
                    continue
                files.append(sub)
        else:
            files.append(p)

    seen = set()
    res = []
    for f in files:
        if not follow_symlinks and f.is_symlink():
            continue
        try:
            rp = f.resolve()
        except Exception:
            rp = f
        if rp in seen:
            continue
        seen.add(rp)
        rel = rp.relative_to(project_root).as_posix()
        if match_globs(rel, exclude):
            continue
        if gi and gi.match_file(rel):
            continue
        res.append(rp)
    return sorted(res)

def make_tree_listing(paths, project_root: Path, max_entries: int) -> str:
    rels = [p.relative_to(project_root).as_posix() for p in paths[:max_entries]]
    lines = []
    for rel in rels:
        parts = rel.split("/")
        for i, part in enumerate(parts):
            lines.append(f"{'  '*i}{part}")
    if len(paths) > max_entries:
        lines.append(f"... (+{len(paths)-max_entries} more)")
    return "\n".join(lines)

def snapshot(project_root: Path, cfg):
    files = walk_files(project_root, cfg)
    text_limit_kb = int(cfg.get("textFileMaxKB", 96))
    binary_globs = cfg.get("binaryGlobs") or []

    included = []
    embedded_kb = 0.0

    for f in files:
        rel = f.relative_to(project_root).as_posix()
        entry = {"path": rel, "bytes": f.stat().st_size, "sha1": file_sha1(f)}
        if is_binary_by_glob(rel, binary_globs):
            entry["type"] = "binary"
        else:
            is_text, content, _ = detect_text(f, text_limit_kb)
            if is_text:
                entry["type"] = "text"
                if content is not None:
                    entry["inline"] = content if len(content) <= 8000 else (content[:8000] + "\n... (truncated)\n")
                    embedded_kb += len(content.encode("utf-8"))/1024.0
                else:
                    entry["inline"] = None
            else:
                entry["type"] = "binary"
        included.append(entry)

    git = get_git_info(project_root) if cfg.get("emitGitBlock", True) else {}
    runtime = {}
    if cfg.get("emitRuntimeBlock", True):
        runtime = {
            "python": sys.version.split()[0],
            "platform": sys.platform,
            "time_utc": datetime.utcnow().isoformat() + "Z"
        }

    from io import StringIO
    md = StringIO()
    title = cfg.get("title", "Assistant Context — snapshot")
    md.write(f"# {title}\n\n")
    if runtime:
        md.write("## Runtime\n")
        for k,v in runtime.items():
            md.write(f"- **{k}**: {v}\n")
        md.write("\n")
    if git:
        md.write("## Git\n")
        md.write(f"- branch: `{git.get('branch','')}`\n")
        md.write(f"- commit: `{git.get('commit','')}`\n")
        md.write(f"- clean: `{git.get('clean', False)}`\n\n")

    md.write("## Summary\n")
    md.write(f"- files: **{len(included)}**\n")
    md.write(f"- embedded text ≈ **{embedded_kb:.1f} KB**\n\n")

    md.write("## Files (inline where small)\n")
    for e in included[:500]:
        md.write(f"### `{e['path']}` ({e['bytes']} bytes)\n")
        md.write(f"- sha1: `{e['sha1']}`\n")
        md.write(f"- type: `{e['type']}`\n")
        if e.get("inline"):
            md.write("\n```text\n")
            md.write(e["inline"])
            md.write("\n```\n\n")
        else:
            md.write("\n_(content omitted by policy or size)_\n\n")

    data = {
        "title": title,
        "manifest_present": True,
        "project_root": str(project_root),
        "generated_utc": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "git": git,
        "runtime": runtime,
        "files": included
    }
    return data, md.getvalue()

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--project-root", default=".", help="Корень проекта")
    args = ap.parse_args()

    project_root = Path(args.project_root).resolve()
    ac_dir = project_root / "_assistant_context"
    out_dir = ac_dir / "out"
    out_dir.mkdir(parents=True, exist_ok=True)

    cfg, ok = load_manifest(project_root)
    data, md = snapshot(project_root, cfg)
    data["manifest_present"] = ok

    (out_dir / "assistant_context.json").write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    (out_dir / "assistant_context.md").write_text(md, encoding="utf-8")
    print(f"[ok] snapshot written: {out_dir}")

if __name__ == "__main__":
    main()
