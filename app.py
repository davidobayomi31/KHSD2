import csv
import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

def load_marina():
    marinas = []
    
    csv_path = open('simco_marina.csv')
    
    with open (encodig = 'utf-8') as f:
        reader = csv.dictReader(f)
        for row in reader:
            row['lat'] = float(row['lat'])
            row['lng'] = float(row['lng'])
            marinas.append(row)

    return marinas

def home():
    return render_template('index.html')

@app.route('/api/marinas')
def get_marina():
    return jsonify(load_marina())





