document.addEventListener('DOMContentLoaded', function() {
    const quizContent = document.getElementById('quiz-content');
    const submitButton = document.getElementById('submit-quiz');
    let currentQuiz = [];
    
    // Language content database
    const languageContent = {
        'French': {
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
                'cinq': 'five'
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
                    'teburu': 'table'
                },
                numbers: {
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
                }
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
                    'tisch': 'table'
                },
                numbers: {
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
                }
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
                    'tavolo': 'table'
                },
                numbers: {
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
                }
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
                    'zhuōzi': 'table'
                },
                numbers: {
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
                }
            },
            'Thai': {
                script: 'ภาษาไทย', 
                words: {
                    'sàwàtdee': 'hello',
                    'khòp khun': 'thank you',
                    'laa kòn': 'goodbye',
                    'maeo': 'cat',
                    'sùnák': 'dog',
                    'bâan': 'house',
                    'náam': 'water',
                    'khànom pang': 'bread',
                    'nangsʉ̌ʉ': 'book',
                    'tóh': 'table'
                },
                numbers: {
                    'nùeng': 'one',
                    'sɔ̌ng': 'two',
                    'sǎam': 'three',
                    'sìi': 'four',
                    'hâa': 'five',
                    'hòk': 'six',
                    'cèt': 'seven',
                    'pɛ̀et': 'eight',
                    'kâao': 'nine',
                    'sìp': 'ten'
                }
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
                    'teibeul': 'table'
                },
                numbers: {
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
                }
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
                'me llamo [name]': 'My name is [name]' //Sentence
            },
                numbers: {
                    'uno': 'one',
                    'dos': 'two',
                    'tres': 'three',
                    'cuatro': 'four',
                    'cinco': 'five',
                    'seis': 'six',
                    'siete': 'seven',
                    'ocho': 'eight',
                    'nueve': 'nine',
                    'diez': 'ten'
                }
            }
        };
        
        
        const language = document.querySelector('h1').textContent.split(' ')[0];
        if (languageContent[language] && languageContent[language].script) {
            console.log(languageContent[language].script);
        } else {
            console.log("Script not found for this language.");
        }
    
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    
        function generateVocabQuestion(language, word, correctMeaning, allMeanings) {
            const options = shuffleArray([...new Set([correctMeaning, ...shuffleArray(allMeanings).slice(0, 3)])]).slice(0, 4);
            const correctIndex = options.indexOf(correctMeaning);
            const correctLetter = String.fromCharCode(65 + correctIndex);
    
            return {
                question: `What does '${word}' mean in ${language}?`,
                options: options.map((opt, i) => `${String.fromCharCode(65 + i)}) ${opt}`),
                correct: correctLetter
            };
        }
    
        // Updated generateQuiz function as per your adjustment
        function generateQuiz(language, difficulty) {
            const langContent = languageContent[language];
            if (!langContent) return null;
            const questions = [];
            
            switch(difficulty) {
                case 'beginner':
                    if (langContent.numbers) {
                        const numberEntries = Object.entries(langContent.numbers);
                        const allNumbers = Object.values(langContent.numbers);
                        const selectedNumbers = shuffleArray(numberEntries).slice(0, 10);
                        selectedNumbers.forEach(([word, meaning]) => {
                            questions.push({
                                question: `What is "${word}" in ${language}?`,
                                options: shuffleArray([meaning, ...shuffleArray(allNumbers.filter(n => n !== meaning)).slice(0, 3)]).map((opt, i) => 
                                    `${String.fromCharCode(65 + i)}) ${opt}`),
                                correct: String.fromCharCode(65 + shuffleArray([meaning, ...shuffleArray(allNumbers.filter(n => n !== meaning)).slice(0, 3)]).indexOf(meaning))
                            });
                        });
                    }
                    break;
                    
                case 'intermediate':
                    const vocabEntries = Object.entries(langContent.words);
                    const allMeanings = Object.values(langContent.words);
                    const selectedVocab = shuffleArray(vocabEntries).slice(0, 8);
                    selectedVocab.forEach(([word, meaning]) => {
                        questions.push(generateVocabQuestion(language, word, meaning, allMeanings));
                    });
                    break;
                    
                case 'advanced':
                    if (langContent.phrases) {
                        const phraseEntries = Object.entries(langContent.phrases);
                        const allPhrases = Object.values(langContent.phrases);
                        const selectedPhrases = shuffleArray(phraseEntries).slice(0, 10);
                        selectedPhrases.forEach(([phrase, meaning]) => {
                            questions.push({
                                question: `What does "${phrase}" mean?`,
                                options: shuffleArray([meaning, ...shuffleArray(allPhrases.filter(p => p !== meaning)).slice(0, 3)]).map((opt, i) => 
                                    `${String.fromCharCode(65 + i)}) ${opt}`),
                                correct: String.fromCharCode(65 + shuffleArray([meaning, ...shuffleArray(allPhrases.filter(p => p !== meaning)).slice(0, 3)]).indexOf(meaning))
                            });
                        });
                    }
                    break;
                    
                default:
                    return generateQuiz(language, 'beginner');
            }
            return questions;
        }
    
        function displayQuiz(questions) {
            currentQuiz = questions;
            quizContent.innerHTML = questions.map((q, i) => `
                <div class="question">
                    <p><strong>Question ${i + 1}:</strong> ${q.question}</p>
                    <div class="options-container">
                        ${q.options.map(opt => `
                            <label class="option">
                                <input type="radio" name="q${i}" value="${opt[0]}">
                                ${opt}
                            </label>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    
        submitButton.addEventListener('click', async function() {
            const answers = Array.from(document.querySelectorAll('input[type="radio"]:checked'))
                .map(input => input.value);
            
            if (answers.length !== currentQuiz.length) {
                alert('Please answer all questions!');
                return;
            }
    
            const score = answers.reduce((acc, ans, i) => {
                return acc + (ans === currentQuiz[i].correct ? 1 : 0);
            }, 0);
    
            const percentage = (score / currentQuiz.length) * 100;
    
            try {
                const response = await fetch('/submit_score', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        language: document.querySelector('h1').textContent.split(' ')[0],
                        score: percentage,
                        answers: answers,
                        correct_answers: currentQuiz.map(q => q.correct)
                    })
                });
    
                if (response.ok) {
                    window.location.href = '/progress';
                }
            } catch (error) {
                console.error('Error submitting score:', error);
            }
        });
    
        // Initialize quiz with difficulty
        const difficulty = document.getElementById('difficulty').value;
        const questions = generateQuiz(language, difficulty);
        if (questions) {
            displayQuiz(questions);
        }
    });