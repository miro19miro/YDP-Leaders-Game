/* =========================================
   YDP HR GAME
========================================= */


/* =========================================
   ACCESS CODES
========================================= */

const ADMIN_CODE = "BYS20M";
const PLAYER_CODE = "MEM201";


/* =========================================
   TEMPORARY MEMBERS
========================================= */

const DEFAULT_MEMBERS = [
    {
        id: "member_001",
        name: "Mariam Waleed Aref"
    },
    {
        id: "member_002",
        name: "Ahmed Mohamed Ali"
    },
    {
        id: "member_003",
        name: "Sara Mahmoud Hassan"
    }
];


/* =========================================
   TEMPORARY INTERVIEW
========================================= */

const TEST_INTERVIEW = {

    id: "test_001",

    photo: "images/1.jpg",

    name: "Ahmed Mohamed Ali",

    nationalId: "29806151234567",

    university: "Cairo University",

    faculty: "Faculty of Commerce",

    age: 21,

    committee: "HR",

    governorate: "Cairo",

    availability: "80%",

    questions: [

        {
            question:
                "Tell us about yourself.",

            answer:
                "I am a motivated university student who enjoys teamwork and learning new skills."
        },

        {
            question:
                "Why do you want to join YDP?",

            answer:
                "I want to develop my leadership skills and contribute to the team."
        },

        {
            question:
                "How do you deal with pressure?",

            answer:
                "I try to organize my priorities and stay calm while solving the problem."
        }

    ],

    /*
       TEST ONLY

       هنغير ده لما الـAdmin هو اللي
       يعمل الـInterview.
    */

    correctDecision: "accepted"

};


/* =========================================
   DOM
========================================= */

const introScreen =
    document.getElementById(
        "introScreen"
    );

const introVideo =
    document.getElementById(
        "introVideo"
    );


const codeScreen =
    document.getElementById(
        "codeScreen"
    );

const codeInput =
    document.getElementById(
        "codeInput"
    );

const enterCodeBtn =
    document.getElementById(
        "enterCodeBtn"
    );

const codeError =
    document.getElementById(
        "codeError"
    );


const genderScreen =
    document.getElementById(
        "genderScreen"
    );

const girlChoice =
    document.getElementById(
        "girlChoice"
    );

const boyChoice =
    document.getElementById(
        "boyChoice"
    );


const nameScreen =
    document.getElementById(
        "nameScreen"
    );

const membersList =
    document.getElementById(
        "membersList"
    );

const nameContinueBtn =
    document.getElementById(
        "nameContinueBtn"
    );

const nameError =
    document.getElementById(
        "nameError"
    );


const officeScreen =
    document.getElementById(
        "officeScreen"
    );

const nextBtn =
    document.getElementById(
        "nextBtn"
    );


const deskPaper =
    document.getElementById(
        "deskPaper"
    );

const eyeButton =
    document.getElementById(
        "eyeButton"
    );


const paperModal =
    document.getElementById(
        "paperModal"
    );

const closePaperBtn =
    document.getElementById(
        "closePaperBtn"
    );


const paperPhoto =
    document.getElementById(
        "paperPhoto"
    );

const paperName =
    document.getElementById(
        "paperName"
    );

const paperCommittee =
    document.getElementById(
        "paperCommittee"
    );


const fullPaperPhoto =
    document.getElementById(
        "fullPaperPhoto"
    );

const fullName =
    document.getElementById(
        "fullName"
    );

const fullNationalId =
    document.getElementById(
        "fullNationalId"
    );

const fullUniversity =
    document.getElementById(
        "fullUniversity"
    );

const fullFaculty =
    document.getElementById(
        "fullFaculty"
    );
    const fullAge =
    document.getElementById(
        "fullAge"
    );

const fullCommittee =
    document.getElementById(
        "fullCommittee"
    );

const fullGovernorate =
    document.getElementById(
        "fullGovernorate"
    );

const fullAvailability =
    document.getElementById(
        "fullAvailability"
    );

const questionsContainer =
    document.getElementById(
        "questionsContainer"
    );


const acceptedStamp =
    document.getElementById(
        "acceptedStamp"
    );

const rejectedStamp =
    document.getElementById(
        "rejectedStamp"
    );


const paperDecision =
    document.getElementById(
        "paperDecision"
    );


const acceptedCount =
    document.getElementById(
        "acceptedCount"
    );

const rejectedCount =
    document.getElementById(
        "rejectedCount"
    );

const scoreCount =
    document.getElementById(
        "scoreCount"
    );


const adminScreen =
    document.getElementById(
        "adminScreen"
    );


/* =========================================
   DATA
========================================= */

let selectedGender = null;

let selectedMember = null;

let currentInterview =
    TEST_INTERVIEW;

let currentDecision = null;

let isStamping = false;


/* =========================================
   MEMBERS
========================================= */

function initializeMembers() {

    const saved =
        localStorage.getItem(
            "hrMembers"
        );


    if (!saved) {

        localStorage.setItem(
            "hrMembers",
            JSON.stringify(
                DEFAULT_MEMBERS
            )
        );

    }

}


function getMembers() {

    const saved =
        localStorage.getItem(
            "hrMembers"
        );


    if (!saved) {
        return [];
    }


    try {

        return JSON.parse(saved);

    } catch {

        return [];

    }

}


initializeMembers();


/* =========================================
   INTRO → CODE
========================================= */

introVideo.addEventListener(
    "ended",
    () => {

        introScreen.classList.add(
            "hidden"
        );

        codeScreen.classList.remove(
            "hidden"
        );

        setTimeout(
            () => {
                codeInput.focus();
            },
            300
        );

    }
);


/* =========================================
   CODE
========================================= */

function checkCode() {

    const code =
        codeInput.value
            .trim()
            .toUpperCase();


    codeError.textContent = "";


    if (!code) {

        codeError.textContent =
            "Please enter your code.";

        return;

    }


    if (code === ADMIN_CODE) {

        openAdmin();

        return;

    }


    if (code === PLAYER_CODE) {

        openPlayer();

        return;

    }


    codeError.textContent =
        "Invalid code. Please try again.";

}


enterCodeBtn.addEventListener(
    "click",
    checkCode
);


codeInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter"
        ) {

            checkCode();

        }

    }
);


/* =========================================
   ADMIN
========================================= */

function openAdmin() {

    codeScreen.classList.add(
        "hidden"
    );

    adminScreen.classList.remove(
        "hidden"
    );

}


/* =========================================
   PLAYER
========================================= */

function openPlayer() {

    codeScreen.classList.add(
        "hidden"
    );

    genderScreen.classList.remove(
        "hidden"
    );

}


/* =========================================
   GENDER
========================================= */

girlChoice.addEventListener(
    "click",
    () => {

        selectedGender =
            "girl";

        goToName();

    }
);


boyChoice.addEventListener(
    "click",
    () => {

        selectedGender =
            "boy";

        goToName();

    }
);


function goToName() { 
    genderScreen.classList.add(
        "hidden"
    );

    nameScreen.classList.remove(
        "hidden"
    );

    renderMembers();

}


/* =========================================
   MEMBERS
========================================= */

function renderMembers() {

    const members =
        getMembers();


    membersList.innerHTML =
        "";

    selectedMember =
        null;

    nameContinueBtn.disabled =
        true;

    nameError.textContent =
        "";


    members.forEach(
        (member) => {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";

            button.className =
                "member-option";

            button.textContent =
                member.name;


            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".member-option"
                        )
                        .forEach(
                            (item) => {

                                item.classList.remove(
                                    "selected"
                                );

                            }
                        );


                    button.classList.add(
                        "selected"
                    );


                    selectedMember =
                        member;


                    nameContinueBtn.disabled =
                        false;

                }
            );


            membersList.appendChild(
                button
            );

        }
    );

}


nameContinueBtn.addEventListener(
    "click",
    () => {

        if (!selectedMember) {

            nameError.textContent =
                "Please choose your name.";

            return;

        }


        openHROffice();

    }
);


/* =========================================
   OPEN OFFICE
========================================= */

function openHROffice() {

    nameScreen.classList.add(
        "hidden"
    );

    officeScreen.classList.remove(
        "hidden"
    );


    /*
       مفيش Character هنا خالص.
       الـID machine هو العنصر الموجود
       في مكان الشخصية القديم.
    */


    resetOffice();

}


/* =========================================
   RESET OFFICE
========================================= */

function resetOffice() {

    currentDecision =
        null;

    isStamping =
        false;


    deskPaper.classList.add(
        "hidden"
    );


    paperModal.classList.add(
        "hidden"
    );


    acceptedStamp.classList.add(
        "hidden"
    );


    rejectedStamp.classList.add(
        "hidden"
    );


    paperDecision.classList.add(
        "hidden"
    );


    paperDecision.textContent =
        "";


    nextBtn.classList.remove(
        "hidden"
    );

}


/* =========================================
   NEXT
========================================= */

nextBtn.addEventListener(
    "click",
    () => {

        showInterview();

    }
);


/* =========================================
   SHOW INTERVIEW
========================================= */

function showInterview() {

    nextBtn.classList.add(
        "hidden"
    );


    currentInterview =
        TEST_INTERVIEW;


    fillSmallPaper();


    deskPaper.classList.remove(
        "hidden"
    );


    /*
       لحد ما اللاعب يفتح الورقة،
       الـstamps مش ظاهرين.
    */

    acceptedStamp.classList.add(
        "hidden"
    );

    rejectedStamp.classList.add(
        "hidden"
    );

}


/* =========================================
   SMALL PAPER
========================================= */

function fillSmallPaper() {

    paperPhoto.src =
        currentInterview.photo;

    paperName.textContent =
        currentInterview.name;

    paperCommittee.textContent =
        currentInterview.committee;

}


/* =========================================
   OPEN FULL PAPER
========================================= */
eyeButton.addEventListener(
    "click",
    () => {

        fillFullPaper();

        paperModal.classList.remove(
            "hidden"
        );

    }
);


/* =========================================
   FILL FULL PAPER
========================================= */

function fillFullPaper() {

    fullPaperPhoto.src =
        currentInterview.photo;

    fullName.textContent =
        currentInterview.name;

    fullNationalId.textContent =
        currentInterview.nationalId;

    fullUniversity.textContent =
        currentInterview.university;

    fullFaculty.textContent =
        currentInterview.faculty;

    fullAge.textContent =
        currentInterview.age;

    fullCommittee.textContent =
        currentInterview.committee;

    fullGovernorate.textContent =
        currentInterview.governorate;

    fullAvailability.textContent =
        currentInterview.availability;


    questionsContainer.innerHTML =
        "";


    currentInterview.questions.forEach(
        (item, index) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "question-card";


            card.innerHTML = `
                <div class="question">
                    Q${index + 1}.
                    ${item.question}
                </div>

                <div class="answer">
                    ${item.answer}
                </div>
            `;


            questionsContainer.appendChild(
                card
            );

        }
    );

}


/* =========================================
   CLOSE PAPER
========================================= */

closePaperBtn.addEventListener(
    "click",
    () => {

        paperModal.classList.add(
            "hidden"
        );


        /*
           بعد ما يخلص قراءة الورقة،
           الختمين يظهروا.
        */

        acceptedStamp.classList.remove(
            "hidden"
        );

        rejectedStamp.classList.remove(
            "hidden"
        );

    }
);


/* =========================================
   STAMP CLICK
========================================= */

acceptedStamp.addEventListener(
    "click",
    () => {

        startStampAnimation(
            "accepted"
        );

    }
);


rejectedStamp.addEventListener(
    "click",
    () => {

        startStampAnimation(
            "rejected"
        );

    }
);


/* =========================================
   START STAMP ANIMATION
========================================= */

function startStampAnimation(
    decision
) {

    if (isStamping) {
        return;
    }


    if (currentDecision) {
        return;
    }


    isStamping =
        true;


    currentDecision =
        decision;


    const stamp =
        decision === "accepted"
            ? acceptedStamp
            : rejectedStamp;


    const stampImage =
        stamp.querySelector(
            "img"
        );


    const stampRect =
        stampImage.getBoundingClientRect();


    const paperRect =
        deskPaper.getBoundingClientRect();


    /*
       نعمل نسخة من الختم
       عشان الأصلي يفضل في مكانه.
    */

    const movingStamp =
        stamp.cloneNode(true);


    movingStamp.classList.remove(
        "hidden"
    );


    movingStamp.classList.add(
        "stamp-moving"
    );


    movingStamp.style.width =
        `${stampRect.width}px`;


    movingStamp.style.left =
        `${stampRect.left}px`;


    movingStamp.style.top =
        `${stampRect.top}px`;


    movingStamp.style.transform =
        "rotate(0deg) scale(1)";


    document.body.appendChild(
        movingStamp
    );


    /*
       مكان الختم على الورقة
    */

    const targetLeft =
        paperRect.left +
        paperRect.width * 0.5 -
        stampRect.width * 0.5;


    const targetTop =
        paperRect.top +
        paperRect.height * 0.58 -
        stampRect.height * 0.5;


    requestAnimationFrame(
        () => {

            movingStamp.style.left =
                `${targetLeft}px`;
                movingStamp.style.top =
                `${targetTop}px`;

            movingStamp.style.transform =
                "rotate(-8deg) scale(0.78)";

        }
    );


    /*
       بعد الوصول للورقة
    */

    setTimeout(
        () => {

            movingStamp.style.transform =
                "rotate(-8deg) scale(0.72)";

        },
        700
    );


    /*
       بعد الختم
    */

    setTimeout(
        () => {

            document.body.removeChild(
                movingStamp
            );


            showDecision(
                decision
            );


            returnStampToPlace(
                stamp
            );


        },
        1200
    );

}


/* =========================================
   SHOW DECISION ON PAPER
========================================= */

function showDecision(
    decision
) {

    paperDecision.textContent =
        decision === "accepted"
            ? "ACCEPTED"
            : "REJECTED";


    paperDecision.style.color =
        decision === "accepted"
            ? "#159447"
            : "#d62828";


    paperDecision.style.borderColor =
        decision === "accepted"
            ? "#159447"
            : "#d62828";


    paperDecision.classList.remove(
        "hidden"
    );


    updateScore(
        decision
    );

}


/* =========================================
   UPDATE SCORE
========================================= */

function updateScore(
    decision
) {

    const playerData =
        JSON.parse(
            localStorage.getItem(
                "hrCurrentPlayer"
            ) || "{}"
        );


    if (!playerData.accepted) {
        playerData.accepted =
            0;
    }


    if (!playerData.rejected) {
        playerData.rejected =
            0;
    }


    if (!playerData.score) {
        playerData.score =
            0;
    }


    if (
        decision === "accepted"
    ) {

        playerData.accepted++;

    } else {

        playerData.rejected++;

    }


    /*
       Test scoring.
       الـcorrectDecision الحالي = accepted
    */

    if (
        decision ===
        currentInterview.correctDecision
    ) {

        playerData.score +=
            10;

    } else {

        playerData.score -=
            10;

    }


    acceptedCount.textContent =
        playerData.accepted;

    rejectedCount.textContent =
        playerData.rejected;

    scoreCount.textContent =
        playerData.score;


    localStorage.setItem(
        "hrCurrentPlayer",
        JSON.stringify(
            playerData
        )
    );

}


/* =========================================
   STAMP RETURNS TO ORIGINAL PLACE
========================================= */

function returnStampToPlace(
    stamp
) {

    /*
       مجرد تأكيد بصري إن الختم
       رجع لمكانه الأصلي.
    */

    stamp.style.transform =
        "scale(1) rotate(0deg)";


    setTimeout(
        () => {

            isStamping =
                false;

        },
        250
    );

}