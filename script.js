import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    onSnapshot,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs,
    increment
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";const videoIntro = document.getElementById("videoIntro");
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
   PLAYER SYSTEM
========================================= */

let playersData = [];

let selectedPlayerId = null;

let levelStartTime = null;

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
FIREBASE - PLAYERS
========================================= */

function listenToPlayers() {

const playersRef =
    collection(db, "players");

onSnapshot(
    playersRef,

    snapshot => {

        playersData = [];

        snapshot.forEach(docSnap => {

            const data = docSnap.data();

            playersData.push({

                id: docSnap.id,

                name: data.name || "",

                totalScore:
                    Number(data.totalScore || 0)

            });

        });

        playersData.sort((a, b) =>
            a.name.localeCompare(
                b.name,
                "ar"
            )
        );

        console.log(
            "Players synced with Firebase ✅",
            playersData
        );

        populatePlayerSelect();
        renderPlayersList();

    },

    error => {

        console.error(
            "Error listening to players:",
            error
        );

        showToast(
            "Error loading players"
        );

    }
);

}

/* =========================================
PLAYER SELECT
========================================= */

function populatePlayerSelect() {

const select =
    document.getElementById(
        "playerSelect"
    );

if (!select) {
    return;
}

select.innerHTML = "";

const defaultOption =
    document.createElement("option");

defaultOption.value = "";

defaultOption.textContent =
    "Select your name";

select.appendChild(
    defaultOption
);

playersData.forEach(player => {

    const option =
        document.createElement("option");

    option.value =
        player.id;

    option.textContent =
        player.name;

    select.appendChild(
        option
    );

});

}

/* =========================================
ADD PLAYER
========================================= */

async function addPlayer(playerName) {

const name =
    playerName.trim();

if (!name) {

    showToast(
        "Please enter a player name."
    );

    return false;

}

const words =
    name.split(/\s+/);

if (words.length < 3) {

    showToast(
        "Please enter the full name (3 names)."
    );

    return false;

}

try {

    const playersRef =
        collection(db, "players");

    const existingQuery =
        query(
            playersRef,
            where("name", "==", name)
        );

    const existing =
        await getDocs(
            existingQuery
        );

    if (!existing.empty) {

        showToast(
            "This name already exists."
        );

        return false;

    }

    await addDoc(
        playersRef,
        {

            name: name,

            totalScore: 0,

            createdAt:
                serverTimestamp()

        }
    );

    showToast(
        "Player added successfully! ✅"
    );

    return true;

} catch (error) {

    console.error(
        "Error adding player:",
        error
    );

    showToast(
        "Error adding player."
    );

    return false;

}

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
   JUNGLE MAP
========================================= */

const levelPositions = {

    /* =========================
       START → BOTTOM
    ========================== */

    1: {
        left: 45,
        top: 78
    },

    2: {
        left: 61,
        top: 73
    },

    3: {
        left: 76,
        top: 69
    },


    /* =========================
       MIDDLE PATH
    ========================== */

    4: {
        left: 82,
        top: 60
    },

    5: {
        left: 54,
        top: 57
    },

    6: {
        left: 28,
        top: 59
    },


    /* =========================
       UPPER PATH
    ========================== */

    7: {
        left: 25,
        top: 49
    },

    8: {
        left: 47,
        top: 46
    },

    9: {
        left: 64,
        top: 44
    },

    10: {
        left: 64,
        top: 38
    }

};
/* =========================================
   SETUP MAP
========================================= */

function setupMap() {

    if (!levelsContainer) {
        return;
    }
createFlyingBirds();
    
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
========================= */

if (currentUser === "player") {

    movePenguin(level);

    savePenguinPosition(level);

    await new Promise(resolve => {

        setTimeout(resolve, 1200);

    });

    openNameScreen(level);

    return;
}
} 

/* =========================================
   CHECK PLAYER LEVEL
========================================= */

async function hasPlayerPlayedLevel(
    playerId,
    level
) {

    try {

        const resultId =
            `${playerId}_level${level}`;

        const resultRef =
            doc(
                db,
                "results",
                resultId
            );

        const resultSnap =
            await getDoc(resultRef);

        if (!resultSnap.exists()) {
            return false;
        }

        const data = resultSnap.data();

        // Admin allowed this player to replay
        if (data.replayAllowed === true) {
            return false;
        }

        return true;

    } catch (error) {

        console.error(
            "Error checking player level:",
            error
        );

        showToast(
            "Error checking level data."
        );

        return true;

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
   PLAYERS ADMIN
========================================= */

function renderPlayersList() {

    const container =
        document.getElementById(
            "playersList"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    if (
        playersData.length === 0
    ) {

        container.innerHTML = `
            <p class="data-empty">
                No players registered yet.
            </p>
        `;

        return;

    }

    playersData.forEach(
        player => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "player-admin-row";

            row.innerHTML = `

                <div class="player-admin-info">

                    <strong>
                        ${escapeHTML(
                            player.name
                        )}
                    </strong>

                    <span>
                        Total Score:
                        ${player.totalScore}
                    </span>

                </div>

                <button
                    class="delete-player-btn"
                    type="button"
                    data-player-id="${player.id}"
                >
                    Delete
                </button>

            `;

            container.appendChild(
                row
            );

        }
    );

    container
        .querySelectorAll(
            ".delete-player-btn"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    deletePlayer(
                        button.dataset.playerId
                    );

                }
            );

        });
loadTotalScores();
}


/* =========================================
   ADD PLAYER BUTTON
========================================= */

const addPlayerBtn =
    document.getElementById(
        "addPlayerBtn"
    );

if (addPlayerBtn) {

    addPlayerBtn.addEventListener(
        "click",
        async () => {

            const input =
                document.getElementById(
                    "newPlayerName"
                );

            if (!input) {
                return;
            }

            const name =
                input.value.trim();

            const saved =
                await addPlayer(name);

            if (saved) {

                input.value = "";

            }

        }
    );

}


/* =========================================
   DELETE PLAYER
========================================= */

async function deletePlayer(
    playerId
) {

    const player =
        playersData.find(
            item => item.id === playerId
        );

    if (!player) {
        return;
    }

    const confirmed =
        confirm(
            `Delete player "${player.name}"?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "players",
                playerId
            )
        );

        showToast(
            "Player deleted."
        );

    } catch (error) {

        console.error(
            "Error deleting player:",
            error
        );

        showToast(
            "Error deleting player."
        );

    }

}

/* =========================================
   OPEN DATA
========================================= */

const dataLevelSelect =
    document.getElementById(
        "dataLevelSelect"
    );

if (dataLevelSelect) {

    dataLevelSelect.addEventListener(
        "change",
        () => {

            const level =
                Number(
                    dataLevelSelect.value
                );

            if (!level) {

                clearLevelData();

                return;

            }

            loadLevelData(level);

        }
    );

}


/* =========================================
   LOAD LEVEL DATA
========================================= */

async function loadLevelData(
    level
) {

    const container =
        document.getElementById(
            "levelDataContainer"
        );

    if (!container) {
        return;
    }

    container.innerHTML = `
        <p class="data-empty">
            Loading data...
        </p>
    `;

    try {

        const resultsRef =
            collection(
                db,
                "results"
            );

        const q =
            query(
                resultsRef,
                where(
                    "level",
                    "==",
                    level
                )
            );

        const snapshot =
            await getDocs(q);

        if (snapshot.empty) {

            container.innerHTML = `
                <p class="data-empty">
                    No players have completed Level ${level} yet.
                </p>
            `;

            return;

        }

        const results = [];

        snapshot.forEach(
            docSnap => {

                results.push(
                    docSnap.data()
                );

            }
        );

        results.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name,
                    "ar"
                )
        );

        container.innerHTML = `
            <h3>
                Level ${level} Results
            </h3>

            <div class="data-table">

                <div class="data-row data-header">

    <span>Player</span>

    <span>Start</span>

    <span>End</span>

    <span>Score</span>

    <span>Actions</span>

</div>

                ${results.map(
    result => {

        const playerId =
            result.playerId || "";

        const resultId =
            result.resultId ||
            `${playerId}_level${level}`;

        return `

        <div class="data-row">

            <span>
                ${escapeHTML(
                    result.name || "-"
                )}
            </span>

            <span>
                ${formatFirebaseDate(
                    result.startTime
                )}
            </span>

            <span>
                ${formatFirebaseDate(
                    result.endTime
                )}
            </span>

            <span class="score-cell">
                ${Number(
                    result.score || 0
                )}
            </span>

            <span class="data-actions">

                <button
                    class="replay-player-btn"
                    type="button"
                    data-result-id="${resultId}"
                    data-player-id="${playerId}"
                    data-level="${level}"
                >
                    🔄 Replay
                </button>

                <button
                    class="delete-result-btn"
                    type="button"
                    data-result-id="${resultId}"
                >
                    🗑️ Delete
                </button>

            </span>

        </div>

        `;

    }
).join("")}
            </div>
        `;

    } catch (error) {

        console.error(
            "Error loading level data:",
            error
        );

        container.innerHTML = `
            <p class="data-empty">
                Error loading data.
            </p>
        `;

    }

}

/* =========================================
   ALLOW PLAYER TO REPLAY LEVEL
========================================= */

async function allowPlayerReplay(
    resultId,
    playerId,
    level
) {

    try {

        await updateDoc(
            doc(
                db,
                "results",
                resultId
            ),
            {
                replayAllowed: true
            }
        );

        showToast(
            `Player can replay Level ${level} 🔄`
        );

        loadLevelData(level);

    } catch (error) {

        console.error(
            "Error allowing replay:",
            error
        );

        showToast(
            "Error allowing replay."
        );

    }

}

/* =========================================
   DELETE PLAYER RESULT
========================================= */

async function deletePlayerResult(
    resultId,
    level
) {

    const confirmed =
        confirm(
            `Delete this player's Level ${level} data?`
        );

    if (!confirmed) {
        return;
    }

    try {

        await deleteDoc(
            doc(
                db,
                "results",
                resultId
            )
        );

        showToast(
            "Player data deleted successfully 🗑️"
        );

        loadLevelData(level);

    } catch (error) {

        console.error(
            "Error deleting player result:",
            error
        );

        showToast(
            "Error deleting player data."
        );

    }

}

/* =========================================
   DATA ACTION BUTTONS
========================================= */

document.addEventListener(
    "click",
    event => {

        const replayButton =
            event.target.closest(
                ".replay-player-btn"
            );

        if (replayButton) {

            const resultId =
                replayButton.dataset.resultId;

            const playerId =
                replayButton.dataset.playerId;

            const level =
                Number(
                    replayButton.dataset.level
                );

            allowPlayerReplay(
                resultId,
                playerId,
                level
            );

            return;
        }


        const deleteButton =
            event.target.closest(
                ".delete-result-btn"
            );

        if (deleteButton) {

            const resultId =
                deleteButton.dataset.resultId;

            const row =
                deleteButton.closest(
                    ".data-row"
                );

            const level =
                Number(
                    dataLevelSelect?.value
                );

            deletePlayerResult(
                resultId,
                level
            );

        }

    }
);
/* =========================================
   FORMAT FIREBASE DATE
========================================= */

function formatFirebaseDate(
    timestamp
) {

    if (!timestamp) {
        return "-";
    }

    let date;

    if (
        timestamp.toDate
    ) {

        date =
            timestamp.toDate();

    } else {

        date =
            new Date(timestamp);

    }

    return date.toLocaleString(
        "en-EG",
        {

            day: "2-digit",

            month: "2-digit",

            year: "numeric",

            hour: "2-digit",

            minute: "2-digit",

            second: "2-digit"

        }
    );

}


/* =========================================
   CLEAR LEVEL DATA
========================================= */

function clearLevelData() {

    const container =
        document.getElementById(
            "levelDataContainer"
        );

    if (container) {

        container.innerHTML = `
            <p class="data-empty">
                Select a level to view player data.
            </p>
        `;

    }

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
   OPEN PLAYER SELECTION
========================================= */

function openNameScreen(level) {

    selectedLevel =
        level;

    const select =
        document.getElementById(
            "playerSelect"
        );

    const error =
        document.getElementById(
            "nameError"
        );

    if (select) {

        select.value = "";

    }

    if (error) {

        error.textContent = "";

    }

    populatePlayerSelect();

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


/* =========================================
   START PLAYER GAME
========================================= */

async function startPlayerGame() {

    const playerSelect =
        document.getElementById(
            "playerSelect"
        );

    const error =
        document.getElementById(
            "nameError"
        );

    if (
        !playerSelect ||
        !error
    ) {
        return;
    }

    const playerId =
        playerSelect.value;

    error.textContent = "";

    if (!playerId) {

        error.textContent =
            "Please select your name.";

        return;

    }

    const player =
        playersData.find(
            item => item.id === playerId
        );

    if (!player) {

        error.textContent =
            "Player not found.";

        return;

    }
    
selectedPlayerId =
    player.id;

const alreadyPlayed =
    await hasPlayerPlayedLevel(
        player.id,
        selectedLevel
    );

if (alreadyPlayed) {

    error.textContent =
        `You already played Level ${selectedLevel}.`;

    return;

}

currentUser = {

    type: "player",

    id: player.id,

    name: player.name,

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

    levelStartTime = new Date();

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
            "+10 points! 🎉🐧"
        );

    } else {

        clickedButton.classList.add(
            "wrong"
        );


        currentScore -= 10;


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
            "-10 point 💔🐧"
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
        currentUser.type !== "player" ||
        !currentUser.id ||
        !currentLevel
    ) {

        return;

    }

    try {

        const resultId =
            `${currentUser.id}_level${currentLevel}`;

        const resultRef =
            doc(
                db,
                "results",
                resultId
            );

        const existing =
            await getDoc(
                resultRef
            );

        /*
           Safety check:
           Don't save the same level twice.
        */

        if (existing.exists()) {

            console.log(
                "This level result already exists."
            );

            return;

        }

        const endTime =
            new Date();

        await setDoc(
            resultRef,
            {

                playerId:
                    currentUser.id,

                name:
                    currentUser.name,

                level:
                    currentLevel,

                score:
                    currentScore,

                startTime:
                    levelStartTime
                        ? levelStartTime
                        : endTime,

                endTime:
                    endTime,

                status:
                    "completed",

                code:
                    PLAYER_CODE

            }
        );

        /*
           Update player's total score.
        */

        const playerRef =
            doc(
                db,
                "players",
                currentUser.id
            );

        await updateDoc(
            playerRef,
            {

                totalScore:
                    increment(currentScore)

            }
        );

        console.log(
            "Player result saved successfully ✅"
        );

    } catch (error) {

        console.error(
            "Error saving player result:",
            error
        );

        showToast(
            "Error saving result."
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
   FOREST FLYING BIRDS
========================================= */

function createFlyingBirds() {

    const container = document.getElementById("birdsContainer");

    if (!container) return;

    container.innerHTML = "";

    const birdCount = 7;

    for (let i = 0; i < birdCount; i++) {

        const bird = document.createElement("div");

        bird.className = "flying-bird";

        const startY =
            Math.random() * 65 + 5;

        const endY =
            Math.random() * 65 + 5;

        const duration =
            Math.random() * 12 + 15;

        const delay =
            Math.random() * 15 - 15;

        const size =
            Math.random() * 0.7 + 0.55;

        const opacity =
            Math.random() * 0.35 + 0.45;

        const angle =
            Math.random() * 8 - 4;

        bird.style.setProperty(
            "--start-y",
            `${startY}%`
        );

        bird.style.setProperty(
            "--end-y",
            `${endY}%`
        );

        bird.style.setProperty(
            "--fly-duration",
            `${duration}s`
        );

        bird.style.setProperty(
            "--fly-delay",
            `${delay}s`
        );

        bird.style.setProperty(
            "--bird-size",
            size
        );

        bird.style.setProperty(
            "--bird-opacity",
            opacity
        );

        bird.style.setProperty(
            "--bird-angle",
            `${angle}deg`
        );

        container.appendChild(bird);
    }
}


/* =========================================
   INITIALIZATION
========================================= */

function initializeGame() {

    listenToPlayers();

    listenToQuestions();

    listenToLevelState();

    showScreen(
        screens.splash
    );

    console.log(
        "YDP Leaders Game loaded successfully 🚀"
    );

}


initializeGame();
