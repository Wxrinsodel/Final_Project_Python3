from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import pandas as pd
import json
from flask_migrate import Migrate
import dotenv
import os
from mistralai import Mistral
dotenv.load_dotenv()


api_key = os.environ["Mistral"]
model = "mistral-large-latest"

client = Mistral(api_key=api_key)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'SECRET_KEY'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///language_quiz.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)


def generate_quiz_with_llm(language, num_questions=10):
    """
    Generates language quiz questions using OpenAI's API
    """
    prompt = f"""Generate {num_questions} multiple choice questions for {language} language learning.
    Each question should test vocabulary or basic grammar.
    Format the response as a JSON array with the following structure for each question:
    {{
        "question": "What does [word] mean in {language}?",
        "options": ["A) answer1", "B) answer2", "C) answer3", "D) answer4"],
        "correct": "A"  // The correct option letter
    }}
    Make sure the questions are suitable for beginners to intermediate learners."""


    #request API of Mistral and get an answer

    try:
        response = client.chat.complete(
            model= model,
            messages = [
                {
                    "role": "user",
                    "content": prompt,
                },
            ]
        )
        
        # json to python object >> Use in Flask andEnsure correct format before using it
        response = response.choices[0].message.content
        response = response.replace("```json", '')
        response = response.replace("```", '')
        # print(response)

        questions = json.loads(response)
        return questions
    except Exception as e:
        print(f"Error generating quiz: {str(e)}")
        return None
    

#create table for store user information
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


# going to main page
@app.route('/quiz/<language>')
def quiz(language):
    if 'username' not in session:
        return redirect(url_for('login')) #back to loginpage
    
    # Generate questions using LLM
    questions = generate_quiz_with_llm(language)
    
    # Store questions in session for validation later
    session['current_quiz'] = questions
    
    return render_template('quiz.html', language=language)


#get the question for quiz in JSON
@app.route('/get_quiz_questions/<language>')
def get_quiz_questions(language):
    if 'username' not in session:
        return jsonify({'error': 'Not logged in'})
    
    questions = session.get('current_quiz')

    #if dont have questionin session, gen again
    if not questions:
        questions = generate_quiz_with_llm(language)
        session['current_quiz'] = questions
    
    return jsonify(questions)


#store the score
@app.route('/submit_score', methods=['POST'])
def submit_score():
    if 'username' not in session:
        return jsonify({'success': False, 'error': 'Not logged in'})
    
    #find the currently logged user name
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

    # Get all scores for the current user
    user_scores = Score.query.filter_by(user_id=user.id).order_by(Score.date.desc()).all()
    
    # Prepare data for charts
    languages = {}
    all_languages_data = []  # For the combined plot
    
    for score in user_scores:
        if score.language not in languages:

            # Get all scores for this language (from all users)
            all_language_scores = Score.query.filter_by(
                language=score.language
            ).all()
            
            # Get user's scores for this language
            user_language_scores = [s.score for s in user_scores if s.language == score.language]
            
            # Calculate distribution data
            score_distribution = calculate_score_distribution(all_language_scores)
            
            languages[score.language] = {
                'scores': user_language_scores, #tores all scores for this language in a list
                #Creates a list of dates when tests were taken (filtering it)
                'dates': [s.date.strftime('%Y-%m-%d') for s in user_scores if s.language == score.language], 
                'highest_score': max(user_language_scores) if user_language_scores else 0,
                'latest_score': user_language_scores[-1] if user_language_scores else 0,
                'attempts': len(user_language_scores),
                #Adds all scores and divides by number of attempts
                'average_score': sum(user_language_scores) / len(user_language_scores) if user_language_scores else 0, 
                'distribution': score_distribution #Stores the distribution data calculated earlier
            }
            
            # Add to combined plot data
            all_languages_data.append({
                'language': score.language,
                'highest_score': max(user_language_scores) if user_language_scores else 0
            })

    return render_template('progress.html', 
                         languages=languages,
                         all_languages_data=all_languages_data)

def calculate_score_distribution(scores, bins=10):
    """Calculate score distribution for visualization"""
    if not scores:
        return []
    
    score_values = [s.score for s in scores]
    hist = {}
    
    # Create bins from 0 to 100
    bin_size = 100 / bins # With default 10 bins, each bin is 10 points wide
    for i in range(bins):
        lower = i * bin_size
        upper = (i + 1) * bin_size

        # Count how many scores fall into this bin
        count = sum(1 for score in score_values if lower <= score < upper)

        # Add to histogram with formatted range as key >> .0f is decimal thing
        hist[f"{lower:.0f}-{upper:.0f}"] = count
    
    return hist


@app.route('/')
def index():
    if 'username' not in session:
        return redirect(url_for('login'))
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].strip()
        #try to find the username in database if the username is not empty
        if username: 
            user = User.query.filter_by(username=username).first()
            #create a new user and store in database
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