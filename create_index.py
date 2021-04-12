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
p = Path(path).glob('*.txt')
files = [x for x in p if x.is_file()]
wordDic = {}

with open('index.tsv', 'w') as outputFile:
    for f in tqdm(files):
        basename = ntpath.basename(f).strip(".txt")

        with open(f) as file:
            lines = [l.strip('\n') for l in file]
        words = list(map(lambda w: w.lower(), tokenize(' '.join(lines))))
        for w in words:
            if w in wordDic:
                wordDic[w].append(basename)
            else:
                wordDic[w] = [basename]

        res = ' '.join(words)
        outputFile.write(f'{basename}\t{res}\n')

with open('index.json', 'w') as f:
    json.dump(wordDic, f)
