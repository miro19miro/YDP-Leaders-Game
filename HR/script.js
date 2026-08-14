const ADMIN_CODE = "BYS20M";
const PLAYER_CODE = "MEM201";
const KEYS = {members:"hrMembersV2", interviews:"hrInterviewsV2", questions:"hrQuestionsV2", results:"hrResultsV2"};

const $ = id => document.getElementById(id);
const read = (key, fallback=[]) => { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; } };
const write = (key, value) => { writeLocal(key, value); cloudWrite(key, value); };
const uid = prefix => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
const esc = value => String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
const show = el => el && el.classList.remove("hidden");
const hide = el => el && el.classList.add("hidden");

/* =========================================================
   FIREBASE / REAL-TIME SHARED DATA
========================================================= */

let firebaseReady = false;
let cloudDb = null;
const CLOUD_DOC = "gameData";
const CLOUD_COLLECTION = "ydp_hr_game";

function initFirebaseSync() {
  try {
    const cfg = window.YDP_FIREBASE_CONFIG;
    if (!window.firebase || !cfg || !cfg.apiKey || cfg.apiKey.includes("PASTE_YOUR")) {
      console.info("Firebase config is not filled. Using localStorage fallback.");
      return;
    }

    if (!firebase.apps.length) firebase.initializeApp(cfg);
    cloudDb = firebase.firestore();
    firebaseReady = true;

    firebase.auth().signInAnonymously().then(() => {
      const ref = cloudDb.collection(CLOUD_COLLECTION).doc(CLOUD_DOC);
      ref.onSnapshot(snapshot => {
        if (!snapshot.exists) {
          const payload = {
            members: getMembers(),
            interviews: getInterviews(),
            questions: getQuestions(),
            results: getResults(),
            updatedAt: Date.now()
          };
          ref.set(payload, { merge: true });
          return;
        }

        const data = snapshot.data() || {};
        if (Array.isArray(data.members)) writeLocal(KEYS.members, data.members);
        if (Array.isArray(data.interviews)) writeLocal(KEYS.interviews, data.interviews);
        if (Array.isArray(data.questions)) writeLocal(KEYS.questions, data.questions);
        if (Array.isArray(data.results)) writeLocal(KEYS.results, data.results);

        if (typeof renderAdmin === "function" && $('adminScreen') && !$('adminScreen').classList.contains('hidden')) {
          renderAdmin();
        }
        if ($('nameScreen') && !$('nameScreen').classList.contains('hidden')) {
          renderPlayerMembers();
        }
        updateScorePanel();
      }, error => console.error("Firebase realtime listener error:", error));
    }).catch(error => console.error("Firebase anonymous auth error:", error));
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
}

function writeLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

async function cloudWrite(key, value) {
  if (!firebaseReady || !cloudDb) return;
  const field = Object.keys(KEYS).find(k => KEYS[k] === key);
  if (!field) return;
  try {
    await cloudDb.collection(CLOUD_COLLECTION).doc(CLOUD_DOC).set({
      [field]: value,
      updatedAt: Date.now()
    }, { merge: true });
  } catch (error) {
    console.error("Firebase write error:", error);
  }
}

let state = {
  gender:null,
  member:null,
  interview:null,
  paperIndex:0,
  decision:null,
  stamping:false,
  questionCount:0,
  chosenQuestions:[],
  questionRound:0,
  sessionStarted:null,
  currentQuestion:null,
  viewerIndex:0
};

const introScreen=$('introScreen'), introVideo=$('introVideo'), codeScreen=$('codeScreen'), codeInput=$('codeInput'), codeError=$('codeError');
const genderScreen=$('genderScreen'), nameScreen=$('nameScreen'), membersList=$('membersList'), nameContinueBtn=$('nameContinueBtn'), nameError=$('nameError');
const officeScreen=$('officeScreen'), nextBtn=$('nextBtn'), paperDeck=$('paperDeck'), paper1=$('paper1'), paper2=$('paper2'), paper3=$('paper3');
const candidateCharacter=$('candidateCharacter'), candidateCharacterImage=$('candidateCharacterImage'), cvEyeCard=$('cvEyeCard');
const acceptedStamp=$('acceptedStamp'), rejectedStamp=$('rejectedStamp'), paperDecision=$('paperDecision');
const acceptedCount=$('acceptedCount'), rejectedCount=$('rejectedCount'), scoreCount=$('scoreCount');
const chatButton=$('chatButton'), idButton=$('idButton');

initFirebaseSync();

function getMembers(){return read(KEYS.members);}
function getInterviews(){return read(KEYS.interviews);}
function getQuestions(){return read(KEYS.questions);}
function getResults(){return read(KEYS.results);}

function finishIntro(){hide(introScreen);show(codeScreen);setTimeout(()=>codeInput.focus(),200);}
introVideo.addEventListener('ended',finishIntro);
introVideo.addEventListener('error',finishIntro);
setTimeout(()=>{if(introVideo.readyState===0){}},1500);

function checkCode(){
  const code=codeInput.value.trim().toUpperCase(); codeError.textContent="";
  if(code===ADMIN_CODE){hide(codeScreen);openAdmin();return;}
  if(code===PLAYER_CODE){hide(codeScreen);show(genderScreen);return;}
  codeError.textContent=code?"Invalid code. Please try again.":"Please enter your code.";
}
$('enterCodeBtn').addEventListener('click',checkCode); codeInput.addEventListener('keydown',e=>{if(e.key==='Enter')checkCode();});

document.querySelectorAll('.gender-choice').forEach(btn=>btn.addEventListener('click',()=>{state.gender=btn.dataset.gender;hide(genderScreen);show(nameScreen);renderPlayerMembers();}));

function renderPlayerMembers(){
  const members=getMembers(); membersList.innerHTML=""; state.member=null; nameContinueBtn.disabled=true; nameError.textContent="";
  if(!members.length){membersList.innerHTML='<div class="admin-note">No player names have been added by the Admin yet.</div>';return;}
  members.forEach(member=>{
    const b=document.createElement('button'); b.className='member-option'; b.type='button'; b.textContent=member.name;
    b.onclick=()=>{document.querySelectorAll('.member-option').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');state.member=member;nameContinueBtn.disabled=false;};
    membersList.appendChild(b);
  });
}
nameContinueBtn.addEventListener('click',()=>{if(!state.member){nameError.textContent='Please choose your name.';return;}openOffice();});

function openOffice(){
  hide(nameScreen); show(officeScreen); state.sessionStarted=Date.now(); state.paperIndex=0; state.decision=null; state.questionCount=0; state.chosenQuestions=[]; state.questionRound=0;
  resetOffice(); updateScorePanel();
}
function resetOffice(){
  hide(paperDeck); hide(candidateCharacter); hide(cvEyeCard); hide(acceptedStamp); hide(rejectedStamp); hide(chatButton); hide(idButton); hide(paperDecision); paperDecision.textContent=""; state.interview=null; state.decision=null; state.stamping=false; nextBtn.textContent='NEXT'; show(nextBtn);
}

nextBtn.addEventListener('click',()=>{
  if(state.decision){ startNextInterview(); return; }
  startNextInterview();
});

function startNextInterview(){
  const interviews=getInterviews();
  if(!interviews.length){alert('Admin has not added any interviews yet.');return;}
  const results=getResults().filter(r=>r.playerId===state.member?.id);
  const completedIds=new Set(results.map(r=>r.interviewId));
  const next=interviews.find(i=>!completedIds.has(i.id)) || interviews[0];
  state.interview=next; state.paperIndex=0; state.decision=null; state.questionCount=0; state.chosenQuestions=[]; state.questionRound=0; state.currentQuestion=null;
  hide(nextBtn); hide(paperDecision); hide(acceptedStamp); hide(rejectedStamp); hide(idButton); show(chatButton);
  fillPapers(next); show(paperDeck); show(candidateCharacter); candidateCharacterImage.src=next.photo;
  paperDeck.classList.remove('fly-out'); void paperDeck.offsetWidth; paperDeck.classList.add('fly-out');
  setTimeout(()=>show(cvEyeCard),450);
}

function basePaper(title, body, eye=false){
  return `<div class="paper-header"><span>${esc(title)}</span>${eye ? '<button class="paper-eye" id="cvEyeCard" type="button" aria-label="Open CV viewer">👁</button>' : ''}</div>${body}`;
}
function fillPapers(i){
  const cv=i.cv||{}; const id=i.idCard||{}; const cd=i.committeeData||{};

  paper1.innerHTML=basePaper('CURRICULUM VITAE',`
    <div class="cv-mini-top">
      <img src="${esc(i.photo||'images/1.png')}" alt="Candidate">
      <div><h2 class="cv-name">${esc(cv.name||i.name)}</h2><p>${esc(cv.summary||'Candidate profile')}</p></div>
    </div>
    <div class="cv-grid">
      <div class="cv-field"><span class="cv-label">Name</span><b>${esc(cv.name||i.name)}</b></div>
      <div class="cv-field"><span class="cv-label">Age</span><b>${esc(cv.age||i.age)}</b></div>
      <div class="cv-field"><span class="cv-label">Address</span><b>${esc(cv.address||'')}</b></div>
      <div class="cv-field"><span class="cv-label">Phone</span><b>${esc(cv.phone||'')}</b></div>
    </div>
    <div class="cv-section"><h3>Soft Skills</h3><p>${esc(cv.softSkills||'')}</p></div>
    <div class="cv-section"><h3>Technical Skills</h3><p>${esc(cv.technicalSkills||'')}</p></div>
    <div class="cv-section"><h3>Languages</h3><p>${esc(cv.languages||'')}</p></div>
    <div class="cv-section"><h3>Experience</h3><p>${esc(cv.experience||'')}</p></div>`, true);

  paper2.innerHTML=basePaper('APPLICATION DATA',`
    <div class="application-sheet">
      <div><span>NAME</span><b>${esc(cd.name||i.name)}</b></div>
      <div><span>GENDER</span><b>${esc(cd.gender||'')}</b></div>
      <div><span>PHONE</span><b>${esc(cd.phone||cv.phone||'')}</b></div>
      <div><span>AGE</span><b>${esc(cd.age||i.age)}</b></div>
      <div><span>COMMUNITY</span><b>${esc(cd.community||'')}</b></div>
      <div><span>GOVERNORATE</span><b>${esc(cd.governorate||'')}</b></div>
      <div class="full"><span>COMMITTEE</span><b>${esc(cd.committee||i.committee||'HR')}</b></div>
    </div>`, false);

  paper3.innerHTML=basePaper('PERSONAL CARD',`
    <div class="personal-card-sheet">
      <img src="${esc(i.photo||'images/1.png')}" alt="Candidate">
      <div class="personal-card-data">
        <p><span>NAME</span><b>${esc(id.name||i.name)}</b></p>
        <p><span>NATIONALITY</span><b>${esc(id.nationality||'')}</b></p>
        <p><span>NATIONAL ID</span><b>${esc(id.nationalId||'')}</b></p>
        <p><span>STATUS</span><b>${esc(id.status||'')}</b></p>
        <p><span>ADDRESS</span><b>${esc(id.address||'')}</b></p>
      </div>
    </div>`, false);

  [paper1,paper2,paper3].forEach((p,idx)=>{
    p.classList.remove('active-paper');
    p.style.zIndex=String(3-idx);
    p.onclick=()=>cyclePaper(idx);
  });
  activatePaper(0);

  const eye=$('cvEyeCard');
  if(eye){
    eye.addEventListener('click', event=>{
      event.stopPropagation();
      openDocumentViewer(0);
    });
  }
}
function activatePaper(index){
  state.paperIndex=index;
  [paper1,paper2,paper3].forEach((p,i)=>{
    p.classList.toggle('active-paper',i===index);
    p.style.zIndex=i===index?5:3-i;
    p.style.transform=i===index?'translate(-50%,-50%) rotate(-1deg)':`translate(calc(-50% + ${(i-index)*18}px),calc(-50% + ${(i-index)*18}px)) rotate(${(i-index)*3}deg)`;
  });
}
function cyclePaper(index){ if(index!==state.paperIndex)return; activatePaper((state.paperIndex+1)%3); }
function getDocumentData(index){
  const i=state.interview||{}; const cv=i.cv||{}; const id=i.idCard||{}; const cd=i.committeeData||{};
  if(index===0) return {
    title:'CURRICULUM VITAE',
    html:`<div class="viewer-cv"><div class="viewer-cv-head"><img src="${esc(i.photo||'images/1.png')}"><div><h2>${esc(cv.name||i.name)}</h2><p>${esc(cv.summary||'')}</p></div></div><div class="viewer-grid"><p><b>Age</b>${esc(cv.age||i.age)}</p><p><b>Phone</b>${esc(cv.phone||'')}</p><p><b>Address</b>${esc(cv.address||'')}</p></div><h3>Skills</h3><p>${esc(cv.softSkills||'')}</p><h3>Technical Skills</h3><p>${esc(cv.technicalSkills||'')}</p><h3>Languages</h3><p>${esc(cv.languages||'')}</p><h3>Experience</h3><p>${esc(cv.experience||'')}</p></div>`
  };
  if(index===1) return {
    title:'APPLICATION DATA',
    html:`<div class="viewer-application">${[['Name',cd.name||i.name],['Gender',cd.gender],['Phone',cd.phone||cv.phone],['Age',cd.age||i.age],['Community',cd.community],['Governorate',cd.governorate],['Committee',cd.committee||i.committee||'HR']].map(x=>`<p><span>${esc(x[0])}</span><b>${esc(x[1]||'')}</b></p>`).join('')}</div>`
  };
  return {
    title:'PERSONAL CARD',
    html:`<div class="viewer-id"><img src="${esc(i.photo||'images/1.png')}"><div>${[['Name',id.name||i.name],['Nationality',id.nationality],['National ID',id.nationalId],['Status',id.status],['Address',id.address]].map(x=>`<p><span>${esc(x[0])}</span><b>${esc(x[1]||'')}</b></p>`).join('')}</div></div>`
  };
}
function openDocumentViewer(index=0){
  if(!state.interview)return;
  state.viewerIndex=index;
  const d=getDocumentData(index);
  $('documentViewerTitle').textContent=d.title;
  $('documentViewerCounter').textContent=`${index+1} / 3`;
  $('documentViewerContent').innerHTML=d.html;
  show($('candidatePhotoModal'));
}
$('documentViewerNext').addEventListener('click',()=>openDocumentViewer((state.viewerIndex+1)%3));


document.querySelectorAll('[data-close]').forEach(btn=>btn.addEventListener('click',()=>hide($(btn.dataset.close))));

acceptedStamp.addEventListener('click',()=>stampDecision('accepted')); rejectedStamp.addEventListener('click',()=>stampDecision('rejected'));
function stampDecision(decision){
  if(state.stamping||state.decision)return; state.stamping=true; state.decision=decision;
  const stamp=decision==='accepted'?acceptedStamp:rejectedStamp; const img=stamp.querySelector('img'); const sr=img.getBoundingClientRect(); const paper=paperDeck.querySelector('.active-paper'); const pr=paper.getBoundingClientRect();
  const moving=stamp.cloneNode(true); moving.classList.remove('hidden'); moving.style.position='fixed';moving.style.left=sr.left+'px';moving.style.top=sr.top+'px';moving.style.width=sr.width+'px';moving.style.zIndex='999';moving.style.transition='left .65s cubic-bezier(.22,1,.36,1),top .65s cubic-bezier(.22,1,.36,1),transform .65s ease';moving.style.transform='rotate(0) scale(1)';document.body.appendChild(moving);
  requestAnimationFrame(()=>{moving.style.left=(pr.left+pr.width*.5-sr.width*.5)+'px';moving.style.top=(pr.top+pr.height*.56-sr.height*.5)+'px';moving.style.transform='rotate(-8deg) scale(.72)';});
  setTimeout(()=>{moving.remove();showDecision(decision);},1150);
}
function showDecision(decision){
  paperDecision.textContent=decision==='accepted'?'ACCEPTED':'REJECTED'; paperDecision.style.color=decision==='accepted'?'#159447':'#d62828';paperDecision.style.borderColor=paperDecision.style.color;show(paperDecision);hide(acceptedStamp);hide(rejectedStamp);saveResult(decision);updateScorePanel();state.stamping=false;show(nextBtn);nextBtn.textContent='NEXT';if(decision==='accepted')show(idButton);
}
function saveResult(decision){
  const results=getResults(); const correct=state.interview.correctDecision===decision; const score=correct?10:-10;
  results.push({id:uid('result'),playerId:state.member.id,playerName:state.member.name,gender:state.gender,interviewId:state.interview.id,interviewName:state.interview.name,decision,correct,score,questionsAsked:state.questionCount,startedAt:state.sessionStarted,finishedAt:Date.now()});write(KEYS.results,results);
}
function updateScorePanel(){
  if(!state.member){acceptedCount.textContent='0';rejectedCount.textContent='0';scoreCount.textContent='0';return;}
  const r=getResults().filter(x=>x.playerId===state.member.id);acceptedCount.textContent=r.filter(x=>x.decision==='accepted').length;rejectedCount.textContent=r.filter(x=>x.decision==='rejected').length;scoreCount.textContent=r.reduce((a,x)=>a+x.score,0);
}

idButton.addEventListener('click',()=>{const i=state.interview;if(!i)return;$('generatedIdPhoto').src=i.photo;$('generatedIdName').textContent=i.name;$('generatedIdCommittee').textContent=i.committeeData?.committee||i.committee||'HR';show($('idModal'));});

chatButton.addEventListener('click',openQuestionChat);
function getInterviewQuestions(){
  const bank=getQuestions(); const answers=state.interview?.answers||{};
  return bank.filter(q=>answers[q.id]?.trim()).map(q=>({...q,answer:answers[q.id]}));
}
function openQuestionChat(){
  if(!state.interview||state.decision)return;
  state.questionRound=0;state.questionCount=0;state.chosenQuestions=[];state.currentQuestion=null;show($('questionModal'));renderQuestionChoices();
}
function renderQuestionChoices(){
  const choices=$('questionChoices'), progress=$('questionProgress'), answer=$('questionAnswer'), nextQ=$('nextQuestionBtn');
  progress.textContent=`Choose a question — ${state.questionRound} / 10`;choices.innerHTML='';hide(answer);hide(nextQ);
  if(state.questionRound>=10){choices.innerHTML='<div class="admin-note">You have completed the 10-question interview.</div>';return;}
  const available=getInterviewQuestions().filter(q=>!state.chosenQuestions.includes(q.id));
  if(!available.length){choices.innerHTML='<div class="admin-note">Interview questions completed.</div>';if(state.questionRound>0){show(acceptedStamp);show(rejectedStamp);}return;}
  available.forEach(q=>{const b=document.createElement('button');b.className='question-choice';b.textContent=q.text;b.onclick=()=>askQuestion(q);choices.appendChild(b);});
}
function askQuestion(q){state.currentQuestion=q;state.chosenQuestions.push(q.id);state.questionRound++;state.questionCount++;$('questionProgress').textContent=`Question ${state.questionRound} / 10`;$('questionChoices').innerHTML=`<div class="question-choice" style="cursor:default"><b>${esc(q.text)}</b></div>`;$('questionAnswer').innerHTML=`<b>${esc(state.interview.name)}:</b><br>${esc(q.answer)}`;show($('questionAnswer'));if(state.questionRound<10){$('nextQuestionBtn').textContent='CHOOSE NEXT';show($('nextQuestionBtn'));}else{$('nextQuestionBtn').textContent='FINISH INTERVIEW';show($('nextQuestionBtn'));}}
$('nextQuestionBtn').addEventListener('click',()=>{if(state.questionRound>=10){hide($('questionModal'));show(acceptedStamp);show(rejectedStamp);return;}renderQuestionChoices();});

/* ========================= ADMIN ========================= */
function openAdmin(){show($('adminScreen'));renderAdmin();}
function renderAdmin(){renderOverview();renderInterviewAdmin();renderMemberAdmin();renderQuestionAdmin();renderResultsAdmin();}
function renderOverview(){$('statMembers').textContent=getMembers().length;$('statInterviews').textContent=getInterviews().length;$('statQuestions').textContent=getQuestions().length;$('statResults').textContent=getResults().length;}

document.querySelectorAll('.admin-tabs button').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.admin-tabs button').forEach(x=>x.classList.remove('active'));document.querySelectorAll('.admin-tab').forEach(x=>x.classList.remove('active-tab'));tab.classList.add('active');$('tab-'+tab.dataset.tab).classList.add('active-tab');}));
$('adminRefreshBtn').addEventListener('click',renderAdmin);
$('adminBackBtn').addEventListener('click',()=>{hide($('adminScreen'));show($('codeScreen'));$('codeInput').value='';$('codeError').textContent='';setTimeout(()=>$('codeInput').focus(),100);});
$('addInterviewBtn').addEventListener('click',()=>openInterviewEditor());
$('addMemberBtn').addEventListener('click',()=>openMemberEditor());
$('addQuestionBtn').addEventListener('click',()=>openQuestionEditor());
$('clearResultsBtn').addEventListener('click',()=>{if(confirm('Clear all results?')){write(KEYS.results,[]);renderAdmin();}});

function renderInterviewAdmin(){const list=$('interviewList');list.innerHTML='';const items=getInterviews();if(!items.length){list.innerHTML='<div class="admin-note">No interviews yet. Add the first candidate.</div>';return;}items.forEach(i=>{const row=document.createElement('div');row.className='admin-row';row.innerHTML=`<div class="admin-row-main"><div class="admin-row-title">${esc(i.name)}</div><div class="admin-row-sub">${esc(i.committee||'HR')} · Correct decision: ${esc(i.correctDecision)} · ${Object.values(i.answers||{}).filter(Boolean).length} answered questions</div></div><div class="admin-actions"><button class="action-btn edit">Edit</button><button class="action-btn delete">Delete</button></div>`;row.querySelector('.edit').onclick=()=>openInterviewEditor(i.id);row.querySelector('.delete').onclick=()=>{if(confirm('Delete this interview?')){write(KEYS.interviews,getInterviews().filter(x=>x.id!==i.id));renderAdmin();}};list.appendChild(row);});}
function renderMemberAdmin(){const list=$('memberAdminList');list.innerHTML='';const items=getMembers();if(!items.length){list.innerHTML='<div class="admin-note">No members yet.</div>';return;}items.forEach(m=>{const row=document.createElement('div');row.className='admin-row';row.innerHTML=`<div class="admin-row-main"><div class="admin-row-title">${esc(m.name)}</div><div class="admin-row-sub">${esc(m.id)}</div></div><div class="admin-actions"><button class="action-btn edit">Edit</button><button class="action-btn delete">Delete</button></div>`;row.querySelector('.edit').onclick=()=>openMemberEditor(m.id);row.querySelector('.delete').onclick=()=>{if(confirm('Delete this member?')){write(KEYS.members,getMembers().filter(x=>x.id!==m.id));renderAdmin();}};list.appendChild(row);});}
function renderQuestionAdmin(){const list=$('questionAdminList');list.innerHTML='';const items=getQuestions();if(!items.length){list.innerHTML='<div class="admin-note">No questions yet. Add your interview question bank here.</div>';return;}items.forEach((q,n)=>{const row=document.createElement('div');row.className='admin-row';row.innerHTML=`<div class="admin-row-main"><div class="admin-row-title">Q${n+1}. ${esc(q.text)}</div><div class="admin-row-sub">${q.id}</div></div><div class="admin-actions"><button class="action-btn edit">Edit</button><button class="action-btn delete">Delete</button></div>`;row.querySelector('.edit').onclick=()=>openQuestionEditor(q.id);row.querySelector('.delete').onclick=()=>{if(confirm('Delete this question?')){write(KEYS.questions,getQuestions().filter(x=>x.id!==q.id));const ints=getInterviews().map(i=>{const a={...(i.answers||{})};delete a[q.id];return {...i,answers:a};});write(KEYS.interviews,ints);renderAdmin();}};list.appendChild(row);});}
function renderResultsAdmin(){const body=$('resultsBody');body.innerHTML='';const results=getResults().slice().reverse();if(!results.length){body.innerHTML='<tr><td colspan="7">No results yet.</td></tr>';return;}results.forEach(r=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${esc(r.playerName)}</td><td>${esc(r.interviewName)}</td><td>${esc(r.decision)}</td><td>${r.correct?'YES':'NO'}</td><td>${r.score}</td><td>${r.questionsAsked}/10</td><td>${new Date(r.finishedAt).toLocaleString()}</td>`;body.appendChild(tr);});}

function openMemberEditor(id=''){const m=getMembers().find(x=>x.id===id);$('editMemberId').value=m?.id||'';$('memberName').value=m?.name||'';show($('memberEditor'));}
$('memberForm').addEventListener('submit',e=>{e.preventDefault();const id=$('editMemberId').value;const name=$('memberName').value.trim();if(!name)return;let items=getMembers();if(id)items=items.map(m=>m.id===id?{...m,name}:m);else items.push({id:uid('member'),name});write(KEYS.members,items);hide($('memberEditor'));renderAdmin();});

function openQuestionEditor(id=''){const q=getQuestions().find(x=>x.id===id);$('editQuestionId').value=q?.id||'';$('questionText').value=q?.text||'';show($('questionEditor'));}
$('questionForm').addEventListener('submit',e=>{e.preventDefault();const id=$('editQuestionId').value,text=$('questionText').value.trim();if(!text)return;let items=getQuestions();if(id)items=items.map(q=>q.id===id?{...q,text}:q);else items.push({id:uid('question'),text});write(KEYS.questions,items);hide($('questionEditor'));renderAdmin();});

function openInterviewEditor(id=''){
  const i=getInterviews().find(x=>x.id===id); $('editInterviewId').value=i?.id||'';$('editorTitle').textContent=i?'Edit Interview':'Add Interview';
  $('fPhoto').value=i?.photo||'images/1.png';$('fName').value=i?.name||'';
  const cv=i?.cv||{};const ic=i?.idCard||{};const cd=i?.committeeData||{};
  $('fAddress').value=cv.address||'';$('fPhone').value=cv.phone||'';$('fAge').value=cv.age||'';$('fNationality').value=ic.nationality||'';$('fNationalId').value=ic.nationalId||'';$('fStatus').value=ic.status||'';$('fCommittee').value=cd.committee||i?.committee||'HR';$('fGovernorate').value=cd.governorate||'';$('fCommunity').value=cd.community||'';$('fSummary').value=cv.summary||'';$('fSoftSkills').value=cv.softSkills||'';$('fTechnicalSkills').value=cv.technicalSkills||'';$('fLanguages').value=cv.languages||'';$('fExperience').value=cv.experience||'';$('fDecision').value=i?.correctDecision||'accepted';
  renderInterviewAnswers(i?.answers||{});show($('adminEditor'));
}
function renderInterviewAnswers(existing={}){const box=$('interviewAnswers');const qs=getQuestions();box.innerHTML=qs.length?'':'<div class="admin-note">Add questions first, then return here to add character answers.</div>';qs.forEach((q,n)=>{const row=document.createElement('div');row.className='answer-row';row.innerHTML=`<small>Q${n+1}. ${esc(q.text)}</small><textarea data-answer-id="${esc(q.id)}" placeholder="Character answer...">${esc(existing[q.id]||'')}</textarea>`;box.appendChild(row);});}
$('interviewForm').addEventListener('submit',e=>{e.preventDefault();const id=$('editInterviewId').value;const qs={};document.querySelectorAll('[data-answer-id]').forEach(t=>{if(t.value.trim())qs[t.dataset.answerId]=t.value.trim();});const item={id:id||uid('interview'),photo:$('fPhoto').value.trim(),name:$('fName').value.trim(),age:$('fAge').value.trim(),committee:$('fCommittee').value.trim()||'HR',correctDecision:$('fDecision').value,cv:{name:$('fName').value.trim(),address:$('fAddress').value.trim(),phone:$('fPhone').value.trim(),age:$('fAge').value.trim(),summary:$('fSummary').value.trim(),softSkills:$('fSoftSkills').value.trim(),technicalSkills:$('fTechnicalSkills').value.trim(),languages:$('fLanguages').value.trim(),experience:$('fExperience').value.trim()},idCard:{name:$('fName').value.trim(),address:$('fAddress').value.trim(),nationality:$('fNationality').value.trim(),nationalId:$('fNationalId').value.trim(),status:$('fStatus').value.trim()},committeeData:{name:$('fName').value.trim(),gender:'',phone:$('fPhone').value.trim(),age:$('fAge').value.trim(),community:$('fCommunity').value.trim(),governorate:$('fGovernorate').value.trim(),committee:$('fCommittee').value.trim()||'HR'},answers:qs};let items=getInterviews();if(id)items=items.map(x=>x.id===id?item:x);else items.push(item);write(KEYS.interviews,items);hide($('adminEditor'));renderAdmin();});

/* keep the gender on the application card editable through the chosen player flow only for now */
window.addEventListener('storage',()=>{if($('adminScreen')&&!$('adminScreen').classList.contains('hidden'))renderAdmin();});
