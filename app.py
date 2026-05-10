import csv
import os
from flask import Flask, render_template, jsonify

app = Flask(__name__)

def load_marinas():
    marinas = []
    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'simcoe_marinas.csv')
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Skip any row that is missing lat or lng
            if not row.get('lat') or not row.get('lng'):
                continue
            row['lat'] = float(row['lat'])
            row['lng'] = float(row['lng'])
            marinas.append(row)
    return marinas

@app.route('/')  
def home():
    return render_template('index.html')

@app.route('/api/marinas')
def get_marinas():
    return jsonify(load_marinas())

if __name__ == '__main__':
    app.run(debug=True, port=5000)



