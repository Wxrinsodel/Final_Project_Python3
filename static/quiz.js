document.addEventListener('DOMContentLoaded', function() { //loading webpage
    const quizContent = document.getElementById('quiz-content');
    const submitButton = document.getElementById('submit-quiz');
    let currentQuiz = [];
    
    // Language content database 
    const languageContent = {
        'French': {
            script: 'Français',
            words: {
                'bonjour': 'hello',
                'merci': 'thank you',
                'au revoir': 'goodbye',
                'chat': 'cat',
                'chien': 'dog',
                'maison': 'house',
                'eau': 'water',
                'pain': 'bread',
                'livre': 'book',
                'table': 'table',

                'un': 'one',
                'deux': 'two',
                'trois': 'three',
                'quatre': 'four',
                'cinq': 'five',
                'six': 'six',
                'sept': 'seven',
                'huit': 'eight',
                'neuf': 'nine',
                'dix': 'ten'
            }
        },
            'Japanese': {
                script: '日本語',
                words: {
                    'konnichiwa': 'hello',
                    'arigato': 'thank you',
                    'sayonara': 'goodbye',
                    'neko': 'cat',
                    'inu': 'dog',
                    'ie': 'house',
                    'mizu': 'water',
                    'pan': 'bread',
                    'hon': 'book',
                    'teburu': 'table',

                    'ichi': 'one',
                    'ni': 'two',
                    'san': 'three',
                    'yon': 'four',
                    'go': 'five',
                    'roku': 'six',
                    'shichi': 'seven',
                    'hachi': 'eight',
                    'kyuu': 'nine',
                    'juu': 'ten'
                },
            },
            'German': {
                script: 'Deutsch',
                words: {
                    'hallo': 'hello',
                    'danke': 'thank you',
                    'auf wiedersehen': 'goodbye',
                    'katze': 'cat',
                    'hund': 'dog',
                    'haus': 'house',
                    'wasser': 'water',
                    'brot': 'bread',
                    'buch': 'book',
                    'tisch': 'table',

                    'eins': 'one',
                    'zwei': 'two',
                    'drei': 'three',
                    'vier': 'four',
                    'fünf': 'five',
                    'sechs': 'six',
                    'sieben': 'seven',
                    'acht': 'eight',
                    'neun': 'nine',
                    'zehn': 'ten'
                },
            },
            'Italian': {
                script: 'Italiano',
                words: {
                    'ciao': 'hello',
                    'grazie': 'thank you',
                    'arrivederci': 'goodbye',
                    'gatto': 'cat',
                    'cane': 'dog',
                    'casa': 'house',
                    'acqua': 'water',
                    'pane': 'bread',
                    'libro': 'book',
                    'tavolo': 'table',

                    'uno': 'one',
                    'due': 'two',
                    'tre': 'three',
                    'quattro': 'four',
                    'cinque': 'five',
                    'sei': 'six',
                    'sette': 'seven',
                    'otto': 'eight',
                    'nove': 'nine',
                    'dieci': 'ten'
                },
            },
            'Chinese': {
                script: '中文',
                words: {
                    'nǐ hǎo': 'hello',
                    'xièxie': 'thank you',
                    'zàijiàn': 'goodbye',
                    'māo': 'cat',
                    'gǒu': 'dog',
                    'fángzi': 'house',
                    'shuǐ': 'water',
                    'miànbāo': 'bread',
                    'shū': 'book',
                    'zhuōzi': 'table',

                    'yī': 'one',
                    'èr': 'two',
                    'sān': 'three',
                    'sì': 'four',
                    'wǔ': 'five',
                    'liù': 'six',
                    'qī': 'seven',
                    'bā': 'eight',
                    'jiǔ': 'nine',
                    'shí': 'ten'
                },

            },
            'Thai': {
                script: 'ภาษาไทย', 
                words: {
                    'sàwàtdee (สวัสดี)': 'hello',
                    'khòp khun (ขอบคุณ)': 'thank you',
                    'laa kòn (ลาก่อน)': 'goodbye',
                    'maeo (แมว)': 'cat',
                    'sùnák(สุนัข)': 'dog',
                    'bâan (บ้าน)': 'house',
                    'náam (น้ำ)': 'water',
                    'khànom pang (ขนมปัง)': 'bread',
                    'nangsʉ̌ʉ (หนังสือ)': 'book',
                    'tóh (โต๊ะ)': 'table',

                    'nùeng (หนึ่ง)': 'one',
                    'sɔ̌ng (สอง)': 'two',
                    'sǎam (สาม)': 'three',
                    'sìi(สี่)': 'four',
                    'hâa (ห้า)': 'five',
                    'hòk (หก)': 'six',
                    'cèt (เจ็ด)': 'seven',
                    'pɛ̀et (แปด)': 'eight',
                    'kâao (เก้า)': 'nine',
                    'sìp (สิบ)': 'ten'
                },
            },
            'Korean': {
                script: '한국어',
                words: {
                    'annyeonghaseyo': 'hello',
                    'gamsahabnida': 'thank you',
                    'annyeonghi gaseyo': 'goodbye',
                    'goyangi': 'cat',
                    'gae': 'dog',
                    'jip': 'house',
                    'mul': 'water',
                    'ppang': 'bread',
                    'chaek': 'book',
                    'teibeul': 'table',

                    'hana': 'one',
                    'dul': 'two',
                    'set': 'three',
                    'net': 'four',
                    'daseot': 'five',
                    'yoseot': 'six',
                    'ilgop': 'seven',
                    'yeodeolp': 'eight',
                    'ahop': 'nine',
                    'yeol': 'ten'
                },
            },
            'Spanish': {
                words: {
                'hola': 'hello',
                'gracias': 'thank you',
                'adiós': 'goodbye',
                'gato': 'cat',
                'perro': 'dog',
                'casa': 'house',
                'agua': 'water',
                'pan': 'bread',
                'libro': 'book',
                'mesa': 'table',

                'uno': 'one',
                'dos': 'two',
                'tres': 'three',
                'cuatro': 'four',
                'cinco': 'five',
                'seis': 'six',
                'siete': 'seven',
                'ocho': 'eight',
                'nueve': 'nine',
                'diez': 'ten',
               
            },
            }
        };

        async function getQuizQuestions(language) {
            try {
                // First try to get LLM-generated questions
                const response = await fetch(`/get_quiz_questions/${language}`);
                const data = await response.json();
                
                if (data && !data.error) {
                    return data;
                } else {
                    // If LLM fails, fall back to local content
                    console.log('Falling back to local content');
                    return generateLocalQuiz(language);
                }
            } catch (error) {
                console.error('Error fetching LLM questions:', error);
                return generateLocalQuiz(language);
            }
        }
        
        function generateLocalQuiz(language) {
            const langContent = languageContent[language]; //handle error if language is not in langContent
            if (!langContent) return null;
            
            const questions = [];
            const vocabEntries = Object.entries(langContent.words); //store meaning of the words

            const allMeanings = Object.values(langContent.words); // store meaning of all words

            // Select 10 random words for the quiz
            const selectedVocab = shuffleArray(vocabEntries).slice(0, 10);
            
            selectedVocab.forEach(([word, meaning]) => { //looping in selectedVocab
                const options = shuffleArray([
                    //use meaning to be a correct one and choose 3 incorrect answers that not "meaning"
                    meaning,
                    ...shuffleArray(allMeanings.filter(m => m !== meaning)).slice(0, 3)
                ]);
                
                const correctIndex = options.indexOf(meaning); //find the correct answer
                const correctLetter = String.fromCharCode(65 + correctIndex); //index to string
    
                    // created object 'questions' and stores in questions
                questions.push({
                    question: `What does '${word}' mean in ${language}?`,
                    options: options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`),
                    correct: correctLetter //the correct answer
                });
            });
            
            return questions;
        }
        
        // randomly generate the sequence of the question
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    
        function displayQuiz(questions) {
            currentQuiz = questions;
            // delete the previous page to avoid the same display as before
            quizContent.innerHTML = questions.map((q, i) => ` //.map makeHTML to loop for each Ques.
                <div class="question">
                    <p><strong>Question ${i + 1}:</strong> ${q.question}</p>  //loop each by each question
                    <div class="options-container">
                        ${q.options.map(opt => `
                            <label class="option">
                                <input type="radio" name="q${i}" value="${opt[0]}"> //radio = make sure to choose only one answer
                                ${opt}
                            </label>
                        `).join('')} //mix all q be in one html
                    </div>
                </div>
            `).join('');
        }

        // check the answer and store to input.value
    
        submitButton.addEventListener('click', async function() {
            const answers = Array.from(document.querySelectorAll('input[type="radio"]:checked'))
                .map(input => input.value);
            
            if (answers.length !== currentQuiz.length) {
                alert('Please answer all questions!');
                return;
            }
    
            const score = answers.reduce((acc, ans, i) => { //reduce() will looping check how many the correct answer is
                return acc + (ans === currentQuiz[i].correct ? 1 : 0);
            }, 0);
    
            const percentage = (score / currentQuiz.length) * 100; 
    
            try {
                const response = await fetch('/submit_score', { //submit the result by fetch
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ //converts a JavaScript object into a JSON-formatted string
                        language: document.querySelector('h1').textContent.split(' ')[0], //split the text and take the first word
                        score: percentage,
                        answers: answers, //user's answer go to answer's array
                        correct_answers: currentQuiz.map(q => q.correct) //extracts only the correct answers
                    })
                });
    
                if (response.ok) {
                    window.location.href = '/progress';
                }
            } catch (error) {
                console.error('Error submitting score:', error);
            }
        });
    
        // Initialize quiz
        const language = document.querySelector('h1').textContent.split(' ')[0];
        getQuizQuestions(language).then(questions => { //load the data, then display it
            if (questions) {
                displayQuiz(questions);
            }
        });
    });