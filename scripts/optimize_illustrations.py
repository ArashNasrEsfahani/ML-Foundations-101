"""Shrink Codex-generated illustrations for the single-file build.

- Keeps untouched originals in src/assets/illustrations/originals/
  (the app's glob only picks up *.png directly in illustrations/).
- Downscales to max 512px, converts to grayscale+alpha, palette-quantizes.
- Idempotent: re-run any time Codex drops new images.

Usage:  python scripts/optimize_illustrations.py
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ILLOS = ROOT / "src" / "assets" / "illustrations"
ORIGINALS = ILLOS / "originals"
MAX_SIDE = 512

def optimize(path: Path) -> tuple[int, int]:
    orig_bytes = path.stat().st_size
    backup = ORIGINALS / path.name
    if not backup.exists():
        ORIGINALS.mkdir(exist_ok=True)
        backup.write_bytes(path.read_bytes())

    img = Image.open(backup).convert("RGBA")
    if max(img.size) > MAX_SIDE:
        scale = MAX_SIDE / max(img.size)
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)

    # grayscale + alpha, then palette quantization (keeps transparency)
    gray = img.convert("LA").convert("RGBA")
    quant = gray.quantize(colors=64, method=Image.Quantize.FASTOCTREE)
    quant.save(path, optimize=True)
    return orig_bytes, path.stat().st_size

def main() -> None:
    total_before = total_after = 0
    for png in sorted(ILLOS.glob("*.png")):
        before, after = optimize(png)
        total_before += before
        total_after += after
        print(f"{png.name:28s} {before/1024:8.0f} KB -> {after/1024:6.0f} KB")
    if total_before:
        print(f"{'TOTAL':28s} {total_before/1024:8.0f} KB -> {total_after/1024:6.0f} KB")
    else:
        print("no images found")

if __name__ == "__main__":
    main()
