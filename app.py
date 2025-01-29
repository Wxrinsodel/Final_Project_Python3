from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pandas as pd
import json
from flask_migrate import Migrate


app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///language_quiz.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    scores = db.relationship('Score', backref='user', lazy=True)

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Float, nullable=False)
    answers = db.Column(db.String(500))  
    correct_answers = db.Column(db.String(500))  
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

@app.route('/quiz/<language>')
def quiz(language):
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('quiz.html', language=language)

@app.route('/submit_score', methods=['POST'])
def submit_score():
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'})
    
    try:
        data = request.json
        user = User.query.filter_by(username=session['username']).first()
        
        new_score = Score(
            user_id=user.id,
            language=data['language'],
            score=data['score'],
            answers=json.dumps(data['answers']),
            correct_answers=json.dumps(data['correct_answers']),
            date=datetime.utcnow()
        )
        db.session.add(new_score)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

@app.route('/progress')
def progress():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    user = User.query.filter_by(username=session['username']).first()
    if not user:
        return redirect(url_for('login'))

    scores = Score.query.filter_by(user_id=user.id).order_by(Score.date.desc()).all()
    
    # Prepare data for charts
    languages = {}
    for score in scores:
        if score.language not in languages:
            all_scores = Score.query.filter_by(
                user_id=user.id, 
                language=score.language
            ).order_by(Score.score.desc()).all()
            
            languages[score.language] = {
                'scores': [],
                'dates': [],
                'highest_score': all_scores[0].score if all_scores else 0,
                'latest_score': all_scores[-1].score if all_scores else 0,
                'attempts': 0,
                'average_score': 0
            }
        
        languages[score.language]['scores'].append(score.score)
        languages[score.language]['dates'].append(score.date.strftime('%Y-%m-%d'))
        languages[score.language]['attempts'] += 1
        languages[score.language]['average_score'] = sum(languages[score.language]['scores']) / len(languages[score.language]['scores'])

    return render_template('progress.html', 
                         languages=languages)

@app.route('/')
def index():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        user = User.query.filter_by(username=username).first()
        if not user:
            user = User(username=username)
            db.session.add(user)
            db.session.commit()
        session['username'] = username
        return redirect(url_for('index'))
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/language/<lang>')
def language_page(lang):
    background_images = {
        'Spanish': 'Spain.jpg',
        'Chinese': 'China.jpg',
        'French': 'France.jpg', 
        'German': 'Germany.jpg',
        'Italian': 'Italy.jpg',
        'Japanese': 'Japan.jpg',
        'Thai': 'Thailand.jpg',
        'Korean': 'Korea.jpg'
    }


    bg_image = background_images.get(lang, None)

    return render_template('index.html', bg_image=bg_image, background_images=background_images)


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='127.0.0.1', port=1234)