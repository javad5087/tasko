"""تولید آیکون‌های اپ (آیکون تیک نارنجی روی پس‌زمینه خاکستری)."""
from PIL import Image, ImageDraw
import os

ORANGE = (255, 79, 0)
INK = (47, 47, 47)
BG = (220, 220, 220)
SS = 4  # supersampling برای لبه‌های نرم


def draw_icon(size, safe=1.0):
    """safe<1 یعنی محتوا کوچک‌تر (برای maskable)."""
    S = size * SS
    img = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(img)

    # چند خط افقی محو مثل لیست روزها
    for i, shade in enumerate((212, 202, 190)):
        y0 = int(S * (0.70 + i * 0.10))
        d.rectangle([0, y0, S, y0 + int(S * 0.10)], fill=(shade,) * 3)

    # کادر چک‌باکس
    box = S * 0.46 * safe
    cx, cy = S / 2, S * 0.43
    x0, y0, x1, y1 = cx - box / 2, cy - box / 2, cx + box / 2, cy + box / 2
    d.rounded_rectangle([x0, y0, x1, y1], radius=box * 0.2, fill=ORANGE)

    # تیک سفید
    w = int(box * 0.12)
    pts = [(cx - box * 0.24, cy + box * 0.02), (cx - box * 0.06, cy + box * 0.20), (cx + box * 0.26, cy - box * 0.17)]
    d.line(pts, fill=(255, 255, 255), width=w, joint="curve")
    for px, py in (pts[0], pts[-1]):
        d.ellipse([px - w / 2, py - w / 2, px + w / 2, py + w / 2], fill=(255, 255, 255))

    return img.resize((size, size), Image.LANCZOS)


os.makedirs("icons", exist_ok=True)
draw_icon(180).save("icons/apple-touch-icon.png")
draw_icon(192).save("icons/icon-192.png")
draw_icon(512).save("icons/icon-512.png")
draw_icon(512, safe=0.8).save("icons/icon-maskable-512.png")
print("ok")
