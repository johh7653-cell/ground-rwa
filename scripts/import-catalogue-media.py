"""Copy only saved asset/issuer identity images and build their local URL map."""

from __future__ import annotations

import argparse
import json
from pathlib import Path, PurePosixPath
from urllib.parse import urlparse
from zipfile import ZipFile


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument(
        "--root", type=Path, default=Path(__file__).resolve().parents[1]
    )
    args = parser.parse_args()
    destination = args.root / "public/catalogue-media"
    destination.mkdir(parents=True, exist_ok=True)
    saved_map: dict[str, dict[str, str]] = {"tokens": {}, "issuers": {}}
    extracted: dict[str, bytes] = {}
    missing: list[str] = []

    with ZipFile(args.archive) as archive:
        files = set(archive.namelist())
        logo_paths = [name for name in files if name.endswith("/logos.json")]
        if len(logo_paths) != 1:
            raise ValueError("Expected one identity-logo mapping")
        source_dir = PurePosixPath(logo_paths[0]).parent
        logos = json.loads(archive.read(logo_paths[0]))
        source_media = json.loads(archive.read(str(source_dir / "asset-map.json")))
        # Match logo paths from the source map. The original host is not needed
        # in the generated client map, and no request is sent to it.
        filename_by_logo_path = {
            urlparse(url).path: filename
            for url, filename in source_media.items()
            if urlparse(url).path.startswith(("/logos/tokens/", "/logos/issuers/"))
        }
        public_source_dir = PurePosixPath("public") / source_dir.relative_to(
            "src/components"
        )
        for group in ("tokens", "issuers"):
            for identity, logo_path in logos[group].items():
                if (
                    "grail" in identity.casefold()
                    or not logo_path.startswith(("/logos/tokens/", "/logos/issuers/"))
                ):
                    continue
                filename = filename_by_logo_path.get(logo_path)
                if (
                    not filename
                    or PurePosixPath(filename).name != filename
                    or PurePosixPath(filename).suffix.lower() not in {".png", ".webp"}
                ):
                    missing.append(f"{group}:{identity}")
                    continue
                source_file = str(public_source_dir / filename)
                if source_file not in files:
                    missing.append(f"{group}:{identity}")
                    continue
                content = archive.read(source_file)
                is_png = content.startswith(b"\x89PNG\r\n\x1a\n")
                is_webp = content.startswith(b"RIFF") and content[8:12] == b"WEBP"
                if not (is_png or is_webp):
                    missing.append(f"{group}:{identity}")
                    continue
                previous = extracted.get(filename)
                if previous is not None and previous != content:
                    raise ValueError(f"Conflicting archive filename: {filename}")
                extracted[filename] = content
                saved_map[group][identity] = f"/catalogue-media/{filename}"

    for filename, content in extracted.items():
        (destination / filename).write_bytes(content)
    mapping_path = args.root / "src/data/catalogue-media-map.json"
    mapping_path.parent.mkdir(parents=True, exist_ok=True)
    mapping_path.write_text(
        json.dumps(saved_map, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(
        f"Copied {len(extracted)} identity images ({sum(map(len, extracted.values())):,} bytes); "
        f"asset mappings: {len(saved_map['tokens'])}; issuer mappings: {len(saved_map['issuers'])}; "
        f"unavailable: {len(missing)}"
    )
    if missing:
        print("Unmapped identities:", ", ".join(missing[:20]))


if __name__ == "__main__":
    main()
