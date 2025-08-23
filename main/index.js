//setting these variables
let displayChar = true;
let displayPinyin = false;
let displayAudio = false;
let displayEnglish = false;
let countDisplays = 1;
let display = {chars:true, pinyin: false, audio: false, english: false}
let inputLang = {chinese: true, english: false}
let inputType = {mc: false, typein: true}

//DOM elements
const displayCharEl = document.getElementById("displayChar");
const displayPinyinEl = document.getElementById("displayPinyin");
const displayAudioEl = document.getElementById("displayAudio");
const displayEngEl = document.getElementById("displayEng"); 
const inputChinEl = document.getElementById("inputChin");
const inputEngEl = document.getElementById("inputEng");
const inputMCEl = document.getElementById("inputMC");
const inputTypeEl = document.getElementById("inputType"); 

function hasExactlyOneTrue(obj) {
  return Object.values(obj).filter(v => v === true).length === 1;
}

function displaySelecting(state, myVar, obj, contentYes, contentNo){
  if(!(state[myVar] && hasExactlyOneTrue(state))){// do not allow deselect
    state[myVar] = !state[myVar];
    if(state[myVar]){//was just turned on
      obj.textContent = contentYes;
      obj.classList.add('selected');
    }else{
      obj.textContent = contentNo;
      obj.classList.remove('selected');
    }
  }
}

displayCharEl.addEventListener('click', () => {
  displaySelecting(display, "chars", displayCharEl, "Show Characters", "Hide Characters");
});
displayPinyinEl.addEventListener('click', () => {
  displaySelecting(display, "pinyin", displayPinyinEl, "Show Pinyin", "Hide Pinyin");
});
displayAudioEl.addEventListener('click', () => {
  displaySelecting(display, "audio", displayAudioEl, "Play Audio", "No Audio");
});
displayEngEl.addEventListener('click', () => {
  displaySelecting(display, "english", displayEngEl, "Show English", "Hide English");
});


//selectLang
function inputSelecting(state, var1, var2, obj1, obj2) {
  state[var1] = !state[var1];
  state[var2] = !state[var2];
  if(state[var1]){
    obj1.classList.add("selected");
    obj2.classList.remove("selected");
  }else{
    obj2.classList.add("selected");
    obj1.classList.remove("selected");
  }
}
inputChinEl.addEventListener('click', () => { inputSelecting(inputLang,"chinese", "english", inputChinEl, inputEngEl); });
inputEngEl.addEventListener('click', () => { inputSelecting(inputLang, "chinese", "english", inputChinEl, inputEngEl); });
inputTypeEl.addEventListener('click', () => { inputSelecting(inputType,"typein", "mc", inputTypeEl, inputMCEl); });
inputMCEl.addEventListener('click', () => { inputSelecting(inputType, "typein", "mc", inputTypeEl, inputMCEl); });

function goToFlashcards() {
  const params = new URLSearchParams();
  var number = document.getElementById("number").value;
  // prefix keys from display
  Object.entries(display).forEach(([key, val]) => {
    params.set(`display${key}`, val);
  });

  // prefix keys from inputLang
  Object.entries(inputLang).forEach(([key, val]) => {
    params.set(`input${key}`, val);
  });

  // prefix keys from inputType
  Object.entries(inputType).forEach(([key, val]) => {
    params.set(`input${key}`, val);
  });

  // add number (assuming it's already defined)
  params.set("number", number);

  // build final URL
  const url = `flashcards.html?${params.toString()}`;
  window.location.href = url;
}
