"""Génère le bloc « Récemment modifié » de la page d'accueil.

Remplace le marqueur <!-- recent-pages --> dans index.md / index.en.md par
les liens vers les 3 fiches de contenu les plus récemment modifiées dans
git — pas de nouvelle dépendance, juste `git log` au moment du build.
Les pages d'accueil, de référence (conventions, gabarit) et les index de
section sont exclues : ce bloc pointe vers des fiches, pas des sommaires.
"""

from pathlib import Path
import subprocess

MARKER = "<!-- recent-pages -->"

EXCLUDE_BASENAMES = {
    "index.md", "index.en.md",
    "conventions.md", "conventions.en.md",
    "gabarit.md", "gabarit.en.md",
    "404.md", "404.en.md",
}

LIMIT = 3


def _git_timestamp(repo_root: Path, path: Path) -> int:
    try:
        out = subprocess.run(
            ["git", "log", "-1", "--format=%ct", "--", str(path)],
            cwd=repo_root, capture_output=True, text=True, check=True,
        ).stdout.strip()
        return int(out) if out else 0
    except (subprocess.CalledProcessError, ValueError, FileNotFoundError):
        return 0


def _title(path: Path) -> str:
    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.startswith("# "):
                return line[2:].strip()
    except OSError:
        pass
    return path.stem


def _recent_pages(docs_dir: Path, repo_root: Path, lang: str):
    candidates = []
    for p in docs_dir.rglob("*.md"):
        if p.name in EXCLUDE_BASENAMES:
            continue
        is_en = p.name.endswith(".en.md")
        if (lang == "en") != is_en:
            continue
        ts = _git_timestamp(repo_root, p)
        if ts:
            candidates.append((ts, p))
    candidates.sort(key=lambda c: c[0], reverse=True)
    return candidates[:LIMIT]


def _render(pages, docs_dir: Path, lang: str) -> str:
    if not pages:
        return ""
    heading = "Récemment modifié" if lang == "fr" else "Recently updated"
    lines = [f"## {heading}\n"]
    for _ts, p in pages:
        rel = p.relative_to(docs_dir).as_posix()
        if rel.endswith(".en.md"):
            rel = rel[: -len(".en.md")] + ".md"
        lines.append(f"- [{_title(p)}]({rel})")
    return "\n".join(lines) + "\n"


def on_page_markdown(markdown, page, config, files):
    if MARKER not in markdown:
        return markdown
    docs_dir = Path(config["docs_dir"])
    repo_root = Path(config["config_file_path"]).parent
    lang = "en" if page.file.src_uri.endswith(".en.md") else "fr"
    pages = _recent_pages(docs_dir, repo_root, lang)
    return markdown.replace(MARKER, _render(pages, docs_dir, lang))
