from pathlib import Path
from tqdm import tqdm
import ntpath
import re
import sys
import json

def tokenize(text: str):
    for match in re.finditer(r'\w+', text, re.UNICODE):
        yield match.group(0)

path = Path(sys.argv[1])
txtFiles = [x for x in Path(path).glob('txt/*.txt') if x.is_file()]
mp4Files = [ntpath.basename(x) for x in Path(path).glob('mp4/*.mp4') if x.is_file()]
wordDic = {
    'empty-words': [],
    'videos': mp4Files
}
ii = 0
with open('index.tsv', 'w') as outputFile:
    for f in tqdm(txtFiles):
        basename = ntpath.basename(f).strip(".txt")

        with open(f) as file:
            lines = [l.strip('\n') for l in file]
        words = list(map(lambda w: w.lower(), tokenize(' '.join(lines))))
        if len(words) == 0:
            wordDic['empty-words'].append(basename)
        else:
            for w in words:
                if w in wordDic:
                    wordDic[w].append(basename)
                else:
                    wordDic[w] = [basename]

        res = ' '.join(words)
        outputFile.write(f'{basename}\t{res}\n')

with open('index.json', 'w') as f:
    json.dump(wordDic, f)
