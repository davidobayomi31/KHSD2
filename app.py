import csv
import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

def load_marina():
    marinas = []

csv_path = open('simco_marina.csv')
with open (encodig = 'utf-8') as f:
    reader = csv.dictReader(f)




