document.addEventListener('DOMContentLoaded', function() {
    const quizContent = document.getElementById('quiz-content');
    const submitButton = document.getElementById('submit-quiz');
    let currentQuiz = [];

    function parseQuiz(quizText) {
        const questions = quizText.split('\n\n');
        return questions.map(q => {
            const lines = q.split('\n');
            return {
                question: lines[0],
                options: lines.slice(1, 5),
                correct: lines[5].split(': ')[1]
            };
        });
    }

    function displayQuiz(questions) {
        currentQuiz = questions;
        quizContent.innerHTML = questions.map((q, i) => `
            <div class="question">
                <p>${q.question}</p>
                ${q.options.map((opt, j) => `
                    <label>
                        <input type="radio" name="q${i}" value="${opt[0]}">
                        ${opt}
                    </label>
                `).join('')}
            </div>
        `).join('');
    }

    submitButton.addEventListener('click', async function() {
        const answers = Array.from(document.querySelectorAll('input[type="radio"]:checked'))
            .map(input => input.value);
        
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
                    score: percentage
                })
            });

            if (response.ok) {
                alert(`Your score: ${percentage}%`);
                window.location.href = '/progress';
            }
        } catch (error) {
            console.error('Error submitting score:', error);
        }
    });

    // Initialize quiz from server-provided content
    const quizText = document.querySelector('#quiz-content').textContent;
    const questions = parseQuiz(quizText);
    displayQuiz(questions);
});