/* =========================================
   HR GAME - PHASE 1
   INTRO → CODE → PLAYER / ADMIN
========================================= */


/* =========================================
   CODES
========================================= */

const ADMIN_CODE = "BYS20M";
const PLAYER_CODE = "MEM201";


/* =========================================
   ELEMENTS
========================================= */

const introScreen = document.getElementById("introScreen");
const introVideo = document.getElementById("introVideo");

const codeScreen = document.getElementById("codeScreen");

const codeInput = document.getElementById("codeInput");
const enterCodeBtn = document.getElementById("enterCodeBtn");
const codeError = document.getElementById("codeError");

const resultScreen = document.getElementById("resultScreen");
const resultTitle = document.getElementById("resultTitle");
const resultText = document.getElementById("resultText");


/* =========================================
   SHOW CODE SCREEN
========================================= */

function showCodeScreen() {

    introScreen.classList.add("hidden");

    codeScreen.classList.remove("hidden");

    setTimeout(() => {
        codeInput.focus();
    }, 300);
}


/* =========================================
   INTRO FINISHED
========================================= */

introVideo.addEventListener("ended", () => {

    showCodeScreen();

});


/* =========================================
   ENTER CODE
========================================= */

function checkCode() {

    const enteredCode = codeInput.value.trim().toUpperCase();

    codeError.textContent = "";


    /* Empty */

    if (!enteredCode) {

        codeError.textContent = "Please enter your code.";

        return;
    }


    /* Admin */

    if (enteredCode === ADMIN_CODE) {

        openAdmin();

        return;
    }


    /* Player */

    if (enteredCode === PLAYER_CODE) {

        openPlayer();

        return;
    }


    /* Wrong code */

    codeError.textContent = "Invalid code. Please try again.";

}


/* =========================================
   ADMIN
========================================= */

function openAdmin() {

    codeScreen.classList.add("hidden");

    resultScreen.classList.remove("hidden");

    resultTitle.textContent = "Admin Access";

    resultText.textContent =
        "Admin code accepted. Control Panel will be connected next.";

}


/* =========================================
   PLAYER
========================================= */

function openPlayer() {

    codeScreen.classList.add("hidden");

    resultScreen.classList.remove("hidden");

    resultTitle.textContent = "Player Access";

    resultText.textContent =
        "Player code accepted. Gender selection will be connected next.";

}


/* =========================================
   BUTTON
========================================= */

enterCodeBtn.addEventListener("click", checkCode);


/* =========================================
   ENTER KEY
========================================= */

codeInput.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        checkCode();

    }

});