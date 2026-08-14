const ADMIN_CODE = "BYS20M";
const PLAYER_CODE = "MEM201";

const KEYS = {
    members: "hrMembersV2",
    interviews: "hrInterviewsV2",
    questions: "hrQuestionsV2",
    results: "hrResultsV2"
};

const $ = id => document.getElementById(id);

const read = (key, fallback = []) => {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
        return fallback;
    }
};

const write = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const uid = prefix =>
    `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const esc = value =>
    String(value ?? "").replace(/[&<>'"]/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;"
    }[c]));

const show = el => {
    if (el) el.classList.remove("hidden");
};

const hide = el => {
    if (el) el.classList.add("hidden");
};


/* =========================================
   GAME STATE
========================================= */

let state = {
    gender: null,
    member: null,
    interview: null,

    paperIndex: 0,

    decision: null,
    stamping: false,

    questionCount: 0,
    chosenQuestions: [],
    questionRound: 0,
    currentQuestion: null,

    sessionStarted: null
};


/* =========================================
   ELEMENTS
========================================= */

const introScreen = $("introScreen");
const introVideo = $("introVideo");

const codeScreen = $("codeScreen");
const codeInput = $("codeInput");
const codeError = $("codeError");

const genderScreen = $("genderScreen");

const nameScreen = $("nameScreen");
const membersList = $("membersList");
const nameContinueBtn = $("nameContinueBtn");
const nameError = $("nameError");

const officeScreen = $("officeScreen");

const nextBtn = $("nextBtn");

const paperDeck = $("paperDeck");
const paper1 = $("paper1");
const paper2 = $("paper2");
const paper3 = $("paper3");

const candidateCharacter = $("candidateCharacter");
const candidateCharacterImage = $("candidateCharacterImage");

const cvEyeCard = $("cvEyeCard");

const acceptedStamp = $("acceptedStamp");
const rejectedStamp = $("rejectedStamp");

const paperDecision = $("paperDecision");

const acceptedCount = $("acceptedCount");
const rejectedCount = $("rejectedCount");
const scoreCount = $("scoreCount");

const chatButton = $("chatButton");
const idButton = $("idButton");


/* =========================================
   STORAGE HELPERS
========================================= */

function getMembers() {
    return read(KEYS.members);
}

function getInterviews() {
    return read(KEYS.interviews);
}

function getQuestions() {
    return read(KEYS.questions);
}

function getResults() {
    return read(KEYS.results);
}


/* =========================================
   INTRO
========================================= */

function finishIntro() {
    hide(introScreen);
    show(codeScreen);

    setTimeout(() => {
        if (codeInput) {
            codeInput.focus();
        }
    }, 200);
}

if (introVideo) {
    introVideo.addEventListener("ended", finishIntro);
    introVideo.addEventListener("error", finishIntro);
}


/* =========================================
   CODE
========================================= */

function checkCode() {

    const code = codeInput.value
        .trim()
        .toUpperCase();

    codeError.textContent = "";

    if (code === ADMIN_CODE) {

        hide(codeScreen);

        openAdmin();

        return;
    }

    if (code === PLAYER_CODE) {

        hide(codeScreen);

        show(genderScreen);

        return;
    }

    codeError.textContent =
        code
            ? "Invalid code. Please try again."
            : "Please enter your code.";
}

if ($("enterCodeBtn")) {

    $("enterCodeBtn")
        .addEventListener("click", checkCode);
}

if (codeInput) {

    codeInput.addEventListener("keydown", e => {

        if (e.key === "Enter") {
            checkCode();
        }

    });
}

/* =========================================
   GENDER
========================================= */

document
    .querySelectorAll(".gender-choice")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            state.gender = btn.dataset.gender;

            hide(genderScreen);

            show(nameScreen);

            renderPlayerMembers();
        });

    });


/* =========================================
   PLAYER NAMES
========================================= */

function renderPlayerMembers() {

    const members = getMembers();

    membersList.innerHTML = "";

    state.member = null;

    nameContinueBtn.disabled = true;

    nameError.textContent = "";

    if (!members.length) {

        membersList.innerHTML =
            <div class="admin-note">
                No player names have been added by the Admin yet.
            </div>
            ;

        return;
    }

    members.forEach(member => {

        const button =
            document.createElement("button");

        button.className = "member-option";

        button.type = "button";

        button.textContent = member.name;

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".member-option")
                .forEach(item =>
                    item.classList.remove("selected")
                );

            button.classList.add("selected");

            state.member = member;

            nameContinueBtn.disabled = false;
        });

        membersList.appendChild(button);

    });
}


if (nameContinueBtn) {

    nameContinueBtn.addEventListener("click", () => {

        if (!state.member) {

            nameError.textContent =
                "Please choose your name.";

            return;
        }

        openOffice();

    });

}


/* =========================================
   OFFICE
========================================= */

function openOffice() {

    hide(nameScreen);

    show(officeScreen);

    state.sessionStarted = Date.now();

    state.paperIndex = 0;

    state.decision = null;

    state.questionCount = 0;

    state.chosenQuestions = [];

    state.questionRound = 0;

    resetOffice();

    updateScorePanel();
}


function resetOffice() {

    hide(paperDeck);

    hide(candidateCharacter);

    hide(cvEyeCard);

    hide(acceptedStamp);

    hide(rejectedStamp);

    hide(chatButton);

    hide(idButton);

    hide(paperDecision);

    paperDecision.textContent = "";

    state.interview = null;

    state.decision = null;

    state.stamping = false;

    nextBtn.textContent = "NEXT";

    show(nextBtn);
}


/* =========================================
   NEXT
========================================= */

if (nextBtn) {

    nextBtn.addEventListener("click", () => {

        startNextInterview();

    });

}


function startNextInterview() {

    const interviews = getInterviews();

    if (!interviews.length) {

        alert(
            "Admin has not added any interviews yet."
        );

        return;
    }

    const results =
        getResults()
            .filter(
                result =>
                    result.playerId ===
                    state.member?.id
            );

    const completedIds =
        new Set(
            results.map(
                result =>
                    result.interviewId
            )
        );

    const next =
        interviews.find(
            interview =>
                !completedIds.has(interview.id)
        ) || interviews[0];

    state.interview = next;

    state.paperIndex = 0;

    state.decision = null;

    state.questionCount = 0;

    state.chosenQuestions = [];

    state.questionRound = 0;

    state.currentQuestion = null;

    hide(nextBtn);

    hide(paperDecision);

    hide(acceptedStamp);

    hide(rejectedStamp);

    hide(idButton);

    show(chatButton);

    fillPapers(next);

    show(paperDeck);

    show(candidateCharacter);

    candidateCharacterImage.src =
        next.photo;

    paperDeck.classList.remove("fly-out");

    void paperDeck.offsetWidth;
    paperDeck.classList.add("fly-out");

    setTimeout(() => {

        show(cvEyeCard);

    }, 450);
}


/* =========================================
   PAPERS
========================================= */

function basePaper(title, body) {

    return `
        <h2>${esc(title)}</h2>
        ${body}
    `;
}


function fillPapers(interview) {

    const cv =
        interview.cv || {};

    const id =
        interview.idCard || {};

    const committeeData =
        interview.committeeData || {};


    /* CV */

    paper1.innerHTML =
        basePaper(
            "CURRICULUM VITAE",
            `
            <div class="cv-grid">

                <div class="cv-field">
                    <b>Name:</b>
                    ${esc(cv.name || interview.name)}
                </div>

                <div class="cv-field">
                    <b>Age:</b>
                    ${esc(cv.age || interview.age)}
                </div>

                <div class="cv-field">
                    <b>Address:</b>
                    ${esc(cv.address || "")}
                </div>

                <div class="cv-field">
                    <b>Phone:</b>
                    ${esc(cv.phone || "")}
                </div>

            </div>

            <div class="cv-summary">

                <h3>About</h3>

                <p>
                    ${esc(cv.summary || "")}
                </p>

            </div>

            <div class="skill-list">

                <h3>Soft Skills</h3>

                <p>
                    ${esc(cv.softSkills || "")}
                </p>

                <h3>Technical Skills</h3>

                <p>
                    ${esc(cv.technicalSkills || "")}
                </p>

                <h3>Languages</h3>

                <p>
                    ${esc(cv.languages || "")}
                </p>

                <h3>Experience</h3>

                <p>
                    ${esc(cv.experience || "")}
                </p>

            </div>
            `
        );


    /* PERSONAL ID */

    paper2.innerHTML =
        basePaper(
            "PERSONAL ID",
            `
            <div class="cv-summary">

                <p>
                    <b>Name:</b>
                    ${esc(id.name || interview.name)}
                </p>

                <p>
                    <b>Address:</b>
                    ${esc(id.address || "")}
                </p>

                <p>
                    <b>Nationality:</b>
                    ${esc(id.nationality || "")}
                </p>

                <p>
                    <b>National ID:</b>
                    ${esc(id.nationalId || "")}
                </p>

                <p>
                    <b>Status:</b>
                    ${esc(id.status || "")}
                </p>

            </div>
            `
        );


    /* APPLICATION DATA */

    paper3.innerHTML =
        basePaper(
            "APPLICATION DATA",
            `
            <div class="cv-summary">

                <p>
                    <b>Name:</b>
                    ${esc(
                committeeData.name ||
                interview.name
            )}
                </p>

                <p>
                    <b>Gender:</b>
                    ${esc(
                committeeData.gender ||
                ""
            )}
                </p>

                <p>
                    <b>Phone number:</b>
                    ${esc(
                committeeData.phone ||
                ""
            )}
                </p>

                <p>
                    <b>Age:</b>
                    ${esc(
                committeeData.age ||
                interview.age
            )}
                </p>

                <p>
                    <b>Community:</b>
                    ${esc(
                committeeData.community ||
                ""
            )}
                </p>
                <p>
                    <b>Governorate:</b>
                    ${esc(
                committeeData.governorate ||
                ""
            )}
                </p>

                <p>
                    <b>Committee:</b>
                    ${esc(
                committeeData.committee ||
                interview.committee ||
                "HR"
            )}
                </p>

            </div>
            `
        );


    [paper1, paper2, paper3]
        .forEach((paper, index) => {

            paper.classList
                .remove("active-paper");

            paper.style.zIndex =
                String(3 - index);

            paper.onclick = () =>
                cyclePaper(index);

        });


    activatePaper(0);
}


/* =========================================
   PAPER TURN
========================================= */

function activatePaper(index) {

    state.paperIndex = index;

    [paper1, paper2, paper3]
        .forEach((paper, i) => {

            paper.classList.toggle(
                "active-paper",
                i === index
            );

            paper.style.zIndex =
                i === index
                    ? 5
                    : 3 - i;

            paper.style.transform =
                i === index
                    ? "translate(0,0) rotate(-1deg)"
                    : `translate(${(i - index) * 18}px, ${(i - index) * 18}px) rotate(${(i - index) * 3}deg)`;
        });


    if (index === 0) {

        show(cvEyeCard);

    } else {

        hide(cvEyeCard);

    }

}


function cyclePaper(index) {

    if (index !== state.paperIndex) {
        return;
    }

    activatePaper(
        (state.paperIndex + 1) % 3
    );

}


/* =========================================
   EYE / PHOTO
========================================= */

if (cvEyeCard) {

    cvEyeCard.addEventListener(
        "click",
        () => {

            if (!state.interview) {
                return;
            }

            $("candidatePhotoLarge").src =
                state.interview.photo;

            show(
                $("candidatePhotoModal")
            );

        }
    );

}


/* =========================================
   CLOSE MODALS
========================================= */

document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                hide(
                    $(button.dataset.close)
                );

            }
        );

    });


/* =========================================
   STAMPS
========================================= */

if (acceptedStamp) {

    acceptedStamp.addEventListener(
        "click",
        () => stampDecision("accepted")
    );

}

if (rejectedStamp) {

    rejectedStamp.addEventListener(
        "click",
        () => stampDecision("rejected")
    );

}


function stampDecision(decision) {

    if (
        state.stamping ||
        state.decision
    ) {
        return;
    }

    state.stamping = true;

    state.decision = decision;

    const stamp =
        decision === "accepted"
            ? acceptedStamp
            : rejectedStamp;

    const img =
        stamp.querySelector("img");

    const stampRect =
        img.getBoundingClientRect();

    const paper =
        paperDeck.querySelector(
            ".active-paper"
        );

    const paperRect =
        paper.getBoundingClientRect();


    const moving =
        stamp.cloneNode(true);

    moving.classList.remove("hidden");

    moving.style.position = "fixed";

    moving.style.left =
        stampRect.left + "px";

    moving.style.top =
        stampRect.top + "px";

    moving.style.width =
        stampRect.width + "px";

    moving.style.zIndex = "999";
    moving.style.transition =
        "left .65s cubic-bezier(.22,1,.36,1), top .65s cubic-bezier(.22,1,.36,1), transform .65s ease";

    moving.style.transform =
        "rotate(0) scale(1)";

    document.body.appendChild(
        moving
    );


    requestAnimationFrame(() => {

        moving.style.left =
            (
                paperRect.left +
                paperRect.width * 0.5 -
                stampRect.width * 0.5
            ) + "px";

        moving.style.top =
            (
                paperRect.top +
                paperRect.height * 0.56 -
                stampRect.height * 0.5
            ) + "px";

        moving.style.transform =
            "rotate(-8deg) scale(.72)";

    });


    setTimeout(() => {

        moving.remove();

        showDecision(decision);

    }, 1150);

}


/* =========================================
   DECISION
========================================= */

function showDecision(decision) {

    paperDecision.textContent =
        decision === "accepted"
            ? "ACCEPTED"
            : "REJECTED";


    paperDecision.style.color =
        decision === "accepted"
            ? "#159447"
            : "#d62828";


    paperDecision.style.borderColor =
        paperDecision.style.color;


    show(paperDecision);

    hide(acceptedStamp);

    hide(rejectedStamp);


    saveResult(decision);

    updateScorePanel();


    state.stamping = false;


    show(nextBtn);

    nextBtn.textContent =
        "NEXT";


    if (decision === "accepted") {

        show(idButton);

    }

}


/* =========================================
   RESULTS
========================================= */

function saveResult(decision) {

    const results =
        getResults();

    const correct =
        state.interview.correctDecision ===
        decision;

    const score =
        correct
            ? 10
            : -10;


    results.push({

        id: uid("result"),

        playerId:
            state.member.id,

        playerName:
            state.member.name,

        gender:
            state.gender,

        interviewId:
            state.interview.id,

        interviewName:
            state.interview.name,

        decision,

        correct,

        score,

        questionsAsked:
            state.questionCount,

        startedAt:
            state.sessionStarted,

        finishedAt:
            Date.now()

    });


    write(
        KEYS.results,
        results
    );

}


function updateScorePanel() {

    if (!state.member) {

        acceptedCount.textContent = "0";

        rejectedCount.textContent = "0";

        scoreCount.textContent = "0";

        return;
    }


    const results =
        getResults()
            .filter(
                result =>
                    result.playerId ===
                    state.member.id
            );


    acceptedCount.textContent =
        results.filter(
            result =>
                result.decision === "accepted"
        ).length;


    rejectedCount.textContent =
        results.filter(
            result =>
                result.decision === "rejected"
        ).length;


    scoreCount.textContent =
        results.reduce(
            (total, result) =>
                total + result.score,
            0
        );

}


/* =========================================
   ID CARD
========================================= */

if (idButton) {

    idButton.addEventListener(
        "click",
        () => {

            const interview =
                state.interview;

            if (!interview) {
                return;
            }


            $("generatedIdPhoto").src =
                interview.photo;


            $("generatedIdName")
                .textContent =
                interview.name;


            $("generatedIdCommittee")
                .textContent =
                interview.committeeData?.committee ||
                interview.committee ||
                "HR";


            show(
                $("idModal")
            );
        }
    );

}


/* =========================================
   QUESTIONS
========================================= */

if (chatButton) {

    chatButton.addEventListener(
        "click",
        openQuestionChat
    );

}


function getInterviewQuestions() {

    const bank =
        getQuestions();

    const answers =
        state.interview?.answers || {};


    return bank
        .filter(
            question =>
                answers[question.id]?.trim()
        )
        .map(question => ({
            ...question,
            answer:
                answers[question.id]
        }));

}


function openQuestionChat() {

    if (
        !state.interview ||
        state.decision
    ) {
        return;
    }


    state.questionRound = 0;

    state.questionCount = 0;

    state.chosenQuestions = [];

    state.currentQuestion = null;


    show(
        $("questionModal")
    );


    renderQuestionChoices();

}


function renderQuestionChoices() {

    const choices =
        $("questionChoices");

    const progress =
        $("questionProgress");

    const answer =
        $("questionAnswer");

    const nextQuestion =
        $("nextQuestionBtn");


    progress.textContent =
        `Choose a question — ${state.questionRound} / 10`;


    choices.innerHTML = "";

    hide(answer);

    hide(nextQuestion);


    if (
        state.questionRound >= 10
    ) {

        choices.innerHTML =
            `
                <div class="admin-note">
                    You have completed the
                    10-question interview.
                </div>
            `;

        return;
    }


    const available =
        getInterviewQuestions()
            .filter(
                question =>
                    !state.chosenQuestions
                        .includes(question.id)
            );


    if (!available.length) {

        choices.innerHTML = `
            <div class="admin-note">
                There are not enough answered
                questions for this character yet.
            </div>
        `;

        return;
    }


    available.forEach(question => {

        const button =
            document.createElement("button");

        button.className =
            "question-choice";

        button.textContent =
            question.text;


        button.onclick = () =>
            askQuestion(question);


        choices.appendChild(button);

    });

}


function askQuestion(question) {

    state.currentQuestion =
        question;

    state.chosenQuestions.push(
        question.id
    );

    state.questionRound++;

    state.questionCount++;


    $("questionProgress")
        .textContent =
        `Question ${ state.questionRound } / 10`;


    $("questionChoices").innerHTML = `
        <div
            class="question-choice"
            style="cursor:default"
        >
            <b>
                ${esc(question.text)}
            </b>
        </div>
    `;


    $("questionAnswer").innerHTML = `
        <b>
            ${esc(state.interview.name)}:
        </b>
        <br>
        ${esc(question.answer)}
    `;


    show(
        $("questionAnswer")
    );


    if (
        state.questionRound < 10
    ) {

        $("nextQuestionBtn")
            .textContent =
            "CHOOSE NEXT";

        show(
            $("nextQuestionBtn")
        );

    } else {

        $("nextQuestionBtn")
            .textContent =
            "FINISH INTERVIEW";

        show(
            $("nextQuestionBtn")
        );

    }

}


if ($("nextQuestionBtn")) {

    $("nextQuestionBtn")
        .addEventListener(
            "click",
            () => {

                if (
                    state.questionRound >= 10
                ) {

                    hide(
                        $("questionModal")
                    );

                    return;
                }

                renderQuestionChoices();

            }
        );

}


/* =========================================
   ADMIN
========================================= */

function openAdmin() {

    show(
        $("adminScreen")
    );
    renderAdmin();

}


function renderAdmin() {

    renderOverview();

    renderInterviewAdmin();

    renderMemberAdmin();

    renderQuestionAdmin();

    renderResultsAdmin();

}


function renderOverview() {

    $("statMembers").textContent =
        getMembers().length;

    $("statInterviews").textContent =
        getInterviews().length;

    $("statQuestions").textContent =
        getQuestions().length;

    $("statResults").textContent =
        getResults().length;

}


/* =========================================
   ADMIN TABS
========================================= */

document
    .querySelectorAll(".admin-tabs button")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".admin-tabs button"
                    )
                    .forEach(button =>
                        button.classList
                            .remove("active")
                    );


                document
                    .querySelectorAll(
                        ".admin-tab"
                    )
                    .forEach(section =>
                        section.classList
                            .remove("active-tab")
                    );


                tab.classList.add(
                    "active"
                );


                $("tab-" + tab.dataset.tab)
                    .classList
                    .add("active-tab");

            }
        );

    });


/* =========================================
   ADMIN BUTTONS
========================================= */

if ($("adminRefreshBtn")) {

    $("adminRefreshBtn")
        .addEventListener(
            "click",
            renderAdmin
        );

}


if ($("addInterviewBtn")) {

    $("addInterviewBtn")
        .addEventListener(
            "click",
            () => openInterviewEditor()
        );

}


if ($("addMemberBtn")) {

    $("addMemberBtn")
        .addEventListener(
            "click",
            () => openMemberEditor()
        );

}


if ($("addQuestionBtn")) {

    $("addQuestionBtn")
        .addEventListener(
            "click",
            () => openQuestionEditor()
        );

}


if ($("clearResultsBtn")) {

    $("clearResultsBtn")
        .addEventListener(
            "click",
            () => {

                if (
                    confirm(
                        "Clear all results?"
                    )
                ) {

                    write(
                        KEYS.results,
                        []
                    );

                    renderAdmin();

                }

            }
        );

}


/* =========================================
   INTERVIEW ADMIN
========================================= */

function renderInterviewAdmin() {

    const list =
        $("interviewList");

    list.innerHTML = "";

    const items =
        getInterviews();


    if (!items.length) {

        list.innerHTML = 
            <div class="admin-note">
                No interviews yet.
                Add the first candidate.
            </div>
        ;

        return;
    }


    items.forEach(interview => {

        const row =
            document.createElement("div");

        row.className =
            "admin-row";


        row.innerHTML = `

            <div class="admin-row-main">

                <div class="admin-row-title">
                    ${esc(interview.name)}
                </div>

                <div class="admin-row-sub">

                    ${esc(
                        interview.committee ||
                        "HR"
                    )}

                    · Correct decision:

                    ${esc(
                        interview.correctDecision
                    )}

                    ·${
                        Object
                            .values(
                                interview.answers || {}
                            )
                            .filter(Boolean)
                            .length
                    }

                    answered questions

                </div>

            </div>


            <div class="admin-actions">

                <button
                    class="action-btn edit"
                >
                    Edit
                </button>

                <button
                    class="action-btn delete"
                >
                    Delete
                </button>

            </div>
        ;


        row
            .querySelector(".edit")
            .onclick = () =>
                openInterviewEditor(
                    interview.id
                );


        row
            .querySelector(".delete")
            .onclick = () => {

                if (
                    confirm(
                        "Delete this interview?"
                    )
                ) {

                    write(
                        KEYS.interviews,
                        getInterviews()
                            .filter(
                                item =>
                                    item.id !==
                                    interview.id
                            )
                    );

                    renderAdmin();

                }

            };


        list.appendChild(row);

    });

}


/* =========================================
   MEMBERS ADMIN
========================================= */

function renderMemberAdmin() {

    const list =
        $("memberAdminList");

    list.innerHTML = "";

    const items =
        getMembers();


    if (!items.length) {

        list.innerHTML = 
            <div class="admin-note">
                No members yet.
            </div>
        ;

        return;
    }


    items.forEach(member => {

        const row =
            document.createElement("div");

        row.className =
            "admin-row";


        row.innerHTML = 

            <div class="admin-row-main">

                <div class="admin-row-title">
                    ${esc(member.name)}
                </div>

                <div class="admin-row-sub">
                    ${esc(member.id)}
                </div>

            </div>


            <div class="admin-actions">

                <button
                    class="action-btn edit"
                >
                    Edit
                </button>

                <button
                    class="action-btn delete"
                >
                    Delete
                </button>

            </div>
        `;


        row
            .querySelector(".edit")
            .onclick = () =>
                openMemberEditor(
                    member.id
                );


        row
            .querySelector(".delete")
            .onclick = () => {

                if (
                    confirm(
                        "Delete this member?"
                    )
                ) {
                    deleteMember(
                        member.id
                    );

                    renderMembers();
                }
            };

        list.appendChild(row);
    });

    return;
}