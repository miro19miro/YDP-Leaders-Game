/* =========================================
   YDP HR GAME
   PHASE 1 + PLAYER NAME SELECTION

   FLOW:

   INTRO
      ↓
   CODE
      ↓
   PLAYER / ADMIN

   PLAYER:
      ↓
   GENDER
      ↓
   NAME FROM MEMBER LIST
      ↓
   HR OFFICE

   ADMIN:
      ↓
   CONTROL PANEL
========================================= */


/* =========================================
   ACCESS CODES
========================================= */

const ADMIN_CODE = "BYS20M";
const PLAYER_CODE = "MEM201";


/* =========================================
   TEMPORARY MEMBERS

   دول مؤقتين للاختبار فقط.

   بعد ما نعمل Admin Panel و Add Member
   هنخلي الـAdmin هو اللي يتحكم في القائمة.
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
   INITIALIZE MEMBERS
========================================= */

function initializeMembers() {

    const savedMembers =
        localStorage.getItem("hrMembers");


    if (!savedMembers) {

        localStorage.setItem(
            "hrMembers",
            JSON.stringify(DEFAULT_MEMBERS)
        );

    }

}


/* =========================================
   GET MEMBERS
========================================= */

function getMembers() {

    const savedMembers =
        localStorage.getItem("hrMembers");


    if (!savedMembers) {

        return [];

    }


    try {

        return JSON.parse(savedMembers);

    } catch (error) {

        console.error(
            "Could not read HR members:",
            error
        );

        return [];

    }

}


/* =========================================
   DOM ELEMENTS
========================================= */

const introScreen =
    document.getElementById("introScreen");

const introVideo =
    document.getElementById("introVideo");


const codeScreen =
    document.getElementById("codeScreen");

const codeInput =
    document.getElementById("codeInput");

const enterCodeBtn =
    document.getElementById("enterCodeBtn");

const codeError =
    document.getElementById("codeError");


const genderScreen =
    document.getElementById("genderScreen");

const girlChoice =
    document.getElementById("girlChoice");

const boyChoice =
    document.getElementById("boyChoice");


const nameScreen =
    document.getElementById("nameScreen");

const membersList =
    document.getElementById("membersList");

const nameContinueBtn =
    document.getElementById("nameContinueBtn");

const nameError =
    document.getElementById("nameError");


const playerReadyScreen =
    document.getElementById("playerReadyScreen");

const welcomeText =
    document.getElementById("welcomeText");


const adminScreen =
    document.getElementById("adminScreen");


/* =========================================
   PLAYER DATA
========================================= */

let selectedGender = null;

let selectedMember = null;


/* =========================================
   START
========================================= */

initializeMembers();


/* =========================================
   INTRO → CODE
========================================= */

introVideo.addEventListener(
    "ended",
    () => {

        showCodeScreen();

    }
);


/* =========================================
   SHOW CODE SCREEN
========================================= */

function showCodeScreen() {

    introScreen.classList.add("hidden");

    codeScreen.classList.remove("hidden");


    setTimeout(
        () => {

            codeInput.focus();

        },
        300
    );

}


/* =========================================
   CHECK CODE
========================================= */

function checkCode() {

    const enteredCode =
        codeInput.value
            .trim()
            .toUpperCase();


    codeError.textContent = "";


    /* Empty */

    if (!enteredCode) {
        codeError.textContent =
            "Please enter your code.";

        return;

    }


    /* ADMIN */

    if (enteredCode === ADMIN_CODE) {

        openAdmin();

        return;

    }


    /* PLAYER */

    if (enteredCode === PLAYER_CODE) {

        openPlayer();

        return;

    }


    /* WRONG */

    codeError.textContent =
        "Invalid code. Please try again.";

}


/* =========================================
   OPEN ADMIN
========================================= */

function openAdmin() {

    codeScreen.classList.add("hidden");

    adminScreen.classList.remove("hidden");

}


/* =========================================
   OPEN PLAYER
========================================= */

function openPlayer() {

    codeScreen.classList.add("hidden");

    genderScreen.classList.remove("hidden");

}


/* =========================================
   GIRL SELECT
========================================= */

girlChoice.addEventListener(
    "click",
    () => {

        selectGender("girl");

    }
);


/* =========================================
   BOY SELECT
========================================= */

boyChoice.addEventListener(
    "click",
    () => {

        selectGender("boy");

    }
);


/* =========================================
   SELECT GENDER
========================================= */

function selectGender(gender) {

    selectedGender = gender;


    const selectedCharacter =
        gender === "girl"
            ? girlChoice
            : boyChoice;


    selectedCharacter.style.transform =
        "scale(1.08) translateY(-10px)";


    setTimeout(
        () => {

            genderScreen.classList.add("hidden");

            openNameScreen();

        },
        350
    );

}


/* =========================================
   OPEN NAME SCREEN
========================================= */

function openNameScreen() {

    nameScreen.classList.remove("hidden");

    renderMembers();

}


/* =========================================
   RENDER MEMBER LIST
========================================= */

function renderMembers() {

    const members =
        getMembers();


    membersList.innerHTML = "";

    selectedMember = null;

    nameContinueBtn.disabled = true;

    nameError.textContent = "";


    /* No members */

    if (members.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "No members are available yet.";

        emptyMessage.style.color =
            "#777";

        emptyMessage.style.padding =
            "20px";

        membersList.appendChild(
            emptyMessage
        );

        return;

    }


    /* Create buttons */

    members.forEach(
        (member) => {

            const memberButton =
                document.createElement("button");


            memberButton.type =
                "button";


            memberButton.className =
                "member-option";


            memberButton.textContent =
                member.name;


            memberButton.dataset.memberId =
                member.id;


            memberButton.addEventListener(
                "click",
                () => {

                    selectMember(
                        member,
                        memberButton
                    );

                }
            );


            membersList.appendChild(
                memberButton
            );

        }
    );

}


/* =========================================
   SELECT MEMBER
========================================= */

function selectMember(
    member,
    selectedButton
) {

    selectedMember = member;


    const allButtons =
        document.querySelectorAll(
            ".member-option"
        );


    allButtons.forEach(
        (button) => {

            button.classList.remove(
                "selected"
            );

        }
    );


    selectedButton.classList.add(
        "selected"
    );


    nameContinueBtn.disabled =
        false;


    nameError.textContent = "";

}
/* =========================================
   CONTINUE AFTER NAME
========================================= */

nameContinueBtn.addEventListener(
    "click",
    continueWithMember
);


/* =========================================
   CONTINUE WITH SELECTED MEMBER
========================================= */

function continueWithMember() {

    if (!selectedMember) {

        nameError.textContent =
            "Please choose your name.";

        return;

    }


    /*
       Save player information.
    */

    const playerData = {

        memberId:
            selectedMember.id,

        name:
            selectedMember.name,

        gender:
            selectedGender,

        startTime:
            new Date().toISOString(),

        score: 0,

        accepted: 0,

        rejected: 0

    };


    localStorage.setItem(
        "hrCurrentPlayer",
        JSON.stringify(playerData)
    );


    /*
       Temporary screen.
       هنستبدلها بالـHR Office.
    */

    nameScreen.classList.add(
        "hidden"
    );

    playerReadyScreen.classList.remove(
        "hidden"
    );


    welcomeText.textContent = `Welcome ${selectedMember.name}!`;

}


/* =========================================
   ENTER KEY ON CODE
========================================= */

codeInput.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Enter") {

            checkCode();

        }

    }
);


/* =========================================
   ENTER BUTTON
========================================= */

enterCodeBtn.addEventListener(
    "click",
    checkCode
);