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
            # Convert every value to a plain string so JSON can handle it
            clean = {k: (v if v is not None else '') for k, v in row.items()}
            # Skip rows with missing coordinates
            if not clean.get('lat') or not clean.get('lng'):
                continue
            clean['lat'] = float(clean['lat'])
            clean['lng'] = float(clean['lng'])
            marinas.append(clean)
    return marinas


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/marinas')
def get_marinas():
    return jsonify(load_marinas())


if __name__ == '__main__':
    app.run(debug=True, port=5000)
