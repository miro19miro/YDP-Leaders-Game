import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    collection,
    onSnapshot,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";

const videoIntro = document.getElementById("videoIntro");
const introVideo = document.getElementById("introVideo");

introVideo.addEventListener("ended", () => {
    videoIntro.style.opacity = "0";

    setTimeout(() => {
        videoIntro.style.display = "none";
    }, 500);
});
/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {
    apiKey: "AIzaSyDKmUOtIFdugOxRDj3P38ZDwHLaenoqgpU",
    authDomain: "ydp-leaders-game.firebaseapp.com",
    projectId: "ydp-leaders-game",
    storageBucket: "ydp-leaders-game.firebasestorage.app",
    messagingSenderId: "749753350941",
    appId: "1:749753350941:web:fea92e74a209cd6f3d7ff4",
    measurementId: "G-C7P01D4T99"
};


/* =========================================
   FIREBASE INITIALIZATION
========================================= */

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
let questionAnswered = false;


/* =========================================
   DEFAULT LEVEL STATE
========================================= */

let levelState = {
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

/* =========================================
   QUESTIONS DATA
========================================= */

let questionsData = {};


/*
   Prevents the default questions from
   being created repeatedly by onSnapshot.
*/
let questionsInitialized = false;


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

const toast =
    document.getElementById("toast");


function showToast(
    message,
    duration = 2500
) {

    if (!toast) return;


    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, duration);

}


/* =========================================
   FIREBASE - QUESTIONS
========================================= */

function listenToQuestions() {

    const questionsRef =
        collection(db, "questions");


    onSnapshot(
        questionsRef,

        async (snapshot) => {

            snapshot.forEach(docSnap => {

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
                        Array.isArray(data.questions)
                            ? data.questions
                            : [];

                }

            });


            /*
               Create default questions only
               if the collection is empty/missing levels.
            */

            if (!questionsInitialized) {

                await createDefaultQuestions();

                questionsInitialized = true;

            }


            /*
               If admin is currently editing,
               don't destroy the editor content
               while Firebase sends an update.
            */

            if (
                screens.map &&
                !screens.map.classList.contains("hidden")
            ) {

                // Nothing needed here.
                // Map does not depend on questions.

            }


            console.log(
                "Questions synced with Firebase ✅"
            );

        },

        error => {

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

async function createDefaultQuestions() {

    let changed = false;


    for (
        let level = 1;
        level <= 10;
        level++
    ) {

        if (
            !Object.prototype.hasOwnProperty.call(
                questionsData,
                level
            )
        ) {

            questionsData[level] = [

                {

                    question:
                        `Welcome to Level ${level}!`,

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

        await saveQuestions();

    }

}

/* =========================================
   SAVE QUESTIONS TO FIREBASE
========================================= */

async function saveQuestions() {

    try {

        for (
            const level in questionsData
        ) {

            await setDoc(

                doc(
                    db,
                    "questions",
                    `level${level}`
                ),

                {
                    questions:
                        questionsData[level]
                }

            );

        }


        console.log(
            "Questions saved to Firebase ✅"
        );


        return true;

    } catch (error) {

        console.error(
            "Error saving questions:",
            error
        );


        showToast(
            "Error saving questions"
        );


        return false;

    }

}


/* =========================================
   FIREBASE - LEVEL STATE
========================================= */

async function saveLevelState() {

    try {

        await setDoc(

            doc(
                db,
                "game",
                "settings"
            ),

            {
                levelState: levelState
            },

            {
                merge: true
            }

        );


        console.log(
            "Level state saved to Firebase ✅"
        );


        return true;

    } catch (error) {

        console.error(
            "Error saving level state:",
            error
        );


        showToast(
            "Error saving level state"
        );


        return false;

    }

}

/* =========================================
   LISTEN TO LEVEL STATE
========================================= */

function listenToLevelState() {

    const settingsRef =
        doc(
            db,
            "game",
            "settings"
        );


    onSnapshot(

        settingsRef,

        async snapshot => {

            if (snapshot.exists()) {

                const data =
                    snapshot.data();


                if (data.levelState) {

                    levelState = {

                        ...levelState,

                        ...data.levelState

                    };

                }

            } else {

                /*
                   First time:
                   create default level state.
                */

                await saveLevelState();

            }


            console.log(
                "Level state synced with Firebase ✅"
            );


            /*
               Update map immediately if
               the user is currently there.
            */

            if (
                screens.map &&
                !screens.map.classList.contains("hidden")
            ) {

                setupMap();

            }


            /*
               Update admin controls if
               the control panel is open.
            */

            if (
                screens.control &&
                !screens.control.classList.contains("hidden")
            ) {

                setupLevelControls();

            }

        },

        error => {

            console.error(
                "Error listening to level state:",
                error
            );


            showToast(
                "Error syncing levels"
            );

        }

    );

}

/* =========================================
   SPLASH SCREEN
========================================= */

const startBtn =
    document.getElementById("startBtn");


if (startBtn) {

    startBtn.addEventListener(
        "click",
        () => {

            startBackgroundMusic();

            showScreen(
                screens.login
            );

        }
    );

}


/* =========================================
   BACKGROUND MUSIC
========================================= */

const backgroundMusic =
    document.getElementById(
        "backgroundMusic"
    );


const musicBtn =
    document.getElementById(
        "musicBtn"
    );


let musicEnabled = true;


function startBackgroundMusic() {

    if (
        !musicEnabled ||
        !backgroundMusic
    ) {

        return;

    }


    backgroundMusic.volume = 0.5;


    backgroundMusic
        .play()
        .then(() => {

            if (musicBtn) {

                musicBtn.textContent =
                    "🔊";

            }

        })
        .catch(error => {

            console.log(
                "Music could not start:",
                error
            );

        });

}


if (musicBtn) {

    musicBtn.addEventListener(
        "click",
        () => {

            if (
                !backgroundMusic
            ) {

                return;

            }


            if (
                backgroundMusic.paused
            ) {

                musicEnabled = true;


                backgroundMusic
                    .play();


                musicBtn.textContent =
                    "🔊";


                musicBtn.classList
                    .remove("muted");

            } else {

                musicEnabled = false;


                backgroundMusic.pause();


                musicBtn.textContent =
                    "🔇";


                musicBtn.classList
                    .add("muted");

            }

        }
    );

}

/* =========================================
   LOGIN
========================================= */

const loginBtn =
    document.getElementById(
        "loginBtn"
    );


const accessCode =
    document.getElementById(
        "accessCode"
    );


const loginError =
    document.getElementById(
        "loginError"
    );


function login() {

    if (
        !accessCode ||
        !loginError
    ) {

        return;

    }


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


    /* =========================
       ADMIN
    ========================= */

    if (
        code === ADMIN_CODE
    ) {

        currentUser = "admin";


        showScreen(
            screens.map
        );


        setupMap();


        const controlButton =
            document.getElementById(
                "controlBtn"
            );


        if (controlButton) {

            controlButton
                .classList
                .remove("hidden");

        }


        showToast(
            "Welcome to Game Control!"
        );


        return;

    }

    /* =========================
       PLAYER
    ========================= */

    if (
        code === PLAYER_CODE
    ) {

        currentUser = "player";


        showScreen(
            screens.map
        );


        setupMap();


        const controlButton =
            document.getElementById(
                "controlBtn"
            );


        if (controlButton) {

            controlButton
                .classList
                .add("hidden");

        }


        return;

    }


    loginError.textContent =
        "Invalid code. Please try again.";

}


if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        login
    );

}


if (accessCode) {

    accessCode.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                login();

            }

        }
    );

}


/* =========================================
   MAP
========================================= */

const levelsContainer =
    document.getElementById(
        "levelsContainer"
    );


const penguin =
    document.getElementById(
        "penguin"
    );

/* =========================================
   LEVEL POSITIONS
========================================= */

/* =========================================
   LEVEL POSITIONS
   New Jungle Map
========================================= */

const levelPositions = {

    1: {
        left: 45,
        top: 86
    },

    2: {
        left: 67,
        top: 78
    },

    3: {
        left: 85,
        top: 70
    },

    4: {
        left: 25,
        top: 61
    },

    5: {
        left: 47,
        top: 63
    },

    6: {
        left: 73,
        top: 60
    },

    7: {
        left: 58,
        top: 50
    },

    8: {
        left: 63,
        top: 44
    },

    9: {
        left: 52,
        top: 39
    },

    10: {
        left: 35,
        top: 53
    }

};
/* =========================================
   SETUP MAP
========================================= */

function setupMap() {

    if (!levelsContainer) {
        return;
    }

    levelsContainer.innerHTML = "";


    for (
        let level = 1;
        level <= 10;
        level++
    ) {

        const stone =
            document.createElement("button");


        stone.className =
            "level-stone";


        stone.dataset.level =
            level;


        stone.textContent =
            level;


        /* =========================
           POSITION
        ========================== */

        stone.style.left =
            `${levelPositions[level].left}%`;


        stone.style.top =
            `${levelPositions[level].top}%`;


        /* =========================
           OPEN / LOCKED
        ========================== */

        if (levelState[level]) {

            stone.classList.add("open");

        } else {

            stone.classList.add("locked");

        }


        /* =========================
           CLICK
        ========================== */

        stone.addEventListener(
            "click",
            () => {

                selectLevel(level);

            }
        );


        levelsContainer.appendChild(
            stone
        );

    }


    /* =========================
       PENGUIN POSITION
    ========================== */

    restorePenguinPosition();

}

/* =========================================
   MOVE PENGUIN
========================================= */

function movePenguin(level) {

    if (!penguin) {
        return;
    }


    const position =
        levelPositions[level];


    if (!position) {
        return;
    }


    penguin.style.left =
        `${position.left + 3}%`;


    penguin.style.top =
        `${position.top - 5}%`;

}

/* =========================================
   SAVE PENGUIN POSITION
========================================= */

function savePenguinPosition(level) {

    localStorage.setItem(
        "penguinPosition",
        String(level)
    );

}


/* =========================================
   RESTORE PENGUIN POSITION
========================================= */

function restorePenguinPosition() {

    if (!penguin) {
        return;
    }


    const savedLevel =
        Number(
            localStorage.getItem(
                "penguinPosition"
            )
        );


    /*
       If there is no saved position,
       start at Level 1.
    */

    const level =
        levelPositions[savedLevel]
            ? savedLevel
            : 1;


    movePenguin(level);

}

/* =========================================
   SELECT LEVEL
========================================= */

async function selectLevel(level) {

    selectedLevel = level;


    /* =========================
       LOCKED LEVEL
    ========================== */

    if (!levelState[level]) {

        showLockedModal();

        return;

    }


    /* =========================
       ADMIN
    ========================== */

    if (
        currentUser === "admin"
    ) {

        /*
           Admin does NOT move the penguin.
           Admin only manages the game.
        */

        openLevelEditor(level);

        return;

    }


    /* =========================
       PLAYER
    ========================== */

    if (
        currentUser === "player"
    ) {

        /*
           Move penguin to selected level
           BEFORE opening it.
        */

        movePenguin(level);


        /*
           Save the new position.
        */

        savePenguinPosition(level);


        /*
           Wait for the penguin animation
           to finish.
        */

        await new Promise(
            resolve => {

                setTimeout(
                    resolve,
                    1200
                );

            }
        );


        /*
           Now open the level.
        */

        openNameScreen(level);

    }

}

/* =========================================
   LOCKED LEVEL MODAL
========================================= */

const lockedModal =
    document.getElementById(
        "lockedModal"
    );


const closeLockedBtn =
    document.getElementById(
        "closeLockedBtn"
    );


function showLockedModal() {

    if (!lockedModal) {
        return;
    }


    lockedModal.classList.remove(
        "hidden"
    );

}


function closeLockedModal() {

    if (!lockedModal) {
        return;
    }


    lockedModal.classList.add(
        "hidden"
    );

}


if (closeLockedBtn) {

    closeLockedBtn.addEventListener(
        "click",
        closeLockedModal
    );

}


/* =========================================
   CONTROL PANEL
========================================= */

const controlBtn =
    document.getElementById(
        "controlBtn"
    );


const controlBackBtn =
    document.getElementById(
        "controlBackBtn"
    );


if (controlBtn) {

    controlBtn.addEventListener(
        "click",
        () => {

            showScreen(
                screens.control
            );


            setupLevelControls();

        }
    );

}


if (controlBackBtn) {

    controlBackBtn.addEventListener(
        "click",
        () => {

            showScreen(
                screens.map
            );


            setupMap();

        }
    );

}


/* =========================================
   LEVEL CONTROL BUTTONS
========================================= */

function setupLevelControls() {

    const container =
        document.getElementById(
            "levelControls"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    for (
        let level = 1;
        level <= 10;
        level++
    ) {

        const button =
            document.createElement(
                "button"
            );


        button.className =
            "level-control-btn";


        button.textContent =
            `Level ${level}`;


        if (
            levelState[level]
        ) {

            button.classList.add(
                "open"
            );

        }


        button.addEventListener(
            "click",
            () => {

                toggleLevel(
                    level,
                    button
                );

            }
        );


        container.appendChild(
            button
        );

    }

}

/* =========================================
   TOGGLE LEVEL
========================================= */

async function toggleLevel(
    level,
    button
) {

    levelState[level] =
        !levelState[level];


    if (
        levelState[level]
    ) {

        button.classList.add(
            "open"
        );


        showToast(
            `Level ${level} is now OPEN`
        );

    } else {

        button.classList.remove(
            "open"
        );


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
    document.getElementById(
        "openEditorBtn"
    );


if (openEditorBtn) {

    openEditorBtn.addEventListener(
        "click",
        async () => {

            const levelInput =
                document.getElementById(
                    "levelNumber"
                );


            const countInput =
                document.getElementById(
                    "questionCount"
                );


            const level =
                Number(
                    levelInput?.value
                );


            const count =
                Number(
                    countInput?.value
                );


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


            selectedLevel =
                level;


            await prepareQuestions(
                level,
                count
            );


            openLevelEditor(
                level
            );

        }
    );

}


/* =========================================
   PREPARE QUESTIONS
========================================= */

async function prepareQuestions(
    level,
    count
) {

    if (
        !questionsData[level]
    ) {

        questionsData[level] = [];

    }


    while (
        questionsData[level].length <
        count
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
        questionsData[level].length >
        count
    ) {

        questionsData[level] =
            questionsData[level].slice(
                0,
                count
            );

    }


    await saveQuestions();

}

/* =========================================
   EDITOR
========================================= */

function openLevelEditor(
    level
) {

    selectedLevel =
        level;


    const title =
        document.getElementById(
            "editorLevelTitle"
        );


    if (title) {

        title.textContent =
            `Level ${level}`;

    }


    renderQuestionEditor(
        level
    );


    showScreen(
        screens.editor
    );

}


/* =========================================
   RENDER QUESTION EDITOR
========================================= */

function renderQuestionEditor(
    level
) {

    const container =
        document.getElementById(
            "questionsEditor"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const questions =
        questionsData[level] || [];


    questions.forEach(
        (question, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "question-edit-card";


            const answers =
                Array.isArray(
                    question.answers
                )
                    ? question.answers
                    : [
                        "",
                        "",
                        "",
                        ""
                    ];


            card.innerHTML = `

                <h3>
                    Question ${index + 1}
                </h3>

                <textarea
                    class="edit-question"
                    placeholder="Write the question..."
                >${escapeHTML(
                    question.question || ""
                )}</textarea>

                ${answers.map(
                    (
                        answer,
                        answerIndex
                    ) => `

                    <div
                        class="answer-edit ${
                            question.correct ===
                            answerIndex
                                ? "correct-selected"
                                : ""
                        }"
                    >

                        <input
                            type="radio"
                            name="correct-q-${index}"
                            value="${answerIndex}"
                            ${
                                question.correct ===
                                answerIndex
                                    ? "checked"
                                    : ""
                            }
                        >

                        <input
                            type="text"
                            class="edit-answer"
                            data-answer="${answerIndex}"
                            placeholder="Answer ${answerIndex + 1}"
                            value="${escapeAttribute(
                                answer || ""
                            )}"
                        >

                    </div>

                `
                ).join("")}

            `;


            container.appendChild(
                card
            );

        }
    );


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


    cards.forEach(
        card => {

            const answerRows =
                card.querySelectorAll(
                    ".answer-edit"
                );


            answerRows.forEach(
                row => {

                    const radio =
                        row.querySelector(
                            'input[type="radio"]'
                        );


                    if (
                        radio &&
                        radio.checked
                    ) {

                        row.classList.add(
                            "correct-selected"
                        );

                    } else {

                        row.classList.remove(
                            "correct-selected"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================
   RADIO CHANGE
========================================= */

document.addEventListener(
    "change",
    event => {

        if (
            !event.target.matches(
                ".question-edit-card input[type=\"radio\"]"
            )
        ) {

            return;

        }


        const card =
            event.target.closest(
                ".question-edit-card"
            );


        if (!card) {
            return;
        }


        const answerRows =
            card.querySelectorAll(
                ".answer-edit"
            );


        answerRows.forEach(
            row => {

                row.classList.remove(
                    "correct-selected"
                );

            }
        );


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
);

/* =========================================
   SAVE EDITED QUESTIONS
========================================= */

const saveQuestionsBtn =
    document.getElementById(
        "saveQuestionsBtn"
    );


if (saveQuestionsBtn) {

    saveQuestionsBtn.addEventListener(
        "click",
        saveEditedQuestions
    );

}


async function saveEditedQuestions() {

    const level =
        selectedLevel;


    if (!level) {

        showToast(
            "No level selected."
        );

        return;

    }


    const cards =
        document.querySelectorAll(
            ".question-edit-card"
        );


    const questions = [];


    cards.forEach(
        (card, index) => {

            const questionInput =
                card.querySelector(
                    ".edit-question"
                );


            const question =
                questionInput
                    ? questionInput.value.trim()
                    : "";


            const answerInputs =
                card.querySelectorAll(
                    ".edit-answer"
                );


            const answers =
                Array.from(
                    answerInputs
                ).map(
                    input =>
                        input.value.trim()
                );


            const correctInput =
                card.querySelector(
                    `input[name="correct-q-${index}"]:checked`
                );


            const correct =
                correctInput
                    ? Number(
                        correctInput.value
                    )
                    : 0;


            questions.push({

                question,

                answers,

                correct

            });

        }
    );


    questionsData[level] =
        questions;


    const saved =
        await saveQuestions();


    if (saved) {

        showToast(
            `Level ${level} questions saved!`
        );

    }

}


/* =========================================
   EDITOR NAVIGATION
========================================= */

const editorBackBtn =
    document.getElementById(
        "editorBackBtn"
    );


if (editorBackBtn) {

    editorBackBtn.addEventListener(
        "click",
        () => {

            showScreen(
                screens.control
            );


            setupLevelControls();

        }
    );

}


const doneEditorBtn =
    document.getElementById(
        "doneEditorBtn"
    );


if (doneEditorBtn) {

    doneEditorBtn.addEventListener(
        "click",
        async () => {

            await saveEditedQuestions();


            showScreen(
                screens.map
            );


            setupMap();

        }
    );

}


/* =========================================
   PLAYER NAME
========================================= */

function openNameScreen(
    level
) {

    selectedLevel =
        level;


    const playerName =
        document.getElementById(
            "playerName"
        );


    const nameError =
        document.getElementById(
            "nameError"
        );


    if (playerName) {

        playerName.value = "";

    }


    if (nameError) {

        nameError.textContent = "";

    }


    showScreen(
        screens.name
    );

}


/* =========================================
   START PLAYER GAME
========================================= */

const nameContinueBtn =
    document.getElementById(
        "nameContinueBtn"
    );


if (nameContinueBtn) {

    nameContinueBtn.addEventListener(
        "click",
        startPlayerGame
    );

}


const playerNameInput =
    document.getElementById(
        "playerName"
    );


if (playerNameInput) {

    playerNameInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                startPlayerGame();

            }

        }
    );

}


function startPlayerGame() {

    const playerName =
        document.getElementById(
            "playerName"
        );


    const error =
        document.getElementById(
            "nameError"
        );


    if (
        !playerName ||
        !error
    ) {

        return;

    }


    const name =
        playerName.value.trim();


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

    questionAnswered = false;


    startQuestions();

}

/* =========================================
   START QUESTIONS
========================================= */

function startQuestions() {

    let questions =
        questionsData[currentLevel];


    /*
       If no questions exist.
    */

    if (
        !questions ||
        !Array.isArray(questions) ||
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

    questionAnswered = false;


    showScreen(
        screens.question
    );


    renderCurrentQuestion();

}


/* =========================================
   RENDER CURRENT QUESTION
========================================= */

function renderCurrentQuestion() {

    const questions =
        questionsData[currentLevel];


    if (
        !questions ||
        !questions[currentQuestionIndex]
    ) {

        return;

    }


    const question =
        questions[currentQuestionIndex];


    const questionNumber =
        document.getElementById(
            "questionNumber"
        );


    const totalQuestions =
        document.getElementById(
            "totalQuestions"
        );


    const currentScoreElement =
        document.getElementById(
            "currentScore"
        );


    const questionText =
        document.getElementById(
            "questionText"
        );


    const progressBar =
        document.getElementById(
            "progressBar"
        );


    if (questionNumber) {

        questionNumber.textContent =
            currentQuestionIndex + 1;

    }


    if (totalQuestions) {

        totalQuestions.textContent =
            questions.length;

    }


    if (currentScoreElement) {

        currentScoreElement.textContent =
            currentScore;

    }


    if (questionText) {

        questionText.textContent =
            question.question ||
            "Question";

    }


    const progress =
        (
            currentQuestionIndex /
            questions.length
        ) * 100;


    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;

    }


    const container =
        document.getElementById(
            "answersContainer"
        );


    if (!container) {
        return;
    }


    container.innerHTML = "";


    const answers =
        Array.isArray(
            question.answers
        )
            ? question.answers
            : [];


    answers.forEach(
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
                () => {

                    answerQuestion(
                        index,
                        question.correct,
                        button
                    );

                }
            );


            container.appendChild(
                button
            );

        }
    );


    const nextButton =
        document.getElementById(
            "nextQuestionBtn"
        );


    if (nextButton) {

        nextButton.style.display =
            "none";

    }


    questionAnswered = false;

}


/* =========================================
   ANSWER QUESTION
========================================= */

function answerQuestion(
    selectedAnswer,
    correctAnswer,
    clickedButton
) {

    if (
        questionAnswered
    ) {

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
        selectedAnswer ===
        correctAnswer;


    if (isCorrect) {

        clickedButton.classList.add(
            "correct"
        );


        currentScore += 10;


        showToast(
            "+10 points! 🎉"
        );

    } else {

        clickedButton.classList.add(
            "wrong"
        );


        currentScore -= 1;


        /*
           Show correct answer
        */

        if (
            buttons[correctAnswer]
        ) {

            buttons[
                correctAnswer
            ].classList.add(
                "correct"
            );

        }


        showToast(
            "-1 point"
        );

    }


    const currentScoreElement =
        document.getElementById(
            "currentScore"
        );


    if (currentScoreElement) {

        currentScoreElement.textContent =
            currentScore;

    }


    const nextButton =
        document.getElementById(
            "nextQuestionBtn"
        );


    if (nextButton) {

        nextButton.style.display =
            "block";

    }


    const questions =
        questionsData[currentLevel];


    const progress =
        (
            (currentQuestionIndex + 1) /
            questions.length
        ) * 100;


    const progressBar =
        document.getElementById(
            "progressBar"
        );


    if (progressBar) {

        progressBar.style.width =
            `${progress}%`;

    }

}


/* =========================================
   NEXT QUESTION
========================================= */

const nextQuestionBtn =
    document.getElementById(
        "nextQuestionBtn"
    );


if (nextQuestionBtn) {

    nextQuestionBtn.addEventListener(
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

}


/* =========================================
   FINISH LEVEL
========================================= */

function finishLevel() {

    const finalScore =
        document.getElementById(
            "finalScore"
        );


    const resultLevel =
        document.getElementById(
            "resultLevel"
        );


    if (finalScore) {

        finalScore.textContent =
            currentScore;

    }


    if (resultLevel) {

        resultLevel.textContent =
            `Level ${currentLevel}`;

    }


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

            collection(
                db,
                "results"
            ),

            {

                name:
                    currentUser.name,

                code:
                    currentUser.code,

                level:
                    currentLevel,

                score:
                    currentScore,

                date:
                    serverTimestamp()

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

const resultMapBtn =
    document.getElementById(
        "resultMapBtn"
    );


if (resultMapBtn) {

    resultMapBtn.addEventListener(
        "click",
        () => {

            showScreen(
                screens.map
            );


            setupMap();

        }
    );

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHTML(text) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


function escapeAttribute(text) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        );

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
           Don't block selection inside
           inputs and textareas.
        */

        if (
            event.target.tagName !==
                "INPUT" &&

            event.target.tagName !==
                "TEXTAREA"
        ) {

            event.preventDefault();

        }

    }
);


/* =========================================
   INITIALIZATION
========================================= */

function initializeGame() {

    /*
       Start Firebase listeners.
    */

    listenToQuestions();

    listenToLevelState();


    /*
       Level 1 is open by default
       if there is no value yet.
    */

    if (
        typeof levelState[1] ===
        "undefined"
    ) {

        levelState[1] = true;

    }


    /*
       Show splash screen.
    */

    showScreen(
        screens.splash
    );


    console.log(
        "YDP Leaders Game loaded successfully 🚀"
    );

}


initializeGame();
