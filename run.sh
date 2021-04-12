#!/bin/bash

rm -rf data
mkdir -p data

# DOWNLOAD DUMP
mkdir -p data/dump
( cd data/dump ; gallery-dl "https://twitter.com/borisooc")
mkdir -p data/jpg
mkdir -p data/mp4
find ./data/dump -name '*.jpg' -exec mv {} ./data/jpg \;
find ./data/dump -name '*.mp4' -exec mv {} ./data/mp4 \;
rm -rf data/dump

# FIlter text
mkdir -p data/white
source .venv/bin/activate
python filter_image_text.py data/jpg data/white

# OCR
mkdir -p data/txt
(cd data/white ; for f in *.jpg; do tesseract $f ../txt/$f -l ita; done;)

# videos
(cd data/mp4 ; for f in *.mp4; do ffmpeg -i $f -vframes 15 -f image2 $f.jpg; done;)

# Index file
python create_index.py data/txt
