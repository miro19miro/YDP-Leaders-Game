YDP HR GAME - Firebase setup

1) Open Firebase Console and create/select the project.
2) Add a Web App and copy its Firebase config.
3) Open firebase-config.js and replace every placeholder with the real config values.
4) Firebase Authentication -> Sign-in method -> enable Anonymous.
5) Firestore Database -> create the database.
6) In Firestore Rules, paste the contents of firestore.rules and publish.
7) Upload these files to the same GitHub Pages folder:
   - index.html
   - style.css
   - script.js
   - firebase-config.js

The game keeps a localStorage fallback, but when Firebase is configured it synchronizes:
- members
- interviews
- questions
- results
across devices in real time.

IMPORTANT:
The rules above allow any authenticated anonymous player to read/write the shared game document.
For a public production game, add stronger authorization around the Admin controls before release.
