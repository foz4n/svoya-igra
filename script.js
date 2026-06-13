
let gameData;
let currentQuestion;
let currentCell = null;

let scores = { 1: 0, 2: 0 };

let usedQuestions = [];

const savedUsedQuestions =
    localStorage.getItem("svoya_igra_used");

if (savedUsedQuestions) {
    usedQuestions = JSON.parse(savedUsedQuestions);
}

/* LOAD */
fetch("questions.json")
    .then(r => r.json())
    .then(data => {
        gameData = data;
        buildBoard();
        updateScore();
    });

/* BOARD */
function buildBoard() {

    const c = document.getElementById("categories-column");
    const g = document.getElementById("questions-grid");

    c.innerHTML = "";
    g.innerHTML = "";

    gameData.categories.forEach(cat => {

        const category = document.createElement("div");

        category.className = "category";
        category.textContent = cat.name;

        c.appendChild(category);

        cat.questions.forEach(q => {

            const cell = document.createElement("div");

            cell.className = "question";
            cell.textContent = q.value;

            // сохраняем категорию внутри вопроса
            q.category = cat.name;

            const questionId =
                q.category + "_" + q.value;

            // если вопрос уже был открыт ранее
            if (usedQuestions.includes(questionId)) {

                cell.classList.add("used");

            } else {

                cell.onclick = () => openQuestion(q, cell);
            }

            g.appendChild(cell);
        });
    });
}

/* OPEN QUESTION */
function openQuestion(q, cell) {

    if (cell.classList.contains("used")) return;

    currentQuestion = q;
    currentCell = cell;

    const modal = document.getElementById("question-modal");
    const answers = document.getElementById("answers-container");

    answers.innerHTML = "";

    modal.classList.add("show");

    document.getElementById("question-title").textContent =
        q.question;

    renderMultipleQuestion(q, answers);
}

function renderMultipleQuestion(q, answersContainer) {

    q.answers.forEach((answer, index) => {

        const div = document.createElement("div");

        div.className = "answer";
        div.textContent = answer;

        div.onclick = () => {

            if (
                div.classList.contains("correct") ||
                div.classList.contains("wrong")
            ) {
                return;
            }

            if (index === q.correct) {

                div.classList.add("correct");

            } else {

                div.classList.add("wrong");

                answersContainer.children[q.correct]
                    ?.classList.add("correct");
            }

            markQuestionUsed();
        };

        answersContainer.appendChild(div);
    });
}

/* SCORE */
function addScore(team, plus) {

    const value = currentQuestion.value;

    if (plus) {
        scores[team] += value;
    } else {
        scores[team] -= value;
    }

    updateScore();
}

function updateScore() {

    document.getElementById("score-1").textContent =
        "Команда 1: " + scores[1];

    document.getElementById("score-2").textContent =
        "Команда 2: " + scores[2];

    localStorage.setItem(
        "svoya_igra_scores",
        JSON.stringify(scores)
    );
}

/* CLOSE */
document.getElementById("close-question-btn").onclick = () => {

    document
        .getElementById("question-modal")
        .classList.remove("show");
};

/* FULLSCREEN */
document.getElementById("fullscreen-btn").onclick = () => {

    document.documentElement.requestFullscreen();
};

/* FINISH */
document.getElementById("finish-btn").onclick = () => {

    const res = [
        { name: "Команда 1", score: scores[1] },
        { name: "Команда 2", score: scores[2] }
    ].sort((a, b) => b.score - a.score);

    document
        .getElementById("winner-screen")
        .classList.add("show");

    document.getElementById("winner-results").innerHTML = `

        <h1 style="margin-bottom:25px;">
            🏆 Победитель: ${res[0].name}
        </h1>

        <div style="
            font-size:24px;
            line-height:1.8;
        ">
            🥇 ${res[0].name} — ${res[0].score}
            <br>
            🥈 ${res[1].name} — ${res[1].score}
        </div>
    `;
};

function markQuestionUsed() {

    if (!currentCell || !currentQuestion) return;

    currentCell.classList.add("used");
    currentCell.onclick = null;

    const questionId =
        currentQuestion.category +
        "_" +
        currentQuestion.value;

    if (!usedQuestions.includes(questionId)) {

        usedQuestions.push(questionId);

        localStorage.setItem(
            "svoya_igra_used",
            JSON.stringify(usedQuestions)
        );
    }
}

document.getElementById("close-winner-btn").onclick = () => {

    document
        .getElementById("winner-screen")
        .classList.remove("show");
};

window.addEventListener("beforeunload", (e) => {

    e.preventDefault();

    e.returnValue = "";
});
