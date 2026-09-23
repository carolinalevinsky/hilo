#!/usr/bin/env python3
"""Dibuja los íconos de la PWA en `public/`. Se puede volver a correr: pisa lo que haya.

    python3 scripts/make-icons.py

En esta máquina no hay nada para tratar imágenes —ni PIL, ni ImageMagick, ni
rsvg-convert— y Node sólo corre adentro de Docker. Así que el SVG se rasteriza
acá, a mano, y el PNG se arma chunk por chunk. `zlib` y `struct` son toda la
lista de dependencias.

La marca NO está dibujada en este archivo: se lee de `public/brand/isotype.svg`,
que es la arte que entregó diseño. Las formas y los colores salen de ahí. Cambiar
el isotipo es reemplazar ese SVG y volver a correr esto — no tocar este código.

Lo único que este archivo decide es cómo se encuadra:

    icon-192 / icon-512 / apple-touch-icon
        el isotipo entero, con su cuadrado redondeado, ocupando todo el lienzo.

    icon-maskable-512
        Android le recorta a un ícono maskable la forma que use el launcher —
        un círculo, un cuadrado redondeado, una gota. Así que acá el violeta
        llena el lienzo hasta el borde (el recorte se come las esquinas igual) y
        la "o" va más chica, adentro de la zona segura.
"""

import re
import struct
import sys
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
ISOTYPE = PUBLIC / "brand" / "isotype.svg"
# El favicon no va en `public/`: Next.js lo toma de `src/app/` y le pone el hash
# y el `Cache-Control` que corresponden.
FAVICON = ROOT / "src" / "app" / "favicon.ico"

# Muestras por eje al rasterizar. Cuatro alcanza: el borde de una curva a 192px
# ya no mejora a simple vista con ocho, y el tiempo se cuadruplica.
SUBSAMPLES = 4

# Cuánto del lienzo ocupa la "o" en el ícono maskable. Android garantiza el 80%
# central; 0.62 deja la letra cómoda adentro de un recorte circular.
MASKABLE_GLYPH = 0.62


# ── Leer el SVG ─────────────────────────────────────────────────────────────
#
# Un parser de SVG de verdad no hace falta y sería peor: este archivo tiene tres
# elementos y los conocemos. Lo que sí se chequea es que siga teniendo esos tres,
# porque un SVG distinto que igual parsea daría un ícono mal dibujado en silencio.


def read_isotype():
    """El cuadrado, la letra y el punto, con sus colores, tal como están en el SVG."""
    svg = ISOTYPE.read_text(encoding="utf-8")

    box = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"', svg)
    if not box:
        sys.exit(f"{ISOTYPE.name}: no tiene un viewBox que arranque en 0 0")
    side = float(box.group(1))
    if side != float(box.group(2)):
        sys.exit(f"{ISOTYPE.name}: el isotipo tiene que ser cuadrado")

    paths = re.findall(r'<path\b[^>]*?d="([^"]+)"[^>]*?fill="([^"]+)"', svg)
    dot = re.search(r'<circle cx="([\d.]+)" cy="([\d.]+)" r="([\d.]+)" fill="([^"]+)"', svg)
    if len(paths) != 2 or not dot:
        sys.exit(
            f"{ISOTYPE.name}: esperaba dos <path> y un <circle> y encontré "
            f"{len(paths)} y {'un' if dot else 'ningún'} círculo. "
            "Si la arte cambió de estructura, hay que mirar este script."
        )

    (square_d, square_fill), (glyph_d, glyph_fill) = paths
    return {
        "side": side,
        "square": (flatten(square_d), rgb(square_fill)),
        "glyph": (flatten(glyph_d), rgb(glyph_fill)),
        "dot": (circle(float(dot.group(1)), float(dot.group(2)), float(dot.group(3))),
                rgb(dot.group(4))),
    }


def rgb(value: str) -> tuple[int, int, int]:
    v = value.lstrip("#")
    return tuple(int(v[i : i + 2], 16) for i in (0, 2, 4))


# ── De trazo a polígonos ────────────────────────────────────────────────────


def flatten(d: str, steps: int = 24) -> list[list[tuple[float, float]]]:
    """El atributo `d` convertido en polígonos: una curva cada `steps` segmentos.

    Soporta M, L, H, V, C y Z, que es todo lo que usa esta arte. Cualquier otro
    comando corta acá en vez de dibujar algo aproximado y equivocado.
    """
    tokens = re.findall(r"[MmLlHhVvCcZz]|-?\d*\.?\d+(?:e-?\d+)?", d)
    polys: list[list[tuple[float, float]]] = []
    current: list[tuple[float, float]] = []
    x = y = start_x = start_y = 0.0
    i = 0
    command = ""

    def num():
        nonlocal i
        i += 1
        return float(tokens[i - 1])

    while i < len(tokens):
        if tokens[i].isalpha():
            command = tokens[i]
            i += 1
            if command in "Zz":
                if len(current) > 2:
                    polys.append(current)
                current = []
                x, y = start_x, start_y
                continue
        relative = command.islower()
        head = command.upper()

        if head == "M":
            nx, ny = num(), num()
            x, y = (x + nx, y + ny) if relative else (nx, ny)
            if len(current) > 2:
                polys.append(current)
            current = [(x, y)]
            start_x, start_y = x, y
            command = "l" if relative else "L"  # una M con más pares sigue como L
        elif head in ("L", "H", "V"):
            if head == "L":
                nx, ny = num(), num()
                x, y = (x + nx, y + ny) if relative else (nx, ny)
            elif head == "H":
                n = num()
                x = x + n if relative else n
            else:
                n = num()
                y = y + n if relative else n
            current.append((x, y))
        elif head == "C":
            x1, y1, x2, y2, nx, ny = (num() for _ in range(6))
            if relative:
                x1, y1, x2, y2, nx, ny = x1 + x, y1 + y, x2 + x, y2 + y, nx + x, ny + y
            for s in range(1, steps + 1):
                t = s / steps
                u = 1 - t
                current.append((
                    u**3 * x + 3 * u**2 * t * x1 + 3 * u * t**2 * x2 + t**3 * nx,
                    u**3 * y + 3 * u**2 * t * y1 + 3 * u * t**2 * y2 + t**3 * ny,
                ))
            x, y = nx, ny
        else:
            sys.exit(f"comando '{command}' sin soporte en el trazo del isotipo")

    if len(current) > 2:
        polys.append(current)
    return polys


def circle(cx: float, cy: float, r: float, steps: int = 96) -> list[list[tuple[float, float]]]:
    from math import cos, pi, sin

    return [[(cx + r * cos(2 * pi * s / steps), cy + r * sin(2 * pi * s / steps))
             for s in range(steps)]]


def bounds(polys) -> tuple[float, float, float, float]:
    xs = [p[0] for poly in polys for p in poly]
    ys = [p[1] for poly in polys for p in poly]
    return min(xs), min(ys), max(xs), max(ys)


# ── Rasterizar ──────────────────────────────────────────────────────────────


def coverage(polys, size: int, scale: float, dx: float, dy: float) -> list[list[float]]:
    """Cuánto cubre la forma cada píxel, 0..1, con regla nonzero.

    Por barrido y no muestreando punto por punto: muestrear daría el mismo
    resultado y tardaría unas mil veces más, que en Python puro es la diferencia
    entre un segundo y una tarde.

    El hueco de la "o" sale solo de la regla nonzero — los dos subtrazos giran al
    revés uno del otro, que es como lo exportó diseño y como lo dibuja el
    navegador.
    """
    edges = []
    for poly in polys:
        pts = [(px * scale + dx, py * scale + dy) for px, py in poly]
        for a in range(len(pts)):
            (x0, y0), (x1, y1) = pts[a], pts[(a + 1) % len(pts)]
            if y0 != y1:
                edges.append((x0, y0, x1, y1))

    rows = [[0.0] * size for _ in range(size)]
    for sy in range(size * SUBSAMPLES):
        y = (sy + 0.5) / SUBSAMPLES
        crossings = []
        for x0, y0, x1, y1 in edges:
            if (y0 <= y < y1) or (y1 <= y < y0):
                crossings.append((x0 + (y - y0) * (x1 - x0) / (y1 - y0), 1 if y1 > y0 else -1))
        if not crossings:
            continue
        crossings.sort()

        row = rows[int(y)]
        winding = 0
        span_start = 0.0
        for cx, direction in crossings:
            if winding == 0:
                span_start = cx
            winding += direction
            if winding == 0:
                paint(row, span_start, cx, size)

    return rows


def paint(row: list[float], xa: float, xb: float, size: int) -> None:
    """Suma un tramo horizontal a la fila, con los extremos fraccionados."""
    xa, xb = max(xa, 0.0), min(xb, float(size))
    if xb <= xa:
        return
    first, last = int(xa), min(int(xb), size - 1)
    if first == last:
        row[first] += (xb - xa) / SUBSAMPLES
        return
    row[first] += (first + 1 - xa) / SUBSAMPLES
    for x in range(first + 1, last):
        row[x] += 1.0 / SUBSAMPLES
    row[last] += (xb - last) / SUBSAMPLES


def over(canvas, rows, color, size: int) -> None:
    """Pinta `color` encima de lo que hay, según la cobertura."""
    for y in range(size):
        cov, dst = rows[y], canvas[y]
        for x in range(size):
            a = cov[x]
            if a <= 0:
                continue
            a = 1.0 if a > 1 else a
            base = dst[x]
            dst[x] = tuple(round(base[c] + (color[c] - base[c]) * a) for c in range(3))


# ── Escribir el PNG ─────────────────────────────────────────────────────────


def chunk(kind: bytes, data: bytes) -> bytes:
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    )


def write_icon(art, name: str, size: int, maskable: bool, rgba: bool = False) -> Path:
    side = art["side"]
    _, square_color = art["square"]
    glyph_polys, glyph_color = art["glyph"]
    dot_polys, dot_color = art["dot"]

    # El violeta va a sangre, en los cuatro íconos. Las esquinas redondeadas del
    # SVG no se dibujan a propósito: iOS y Android le dan al ícono la forma que
    # usa el sistema —círculo, cuadrado redondeado, gota— y un ícono que ya trae
    # las suyas termina con un borde de otro color asomando por afuera.
    canvas = [[square_color] * size for _ in range(size)]

    if maskable:
        # Android recorta a la zona segura, así que la letra va más chica y
        # centrada en el lienzo y no donde la dejó el SVG.
        x0, y0, x1, y1 = bounds(glyph_polys)
        scale = size * MASKABLE_GLYPH / max(x1 - x0, y1 - y0)
        dx = size / 2 - (x0 + x1) / 2 * scale
        dy = size / 2 - (y0 + y1) / 2 * scale
    else:
        # Tal cual el SVG: la letra ya viene con su aire alrededor.
        scale, dx, dy = size / side, 0.0, 0.0

    over(canvas, coverage(glyph_polys, size, scale, dx, dy), glyph_color, size)
    over(canvas, coverage(dot_polys, size, scale, dx, dy), dot_color, size)

    raw = bytearray()
    for y in range(size):
        raw.append(0)  # filtro PNG tipo 0 (ninguno) en cada línea
        for px in canvas[y]:
            raw += bytes(px)
            if rgba:
                raw.append(255)

    # Tipo de color 2 (color verdadero, sin alfa) para los PNG sueltos: el campo
    # es opaco, y iOS no compone un canal alfa en un ícono de pantalla de inicio
    # de todos modos.
    #
    # El `.ico` es la excepción y va en 6 (con alfa): el decodificador de
    # imágenes de Next.js rechaza un ICO cuyo PNG no sea RGBA, y el build corta.
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6 if rgba else 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + chunk(b"IEND", b"")
    )

    path = PUBLIC / name
    path.write_bytes(png)
    return path


def verify(path: Path, size: int) -> None:
    """Leer el archivo de vuelta. Lo que vale la pena atajar acá no es un typo:
    es un escritor de PNG que emite algo plausible y no se puede abrir."""
    data = path.read_bytes()
    assert data[:8] == b"\x89PNG\r\n\x1a\n", f"{path.name}: no es un PNG"
    assert data[12:16] == b"IHDR", f"{path.name}: sin IHDR"
    width, height = struct.unpack(">II", data[16:24])
    assert (width, height) == (size, size), f"{path.name}: {width}x{height}"
    assert data[-12:] == chunk(b"IEND", b""), f"{path.name}: cortado"
    assert 300 < len(data) < 2_000_000, f"{path.name}: tamaño implausible, {len(data)} bytes"
    pixels = zlib.decompress(data[41:-16])
    assert len(pixels) == height * (1 + width * 3), f"{path.name}: mal la cuenta de píxeles"
    colours = {pixels[i : i + 3] for i in range(1, len(pixels), 3)}
    assert len(colours) > 3, f"{path.name}: salió de un solo color, no se dibujó la marca"
    print(f"  {path.name}  {width}x{height}  {len(data):,} bytes")


def write_favicon(art) -> Path:
    """El `.ico`, con un PNG de 32x32 adentro.

    Un ICO puede llevar el PNG tal cual desde hace veinte años, así que es la
    misma imagen que el resto y no un formato aparte: seis bytes de encabezado,
    dieciséis de entrada de directorio, y el PNG.

    32 y no 16: es lo que usa una pestaña en una pantalla retina, y el navegador
    achica solo cuando necesita 16.
    """
    png = (PUBLIC / "_favicon.tmp.png")
    write_icon(art, png.name, 32, False, rgba=True)
    data = png.read_bytes()
    png.unlink()

    ico = (
        struct.pack("<HHH", 0, 1, 1)                    # ICONDIR: un ícono
        + struct.pack("<BBBBHHII", 32, 32, 0, 0, 1, 32, len(data), 22)
        + data
    )
    FAVICON.write_bytes(ico)
    return FAVICON


ICONS = [
    ("icon-192.png", 192, False),
    ("icon-512.png", 512, False),
    ("icon-maskable-512.png", 512, True),
    ("apple-touch-icon.png", 180, False),
]

if __name__ == "__main__":
    art = read_isotype()
    print(f"Isotipo: {ISOTYPE.relative_to(ROOT)} → {len(ICONS)} íconos en {PUBLIC.name}/")
    try:
        for name, size, maskable in ICONS:
            verify(write_icon(art, name, size, maskable), size)
        ico = write_favicon(art)
        print(f"  {ico.relative_to(ROOT)}  32x32  {ico.stat().st_size:,} bytes")
    except AssertionError as failure:
        sys.exit(f"falló la verificación de los íconos: {failure}")
    print("Íconos escritos y verificados.")
