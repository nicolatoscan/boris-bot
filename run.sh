#!/bin/bash

rm -rf data
mkdir -p data

# DOWNLOAD DUMP
mkdir -p data/dump
( cd data/dump ; gallery-dl "https://twitter.com/borisooc")
mkdir -p data/jpg
find ./data/dump -name '*.jpg' -exec mv {} ./data/jpg \;
rm -rf data/dump

# FIlter text
mkdir -p data/white
source .venv/bin/activate
python filter_image_text.py data/jpg data/white

# OCR
mkdir -p data/txt
(cd data/white ; for f in *.jpg; do tesseract $f ../txt/$f -l ita; done;)

# Index file
python create_index.py data/txt
