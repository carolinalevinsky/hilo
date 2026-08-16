#!/usr/bin/env python3
"""Draw the PWA icons into `public/`. Re-runnable: it overwrites what is there.

There is no image tooling on this machine — no PIL, no ImageMagick, no
rsvg-convert — and Node only runs inside Docker, so the icons are rasterised
here and written as hand-built PNG chunks. `zlib` and `struct` are the whole
dependency list.

The mark is the sidebar's (`src/components/app-shell/sidebar.tsx`): a white
rounded square on the brand violet. No wordmark and no gradient — the icon is
read at 48px on a home screen and neither survives that.

    python3 scripts/make-icons.py
"""

import struct
import sys
import zlib
from pathlib import Path

VIOLET = (0x6C, 0x5C, 0xE7)  # --hilo-violet, src/app/globals.css
WHITE = (0xFF, 0xFF, 0xFF)
PUBLIC = Path(__file__).resolve().parent.parent / "public"
SUBSAMPLES = 4  # per axis, and only on pixels the mark's edge crosses


def covered(x: float, y: float, left: float, side: float, radius: float) -> bool:
    """Is the point inside the rounded square? Distance to the corner arc's centre."""
    cx = min(max(x, left + radius), left + side - radius)
    cy = min(max(y, left + radius), left + side - radius)
    return (x - cx) ** 2 + (y - cy) ** 2 <= radius * radius


def coverage(px: int, py: int, left: float, side: float, radius: float) -> float:
    """How much of the pixel the mark covers, 0..1."""
    corners = [
        covered(px + dx, py + dy, left, side, radius)
        for dx in (0.0, 1.0)
        for dy in (0.0, 1.0)
    ]
    # Only the rounded corners need anti-aliasing; everywhere else the pixel is
    # wholly in or wholly out and supersampling it would be wasted work.
    if all(corners):
        return 1.0
    if not any(corners):
        return 0.0
    hits = sum(
        covered(
            px + (i + 0.5) / SUBSAMPLES,
            py + (j + 0.5) / SUBSAMPLES,
            left,
            side,
            radius,
        )
        for i in range(SUBSAMPLES)
        for j in range(SUBSAMPLES)
    )
    return hits / (SUBSAMPLES * SUBSAMPLES)


def chunk(kind: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    )


def write_icon(name: str, size: int, mark_ratio: float) -> Path:
    side = size * mark_ratio
    left = (size - side) / 2
    radius = side / 3  # the sidebar mark is 18px wide with a 6px radius

    raw = bytearray()
    for y in range(size):
        raw.append(0)  # PNG filter type 0 (None) for every scanline
        for x in range(size):
            a = coverage(x, y, left, side, radius)
            raw += bytes(
                round(VIOLET[c] + (WHITE[c] - VIOLET[c]) * a) for c in range(3)
            )

    # Colour type 2 (truecolour, no alpha). The field is solid, and iOS refuses
    # to composite an alpha channel on a home screen icon anyway.
    header = struct.pack(">IIBBBBB", size, size, 8, 2, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", header)
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )

    path = PUBLIC / name
    path.write_bytes(png)
    return path


def verify(path: Path, size: int) -> None:
    """Read the file back. A PNG writer that emits a plausible-looking but
    unreadable file is the failure mode worth catching here, not a typo."""
    data = path.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"{path.name}: not a PNG"
    assert data[12:16] == b"IHDR", f"{path.name}: no IHDR"
    width, height = struct.unpack(">II", data[16:24])
    assert (width, height) == (size, size), f"{path.name}: {width}x{height}"
    assert data[-12:] == chunk(b"IEND", b""), f"{path.name}: truncated"
    # Two flat colours deflate to almost nothing, so the byte size only rules
    # out a stub or a runaway; the pixel count below is the real proof.
    assert 300 < len(data) < 2_000_000, f"{path.name}: implausible size, {len(data)} bytes"
    # The IDAT payload must actually inflate: 8 signature + 25 IHDR + 8 header
    # in front of it, its own CRC and the 12-byte IEND behind it.
    pixels = zlib.decompress(data[41:-16])
    assert len(pixels) == height * (1 + width * 3), f"{path.name}: wrong pixel count"
    print(f"  {path.name}  {width}x{height}  {len(data):,} bytes")


# The maskable mark is smaller because a maskable icon is cropped to the inner
# ~80% of the square. 0.34 of the canvas is 0.42 of what survives a circle
# crop — which is what the plain icons look like uncropped.
ICONS = [
    ("icon-192.png", 192, 0.46),
    ("icon-512.png", 512, 0.46),
    ("icon-maskable-512.png", 512, 0.34),
    ("apple-touch-icon.png", 180, 0.46),
]

if __name__ == "__main__":
    print(f"Writing {len(ICONS)} icons to {PUBLIC}")
    try:
        for name, size, ratio in ICONS:
            verify(write_icon(name, size, ratio), size)
    except AssertionError as failure:
        sys.exit(f"icon verification failed: {failure}")
    print("All icons written and verified.")
