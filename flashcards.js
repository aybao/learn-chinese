const flashcards = [
  {
    characters: "你好",
    pinyin: "nǐ hǎo",
    english: "hello",
    examples: ["你好！欢迎光临。 - Hello! Welcome.", "你好吗？ - How are you?"],
    options: ["hello", "goodbye", "thank you", "please"]
  },
  {
    characters: "谢谢",
    pinyin: "xiè xie",
    english: "thank you",
    examples: ["谢谢你的帮助。 - Thank you for your help.", "谢谢大家！ - Thanks everyone!"],
    options: ["thank you", "sorry", "good night", "yes"]
  }
];

let currentIndex = 0;
let showingBack = false;

function renderCard() {
  const card = flashcards[currentIndex];
  document.getElementById('flashcard').innerHTML = showingBack
    ? `<h2>${card.english}</h2>`
    : `<h2>${card.characters}</h2><p>${card.pinyin}</p>`;

  if (showingBack) {
    const exDiv = document.getElementById('examples');
    exDiv.innerHTML = `<h3>Examples:</h3>` + card.examples.map(e => `<p>${e}</p>`).join('') +
      `<div class='options'>${card.options.map(o => `<span class='option'>${o}</span>`).join('')}</div>`;
    exDiv.classList.remove('hidden');
  } else {
    document.getElementById('examples').classList.add('hidden');
  }
}

document.getElementById('answerInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    if (!showingBack) {
      showingBack = true;
      renderCard();
    } else {
      showingBack = false;
      this.value = '';
      currentIndex = (currentIndex + 1) % flashcards.length;
      renderCard();
    }
  }
});

renderCard();