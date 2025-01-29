from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import openai
import os
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-default-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///language_quiz.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


openai.api_key = os.getenv('OPENAI_API_KEY')


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    scores = db.relationship('Score', backref='user', lazy=True)

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


def generate_quiz(language, difficulty='beginner'):
    try:
        prompt = f"""Create a quiz about {language} language with 5 multiple-choice questions. 
        Difficulty level: {difficulty}
        Format each question as follows:
        Question: [question text]
        A) [option]
        B) [option]
        C) [option]
        D) [option]
        Correct: [correct letter]
        
        Make sure questions test various aspects of language learning including vocabulary, grammar, and cultural knowledge."""
        
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a professional language teacher creating educational quizzes."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating quiz: {e}")
        return None

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
        'English': 'England.jpg',
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

@app.route('/quiz/<language>')
def quiz(language):
    if 'username' not in session:
        return redirect(url_for('login'))
    
    difficulty = request.args.get('difficulty', 'beginner')
    quiz_content = generate_quiz(language, difficulty)
    
    if quiz_content is None:
        return "Error generating quiz. Please try again.", 500
        
    return render_template('quiz.html', 
                         quiz=quiz_content, 
                         language=language, 
                         difficulty=difficulty)

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
            date=datetime.utcnow()  # Ensure date is set
        )
        db.session.add(new_score)
        db.session.commit()
        
        return jsonify({'success': True})
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)})

# 🔹 Ensure `/progress` route is defined before `url_for('progress')` is used
@app.route('/progress')
def progress():
    if 'username' not in session:
        return redirect(url_for('login'))
    
    user = User.query.filter_by(username=session['username']).first()
    if not user:  # Handle the case where the user is not found
        return redirect(url_for('login'))

    scores = Score.query.filter_by(user_id=user.id).order_by(Score.date.desc()).all()
    
    stats = {}
    for score in scores:
        if score.language not in stats:
            stats[score.language] = {
                'attempts': 0,
                'total_score': 0,
                'highest_score': 0
            }
        stats[score.language]['attempts'] += 1
        stats[score.language]['total_score'] += score.score
        stats[score.language]['highest_score'] = max(
            stats[score.language]['highest_score'], 
            score.score
        )
    
    for language in stats:
        stats[language]['average_score'] = (
            stats[language]['total_score'] / stats[language]['attempts']
        ) if stats[language]['attempts'] > 0 else 0
    
    return render_template('progress.html', scores=scores, stats=stats)

# 🔹 Ensure only one `if __name__ == '__main__':` block exists
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
