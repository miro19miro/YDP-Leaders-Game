/* =========================================================
   YDP HR GAME
   SCRIPT.JS
   HR VERSION
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEYS = {
    players: "hr_players",
    interviews: "hr_interviews",
    questions: "hr_questions",
    results: "hr_results"
};


/* =========================================================
   DEFAULT QUESTIONS
========================================================= */

const defaultQuestions = [
    {
        id: "q1",
        text: "Tell me about yourself."
    },
    {
        id: "q2",
        text: "Why do you want to join YDP?"
    },
    {
        id: "q3",
        text: "What are your strongest soft skills?"
    },
    {
        id: "q4",
        text: "How do you deal with pressure?"
    },
    {
        id: "q5",
        text: "How do you work within a team?"
    },
    {
        id: "q6",
        text: "Tell me about a problem you solved."
    },
    {
        id: "q7",
        text: "What is one weakness you are working on?"
    },
    {
        id: "q8",
        text: "How do you manage your time?"
    },
    {
        id: "q9",
        text: "How do you handle disagreement with a teammate?"
    },
    {
        id: "q10",
        text: "Why should we choose you?"
    }
];


/* =========================================================
   STORAGE FUNCTIONS
========================================================= */

function loadData(key, fallback = []) {

    try {

        const saved =
            localStorage.getItem(key);

        if (!saved) {
            return fallback;
        }

        const parsed =
            JSON.parse(saved);

        return Array.isArray(parsed)
            ? parsed
            : fallback;

    } catch (error) {

        console.error(
            "Storage error:",
            error
        );

        return fallback;
    }
}


function saveData(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error(
            "Save error:",
            error
        );

    }

}


/* =========================================================
   LOAD DATA
========================================================= */

let players =
    loadData(
        STORAGE_KEYS.players,
        []
    );


let interviews =
    loadData(
        STORAGE_KEYS.interviews,
        []
    );


let questions =
    loadData(
        STORAGE_KEYS.questions,
        defaultQuestions
    );


let results =
    loadData(
        STORAGE_KEYS.results,
        []
    );


/*
   If questions do not exist yet,
   save the default question bank.
*/

if (
    !localStorage.getItem(
        STORAGE_KEYS.questions
    )
) {

    saveData(
        STORAGE_KEYS.questions,
        questions
    );

}


/* =========================================================
   GAME STATE
========================================================= */

const game = {

    playerName: "",

    gender: "",

    currentInterview: null,

    accepted: 0,

    rejected: 0,

    score: 0,

    selectedDecision: null,

    usedInterviewIds: [],

    selectedQuestions: [],

    currentQuestionIndex: 0,

    gameStartedAt: null

};


/* =========================================================
   DOM HELPER
========================================================= */

const $ = (id) =>
    document.getElementById(id);


/* =========================================================
   SCREEN FUNCTIONS
========================================================= */

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.add(
                "hidden"
            );

        });


    const target = $(id);

    if (target) {

        target.classList.remove(
            "hidden"
        );

    }

}


function showElement(id) {

    const element = $(id);
    if (element) {

        element.classList.remove(
            "hidden"
        );

    }

}


function hideElement(id) {

    const element = $(id);

    if (element) {

        element.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   UTILITIES
========================================================= */

function createId(prefix = "id") {

    return (
        prefix +
        "_" +
        Date.now() +
        "_" +
        Math.random()
            .toString(36)
            .substring(2, 8)
    );

}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   INTRO VIDEO
========================================================= */

const introVideo =
    $("introVideo");


if (introVideo) {

    introVideo.addEventListener(
        "ended",
        () => {

            showScreen(
                "codeScreen"
            );

        }
    );

}


/* =========================================================
   CODE SCREEN
========================================================= */

const codeInput =
    $("codeInput");

const enterCodeBtn =
    $("enterCodeBtn");

const codeError =
    $("codeError");


function enterGameCode() {

    if (!codeInput) {
        return;
    }


    const code =
        codeInput.value.trim();


    if (codeError) {

        codeError.textContent = "";

    }


    if (!code) {

        if (codeError) {

            codeError.textContent =
                "Please enter your code.";

        }

        return;
    }


    /*
       HR ADMIN CODE
    */

    if (code === "BYS20M") {

        showScreen(
            "roleScreen"
        );

        return;
    }


    /*
       HR PLAYER CODE
    */

    if (code === "MEM201") {

        showScreen(
            "roleScreen"
        );

        return;
    }


    /*
       WRONG CODE
    */

    if (codeError) {

        codeError.textContent =
            "Invalid code. Please try again.";

    }

}


if (enterCodeBtn) {

    enterCodeBtn.addEventListener(
        "click",
        enterGameCode
    );

}


if (codeInput) {

    codeInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                enterGameCode();

            }

        }
    );

}


/* =========================================================
   ROLE SCREEN
========================================================= */

const playerRoleBtn =
    $("playerRoleBtn");

const adminRoleBtn =
    $("adminRoleBtn");


if (playerRoleBtn) {

    playerRoleBtn.addEventListener(
        "click",
        () => {

            const code =
                codeInput
                    ? codeInput.value.trim()
                    : "";

            if (code !== "MEM201") {

                if (codeError) {

                    codeError.textContent =
                        "Please enter the player code.";

                }

                showScreen(
                    "codeScreen"
                );

                return;
            }


            game.gameStartedAt =
                new Date().toISOString();


            showScreen(
                "genderScreen"
            );

        }
    );

}


if (adminRoleBtn) {

    adminRoleBtn.addEventListener(
        "click",
        () => {

            const code =
                codeInput
                    ? codeInput.value.trim()
                    : "";

            if (code !== "BYS20M") {

                if (codeError) {
                    codeError.textContent =
                        "Please enter the admin code.";

                }

                showScreen(
                    "codeScreen"
                );

                return;
            }


            openAdminPanel();

        }
    );

}


/* =========================================================
   GENDER
========================================================= */

const girlChoice =
    $("girlChoice");

const boyChoice =
    $("boyChoice");


function chooseGender(gender) {

    game.gender =
        gender;

    showScreen(
        "nameScreen"
    );

    renderPlayerNames();

}


if (girlChoice) {

    girlChoice.addEventListener(
        "click",
        () => {

            chooseGender(
                "female"
            );

        }
    );

}


if (boyChoice) {

    boyChoice.addEventListener(
        "click",
        () => {

            chooseGender(
                "male"
            );

        }
    );

}


/* =========================================================
   PLAYER NAME
========================================================= */

let selectedPlayerId =
    null;


const membersList =
    $("membersList");

const nameContinueBtn =
    $("nameContinueBtn");

const nameError =
    $("nameError");


function renderPlayerNames() {

    if (!membersList) {
        return;
    }


    membersList.innerHTML =
        "";


    selectedPlayerId =
        null;


    if (nameContinueBtn) {

        nameContinueBtn.disabled =
            true;

    }


    if (nameError) {

        nameError.textContent =
            "";

    }


    if (players.length === 0) {

        membersList.innerHTML = 
            <div class="empty-message">
                No player names have been added yet.
                Ask the administrator to add your name.
            </div>
        ;

        return;
    }


    players.forEach(
        player => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "member-choice";


            button.dataset.id =
                player.id;


            button.textContent =
                player.name;


            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".member-choice"
                        )
                        .forEach(
                            item => {

                                item.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    button.classList.add(
                        "selected"
                    );


                    selectedPlayerId =
                        player.id;


                    game.playerName =
                        player.name;


                    if (nameError) {

                        nameError.textContent =
                            "";

                    }


                    if (nameContinueBtn) {

                        nameContinueBtn.disabled =
                            false;

                    }

                }
            );


            membersList.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   CONTINUE PLAYER
========================================================= */

if (nameContinueBtn) {

    nameContinueBtn.addEventListener(
        "click",
        () => {

            if (!selectedPlayerId) {

                if (nameError) {

                    nameError.textContent =
                        "Please choose your name.";

                }

                return;
            }


            startPlayerGame();

        }
    );

}

/* =========================================================
   START PLAYER GAME
========================================================= */

function startPlayerGame() {

    game.accepted =
        0;


    game.rejected =
        0;


    game.score =
        0;


    game.usedInterviewIds =
        [];


    game.currentInterview =
        null;


    game.selectedDecision =
        null;


    game.selectedQuestions =
        [];


    game.currentQuestionIndex =
        0;


    game.gameStartedAt =
        new Date().toISOString();


    updateScore();


    showScreen(
        "officeScreen"
    );


    prepareOffice();

}


/* =========================================================
   OFFICE PREPARATION
========================================================= */

function prepareOffice() {

    hideElement(
        "paperDeck"
    );

    hideElement(
        "candidateCharacter"
    );

    hideElement(
        "idButton"
    );

    hideElement(
        "chatButton"
    );

    hideElement(
        "paperDecision"
    );


    const nextButton =
        $("nextBtn");


    if (nextButton) {

        nextButton.classList.remove(
            "hidden"
        );

        nextButton.disabled =
            false;

    }


    /*
       Reset stamps
    */

    if (acceptedStamp) {

        acceptedStamp.disabled =
            false;

        acceptedStamp.classList.remove(
            "stamp-hit"
        );

    }


    if (rejectedStamp) {

        rejectedStamp.disabled =
            false;

        rejectedStamp.classList.remove(
            "stamp-hit"
        );

    }

}


/* =========================================================
   NEXT INTERVIEW BUTTON
========================================================= */

const nextBtn =
    $("nextBtn");


if (nextBtn) {

    nextBtn.addEventListener(
        "click",
        startNextInterview
    );

}


/* =========================================================
   RANDOM INTERVIEW
========================================================= */

function getRandomInterview() {

    if (
        interviews.length ===
        0
    ) {

        return null;

    }


    let available =
        interviews.filter(
            interview =>
                !game.usedInterviewIds.includes(
                    interview.id
                )
        );


    /*
       If all interviews were used,
       start the pool again.
    */

    if (
        available.length ===
        0
    ) {

        game.usedInterviewIds =
            [];

        available =
            [...interviews];

    }


    const randomIndex =
        Math.floor(
            Math.random() *
            available.length
        );


    return available[
        randomIndex
    ];

}


/* =========================================================
   START INTERVIEW
========================================================= */

function startNextInterview() {

    const interview =
        getRandomInterview();


    if (!interview) {

        alert(
            "There are no interviews available yet. Ask the administrator to add interviews."
        );

        return;

    }


    game.currentInterview =
        interview;


    game.usedInterviewIds.push(
        interview.id
    );


    game.selectedDecision =
        null;


    game.selectedQuestions =
        [];


    game.currentQuestionIndex =
        0;


    hideElement(
        "nextBtn"
    );


    hideElement(
        "paperDecision"
    );


    hideElement(
        "idButton"
    );


    hideElement(
        "chatButton"
    );


    showElement(
        "paperDeck"
    );


    renderInterview();


    animateCandidateEntrance();

}


/* =========================================================
   RENDER INTERVIEW
========================================================= */

function renderInterview() {

    const interview =
        game.currentInterview;


    if (!interview) {
        return;
    }

    /* =====================================================
       CV
    ====================================================== */

    const cvContent =
        $("cvContent");


    if (cvContent) {

        cvContent.innerHTML = `

            <div class="candidate-photo-small">

                <img
                    src="${escapeHTML(
                        interview.photo ||
                        "images/1.png"
                    )}"
                    alt="Candidate"
                >

            </div>


            <div class="cv-field">

                <strong>
                    Name:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.name
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Address:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.address
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Phone Number:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.phone
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Age:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.age
                    )}
                </span>

            </div>


            <div class="cv-section">

                <strong>
                    Short Summary
                </strong>

                <p>
                    ${escapeHTML(
                        interview.summary
                    )}
                </p>

            </div>


            <div class="cv-section">

                <strong>
                    Soft Skills
                </strong>

                <p>
                    ${escapeHTML(
                        interview.softSkills
                    )}
                </p>

            </div>


            <div class="cv-section">

                <strong>
                    Technical Skills
                </strong>

                <p>
                    ${escapeHTML(
                        interview.technicalSkills
                    )}
                </p>

            </div>


            <div class="cv-section">

                <strong>
                    Languages
                </strong>

                <p>
                    ${escapeHTML(
                        interview.languages
                    )}
                </p>

            </div>


            <div class="cv-section">

                <strong>
                    Experience
                </strong>

                <p>
                    ${escapeHTML(
                        interview.experience
                    )}
                </p>

            </div>

        `;

    }


    /* =====================================================
       PERSONAL CARD
    ====================================================== */

    const personalCard =
        $("personalCardContent");


    if (personalCard) {

        personalCard.innerHTML = `

            <div class="candidate-photo-small">

                <img
                    src="${escapeHTML(
                        interview.photo ||
                        "images/1.png"
                    )}"
                    alt="Candidate"
                >

            </div>


            <div class="cv-field">

                <strong>
                    Name:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.name
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Address:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.address
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Nationality:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.nationality
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    National ID:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.nationalId
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Status:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.status
                    )}
                </span>

            </div>

        ;

    }


    /* =====================================================
       APPLICATION DATA
    ====================================================== */

    const applicationContent =
        $("applicationContent");


    if (applicationContent) {

        applicationContent.innerHTML = 

            <div class="cv-field">

                <strong>
                    Name:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.name
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Gender:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.gender ||
                        "—"
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Phone Number:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.phone
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Age:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.age
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Community:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.community
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Governorate:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.governorate
                    )}
                </span>

            </div>


            <div class="cv-field">

                <strong>
                    Committee:
                </strong>

                <span>
                    ${escapeHTML(
                        interview.committee ||
                        "HR"
                    )}
                </span>

            </div>

        `;

    }


    /* =====================================================
       CHARACTER
    ====================================================== */

    const characterImage =
        $("candidateCharacterImage");


    if (characterImage) {

        characterImage.src =
            interview.photo ||
            "images/1.png";

    }

}


/* =========================================================
   CHARACTER ENTRANCE
========================================================= */

function animateCandidateEntrance() {

    const character =
        $("candidateCharacter");


    if (!character) {
        return;
    }

    character.classList.remove(
        "hidden"
    );


    character.style.opacity =
        "0";


    character.style.transform =
        "translateX(-25px)";


    requestAnimationFrame(
        () => {

            character.style.transition =
                "opacity 0.8s ease, transform 0.8s ease";


            character.style.opacity =
                "1";


            character.style.transform =
                "translateX(0)";

        }
    );

}


/* =========================================================
   PAPERS
========================================================= */

[
    "paper1",
    "paper2",
    "paper3"
].forEach(
    id => {

        const paper =
            $(id);


        if (!paper) {
            return;
        }


        paper.addEventListener(
            "click",
            () => {

                paper.classList.toggle(
                    "paper-active"
                );

            }
        );

    }
);


/* =========================================================
   CANDIDATE PHOTO
========================================================= */

const cvEyeCard =
    $("cvEyeCard");


if (cvEyeCard) {

    cvEyeCard.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            openCandidatePhoto();

        }
    );

}


document
    .querySelectorAll(
        ".personal-eye"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    openCandidatePhoto();

                }
            );

        }
    );


function openCandidatePhoto() {

    if (!game.currentInterview) {
        return;
    }


    const image =
        $("candidatePhotoLarge");


    if (image) {

        image.src =
            game.currentInterview.photo ||
            "images/1.png";

    }


    showElement(
        "candidatePhotoModal"
    );

}


/* =========================================================
   MODALS
========================================================= */

document
    .querySelectorAll(
        "[data-close]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    const modalId =
                        button.dataset.close;


                    hideElement(
                        modalId
                    );

                }
            );

        }
    );


document
    .querySelectorAll(
        ".modal-overlay"
    )
    .forEach(
        overlay => {

            overlay.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    const modal =
                        overlay.closest(
                            ".modal"
                        );


                    if (modal) {

                        modal.classList.add(
                            "hidden"
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   STAMPS
========================================================= */

const acceptedStamp =
    $("acceptedStamp");

const rejectedStamp =
    $("rejectedStamp");


if (acceptedStamp) {

    acceptedStamp.addEventListener(
        "click",
        () => {

            makeDecision(
                "accepted"
            );

        }
    );

}


if (rejectedStamp) {

    rejectedStamp.addEventListener(
        "click",
        () => {

            makeDecision(
                "rejected"
            );

        }
    );

}


/* =========================================================
   DECISION
========================================================= */

function makeDecision(
    decision
) {

    if (!game.currentInterview) {
        return;
    }


    /*
       Prevent changing decision.
    */

    if (game.selectedDecision) {
        return;
    }


    game.selectedDecision =
        decision;


    const stamp =
        decision === "accepted"
            ? acceptedStamp
            : rejectedStamp;


    animateStamp(
        stamp,
        decision
    );


    if (decision === "accepted") {

        game.accepted++;

    } else {

        game.rejected++;

    }


    const correct =
        decision ===
        game.currentInterview.decision;


    if (correct) {

        game.score +=
            10;

    } else {

        game.score -=
            10;

    }


    updateScore();


    const decisionText =
        $("paperDecision");


    if (decisionText) {

        decisionText.textContent =
            decision === "accepted"
                ? "ACCEPTED"
                : "REJECTED";


        decisionText.classList.remove(
            "hidden"
        );


        decisionText.classList.remove(
            "decision-accepted",
            "decision-rejected"
        );


        decisionText.classList.add(
            decision === "accepted"
                ? "decision-accepted"
                : "decision-rejected"
        );

    }


    /*
       ID is only available
       when candidate is accepted.
    */

    if (
        decision ===
        "accepted"
    ) {

        showElement(
            "idButton"
        );

    } else {

        hideElement(
            "idButton"
        );

    }


    /*
       Chat is available
       after decision.
    */

    showElement(
        "chatButton"
    );


    /*
       Disable stamps.
    */

    if (acceptedStamp) {

        acceptedStamp.disabled =
            true;

    }


    if (rejectedStamp) {

        rejectedStamp.disabled =
            true;

    }


    saveInterviewResult(
        decision,
        correct
    );

}


/* =========================================================
   STAMP ANIMATION
========================================================= */

function animateStamp(
    stamp,
    decision
) {

    if (!stamp) {
        return;
    }


    stamp.classList.add(
        "stamp-hit"
    );


    setTimeout(
        () => {

            stamp.classList.remove(
                "stamp-hit"
            );

        },
        700
    );


    const paperDecision =
        $("paperDecision");


    if (paperDecision) {

        paperDecision.textContent =
            decision === "accepted"
                ? "ACCEPTED"
                : "REJECTED";


        paperDecision.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   SCORE
========================================================= */

function updateScore() {

    const accepted =
        $("acceptedCount");


    const rejected =
        $("rejectedCount");


    const score =
        $("scoreCount");


    if (accepted) {

        accepted.textContent =
            game.accepted;

    }


    if (rejected) {

        rejected.textContent =
            game.rejected;

    }


    if (score) {

        score.textContent =
            game.score;

    }

}


/* =========================================================
   ID CARD
========================================================= */

const idButton =
    $("idButton");


if (idButton) {

    idButton.addEventListener(
        "click",
        openGeneratedId
    );

}


function openGeneratedId() {

    if (!game.currentInterview) {
        return;
    }


    const interview =
        game.currentInterview;


    const photo =
        $("generatedIdPhoto");


    const name =
        $("generatedIdName");


    const committee =
        $("generatedIdCommittee");


    if (photo) {

        photo.src =
            interview.photo ||
            "images/1.png";

    }


    if (name) {

        name.textContent =
            interview.name ||
            "";

    }


    if (committee) {

        committee.textContent =
            interview.committee ||
            "HR";

    }


    showElement(
        "idModal"
    );

}

/* =========================================================
   INTERVIEW CHAT
========================================================= */

const chatButton =
    $("chatButton");


if (chatButton) {

    chatButton.addEventListener(
        "click",
        openQuestionChat
    );

}


function openQuestionChat() {

    if (!game.currentInterview) {
        return;
    }


    if (questions.length === 0) {

        alert(
            "There are no interview questions yet."
        );

        return;
    }


    /*
       Shuffle questions.
    */

    const shuffled =
        [...questions].sort(
            () =>
                Math.random() -
                0.5
        );


    /*
       Select maximum 10.
    */

    game.selectedQuestions =
        shuffled.slice(
            0,
            Math.min(
                10,
                shuffled.length
            )
        );


    game.currentQuestionIndex =
        0;


    hideElement(
        "questionAnswer"
    );


    hideElement(
        "nextQuestionBtn"
    );


    showElement(
        "questionModal"
    );


    renderCurrentQuestion();

}


/* =========================================================
   RENDER QUESTION
========================================================= */

function renderCurrentQuestion() {

    const choices =
        $("questionChoices");


    const progress =
        $("questionProgress");


    if (!choices) {
        return;
    }


    choices.innerHTML =
        "";


    hideElement(
        "questionAnswer"
    );


    hideElement(
        "nextQuestionBtn"
    );


    const total =
        game.selectedQuestions.length;


    const index =
        game.currentQuestionIndex;


    if (progress) {

        progress.textContent =
            `Choose a question — ${Math.min(
                index,
                total
            )} / ${total}`;

    }


    /*
       All questions completed.
    */

    if (
        index >=
        total
    ) {

        choices.innerHTML = 
            <div class="question-finished">
                Interview questions completed.
            </div>
        ;


        if (progress) {

            progress.textContent =
                `Interview complete — ${total} / ${total}`;

        }


        return;

    }


    game.selectedQuestions.forEach(
        question => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "question-choice";


            button.textContent =
                question.text;


            button.addEventListener(
                "click",
                () => {

                    chooseInterviewQuestion(
                        question
                    );

                }
            );


            choices.appendChild(
                button
            );

        }
    );

}


/* =========================================================
   CHOOSE QUESTION
========================================================= */

function chooseInterviewQuestion(
    question
) {

    const choices =
        $("questionChoices");


    if (choices) {

        choices
            .querySelectorAll(
                "button"
            )
            .forEach(
                button => {

                    button.disabled =
                        true;

                }
            );

    }


    const answer =
        getInterviewAnswer(
            question.id
        );


    const answerBox =
        $("questionAnswer");


    if (answerBox) {

        answerBox.innerHTML = 

            `<div class="answer-label">
                Candidate's Answer
            </div>


            <div class="answer-text">

                ${escapeHTML(
                    answer ||
                    "No answer was provided for this question."
                )}

            </div>`

        ;


        answerBox.classList.remove(
            "hidden"
        );

    }

    const next =
        $("nextQuestionBtn");


    if (next) {

        next.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   GET ANSWER
========================================================= */

function getInterviewAnswer(
    questionId
) {

    if (!game.currentInterview) {
        return "";
    }


    const answers =
        game.currentInterview.answers ||
        {};


    return (
        answers[
            questionId
        ] ||
        ""
    );

}


/* =========================================================
   NEXT QUESTION
========================================================= */

const nextQuestionBtn =
    $("nextQuestionBtn");


if (nextQuestionBtn) {

    nextQuestionBtn.addEventListener(
        "click",
        () => {

            game.currentQuestionIndex++;


            renderCurrentQuestion();

        }
    );

}


/* =========================================================
   SAVE RESULT
========================================================= */

function saveInterviewResult(
    decision,
    correct
) {

    if (!game.currentInterview) {
        return;
    }


    const result = {

        id:
            createId(
                "result"
            ),

        player:
            game.playerName,

        gender:
            game.gender,

        interviewId:
            game.currentInterview.id,

        interview:
            game.currentInterview.name,

        decision:
            decision,

        correct:
            correct,

        score:
            correct
                ? 10
                : -10,

        questions:
            game.selectedQuestions.length,

        finished:
            new Date()
                .toISOString()

    };


    results.push(
        result
    );


    saveData(
        STORAGE_KEYS.results,
        results
    );

}


/* =========================================================
   ADMIN PANEL
========================================================= */

function openAdminPanel() {

    showScreen(
        "adminScreen"
    );


    renderAdmin();

}


/* =========================================================
   ADMIN TABS
========================================================= */

document
    .querySelectorAll(
        ".admin-tabs button"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const tab =
                        button.dataset.tab;


                    document
                        .querySelectorAll(
                            ".admin-tabs button"
                        )
                        .forEach(
                            btn => {

                                btn.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );


                    document
                        .querySelectorAll(
                            ".admin-tab"
                        )
                        .forEach(
                            section => {

                                section.classList.remove(
                                    "active-tab"
                                );

                            }
                        );


                    const target =
                        $(
                            "tab-" +
                            tab
                        );


                    if (target) {

                        target.classList.add(
                            "active-tab"
                        );

                    }

                }
            );

        }
    );


/* =========================================================
   ADMIN REFRESH
========================================================= */

const adminRefreshBtn =
    $("adminRefreshBtn");

    if (adminRefreshBtn) {

    adminRefreshBtn.addEventListener(
        "click",
        renderAdmin
    );

}


/* =========================================================
   ADMIN RENDER
========================================================= */

function renderAdmin() {

    renderStats();

    renderInterviewList();

    renderPlayerAdminList();

    renderQuestionAdminList();

    renderResults();

}


/* =========================================================
   ADMIN STATS
========================================================= */

function renderStats() {

    const statMembers =
        $("statMembers");


    const statInterviews =
        $("statInterviews");


    const statQuestions =
        $("statQuestions");


    const statResults =
        $("statResults");


    if (statMembers) {

        statMembers.textContent =
            players.length;

    }


    if (statInterviews) {

        statInterviews.textContent =
            interviews.length;

    }


    if (statQuestions) {

        statQuestions.textContent =
            questions.length;

    }


    if (statResults) {

        statResults.textContent =
            results.length;

    }

}


/* =========================================================
   ADMIN INTERVIEW LIST
========================================================= */

function renderInterviewList() {

    const list =
        $("interviewList");


    if (!list) {
        return;
    }


    list.innerHTML =
        "";


    if (interviews.length === 0) {

        list.innerHTML = 
            <div class="empty-message">
                No interviews yet.
            </div>
        ;

        return;
    }


    interviews.forEach(
        interview => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-list-item";


            item.innerHTML = `

                <div class="admin-item-info">

                    <strong>
                        ${escapeHTML(
                            interview.name
                        )}
                    </strong>


                    <span>
                        Committee:
                        ${escapeHTML(
                            interview.committee ||
                            "HR"
                        )}
                    </span>


                    <span>
                        Correct:
                        ${escapeHTML(
                            interview.decision
                        )}
                    </span>

                </div>


                <div class="admin-item-actions">

                    <button
                        class="admin-edit-btn"
                        type="button"
                        data-edit-interview="${escapeHTML(
                            interview.id
                        )}"
                    >
                        EDIT
                    </button>


                    <button
                        class="admin-delete-btn"
                        type="button"
                        data-delete-interview="${escapeHTML(
                            interview.id
                        )}"
                    >
                        DELETE
                    </button>

                </div>

            `;


            list.appendChild(
                item
            );

        }
    );


    list
        .querySelectorAll(
            "[data-edit-interview]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openInterviewEditor(
                            button.dataset
                                .editInterview
                        );

                    }
                );

            }
        );


    list
        .querySelectorAll(
            "[data-delete-interview]"
        )
        .forEach(
            button => {
                button.addEventListener(
                    "click",
                    () => {

                        deleteInterview(
                            button.dataset
                                .deleteInterview
                        );

                    }
                );

            }
        );

}


/* =========================================================
   ADD INTERVIEW
========================================================= */

const addInterviewBtn =
    $("addInterviewBtn");


if (addInterviewBtn) {

    addInterviewBtn.addEventListener(
        "click",
        () => {

            openInterviewEditor();

        }
    );

}


/* =========================================================
   INTERVIEW EDITOR
========================================================= */

function openInterviewEditor(
    interviewId = null
) {

    const form =
        $("interviewForm");


    if (!form) {
        return;
    }


    form.reset();


    $("editInterviewId").value =
        "";


    $("fPhoto").value =
        "images/1.png";


    $("fCommittee").value =
        "HR";


    if ($("fDecision")) {

        $("fDecision").value =
            "accepted";

    }


    if (interviewId) {

        const interview =
            interviews.find(
                item =>
                    item.id ===
                    interviewId
            );


        if (!interview) {
            return;
        }


        $("editorTitle").textContent =
            "Edit Interview";


        $("editInterviewId").value =
            interview.id;


        fillField(
            "fPhoto",
            interview.photo
        );


        fillField(
            "fName",
            interview.name
        );


        fillField(
            "fAge",
            interview.age
        );


        fillField(
            "fAddress",
            interview.address
        );


        fillField(
            "fPhone",
            interview.phone
        );


        fillField(
            "fSummary",
            interview.summary
        );


        fillField(
            "fSoftSkills",
            interview.softSkills
        );


        fillField(
            "fTechnicalSkills",
            interview.technicalSkills
        );


        fillField(
            "fLanguages",
            interview.languages
        );


        fillField(
            "fExperience",
            interview.experience
        );


        fillField(
            "fNationality",
            interview.nationality
        );


        fillField(
            "fNationalId",
            interview.nationalId
        );


        fillField(
            "fStatus",
            interview.status
        );


        fillField(
            "fCommunity",
            interview.community
        );


        fillField(
            "fGovernorate",
            interview.governorate
        );


        fillField(
            "fCommittee",
            interview.committee ||
            "HR"
        );


        if ($("fDecision")) {

            $("fDecision").value =
                interview.decision ||
                "accepted";

        }

    } else {

        $("editorTitle").textContent =
            "Add Interview";

    }


    renderInterviewAnswerFields(
        interviewId
    );


    showElement(
        "adminEditor"
    );

}


/* =========================================================
   FILL FIELD
========================================================= */

function fillField(
    id,
    value
) {

    const element =
        $(id);


    if (element) {

        element.value =
            value || "";

    }

}


/* =========================================================
   INTERVIEW ANSWERS
========================================================= */

function renderInterviewAnswerFields(
    interviewId = null
) {

    const container =
        $("interviewAnswers");


    if (!container) {
        return;
    }


    container.innerHTML =
        "";


    let interview =
        null;


    if (interviewId) {
        interview =
            interviews.find(
                item =>
                    item.id ===
                    interviewId
            );

    }


    const answers =
        interview?.answers ||
        {};


    if (questions.length === 0) {

        container.innerHTML = 
            <div class="empty-message">
                Add questions first.
            </div>
        ;

        return;
    }


    questions.forEach(
        question => {

            const wrapper =
                document.createElement(
                    "div"
                );


            wrapper.className =
                "answer-editor-row";


            wrapper.innerHTML = `
                <label>
                    ${escapeHTML(
                        question.text
                    )}
                </label>


                <textarea
                    data-answer-question="${escapeHTML(
                        question.id
                    )}"
                    placeholder="Candidate's answer..."
                >${escapeHTML(
                    answers[
                        question.id
                    ] ||
                    ""
                )}</textarea>
            `;


            container.appendChild(
                wrapper
            );

        }
    );

}


/* =========================================================
   SAVE INTERVIEW
========================================================= */

const interviewForm =
    $("interviewForm");


if (interviewForm) {

    interviewForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const id =
                $("editInterviewId")
                    .value ||
                createId(
                    "interview"
                );


            const existing =
                interviews.find(
                    item =>
                        item.id ===
                        id
                );


            const answers =
                {};


            document
                .querySelectorAll(
                    "[data-answer-question]"
                )
                .forEach(
                    textarea => {

                        answers[
                            textarea.dataset
                                .answerQuestion
                        ] =
                            textarea.value.trim();

                    }
                );


            const interview = {

                id:

                    id,


                photo:

                    $("fPhoto")
                        .value
                        .trim() ||

                    "images/1.png",


                name:

                    $("fName")
                        .value
                        .trim(),


                age:

                    $("fAge")
                        .value
                        .trim(),


                address:

                    $("fAddress")
                        .value
                        .trim(),


                phone:

                    $("fPhone")
                        .value
                        .trim(),


                summary:

                    $("fSummary")
                        .value
                        .trim(),


                softSkills:

                    $("fSoftSkills")
                        .value
                        .trim(),


                technicalSkills:

                    $("fTechnicalSkills")
                        .value
                        .trim(),


                languages:

                    $("fLanguages")
                        .value
                        .trim(),


                experience:

                    $("fExperience")
                        .value
                        .trim(),


                nationality:

                    $("fNationality")
                        .value
                        .trim(),


                nationalId:
                $("fNationalId")
                        .value
                        .trim(),


                status:

                    $("fStatus")
                        .value
                        .trim(),


                community:

                    $("fCommunity")
                        .value
                        .trim(),


                governorate:

                    $("fGovernorate")
                        .value
                        .trim(),


                committee:

                    $("fCommittee")
                        .value
                        .trim() ||

                    "HR",


                decision:

                    $("fDecision")
                        .value ||


                    "accepted",


                answers:

                    answers

            };


            if (existing) {

                interviews =
                    interviews.map(
                        item =>
                            item.id ===
                            id
                                ? interview
                                : item
                    );

            } else {

                interviews.push(
                    interview
                );

            }


            saveData(
                STORAGE_KEYS.interviews,
                interviews
            );


            hideElement(
                "adminEditor"
            );


            renderAdmin();

        }
    );

}


/* =========================================================
   DELETE INTERVIEW
========================================================= */

function deleteInterview(
    id
) {

    const interview =
        interviews.find(
            item =>
                item.id ===
                id
        );


    if (!interview) {
        return;
    }


    const confirmed =
        confirm(
            `Delete interview for ${interview.name}?`
        );


    if (!confirmed) {
        return;
    }


    interviews =
        interviews.filter(
            item =>
                item.id !==
                id
        );


    saveData(
        STORAGE_KEYS.interviews,
        interviews
    );


    renderAdmin();

}


/* =========================================================
   PLAYER ADMIN
========================================================= */

const addMemberBtn =
    $("addMemberBtn");


if (addMemberBtn) {

    addMemberBtn.addEventListener(
        "click",
        () => {

            openPlayerEditor();

        }
    );

}


/* =========================================================
   RENDER PLAYERS
========================================================= */

function renderPlayerAdminList() {

    const list =
        $("memberAdminList");


    if (!list) {
        return;
    }


    list.innerHTML =
        "";


    if (players.length === 0) {

        list.innerHTML = 
            <div class="empty-message">
                No players added yet.
            </div>
        ;

        return;
    }


    players.forEach(
        player => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-list-item";


            item.innerHTML = `

                <div class="admin-item-info">

                    <strong>
                        ${escapeHTML(
                            player.name
                        )}
                    </strong>

                </div>


                <div class="admin-item-actions">

                    <button
                        class="admin-edit-btn"
                        type="button"
                        data-edit-player="${escapeHTML(
                            player.id
                        )}"
                    >
                        EDIT
                    </button>
                    <button
                        class="admin-delete-btn"
                        type="button"
                        data-delete-player="${escapeHTML(
                            player.id
                        )}"
                    >
                        DELETE
                    </button>

                </div>

            `;


            list.appendChild(
                item
            );

        }
    );


    list
        .querySelectorAll(
            "[data-edit-player]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openPlayerEditor(
                            button.dataset
                                .editPlayer
                        );

                    }
                );

            }
        );


    list
        .querySelectorAll(
            "[data-delete-player]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deletePlayer(
                            button.dataset
                                .deletePlayer
                        );

                    }
                );

            }
        );

}


/* =========================================================
   PLAYER EDITOR
========================================================= */

function openPlayerEditor(
    playerId = null
) {

    const form =
        $("memberForm");


    if (!form) {
        return;
    }


    form.reset();


    $("editMemberId").value =
        "";


    if (playerId) {

        const player =
            players.find(
                item =>
                    item.id ===
                    playerId
            );


        if (!player) {
            return;
        }


        $("editMemberId").value =
            player.id;


        $("memberName").value =
            player.name ||
            "";

    }


    showElement(
        "memberEditor"
    );

}


/* =========================================================
   SAVE PLAYER
========================================================= */

const memberForm =
    $("memberForm");


if (memberForm) {

    memberForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                $("memberName")
                    .value
                    .trim();


            if (!name) {
                return;
            }


            const id =
                $("editMemberId")
                    .value ||
                createId(
                    "player"
                );


            const player = {

                id:

                    id,

                name:

                    name

            };


            const existing =
                players.some(
                    item =>
                        item.id ===
                        id
                );


            if (existing) {

                players =
                    players.map(
                        item =>
                            item.id ===
                            id
                                ? player
                                : item
                    );

            } else {

                players.push(
                    player
                );

            }


            saveData(
                STORAGE_KEYS.players,
                players
            );


            hideElement(
                "memberEditor"
            );


            renderAdmin();

        }
    );

}


/* =========================================================
   DELETE PLAYER
========================================================= */

function deletePlayer(
    id
) {

    const player =
        players.find(
            item =>
                item.id ===
                id
        );


    if (!player) {
        return;
    }

    if (
        !confirm(
            `Delete player "${player.name}"?`
        )
    ) {

        return;

    }


    players =
        players.filter(
            item =>
                item.id !==
                id
        );


    saveData(
        STORAGE_KEYS.players,
        players
    );


    renderAdmin();

}


/* =========================================================
   QUESTIONS ADMIN
========================================================= */

const addQuestionBtn =
    $("addQuestionBtn");


if (addQuestionBtn) {

    addQuestionBtn.addEventListener(
        "click",
        () => {

            openQuestionEditor();

        }
    );

}


/* =========================================================
   RENDER QUESTIONS
========================================================= */

function renderQuestionAdminList() {

    const list =
        $("questionAdminList");


    if (!list) {
        return;
    }


    list.innerHTML =
        "";


    if (questions.length === 0) {

        list.innerHTML = 
            <div class="empty-message">
                No questions yet.
            </div>
        ;

        return;
    }


    questions.forEach(
        (question, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "admin-list-item";


            item.innerHTML = `
                <div class="admin-item-info">

                    <strong>
                        Q${index + 1}
                    </strong>


                    <span>
                        ${escapeHTML(
                            question.text
                        )}
                    </span>

                </div>


                <div class="admin-item-actions">

                    <button
                        class="admin-edit-btn"
                        type="button"
                        data-edit-question="${escapeHTML(
                            question.id
                        )}"
                    >
                        EDIT
                    </button>


                    <button
                        class="admin-delete-btn"
                        type="button"
                        data-delete-question="${escapeHTML(
                            question.id
                        )}"
                    >
                        DELETE
                    </button>

                </div>
            `;


            list.appendChild(
                item
            );

        }
    );


    list
        .querySelectorAll(
            "[data-edit-question]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        openQuestionEditor(
                            button.dataset
                                .editQuestion
                        );

                    }
                );

            }
        );


    list
        .querySelectorAll(
            "[data-delete-question]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteQuestion(
                            button.dataset
                                .deleteQuestion
                        );

                    }
                );

            }
        );

}


/* =========================================================
   QUESTION EDITOR
========================================================= */

function openQuestionEditor(
    questionId = null
) {

    const form =
        $("questionForm");


    if (!form) {
        return;
    }


    form.reset();


    $("editQuestionId").value =
        "";


    if (questionId) {

        const question =
            questions.find(
                item =>
                    item.id ===
                    questionId
            );


        if (!question) {
            return;
        }

        $("editQuestionId").value =
            question.id;


        $("questionText").value =
            question.text ||
            "";

    }


    showElement(
        "questionEditor"
    );

}


/* =========================================================
   SAVE QUESTION
========================================================= */

const questionForm =
    $("questionForm");


if (questionForm) {

    questionForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const text =
                $("questionText")
                    .value
                    .trim();


            if (!text) {
                return;
            }


            const id =
                $("editQuestionId")
                    .value ||
                createId(
                    "question"
                );


            const question = {

                id:

                    id,

                text:

                    text

            };


            const existing =
                questions.some(
                    item =>
                        item.id ===
                        id
                );


            if (existing) {

                questions =
                    questions.map(
                        item =>
                            item.id ===
                            id
                                ? question
                                : item
                    );

            } else {

                questions.push(
                    question
                );

            }


            saveData(
                STORAGE_KEYS.questions,
                questions
            );


            hideElement(
                "questionEditor"
            );


            renderAdmin();

        }
    );

}


/* =========================================================
   DELETE QUESTION
========================================================= */

function deleteQuestion(
    id
) {

    const question =
        questions.find(
            item =>
                item.id ===
                id
        );


    if (!question) {
        return;
    }


    if (
        !confirm(
            "Delete this question?"
        )
    ) {

        return;

    }


    questions =
        questions.filter(
            item =>
                item.id !==
                id
        );


    saveData(
        STORAGE_KEYS.questions,
        questions
    );


    renderAdmin();

}


/* =========================================================
   RESULTS
========================================================= */

function renderResults() {

    const body =
        $("resultsBody");


    if (!body) {
        return;
    }


    body.innerHTML =
        "";


    if (results.length === 0) {

        body.innerHTML = 

            <tr>

                <td colspan="7">
                    No results yet.
                </td>

            </tr>

        ;

        return;
    }


    [...results]
        .reverse()
        .forEach(
            result => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${escapeHTML(
                            result.player
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            result.interview
                        )}
                    </td>


                    <td>
                        ${escapeHTML(
                            result.decision
                        )}
                    </td>


                    <td>
                        ${
                            result.correct
                                ? "YES"
                                : "NO"
                        }
                    </td>


                    <td>
                        ${result.score}
                    </td>

                    <td>
                        ${result.questions}
                    </td>


                    <td>
                        ${formatDate(
                            result.finished
                        )}
                    </td>

                `;


                body.appendChild(
                    row
                );

            }
        );

}


/* =========================================================
   CLEAR RESULTS
========================================================= */

const clearResultsBtn =
    $("clearResultsBtn");


if (clearResultsBtn) {

    clearResultsBtn.addEventListener(
        "click",
        () => {

            if (
                !confirm(
                    "Are you sure you want to clear all results?"
                )
            ) {

                return;

            }


            results =
                [];


            saveData(
                STORAGE_KEYS.results,
                results
            );


            renderAdmin();

        }
    );

}


/* =========================================================
   DATE
========================================================= */

function formatDate(
    date
) {

    if (!date) {

        return "—";

    }


    try {

        return new Date(
            date
        ).toLocaleString();

    } catch (error) {

        return date;

    }

}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key !==
            "Escape"
        ) {

            return;

        }


        document
            .querySelectorAll(
                ".modal"
            )
            .forEach(
                modal => {

                    modal.classList.add(
                        "hidden"
                    );

                }
            );

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

function initializeGame() {

    showScreen(
        "introScreen"
    );


    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(
            modal => {

                modal.classList.add(
                    "hidden"
                );

            }
        );


    updateScore();


    /*
       Make sure role screen is hidden.
    */

    const roleScreen =
        $("roleScreen");


    if (roleScreen) {

        roleScreen.classList.add(
            "hidden"
        );

    }


    /*
       Try to play intro.
    */

    if (introVideo) {

        try {

            const playPromise =
                introVideo.play();


            if (
                playPromise &&
                typeof playPromise.catch ===
                    "function"
            ) {

                playPromise.catch(
                    error => {

                        console.log(
                            "Autoplay was blocked.",
                            error
                        );

                    }
                );

            }

        } catch (error) {

            console.log(
                "Video play error:",
                error
            );

        }

    }

}


/* =========================================================
   START
========================================================= */

initializeGame();


/* =========================================================
   DEBUG
========================================================= */

window.YDP_HR = {

    game,

    get players() {

        return players;

    },

    get interviews() {

        return interviews;

    },

    get questions() {

        return questions;

    },

    get results() {

        return results;

    },


    resetAllData() {

        localStorage.removeItem(
            STORAGE_KEYS.players
        );


        localStorage.removeItem(
            STORAGE_KEYS.interviews
        );

        localStorage.removeItem(
            STORAGE_KEYS.questions
        );


        localStorage.removeItem(
            STORAGE_KEYS.results
        );


        location.reload();

    }

};