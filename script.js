import {
    getFirestore,
    doc,
    setDoc,
    collection,
    onSnapshot,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyDKmUOtIFdugOxRDj3P38ZDwHLaenoqgpU",
    authDomain: "ydp-leaders-game.firebaseapp.com",
    projectId: "ydp-leaders-game",
    storageBucket: "ydp-leaders-game.firebasestorage.app",
    messagingSenderId: "749753350941",
    appId: "1:749753350941:web:fea92e74a209cd6f3d7ff4",
    measurementId: "G-C7P01D4T99"
};


const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

/* =========================================
   YDP LEADERS GAME
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   GAME DATA
========================================= */

const ADMIN_CODE = "BYS20M";
const PLAYER_CODE = "MEM201";

let currentUser = null;
let currentLevel = null;
let currentQuestionIndex = 0;
let currentScore = 0;
let selectedLevel = null;


/*
   Default level state.
   Level 1 is open at the beginning.
*/let levelState = {
    1: true,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false,
    8: false,
    9: false,
    10: false
};

/*
   Questions saved by the control panel.
*/
let questionsData = {};
function listenToQuestions() {

    const questionsRef =
        collection(db, "questions");

    onSnapshot(
        questionsRef,
        (snapshot) => {

            snapshot.forEach((docSnap) => {

                const data =
                    docSnap.data();

                const levelNumber =
                    Number(
                        docSnap.id.replace(
                            "level",
                            ""
                        )
                    );

                if (
                    !isNaN(levelNumber) &&
                    levelNumber >= 1 &&
                    levelNumber <= 10
                ) {

                    questionsData[levelNumber] =
                        data.questions || [];

                }

            });

            createDefaultQuestions();

            console.log(
                "Questions synced with Firebase ✅"
            );

        },
        (error) => {

            console.error(
                "Error listening to questions:",
                error
            );

            showToast(
                "Error loading questions"
            );

        }
    );

}
/* =========================================
   DEFAULT QUESTIONS
========================================= */

function createDefaultQuestions() {

    let changed = false;

    for (let level = 1; level <= 10; level++) {

        if (!questionsData[level]) {

            questionsData[level] = [
                {
                    question: `Welcome to Level ${level}!`,
                    answers: [
                        "Answer A",
                        "Answer B",
                        "Answer C",
                        "Answer D"
                    ],
                    correct: 0
                }
            ];

            changed = true;
        }
    }

    if (changed) {
        saveQuestions();
    }
}

/* =========================================
   SAVE DATA
========================================= */

async function saveLevelState() {

    try {

        await setDoc(
            doc(db, "game", "settings"),
            {
                levelState: levelState
            },
            {
                merge: true
            }
        );

        console.log("Level state saved to Firebase ✅");

    } catch (error) {

        console.error(
            "Error saving level state:",
            error
        );

        showToast("Error saving level state");

    }

}

function listenToLevelState() {

    const settingsRef =
        doc(db, "game", "settings");

    onSnapshot(
        settingsRef,
        async (snapshot) => {

            if (snapshot.exists()) {

                const data = snapshot.data();

                if (data.levelState) {

                    levelState = {
                        ...levelState,
                        ...data.levelState
                    };

                }

            } else {

                // أول مرة فقط
                await saveLevelState();

            }

            console.log(
                "Level state synced with Firebase ✅"
            );

            // لو اللاعب على الـMap نحدثها فورًا
            if (
                screens.map &&
                !screens.map.classList.contains("hidden")
            ) {

                setupMap();

            }

        },
        (error) => {

            console.error(
                "Error listening to level state:",
                error
            );

        }
    );

}


async function saveQuestions() {

    try {

        for (const level in questionsData) {

            await setDoc(
                doc(db, "questions", `level${level}`),
                {
                    questions: questionsData[level]
                }
            );

        }

        console.log("Questions saved to Firebase ✅");

    } catch (error) {

        console.error(
            "Error saving questions:",
            error
        );

        showToast("Error saving questions");

    }
    }

/* =========================================
   SCREEN MANAGEMENT
========================================= */

const screens = {

    splash: document.getElementById("splashScreen"),
    login: document.getElementById("loginScreen"),
    map: document.getElementById("mapScreen"),
    control: document.getElementById("controlScreen"),
    editor: document.getElementById("editorScreen"),
    name: document.getElementById("nameScreen"),
    question: document.getElementById("questionScreen"),
    result: document.getElementById("resultScreen")

};


function showScreen(screen) {

    Object.values(screens).forEach(item => {

        if (item) {
            item.classList.add("hidden");
        }

    });

    if (screen) {
        screen.classList.remove("hidden");
    }

}


/* =========================================
   TOAST
========================================= */

const toast = document.getElementById("toast");


function showToast(message, duration = 2500) {

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);

}


/* =========================================
   SPLASH SCREEN
========================================= */

const startBtn =
    document.getElementById("startBtn");


startBtn.addEventListener("click", () => {

    startBackgroundMusic();

    showScreen(screens.login);

});


/* =========================================
   BACKGROUND MUSIC
========================================= */

const backgroundMusic =
    document.getElementById("backgroundMusic");

const musicBtn =
    document.getElementById("musicBtn");

let musicEnabled = true;


function startBackgroundMusic() {

    if (!musicEnabled) return;

    backgroundMusic.volume = 0.5;

    backgroundMusic.play()
        .then(() => {

            musicBtn.textContent = "🔊";

        })
        .catch(error => {

            console.log(
                "Music could not start:",
                error
            );

        });

}


musicBtn.addEventListener(
    "click",
    () => {

        if (backgroundMusic.paused) {

            musicEnabled = true;

            backgroundMusic.play();

            musicBtn.textContent = "🔊";

            musicBtn.classList.remove("muted");

        } else {

            musicEnabled = false;

            backgroundMusic.pause();

            musicBtn.textContent = "🔇";

            musicBtn.classList.add("muted");

        }

    }
);

/* =========================================
   LOGIN
========================================= */

const loginBtn =
    document.getElementById("loginBtn");

const accessCode =
    document.getElementById("accessCode");

const loginError =
    document.getElementById("loginError");


function login() {

    const code =
        accessCode.value
            .trim()
            .toUpperCase();


    loginError.textContent = "";


    if (!code) {

        loginError.textContent =
            "Please enter your code.";

        return;
    }


    /*
       ADMIN
    */

    if (code === ADMIN_CODE) {

        currentUser = "admin";

        showScreen(screens.map);

        setupMap();

        document
            .getElementById("controlBtn")
            .classList.remove("hidden");

        showToast("Welcome to Game Control!");

        return;
    }


    /*
       PLAYER
    */

    if (code === PLAYER_CODE) {

        currentUser = "player";

        showScreen(screens.map);

        setupMap();

        document
            .getElementById("controlBtn")
            .classList.add("hidden");

        return;
    }


    loginError.textContent =
        "Invalid code. Please try again.";

}


loginBtn.addEventListener(
    "click",
    login
);


accessCode.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            login();
        }

    }
);


/* =========================================
   MAP
========================================= */

const levelsContainer =
    document.getElementById("levelsContainer");

const penguin =
    document.getElementById("penguin");


/*
   Positions are percentages.
   They can be adjusted later to match
   the exact stones in map.jpg.
*/

const levelPositions = {

    1: { left: 75, top: 82 },
    2: { left: 63, top: 72 },
    3: { left: 48, top: 78 },
    4: { left: 34, top: 66 },
    5: { left: 47, top: 53 },
    6: { left: 62, top: 45 },
    7: { left: 48, top: 35 },
    8: { left: 34, top: 28 },
    9: { left: 52, top: 18 },
    10: { left: 70, top: 10 }

};


function setupMap() {

    levelsContainer.innerHTML = "";


    for (let level = 1; level <= 10; level++) {

        const stone =
            document.createElement("button");


        stone.className =
            "level-stone";


        stone.dataset.level =
            level;


        stone.textContent =
            level;


        stone.style.left =
            `${levelPositions[level].left}%`;


        stone.style.top =
            `${levelPositions[level].top}%`;


        if (levelState[level]) {

            stone.classList.add("open");

        } else {

            stone.classList.add("locked");

        }


        stone.addEventListener(
            "click",
            () => selectLevel(level)
        );


        levelsContainer.appendChild(stone);

    }


    /*
       Penguin starts at Level 10
       and jumps toward Level 1.
    */

    movePenguin(10);

    setTimeout(() => {
        movePenguin(9);
    }, 400);

    setTimeout(() => {
        movePenguin(8);
    }, 800);

    setTimeout(() => {
        movePenguin(7);
    }, 1200);

    setTimeout(() => {
        movePenguin(6);
    }, 1600);

    setTimeout(() => {
        movePenguin(5);
    }, 2000);

    setTimeout(() => {
        movePenguin(4);
    }, 2400);

    setTimeout(() => {
        movePenguin(3);
    }, 2800);

    setTimeout(() => {
        movePenguin(2);
    }, 3200);

    setTimeout(() => {
        movePenguin(1);
    }, 3600);

}


function movePenguin(level) {

    const position =
        levelPositions[level];


    if (!position) return;


    penguin.style.left =
        `${position.left + 3}%`;


    penguin.style.top =
        `${position.top - 5}%`;

}


/* =========================================
   SELECT LEVEL
========================================= */

function selectLevel(level) {

    selectedLevel = level;


    /*
       Locked level
    */

    if (!levelState[level]) {

        showLockedModal();

        return;
    }


    /*
       Admin
    */

    if (currentUser === "admin") {

        openLevelEditor(level);

        return;
    }


    /*
       Player
    */

    if (currentUser === "player") {

        openNameScreen(level);

    }

}


/* =========================================
   LOCKED LEVEL MODAL
========================================= */

const lockedModal =
    document.getElementById("lockedModal");

const closeLockedBtn =
    document.getElementById("closeLockedBtn");


function showLockedModal() {

    lockedModal.classList.remove("hidden");

}


function closeLockedModal() {

    lockedModal.classList.add("hidden");

}


closeLockedBtn.addEventListener(
    "click",
    closeLockedModal
);


/* =========================================
   CONTROL PANEL
========================================= */

const controlBtn =
    document.getElementById("controlBtn");

const controlBackBtn =
    document.getElementById("controlBackBtn");


controlBtn.addEventListener(
    "click",
    () => {

        showScreen(screens.control);

        setupLevelControls();

    }
);


controlBackBtn.addEventListener(
    "click",
    () => {

        showScreen(screens.map);

        setupMap();

    }
);


/* =========================================
   LEVEL CONTROL BUTTONS
========================================= */

function setupLevelControls() {

    const container =
        document.getElementById("levelControls");


    container.innerHTML = "";


    for (let level = 1; level <= 10; level++) {

        const button =
            document.createElement("button");


        button.className =
            "level-control-btn";


        button.textContent =
            `Level ${level}`;


        if (levelState[level]) {
            button.classList.add("open");
        }


        button.addEventListener(
            "click",
            () => toggleLevel(level, button)
        );


        container.appendChild(button);

    }

}


async function toggleLevel(level, button) {

    levelState[level] =
        !levelState[level];


    if (levelState[level]) {

        button.classList.add("open");

        showToast(
            `Level ${level} is now OPEN`
        );

    } else {

        button.classList.remove("open");

        showToast(
            `Level ${level} is now LOCKED`
        );

    }


    await saveLevelState();

}


/* =========================================
   OPEN LEVEL EDITOR
========================================= */

const openEditorBtn =
    document.getElementById("openEditorBtn");


openEditorBtn.addEventListener(
    "click",
    () => {

        const levelInput =
            document.getElementById("levelNumber");

        const countInput =
            document.getElementById("questionCount");


        const level =
            Number(levelInput.value);

        const count =
            Number(countInput.value);


        if (
            level < 1 ||
            level > 10 ||
            !level
        ) {

            showToast(
                "Please enter a level from 1 to 10."
            );

            return;
        }


        if (
            !count ||
            count < 1 ||
            count > 50
        ) {

            showToast(
                "Please enter between 1 and 50 questions."
            );

            return;
        }


        selectedLevel = level;


        prepareQuestions(
            level,
            count
        );


        openLevelEditor(level);

    }
);


/* =========================================
   PREPARE QUESTIONS
========================================= */

function prepareQuestions(level, count) {

    if (!questionsData[level]) {
        questionsData[level] = [];
    }


    while (
        questionsData[level].length < count
    ) {

        questionsData[level].push({

            question: "",
            answers: [
                "",
                "",
                "",
                ""
            ],
            correct: 0

        });

    }


    if (
        questionsData[level].length > count
    ) {

        questionsData[level] =
            questionsData[level].slice(
                0,
                count
            );

    }


    saveQuestions();

}


/* =========================================
   EDITOR
========================================= */

function openLevelEditor(level) {
    selectedLevel = level;

    document.getElementById("editorLevelTitle").textContent = `Level ${level}`;

    renderQuestionEditor(level);

    showScreen(screens.editor);
}


function renderQuestionEditor(level) {
    const container = document.getElementById("questionsEditor");
    container.innerHTML = "";

    const questions = questionsData[level] || [];

    questions.forEach((question, index) => {
        const card = document.createElement("div");
        card.className = "question-edit-card";

        // نضمن إعطاء name فريد لكل مجموعة Radio بناءً على رقم السؤال (index)
        card.innerHTML = `
            <h3>Question ${index + 1}</h3>

            <textarea
                class="edit-question"
                placeholder="Write the question..."
            >${escapeHTML(question.question)}</textarea>

            ${question.answers.map((answer, answerIndex) => `
                <div class="answer-edit ${question.correct === answerIndex ? 'correct-selected' : ''}">
                    <input
                        type="radio"
                        name="correct-q-${index}"
                        value="${answerIndex}"
                        ${question.correct === answerIndex ? "checked" : ""}
                    >
                    <input
                        type="text"
                        class="edit-answer"
                        data-answer="${answerIndex}"
                        placeholder="Answer ${answerIndex + 1}"
                        value="${escapeAttribute(answer)}"
                    >
                </div>
            `).join("")}
        `;

        container.appendChild(card);
    });

    updateCorrectAnswerStyles();
}


/* =========================================
   CORRECT ANSWER VISUAL SELECTION
========================================= */

function updateCorrectAnswerStyles() {

    const cards =
        document.querySelectorAll(
            ".question-edit-card"
        );


    cards.forEach(card => {

        const answerRows =
            card.querySelectorAll(
                ".answer-edit"
            );


        answerRows.forEach(row => {

            const radio =
                row.querySelector(
                    'input[type="radio"]'
                );


            if (radio.checked) {

                row.classList.add(
                    "correct-selected"
                );

            } else {

                row.classList.remove(
                    "correct-selected"
                );

            }

        });

    });

}


/*
   When the admin chooses another answer,
   immediately move the green highlight to it.
*/

document.addEventListener(
    "change",
    event => {

        if (
            event.target.matches(
                '.question-edit-card input[type="radio"]'
            )
        ) {

            const card =
                event.target.closest(
                    ".question-edit-card"
                );


            const answerRows =
                card.querySelectorAll(
                    ".answer-edit"
                );


            answerRows.forEach(row => {

                row.classList.remove(
                    "correct-selected"
                );

            });


            const selectedRow =
                event.target.closest(
                    ".answer-edit"
                );


            if (selectedRow) {

                selectedRow.classList.add(
                    "correct-selected"
                );

            }

        }

    }
);


/* =========================================
   SAVE QUESTIONS
========================================= */

const saveQuestionsBtn = document.getElementById("saveQuestionsBtn");

saveQuestionsBtn.addEventListener("click", saveEditedQuestions);


function saveEditedQuestions() {
    const level = selectedLevel;
    const cards = document.querySelectorAll(".question-edit-card");
    const questions = [];

    cards.forEach((card, index) => {
        const question = card.querySelector(".edit-question").value.trim();

        const answerInputs = card.querySelectorAll(".edit-answer");
        const answers = Array.from(answerInputs).map(input => input.value.trim());

        // نحدد زر الـ Radio المحدد بناءً على اسم المجموعة الخاص بالبطاقة الحالية
        const correctInput = card.querySelector(`input[name="correct-q-${index}"]:checked`);

        // إذا تم تحديد زر، نأخذ قيمته الرقمية (0 لـ A، 1 لـ B، 2 لـ C، 3 لـ D)
        const correct = correctInput ? Number(correctInput.value) : 0;

        questions.push({
            question,
            answers,
            correct
        });
    });

    questionsData[level] = questions;

    saveQuestions();

    showToast(`Level ${level} questions saved!`);
}



/* =========================================
   EDITOR NAVIGATION
========================================= */

document.getElementById(
    "editorBackBtn"
).addEventListener(
    "click",
    () => {

        showScreen(screens.control);

        setupLevelControls();

    }
);


document.getElementById(
    "doneEditorBtn"
).addEventListener(
    "click",
    () => {

        saveEditedQuestions();

        showScreen(screens.map);

        setupMap();

    }
);


/* =========================================
   PLAYER NAME
========================================= */

function openNameScreen(level) {

    selectedLevel =
        level;


    document.getElementById(
        "playerName"
    ).value = "";


    document.getElementById(
        "nameError"
    ).textContent = "";


    showScreen(screens.name);

}


document.getElementById(
    "nameContinueBtn"
).addEventListener(
    "click",
    startPlayerGame
);


document.getElementById(
    "playerName"
).addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {
            startPlayerGame();
        }

    }
);


function startPlayerGame() {

    const name =
        document.getElementById(
            "playerName"
        ).value.trim();


    const error =
        document.getElementById(
            "nameError"
        );


    /*
       Simple full-name validation.
       Arabic and English are both allowed.
    */

    const words =
        name.split(/\s+/);


    if (
        !name ||
        words.length < 3
    ) {

        error.textContent =
            "Please enter your full name (3 names).";

        return;
    }


    currentUser = {

        type: "player",
        name: name,
        code: PLAYER_CODE

    };


    currentLevel =
        selectedLevel;


    currentQuestionIndex = 0;

    currentScore = 0;


    startQuestions();

}


/* =========================================
   START QUESTIONS
========================================= */

function startQuestions() {

    let questions =
        questionsData[currentLevel];


    /*
       If no questions exist,
       create a default one.
    */

    if (
        !questions ||
        questions.length === 0
    ) {

        questions = [

            {
                question:
                    "No questions have been added yet.",

                answers: [
                    "OK",
                    "Continue",
                    "Back",
                    "None"
                ],

                correct: 0
            }

        ];

        questionsData[currentLevel] =
            questions;

    }


    currentQuestionIndex = 0;

    currentScore = 0;


    showScreen(
        screens.question
    );


    renderCurrentQuestion();

}


/* =========================================
   RENDER QUESTION
========================================= */

function renderCurrentQuestion() {

    const questions =
        questionsData[currentLevel];


    const question =
        questions[currentQuestionIndex];


    document.getElementById(
        "questionNumber"
    ).textContent =
        currentQuestionIndex + 1;


    document.getElementById(
        "totalQuestions"
    ).textContent =
        questions.length;


    document.getElementById(
        "currentScore"
    ).textContent =
        currentScore;


    document.getElementById(
        "questionText"
    ).textContent =
        question.question ||
        "Question";


    const progress =
        (
            currentQuestionIndex /
            questions.length
        ) * 100;


    document.getElementById(
        "progressBar"
    ).style.width =
        `${progress}%`;


    const container =
        document.getElementById(
            "answersContainer"
        );


    container.innerHTML = "";


    question.answers.forEach(
        (answer, index) => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "answer-btn";


            button.textContent =
                answer ||
                `Answer ${index + 1}`;


            button.addEventListener(
                "click",
                () => answerQuestion(
                    index,
                    question.correct,
                    button
                )
            );


            container.appendChild(
                button
            );

        }
    );


    document.getElementById(
        "nextQuestionBtn"
    ).style.display =
        "none";

}


/* =========================================
   ANSWER QUESTION
========================================= */

let questionAnswered = false;


function answerQuestion(
    selectedAnswer,
    correctAnswer,
    clickedButton
) {

    if (questionAnswered) {
        return;
    }


    questionAnswered = true;


    const buttons =
        document.querySelectorAll(
            ".answer-btn"
        );


    buttons.forEach(
        button => {
            button.disabled = true;
        }
    );


    const isCorrect =
        selectedAnswer === correctAnswer;


    if (isCorrect) {

        clickedButton.classList.add(
            "correct"
        );


        currentScore += 10;


        showToast("+10 points! 🎉");


    } else {

        clickedButton.classList.add(
            "wrong"
        );


        currentScore -= 1;


        /*
           Show correct answer
        */

        buttons[
            correctAnswer
        ].classList.add(
            "correct"
        );


        showToast("-1 point");

    }


    document.getElementById(
        "currentScore"
    ).textContent =
        currentScore;


    document.getElementById(
        "nextQuestionBtn"
    ).style.display =
        "block";


    /*
       Update progress.
    */

    const questions =
        questionsData[currentLevel];


    const progress =
        (
            (currentQuestionIndex + 1) /
            questions.length
        ) * 100;


    document.getElementById(
        "progressBar"
    ).style.width =
        `${progress}%`;

}


/* =========================================
   NEXT QUESTION
========================================= */

document.getElementById(
    "nextQuestionBtn"
).addEventListener(
    "click",
    () => {

        const questions =
            questionsData[currentLevel];


        currentQuestionIndex++;


        if (
            currentQuestionIndex >=
            questions.length
        ) {

            finishLevel();

            return;

        }


        questionAnswered = false;

        renderCurrentQuestion();

    }
);


/* =========================================
   FINISH LEVEL
========================================= */

function finishLevel() {

    document.getElementById(
        "finalScore"
    ).textContent =
        currentScore;


    document.getElementById(
        "resultLevel"
    ).textContent =
        `Level ${currentLevel}`;


    showScreen(
        screens.result
    );


    savePlayerResult();

}


/* =========================================
   SAVE PLAYER RESULT
========================================= */

async function savePlayerResult() {

    if (
        !currentUser ||
        currentUser.type !== "player"
    ) {

        return;

    }


    try {

        await addDoc(
            collection(db, "results"),
            {

                name: currentUser.name,

                code: currentUser.code,

                level: currentLevel,

                score: currentScore,

                date: serverTimestamp()

            }
        );


        console.log(
            "Player result saved to Firebase ✅"
        );


    } catch (error) {

        console.error(
            "Error saving player result:",
            error
        );

        showToast(
            "Error saving result"
        );

    }

}


/* =========================================
   BACK TO MAP
========================================= */

document.getElementById(
    "resultMapBtn"
).addEventListener(
    "click",
    () => {

        showScreen(
            screens.map
        );

        setupMap();

    }
);


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(text) {

    return String(text)
        .replaceAll("&", "&amp;")
        .replaceAll('"', "&quot;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;");

}


/* =========================================
   BASIC COPY PROTECTION
========================================= */

document.addEventListener(
    "contextmenu",
    event => {

        event.preventDefault();

    }
);


document.addEventListener(
    "copy",
    event => {

        event.preventDefault();

        showToast(
            "Copying is disabled."
        );

    }
);


document.addEventListener(
    "cut",
    event => {

        event.preventDefault();

    }
);


document.addEventListener(
    "selectstart",
    event => {

        /*
           Don't block selection inside inputs.
        */

        if (
            event.target.tagName !== "INPUT" &&
            event.target.tagName !== "TEXTAREA"
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================
   INITIALIZATION
========================================= */

function initializeGame() {

    // تشغيل المزامنة مع Firebase
    listenToQuestions();

    listenToLevelState();


    // Level 1 مفتوح افتراضيًا
    if (
        typeof levelState[1] === "undefined"
    ) {

        levelState[1] = true;

    }


    showScreen(
        screens.splash
    );


    console.log(
        "YDP Leaders Game loaded successfully 🚀"
    );

}

initializeGame();
