function getQueryParams() {
  const params = new URLSearchParams(window.location.search);

  return {
    display: {
      chars: params.get("displaychars") === "true",
      pinyin: params.get("displaypinyin") === "true",
      audio: params.get("displayaudio") === "true",
      english: params.get("displayenglish") === "true",
    },
    inputLang: {
      chinese: params.get("inputchinese") === "true",
      english: params.get("inputenglish") === "true",
    },
    inputType: {
      mc: params.get("inputmc") === "true",
      typein: params.get("inputtypein") === "true",
    },
    number: parseInt(params.get("number"), 10) || 30
  };
}


//get settings
const settings = getQueryParams();
console.log(settings)

// Sentences dataset (character, pinyin, english, examples)
vocabFile = "./vocab-lists/hsk1_full_vocab_with_examples.json"
mnemonicsFile = "./vocab-lists/hsk1_mnemonics.json"

Promise.all([
  fetch(vocabFile).then(res => res.json()),
  fetch(mnemonicsFile).then(res => res.json())
])
.then(([vocabData, mnemonicsData]) => {
console.log(vocabData)
const SENTENCES = vocabData
const MNEMONICS = mnemonicsData

let sessionResults = {};
for (let i = 0; i < 150; i++) {
  sessionResults[i] = 0;
}

let indexQueue = [];
let current = null; let currentIdx = 0;
let showChars = settings.display["chars"];
let showPinyin = settings.display["pinyin"];
let playAudio = settings.display["audio"];
let correct = 0, doneSoFar = 0; total = settings.number;

// DOM elements
const charsEl = document.getElementById('chars');
const pinyinEl = document.getElementById('pinyin');
const englishEl = document.getElementById('english');

const inputEl = document.getElementById('translationInput');
const enterBtn = document.getElementById('enterBtn');

const revealArea = document.getElementById('revealArea');
const correctTranslationEl = document.getElementById('correctTranslation');
const revealExamplesBtn = document.getElementById('revealExamples');
const exampleListEl = document.getElementById('exampleList');

const btnYes = document.getElementById('btnYes');
const btnMixed = document.getElementById('btnMixed');
const btnNo = document.getElementById('btnNo');

const toggleCharsBtn = document.getElementById('toggleChars');
const togglePinyinBtn = document.getElementById('togglePinyin');
const toggleLanguageBtn = document.getElementById('toggleLanguage');

const progressFill = document.getElementById('progressFill');
const progressDisplay = document.getElementById('progressDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');

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
  currentIdx = idx;
  return SENTENCES[idx];
}

function showSentence(sent) {
  console.log("sent:" +sent.chars)
  current = sent;
  charsEl.style.display = showChars ? 'block' : 'none';
  pinyinEl.style.display = showPinyin ? 'block' : 'none';
  charsEl.textContent = sent.chars;
  pinyinEl.textContent = sent.pinyin;
  englishEl.textContent = settings.display["english"]? sent.eng : "";
  inputEl.value = '';
  revealArea.classList.add('hidden');
  correctTranslationEl.textContent = '';
  exampleListEl.innerHTML = '';
  inputEl.focus();
  document.getElementById('cardArea').classList.add('pop');
  setTimeout(() => document.getElementById('cardArea').classList.remove('pop'), 350);
}

function showChineseChars(sentence){
  charsEl.innerHTML = '';
  for (let char of sentence) {
    const span = document.createElement("span");
    span.textContent = char;
    if (MNEMONICS[char]) {
      const info = MNEMONICS[char];
      const tooltip = document.createElement("div");
      tooltip.className = "tooltip";
      tooltip.innerHTML = `
        <strong>${char}</strong><br>
        <em>${info.definition}</em><br>
        <b>Radicals:</b> ${info.radicals.join(", ")}<br>
        <b>Mnemonic:</b> ${info.mnemonic}
      `;
      span.appendChild(tooltip);
    }
    charsEl.appendChild(span);
  }
}

function revealAnswer() {
  if(settings.inputLang["chinese"]){
    correctTranslationEl.textContent = `"${current.eng}"`;
    showChineseChars(current.chars); 
  }else if(settings.inputLang["english"]) {
    correctTranslationEl.textContent = `"${current.chars}": ${current.pinyin}`;
  }
  revealExamplesBtn.style.display = 'block';
  revealArea.classList.remove('hidden');
}

function revealExamples(){
  exampleListEl.innerHTML =
    '<strong>Examples:</strong><br>' +
    current.examples.map(e => `<div style="margin-top:6px;" >
      • ${highlightWordInSentence(current.chars,e.chinese,'span style="color: var(--accent)"')}<br>&nbsp&nbsp
      ${highlightWordInSentence(current.pinyin,e.pinyin,'span style="color: var(--accent)"')}<br>&nbsp&nbsp${e.english}</div>`).join('');
}

function removeAccents(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function highlightWordInSentence(word, sentence, tag) {
  // Clean inputs
  word = word.trim();

  // Build regex pattern for multi-word phrases (space/apostrophe/nothing allowed)
  const parts = word.split(/\s+/);
  const first = parts[0];
  const capFirst = first.charAt(0).toUpperCase() + first.slice(1);

  // lowercase pattern
  let basePattern = parts
    .map((p, i) => (i === 0 ? p : `(?:\\s|'|)?${p}`))
    .join("");

  // capitalized-first-word pattern
  let capPattern = [capFirst]
    .concat(parts.slice(1).map(p => `(?:\\s|'|)?${p}`))
    .join("");

  // Accent-insensitive regex
  const regex = new RegExp(`(${removeAccents(basePattern)}|${removeAccents(capPattern)})`, "i");

  // Work on accent-free sentence
  const plainSentence = removeAccents(sentence);

  const match = plainSentence.match(regex);
  if (!match) return sentence; // no match found

  // Locate in original sentence
  const index = match.index;
  const found = sentence.slice(index, index + match[0].length);

  const before = sentence.slice(0, index);
  const after = sentence.slice(index + found.length);

  return `${before}<${tag}>${found}</${tag}>${after}`;
}

function markResult(res) {
  doneSoFar++;
  if(doneSoFar >= total){
    save("tempProg");
    showFinalScore()
  }
  if (res === 'yes') { correct++; sessionResults[currentIdx] = 3; }
  else if (res === 'mixed') { correct += 0.5; sessionResults[currentIdx] = 2; }
  else{ sessionResults = 1; }
  scoreDisplay.textContent = `${Math.round(correct * 10) / 10} / ${doneSoFar}`;
  const prog = Math.min(100, ((doneSoFar / total) * 100));
  progressFill.style.width = prog + '%';
  progressDisplay.textContent = `${doneSoFar}/${total}`;

  setTimeout(() => {
    const next = pickNext();
    showSentence(next);
  }, 220);
}

function save(filename) {
  localStorage.setItem(filename, JSON.stringify(sessionResults));
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
    if (revealArea.classList.contains('hidden')) {
      revealAnswer(); 
    }else{
      markResult('yes');//auto - assume correct
    }
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
revealExamplesBtn.addEventListener('click', () => {
  revealExamplesBtn.style.display = 'none';
  revealExamples();
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
const first = pickNext();
console.log(first)
showSentence(first);

})
.catch(err => console.error("Error loading files:", err));
