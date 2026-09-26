"""Import the complete saved catalogue, without executing anything in the ZIP."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path
from urllib.parse import urlparse
from zipfile import ZipFile


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("archive", type=Path)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "src/data/catalogue.json",
    )
    args = parser.parse_args()

    with ZipFile(args.archive) as archive:
        candidates = [
            name for name in archive.namelist() if name.endswith("/catalogue.json")
        ]
        if len(candidates) != 1:
            raise ValueError("Expected one saved catalogue in the archive")
        raw = archive.read(candidates[0])
        data = json.loads(raw)
        contract_paths = [
            name for name in archive.namelist() if name.endswith("/Contract.tsx")
        ]
        promotion_addresses: set[str] = set()
        for name in contract_paths:
            text = archive.read(name).decode("utf-8")
            promotion_addresses.update(
                address.lower() for address in re.findall(r"0x[0-9a-fA-F]{40}", text)
            )

    removed_urls = 0

    def clean_urls(value: object) -> object:
        nonlocal removed_urls
        if isinstance(value, dict):
            return {key: clean_urls(item) for key, item in value.items()}
        if isinstance(value, list):
            return [clean_urls(item) for item in value]
        if isinstance(value, str) and value.startswith(("https://", "http://")):
            host = (urlparse(value).hostname or "").lower()
            if (
                host == "grailassets.shop"
                or host.endswith(".grailassets.shop")
                or any(address in value.lower() for address in promotion_addresses)
            ):
                removed_urls += 1
                return None
        return value

    cleaned = clean_urls(data)
    assert isinstance(cleaned, dict)
    assets = cleaned["assets"]
    assert len(assets) == 1936, "Unexpected catalogue size"
    assert len({asset["slug"] for asset in assets}) == len(assets)
    assert not any(asset["symbol"].casefold() == "grail" for asset in assets)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    # The supplied archive needs no URL removals, so preserve its bytes exactly.
    args.output.write_bytes(
        raw
        if removed_urls == 0
        else (json.dumps(cleaned, ensure_ascii=False, indent=2) + "\n").encode()
    )
    print(
        f"Imported {len(assets)} assets; {len(cleaned['issuers'])} issuers; "
        f"{len(cleaned['networks'])} networks; removed URLs: {removed_urls}"
    )


if __name__ == "__main__":
    main()
