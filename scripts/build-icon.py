from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math
size=1024
image=Image.new('RGBA',(size,size),(0,0,0,0))
mask=Image.new('L',(size,size));ImageDraw.Draw(mask).rounded_rectangle((30,30,994,994),radius=220,fill=255)
base=Image.new('RGBA',(size,size));pixels=base.load()
for y in range(size):
 for x in range(size):
  glow=max(0,1-math.hypot(x-380,y-310)/900)
  pixels[x,y]=(int(8+10*glow),int(16+23*glow),int(23+19*glow),255)
base.putalpha(mask);image.alpha_composite(base)
glow=Image.new('RGBA',(size,size));g=ImageDraw.Draw(glow)
g.ellipse((206,186,818,798),outline=(55,233,171,170),width=28)
image.alpha_composite(glow.filter(ImageFilter.GaussianBlur(27)))
d=ImageDraw.Draw(image)
d.rounded_rectangle((32,32,992,992),radius=218,outline=(54,96,79,255),width=4)
d.ellipse((216,196,808,788),fill=(13,43,39,245),outline=(112,242,196,255),width=18)
d.ellipse((356,196,668,788),outline=(77,181,147,255),width=10)
d.ellipse((455,196,569,788),outline=(61,148,124,255),width=7)
d.arc((216,315,808,671),0,360,fill=(77,181,147,255),width=10)
d.line((222,492,802,492),fill=(93,207,165,255),width=10)
# A tilted orbital ring keeps the mark distinctive at small Windows icon sizes.
orbit=Image.new('RGBA',(size,size));o=ImageDraw.Draw(orbit);o.ellipse((115,377,905,633),outline=(153,255,211,255),width=17)
orbit=orbit.rotate(32,resample=Image.Resampling.BICUBIC,center=(512,512));image.alpha_composite(orbit)
d=ImageDraw.Draw(image);d.ellipse((764,226,827,289),fill=(205,255,231,255));d.ellipse((207,690,251,734),fill=(83,225,178,255))
root=Path(__file__).resolve().parent.parent
resources=root/'desktop'/'resources';brand=root/'public'/'brand';resources.mkdir(parents=True,exist_ok=True);brand.mkdir(parents=True,exist_ok=True)
icon=image.resize((256,256),Image.Resampling.LANCZOS)
icon.save(resources/'icon.ico',format='ICO',sizes=[(16,16),(24,24),(32,32),(48,48),(64,64),(128,128),(256,256)])
icon.save(resources/'icon.png');image.resize((512,512),Image.Resampling.LANCZOS).save(brand/'icon-512.png');icon.save(brand/'icon.ico',format='ICO',sizes=[(16,16),(32,32),(48,48),(256,256)])
(brand/'icon.svg').write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="3" y="3" width="94" height="94" rx="23" fill="#10241f" stroke="#365c4b"/><circle cx="50" cy="49" r="30" fill="#0e2b27" stroke="#79ecc0" stroke-width="2"/><ellipse cx="50" cy="49" rx="15" ry="30" fill="none" stroke="#52ad8e" stroke-width="1.5"/><path d="M21 49h58M24 36q26 12 52 0M24 62q26-12 52 0" stroke="#52ad8e" fill="none" stroke-width="1.3"/><ellipse cx="50" cy="50" rx="40" ry="13" transform="rotate(-32 50 50)" fill="none" stroke="#a4f4d2" stroke-width="1.8"/><circle cx="78" cy="25" r="3.5" fill="#dcffed"/></svg>''',encoding='utf-8')
print('Created multi-resolution Windows ICO and matching web brand assets.')
