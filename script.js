/* =========================================
   ELEMENTS
========================================= */

const welcomeScreen = document.getElementById("welcomeScreen");
const introScreen = document.getElementById("introScreen");
const committeeScreen = document.getElementById("committeeScreen");

const welcomeButton = document.getElementById("welcomeButton");
const logoWrapper = document.querySelector(".logo-wrapper");

const introVideo = document.getElementById("introVideo");

const committeeButtons =
    document.querySelectorAll(".committee-btn");

const codeModal = document.getElementById("codeModal");
const closeModal = document.getElementById("closeModal");

const selectedCommittee =
    document.getElementById("selectedCommittee");

const committeeCode =
    document.getElementById("committeeCode");

const enterGameBtn =
    document.getElementById("enterGameBtn");

const errorMessage =
    document.getElementById("errorMessage");


/* =========================================
   COMMITTEE CODES
========================================= */

const committeeData = {

    HR: {
        code: "1980h",
        path: "HR/index.html"
    },

    OR: {
        code: "1990o",
        path: "OR/index.html"
    },

    SM: {
        code: "2000s",
        path: "SM/index.html"
    },

    PI: {
        code: "2010p",
        path: "PI/index.html"
    },

    PR: {
        code: "2020p",
        path: "PR/index.html"
    },

    TR: {
        code: "2030t",
        path: "TR/index.html"
    }

};


/* =========================================
   INITIAL SCREEN
========================================= */

welcomeScreen.classList.add("active");


/* =========================================
   START EXPERIENCE
========================================= */

welcomeButton.addEventListener("click", () => {

    if (welcomeButton.classList.contains("started")) {
        return;
    }

    welcomeButton.classList.add("started");

    logoWrapper.classList.add("rotating");

    /*
        After the logo rotates and YDP appears,
        hide them and show the intro.
    */

    setTimeout(() => {

        logoWrapper.classList.add("hide-logo");

    }, 1400);


    setTimeout(() => {

        welcomeScreen.classList.remove("active");

        introScreen.classList.add("active");

        playIntro();

    }, 2000);

});


/* =========================================
   PLAY INTRO
========================================= */

function playIntro() {

    introVideo.currentTime = 0;

    const playPromise = introVideo.play();

    if (playPromise !== undefined) {

        playPromise.catch(() => {

            /*
                If browser blocks autoplay,
                clicking the video will start it.
            */

            introVideo.controls = true;

        });

    }

}


/* =========================================
   INTRO FINISHED
========================================= */

introVideo.addEventListener("ended", () => {

    introScreen.classList.remove("active");

    setTimeout(() => {

        committeeScreen.classList.add("active");

    }, 500);

});


/* =========================================
   COMMITTEE SELECTION
========================================= */

let currentCommittee = null;


committeeButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const committee =
            button.dataset.committee;

        currentCommittee = committee;

        selectedCommittee.textContent = committee;

        committeeCode.value = "";

        errorMessage.textContent = "";

        codeModal.classList.add("active");

        setTimeout(() => {

            committeeCode.focus();

        }, 250);

    });

});


/* =========================================
   CLOSE MODAL
========================================= */

closeModal.addEventListener("click", () => {

    codeModal.classList.remove("active");

    committeeCode.value = "";

    errorMessage.textContent = "";

});


/* =========================================
   CLICK OUTSIDE MODAL
========================================= */
codeModal.addEventListener("click", (event) => {

    if (event.target === codeModal) {

        codeModal.classList.remove("active");

    }

});


/* =========================================
   ENTER GAME
========================================= */

enterGameBtn.addEventListener("click", checkCode);


/* =========================================
   ENTER KEY
========================================= */

committeeCode.addEventListener("keydown", (event) => {

    if (event.key === "Enter") {

        checkCode();

    }

});


/* =========================================
   CHECK COMMITTEE CODE
========================================= */

function checkCode() {

    if (!currentCommittee) {
        return;
    }

    const enteredCode =
        committeeCode.value.trim();

    const correctCode =
        committeeData[currentCommittee].code;


    /* -----------------------------------------
       CORRECT
    ----------------------------------------- */

    if (enteredCode === correctCode) {

        errorMessage.textContent = "";

        enterGameBtn.disabled = true;

        enterGameBtn.textContent = "LOADING...";


        /*
            Small delay for smooth transition
        */

        setTimeout(() => {

            window.location.href =
                committeeData[currentCommittee].path;

        }, 500);

    }


    /* -----------------------------------------
       WRONG
    ----------------------------------------- */

    else {

        errorMessage.textContent =
            "Invalid committee code ❌";

        committeeCode.value = "";

        committeeCode.focus();

    }

}


/* =========================================
   ESCAPE KEY
========================================= */

document.addEventListener("keydown", (event) => {

    if (
        event.key === "Escape" &&
        codeModal.classList.contains("active")
    ) {

        codeModal.classList.remove("active");

    }

});

/* =========================================
   RESET PAGE WHEN RETURNING WITH BACK BUTTON
========================================= */

window.addEventListener("pageshow", () => {

    enterGameBtn.disabled = false;
    enterGameBtn.textContent = "ENTER GAME";

    currentCommittee = null;

    codeModal.classList.remove("active");

    committeeCode.value = "";

    errorMessage.textContent = "";

});