// Sentences dataset (character, pinyin, english, examples)
const SENTENCES = [
  {chars:'你好', pinyin:'nǐ hǎo', eng:'hello', examples:['你好，我是李明。','你好！很高兴见到你。']},
  {chars:'请问，厕所在哪里？', pinyin:'qǐng wèn, cè suǒ zài nǎ lǐ?', eng:'Excuse me, where is the restroom?', examples:['请问，车站在哪里？','请问，这个怎么用？']},
  {chars:'多少钱？', pinyin:'duō shǎo qián?', eng:'How much is this?', examples:['这个多少钱？','打折后多少钱？']},
  {chars:'我听不懂。', pinyin:'wǒ tīng bù dǒng.', eng:'I don\'t understand (what I hear).', examples:['对不起，我听不懂。','你说慢一点，我听不懂。']},
  {chars:'我想要这个。', pinyin:'wǒ xiǎng yào zhè ge.', eng:'I want this one.', examples:['我想要这个，不要那个。','我想要一杯咖啡。']},
  {chars:'我要去火车站。', pinyin:'wǒ yào qù huǒ chē zhàn.', eng:'I want to go to the train station.', examples:['我要去机场。','我们要去饭店。']},
  {chars:'你叫什么名字？', pinyin:'nǐ jiào shén me míng zi?', eng:'What is your name?', examples:['你叫什么名字？','他叫什么名字？']},
  {chars:'我来自英国。', pinyin:'wǒ lái zì yīng guó.', eng:'I come from the UK.', examples:['我来自中国。','我来自伦敦。']},
  {chars:'今天几号？', pinyin:'jīn tiān jǐ hào?', eng:'What is the date today?', examples:['今天几号？','明天是几号？']},
  {chars:'我可以刷卡吗？', pinyin:'wǒ kě yǐ shuā kǎ ma?', eng:'Can I pay by card?', examples:['可以刷卡吗？','这里可以用卡吗？']}
];

let indexQueue = [];
let current = null;
let showChars = true;
let showPinyin = true;
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
  charsEl.textContent = sent.chars;
  pinyinEl.textContent = sent.pinyin;
  inputEl.value = '';
  revealArea.classList.add('hidden');
  correctTranslationEl.textContent = '';
  exampleListEl.innerHTML = '';
  inputEl.focus();
  document.getElementById('cardArea').classList.add('pop');
  setTimeout(() => document.getElementById('cardArea').classList.remove('pop'), 350);
}

function revealAnswer() {
  correctTranslationEl.textContent = `"${current.eng}"`;
  exampleListEl.innerHTML =
    '<strong>Examples:</strong><br>' +
    current.examples.map(e => `<div style="margin-top:6px">${e}</div>`).join('');
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
