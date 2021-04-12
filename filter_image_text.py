from PIL import Image
import numpy as np
import sys
from pathlib import Path
import os
from tqdm import tqdm
import ntpath




path = Path(sys.argv[1])
outPath = Path(sys.argv[2])
p = Path(path).glob('*.jpg')
files = [x for x in p if x.is_file()]
os.mkdir(path / 'out')

for f in tqdm(files):
    img = Image.open(f)
    data = np.array(img)
    converted = np.where(data >= 250, 0, 250)
    img = Image.fromarray(converted.astype('uint8'))
    img.save(outPath / ntpath.basename(f))