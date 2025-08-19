// Sentences dataset (character, pinyin, english, examples)
filename = "./vocab-lists/hsk1_full_vocab_with_examples.json"

fetch(filename) // "./" means same folder as script.js
  .then(response => response.json())
  .then(data => {
    console.log(data);
const SENTENCES = data;
let indexQueue = [];
let current = null;
let showChars = true;
let showPinyin = true;
let chinToEng = true;
let correct = 0, total = 0;

// DOM elements
const charsEl = document.getElementById('chars');
const pinyinEl = document.getElementById('pinyin');
const inputEl = document.getElementById('translationInput');
const enterBtn = document.getElementById('enterBtn');
const revealArea = document.getElementById('revealArea');
const correctTranslationEl = document.getElementById('correctTranslation');
const exampleListEl = document.getElementById('exampleList');
const btnYes = document.getElementById('btnYes');
const btnMixed = document.getElementById('btnMixed');
const btnNo = document.getElementById('btnNo');
const toggleCharsBtn = document.getElementById('toggleChars');
const togglePinyinBtn = document.getElementById('togglePinyin');
const toggleLanguageBtn = document.getElementById('toggleLanguage');
const progressFill = document.getElementById('progressFill');
const scoreDisplay = document.getElementById('scoreDisplay');
const upcomingList = document.getElementById('upcomingList');
const newRandom = document.getElementById('newRandom');

// Utilities
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}
function buildQueue() {
  indexQueue = Array.from({ length: SENTENCES.length }, (_, i) => i);
  shuffle(indexQueue);
}
function pickNext() {
  if (indexQueue.length === 0) buildQueue();
  const idx = indexQueue.shift();
  return SENTENCES[idx];
}

function renderUpcoming() {
  upcomingList.innerHTML = indexQueue
    .slice(0, 6)
    .map(i => `<div>• ${SENTENCES[i].chars}</div>`)
    .join('');
}

function showSentence(sent) {
  current = sent;
  charsEl.style.display = showChars ? 'block' : 'none';
  pinyinEl.style.display = showPinyin ? 'block' : 'none';
  if(chinToEng){
    charsEl.textContent = sent.chars;
    pinyinEl.textContent = sent.pinyin;
  } else {
    charsEl.textContent = sent.eng;
    pinyinEl.textContent = "";    
  }
  inputEl.value = '';
  revealArea.classList.add('hidden');
  correctTranslationEl.textContent = '';
  exampleListEl.innerHTML = '';
  inputEl.focus();
  document.getElementById('cardArea').classList.add('pop');
  setTimeout(() => document.getElementById('cardArea').classList.remove('pop'), 350);
}

function revealAnswer() {
  if(chinToEng){
    correctTranslationEl.textContent = `"${current.eng}"`;
  }else {
    correctTranslationEl.textContent = `"${current.chars}"`;
  }
  exampleListEl.innerHTML =
    '<strong>Examples:</strong><br>' +
    current.examples.map(e => `<div style="margin-top:6px">• ${e.chinese}<br>&nbsp&nbsp${e.pinyin}<br>&nbsp&nbsp${e.english}</div>`).join('');
  revealArea.classList.remove('hidden');
}

function markResult(res) {
  total++;
  if (res === 'yes') correct++;
  else if (res === 'mixed') correct += 0.5;
  scoreDisplay.textContent = `${Math.round(correct * 10) / 10} / ${total}`;
  const prog = Math.min(100, Math.round((total / (SENTENCES.length * 2)) * 100));
  progressFill.style.width = prog + '%';
  setTimeout(() => {
    const next = pickNext();
    renderUpcoming();
    showSentence(next);
  }, 220);
}

// Event listeners
enterBtn.addEventListener('click', () => {
  if (!current) return;
  if (revealArea.classList.contains('hidden')) {
    revealAnswer();
  }
});
inputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    if (revealArea.classList.contains('hidden')) revealAnswer();
  }
});
btnYes.addEventListener('click', () => markResult('yes'));
btnMixed.addEventListener('click', () => markResult('mixed'));
btnNo.addEventListener('click', () => markResult('no'));

toggleCharsBtn.addEventListener('click', () => {
  showChars = !showChars;
  toggleCharsBtn.textContent = showChars ? 'Hide Characters' : 'Show Characters';
  charsEl.style.display = showChars ? 'block' : 'none';
});
togglePinyinBtn.addEventListener('click', () => {
  showPinyin = !showPinyin;
  togglePinyinBtn.textContent = showPinyin ? 'Hide Pinyin' : 'Show Pinyin';
  pinyinEl.style.display = showPinyin ? 'block' : 'none';
});
toggleLanguageBtn.addEventListener('click', () => {
  chinToEng = !chinToEng;
  console.log(chinToEng);
  toggleLanguageBtn.textContent = showPinyin ? 'English -> Chinese' : 'Chinese -> English';
  if(chinToEng){
    charsEl.textContent = current.chars;
    pinyinEl.textContent = current.pinyin;
  } else {
    charsEl.textContent = current.eng;
    pinyinEl.textContent = "";    
  }

});
newRandom.addEventListener('click', () => {
  const next = pickNext();
  renderUpcoming();
  showSentence(next);
});
document.addEventListener('keydown', e => {
  if (!revealArea.classList.contains('hidden')) {
    if (e.key.toLowerCase() === 'y') btnYes.click();
    if (e.key.toLowerCase() === 'm') btnMixed.click();
    if (e.key.toLowerCase() === 'n') btnNo.click();
  }
});

// Init
buildQueue();
renderUpcoming();
const first = pickNext();
showSentence(first);
  })
  .catch(err => console.error("Error loading JSON:", err));
