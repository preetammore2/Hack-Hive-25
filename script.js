// Quiz questions with categories, hints, and difficulty
const questions = [
    {
        question: "What is phishing?",
        options: ["A type of fish", "A cyberattack that uses email to trick users", "A secure way to share files", "A type of software"],
        answer: 1,
        explanation: "Phishing is a cyberattack where attackers use emails or messages to trick users into providing sensitive information.",
        category: "Phishing",
        hint: "Think about emails that seem suspicious.",
        difficulty: "easy"
    },
    {
        question: "What should you do if you receive a suspicious email?",
        options: ["Click all links to investigate", "Reply to the sender", "Report it and delete it", "Forward it to friends"],
        answer: 2,
        explanation: "Never click links in suspicious emails. Report it to your IT team and delete it.",
        category: "Phishing",
        hint: "Consider what’s safe to do with unknown emails.",
        difficulty: "easy"
    },
    {
        question: "What is a strong password?",
        options: ["Your name", "123456", "A mix of letters, numbers, and symbols", "Your birthdate"],
        answer: 2,
        explanation: "A strong password includes a mix of uppercase, lowercase, numbers, and symbols, and is at least 12 characters long.",
        category: "Passwords",
        hint: "It’s not something easily guessed.",
        difficulty: "medium"
    },
    {
        question: "What does HTTPS mean in a website URL?",
        options: ["Hyper Transfer Protocol Secure", "High Tech Protocol System", "Hyperlink Text Processing Standard", "Home Transfer Protocol Secure"],
        answer: 0,
        explanation: "HTTPS stands for HyperText Transfer Protocol Secure, indicating the website encrypts data for security.",
        category: "Web Security",
        hint: "Look at the 'S' in HTTPS.",
        difficulty: "medium"
    },
    {
        question: "Why is it important to update software regularly?",
        options: ["To get new features only", "To fix security vulnerabilities", "To change the interface", "To slow down your device"],
        answer: 1,
        explanation: "Software updates often include patches for security vulnerabilities, keeping your system safe.",
        category: "Software Security",
        hint: "Think about protecting your system.",
        difficulty: "medium"
    },
    {
        question: "What is two-factor authentication (2FA)?",
        options: ["Using two passwords", "A method requiring two forms of identification", "A type of firewall", "A backup system"],
        answer: 1,
        explanation: "2FA requires two forms of identification, like a password and a code sent to your phone, for added security.",
        category: "Authentication",
        hint: "It involves more than just a password.",
        difficulty: "hard"
    },
    {
        question: "What is malware?",
        options: ["A type of hardware", "Malicious software designed to harm devices", "A secure email system", "A type of antivirus"],
        answer: 1,
        explanation: "Malware is malicious software designed to damage, disrupt, or gain unauthorized access to systems.",
        category: "Malware",
        hint: "It’s something harmful to your device.",
        difficulty: "easy"
    },
    {
        question: "What should you do before sharing personal information online?",
        options: ["Verify the website's legitimacy", "Share it immediately", "Post it on social media", "Send it via email"],
        answer: 0,
        explanation: "Always verify the website’s legitimacy (e.g., check for HTTPS and reviews) before sharing personal information.",
        category: "Web Security",
        hint: "Check if the website is trustworthy.",
        difficulty: "medium"
    },
    {
        question: "What is a firewall?",
        options: ["A physical wall for servers", "A security system to monitor network traffic", "A type of virus", "A backup tool"],
        answer: 1,
        explanation: "A firewall is a security system that monitors and controls incoming and outgoing network traffic.",
        category: "Network Security",
        hint: "It protects your network.",
        difficulty: "hard"
    },
    {
        question: "What is the best way to avoid ransomware?",
        options: ["Pay the ransom", "Regularly back up your data", "Open all email attachments", "Use outdated software"],
        answer: 1,
        explanation: "Regularly backing up data ensures you can recover files without paying a ransom if attacked.",
        category: "Malware",
        hint: "Think about protecting your files.",
        difficulty: "hard"
    }
];

// Shuffle array function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Animate score function
function animateScore(from, to, element) {
    let current = from;
    const step = (to - from) / 20;
    const interval = setInterval(() => {
        current += step;
        element.textContent = Math.round(current);
        if (Math.abs(current - to) < 1) {
            element.textContent = to;
            clearInterval(interval);
        }
    }, 50);
}

// Index.html logic
if (window.location.pathname.includes("index.html")) {
    const leaderboardList = document.getElementById("leaderboard-list");
    const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    leaderboardList.innerHTML = highScores.map(score => `<li>${score.name}: ${score.score}</li>`).join("");
    if (localStorage.getItem("quizState")) {
        document.getElementById("resume").style.display = "block";
    }

    window.startQuiz = function(difficulty) {
        localStorage.setItem("difficulty", difficulty);
        localStorage.removeItem("quizState"); // Reset progress for new quiz
        window.location.href = "quiz.html";
    };

    window.resumeQuiz = function() {
        window.location.href = "quiz.html?resume=true";
    };
}

// Quiz logic for quiz.html
if (window.location.pathname.includes("quiz.html")) {
    let currentQuestion, score, userAnswers, shuffledQuestions;
    const totalQuestions = questions.length;
    let timer;
    let timeLimit;
    let hintUsed = false;

    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const feedbackElement = document.getElementById("feedback");
    const nextButton = document.getElementById("next-btn");
    const scoreElement = document.getElementById("score");
    const progressElement = document.getElementById("progress");
    const timerText = document.getElementById("timer-text");
    const timerProgress = document.getElementById("timer-progress");
    const hintElement = document.getElementById("hint");
    const hintButton = document.getElementById("hint-btn");
    const soundToggle = document.getElementById("sound");

    const correctSound = new Audio("sounds/correct.mp3");
    const incorrectSound = new Audio("sounds/incorrect.mp3");
    correctSound.volume = 0.5;
    incorrectSound.volume = 0.5;

    // Load sound preference
    soundToggle.checked = localStorage.getItem("soundEnabled") !== "false";
    soundToggle.addEventListener("change", () => {
        localStorage.setItem("soundEnabled", soundToggle.checked);
    });

    // Load or initialize quiz state
    let quizState = null;
    if (window.location.search.includes("resume=true") && localStorage.getItem("quizState")) {
        quizState = JSON.parse(localStorage.getItem("quizState"));
        currentQuestion = quizState.currentQuestion;
        score = quizState.score;
        userAnswers = quizState.userAnswers;
        shuffledQuestions = quizState.shuffledQuestions;
        const difficulty = localStorage.getItem("difficulty") || "medium";
        switch (difficulty) {
            case "easy": timeLimit = 45; break;
            case "medium": timeLimit = 30; break;
            case "hard": timeLimit = 20; break;
        }
    } else {
        currentQuestion = 0;
        score = 0;
        userAnswers = [];
        const difficulty = localStorage.getItem("difficulty") || "medium";
        switch (difficulty) {
            case "easy": timeLimit = 45; break;
            case "medium": timeLimit = 30; break;
            case "hard": timeLimit = 20; break;
        }
        shuffledQuestions = shuffle([...questions].filter(q => q.difficulty === difficulty || difficulty === "medium"));
        if (shuffledQuestions.length === 0) shuffledQuestions = shuffle([...questions]);
    }
    scoreElement.textContent = score;

    function startTimer() {
        let timeLeft = timeLimit;
        timerText.textContent = timeLeft;
        timerProgress.style.width = "100%";
        timerProgress.style.transition = `width ${timeLimit}s linear`;
        timerProgress.style.width = "0%";
        timer = setInterval(() => {
            timeLeft--;
            timerText.textContent = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                selectOption(-1, shuffledQuestions[currentQuestion].answer);
            }
        }, 1000);
    }

    function loadQuestion() {
        const q = shuffledQuestions[currentQuestion];
        questionElement.textContent = q.question;
        const optionsWithIndices = q.options.map((option, index) => ({ option, index }));
        shuffle(optionsWithIndices);
        const shuffledOptions = optionsWithIndices.map(item => item.option);
        const correctAnswerIndex = optionsWithIndices.findIndex(item => item.index === q.answer);
        optionsElement.innerHTML = "";
        shuffledOptions.forEach((option, index) => {
            const div = document.createElement("div");
            div.classList.add("option");
            div.textContent = option;
            div.tabIndex = 0;
            div.addEventListener("click", () => selectOption(index, correctAnswerIndex));
            div.addEventListener("keydown", (e) => {
                if (e.key === "Enter") selectOption(index, correctAnswerIndex);
            });
            optionsElement.appendChild(div);
        });
        feedbackElement.textContent = "";
        hintElement.textContent = "";
        hintButton.disabled = false;
        hintUsed = false;
        nextButton.disabled = true;
        updateProgress();
        clearInterval(timer);
        startTimer();
        hintButton.onclick = () => {
            if (!hintUsed) {
                hintElement.textContent = `Hint: ${q.hint}`;
                const oldScore = score;
                score = Math.max(0, score - 2);
                animateScore(oldScore, score, scoreElement);
                hintUsed = true;
                hintButton.disabled = true;
            }
        };
    }

    function selectOption(index, correctAnswerIndex) {
        clearInterval(timer);
        timerProgress.style.transition = "none";
        const q = shuffledQuestions[currentQuestion];
        const options = document.querySelectorAll(".option");
        options.forEach((opt, i) => {
            opt.classList.remove("selected");
            if (i === index) opt.classList.add("selected");
        });
        userAnswers[currentQuestion] = index;
        const oldScore = score;
        if (index === correctAnswerIndex) {
            score += 10;
            animateScore(oldScore, score, scoreElement);
            feedbackElement.textContent = `Correct! ${q.explanation}`;
            feedbackElement.classList.add("correct");
            if (soundToggle.checked) {
                correctSound.play().catch(error => console.log("Error playing correct sound:", error));
            }
        } else {
            feedbackElement.textContent = `Incorrect. ${q.explanation}`;
            feedbackElement.classList.add("incorrect");
            if (soundToggle.checked) {
                incorrectSound.play().catch(error => console.log("Error playing incorrect sound:", error));
            }
        }
        nextButton.disabled = false;
        options.forEach(opt => {
            opt.style.pointerEvents = "none";
            opt.tabIndex = -1;
        });
        saveState();
    }

    function updateProgress() {
        const progress = ((currentQuestion + 1) / totalQuestions) * 100;
        progressElement.style.width = `${progress}%`;
    }

    function saveState() {
        const state = {
            currentQuestion,
            score,
            userAnswers,
            shuffledQuestions
        };
        localStorage.setItem("quizState", JSON.stringify(state));
    }

    nextButton.addEventListener("click", () => {
        currentQuestion++;
        if (currentQuestion < totalQuestions) {
            loadQuestion();
            saveState();
        } else {
            localStorage.removeItem("quizState");
            localStorage.setItem("finalScore", score);
            localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
            window.location.href = "results.html";
        }
    });

    loadQuestion();
}

// Results logic for results.html
if (window.location.pathname.includes("results.html")) {
    const finalScore = parseInt(localStorage.getItem("finalScore")) || 0;
    document.getElementById("final-score").textContent = finalScore;
    const messageElement = document.getElementById("result-message");
    if (finalScore >= 80) {
        messageElement.textContent = "Excellent! You're a cybersecurity pro!";
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else if (finalScore >= 50) {
        messageElement.textContent = "Good job! Keep learning to stay safe online.";
    } else {
        messageElement.textContent = "You might need a refresher. Try again to improve!";
    }

    // Save to leaderboard
    const playerName = prompt("Enter your name for the leaderboard:", "Player") || "Anonymous";
    const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
    highScores.push({ name: playerName, score: finalScore });
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(5);
    localStorage.setItem("highScores", JSON.stringify(highScores));

    // Social sharing
    window.shareScore = function() {
        const score = localStorage.getItem("finalScore") || 0;
        const text = `I scored ${score}/100 on the Cybersecurity Awareness Quiz! Test your knowledge at this fun and educational quiz!`;
        const url = window.location.origin;
        if (navigator.share) {
            navigator.share({
                title: "Cybersecurity Quiz",
                text: text,
                url: url
            }).catch(error => console.log("Error sharing:", error));
        } else {
            const shareText = `${text} ${url}`;
            navigator.clipboard.writeText(shareText).then(() => {
                alert("Score copied to clipboard: " + shareText);
            }).catch(error => console.log("Error copying:", error));
        }
    };
}

// Statistics logic for statistics.html
if (window.location.pathname.includes("statistics.html")) {
    const finalScore = parseInt(localStorage.getItem("finalScore")) || 0;
    const userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || [];
    const totalQuestions = questions.length;
    const correctAnswers = userAnswers.filter((answer, index) => answer === questions[index].answer).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const percentageScore = ((finalScore / (totalQuestions * 10)) * 100).toFixed(2);

    // Display summary stats
    document.getElementById("total-questions").textContent = totalQuestions;
    document.getElementById("correct-answers").textContent = correctAnswers;
    document.getElementById("incorrect-answers").textContent = incorrectAnswers;
    document.getElementById("percentage-score").textContent = percentageScore;

    // Category stats
    const categoryScores = {};
    questions.forEach((q, index) => {
        if (!categoryScores[q.category]) {
            categoryScores[q.category] = { correct: 0, total: 0 };
        }
        categoryScores[q.category].total++;
        if (userAnswers[index] === q.answer) {
            categoryScores[q.category].correct++;
        }
    });
    const statsElement = document.querySelector(".stats");
    Object.keys(categoryScores).forEach(category => {
        const { correct, total } = categoryScores[category];
        const p = document.createElement("p");
        p.innerHTML = `${category}: ${correct}/${total} correct (${((correct / total) * 100).toFixed(2)}%)`;
        statsElement.appendChild(p);
    });

    // Display question breakdown
    const breakdownElement = document.getElementById("question-breakdown");
    questions.forEach((q, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === q.answer;
        const div = document.createElement("div");
        div.classList.add("breakdown-item", isCorrect ? "correct" : "incorrect");
        div.innerHTML = `
            <p><strong>Question ${index + 1}:</strong> ${q.question}</p>
            <p><strong>Your Answer:</strong> ${userAnswer !== undefined ? q.options[userAnswer] : "Not answered"}</p>
            <p><strong>Correct Answer:</strong> ${q.options[q.answer]}</p>
            <p><strong>Explanation:</strong> ${q.explanation}</p>
        `;
        breakdownElement.appendChild(div);
    });

    // Feedback form
    window.submitFeedback = function() {
        const rating = document.querySelector(".star-rating input:checked")?.value || 0;
        const comments = document.getElementById("comments").value;
        if (rating || comments) {
            const feedback = { rating, comments, timestamp: new Date().toISOString() };
            const feedbacks = JSON.parse(localStorage.getItem("feedbacks")) || [];
            feedbacks.push(feedback);
            localStorage.setItem("feedbacks", JSON.stringify(feedbacks));
            document.getElementById("feedback-message").textContent = "Thank you for your feedback!";
            document.getElementById("feedback-message").style.display = "block";
            document.querySelector(".feedback-form button").disabled = true;
        } else {
            alert("Please provide a rating or comment.");
        }
    };
}