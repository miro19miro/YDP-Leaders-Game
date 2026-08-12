/* =========================================
   ELEMENTS
========================================= */

const introScreen =
    document.getElementById("introScreen");

const officeScreen =
    document.getElementById("officeScreen");

const introVideo =
    document.getElementById("introVideo");


const firstBubble =
    document.getElementById("firstBubble");

const firstText =
    document.getElementById("firstText");


const yesButton =
    document.getElementById("yesButton");


const secondBubble =
    document.getElementById("secondBubble");

const secondText =
    document.getElementById("secondText");


const femaleChoice =
    document.getElementById("femaleChoice");

const maleChoice =
    document.getElementById("maleChoice");


const transitionScreen =
    document.getElementById("transitionScreen");


/* =========================================
   TEXT
========================================= */

const firstMessage =
    "Hello, Are you the new HR?";

const secondMessage =
    "Welcome, Now choose your character.";


/* =========================================
   TYPING SPEED
========================================= */

const typingSpeed = 65;


/* =========================================
   START
========================================= */

window.addEventListener("load", () => {

    introScreen.classList.add("active");

    playIntro();

});


/* =========================================
   PLAY HR INTRO
========================================= */

function playIntro() {

    introVideo.currentTime = 0;

    const playPromise =
        introVideo.play();

    if (playPromise !== undefined) {

        playPromise.catch(() => {

            /*
                Browser may block autoplay.
                Clicking the video will start it.
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

        officeScreen.classList.add("active");

        startFirstScene();

    }, 500);

});


/* =========================================
   FIRST SCENE
========================================= */

function startFirstScene() {

    /*
        Show first speech bubble.
    */

    firstBubble.classList.remove("hidden");


    /*
        Start typing.
    */

    typeText(
        firstText,
        firstMessage,
        () => {

            /*
                After the sentence finishes,
                wait EXACTLY 1 second,
                then show YES.
            */

            setTimeout(() => {

                yesButton.classList.remove("hidden");

            }, 1000);

        }
    );

}


/* =========================================
   TYPING FUNCTION
========================================= */

function typeText(element, text, callback) {

    element.textContent = "";

    let index = 0;


    const interval =
        setInterval(() => {

            element.textContent +=
                text.charAt(index);

            index++;


            if (index >= text.length) {

                clearInterval(interval);

                if (callback) {
                    callback();
                }

            }

        }, typingSpeed);

}


/* =========================================
   YES BUTTON
========================================= */

yesButton.addEventListener("click", () => {

    /*
        Hide first bubble + YES.
    */

    firstBubble.classList.add("hidden");

    yesButton.classList.add("hidden");


    /*
        Show second bubble.
    */

    setTimeout(() => {

        secondBubble.classList.remove("hidden");


        typeText(
            secondText,
            secondMessage,
            () => {

                /*
                    Let the player read it,
                    then show the gender choices.
                */

                setTimeout(() => {

                    secondBubble.classList.add("hidden");
                    showCharacterChoices();

                }, 1000);

            }
        );

    }, 300);

});


/* =========================================
   SHOW CHARACTER CHOICES
========================================= */

function showCharacterChoices() {

    femaleChoice.classList.remove("hidden");

    maleChoice.classList.remove("hidden");

}


/* =========================================
   FEMALE CHOICE
========================================= */

femaleChoice.addEventListener("click", () => {

    chooseCharacter("Female");

});


/* =========================================
   MALE CHOICE
========================================= */

maleChoice.addEventListener("click", () => {

    chooseCharacter("Male");

});


/* =========================================
   CHARACTER SELECTED
========================================= */

function chooseCharacter(character) {

    /*
        Disable both choices.
    */

    femaleChoice.disabled = true;

    maleChoice.disabled = true;


    /*
        Store the selected character.
        This will be useful when we continue
        developing the HR game.
    */

    localStorage.setItem(
        "hrSelectedCharacter",
        character
    );


    /*
        Fade everything to black.
    */

    officeScreen.classList.add("fade-out");


    /*
        Wait for the black transition.
    */

    setTimeout(() => {

        transitionScreen.classList.add("show");

    }, 800);

}