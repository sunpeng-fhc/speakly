document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("lessonAudio");
  const playPauseBtn = document.getElementById("playPauseBtn");
  const progressBar = document.getElementById("progressBar");
  const currentTimeText = document.getElementById("currentTime");
  const durationText = document.getElementById("duration");
  const transcriptList = document.getElementById("transcriptList");
  const slowBtn = document.getElementById("slowBtn");
  const normalBtn = document.getElementById("normalBtn");
  const repeatBtn = document.getElementById("repeatBtn");
  

  const wordPopup = document.getElementById("wordPopup");
  const closeWordPopupBtn = document.getElementById("closeWordPopup");
  const continuePracticeBtn = document.getElementById("continuePracticeBtn");
  const wordTitle = document.getElementById("wordTitle");
  const wordPhonetic = document.getElementById("wordPhonetic");
  const wordAudioBtn = document.getElementById("wordAudioBtn");
  const wordPart = document.getElementById("wordPart");
  const wordMeaning = document.getElementById("wordMeaning");
  const wordExample = document.getElementById("wordExample");

  let subtitles = [];
  let currentSentenceIndex = -1;
  let repeatCurrent = false;
  let wasPlayingBeforeWordPopup = false;
  let currentWordAudio = "";

  const dictionaryCache = {};

  function formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) return "00:00";

    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);

    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function normalizeSubtitleItem(item, index) {
    return {
      id: item.id || index + 1,
      start: Number(item.start ?? item.startTime ?? 0),
      end: Number(item.end ?? item.endTime ?? 0),
      textEn: item.textEn || item.en || item.text || "",
      textZh: item.textZh || item.zh || item.translation || ""
    };
  }

  function cleanWord(rawWord) {
    return rawWord.toLowerCase().replace(/[^a-z'-]/g, "").replace(/^'+|'+$/g, "");
  }

  function wrapWords(text) {
    return text.split(/(\s+)/).map(part => {
      const word = cleanWord(part);

      if (!word || !/[a-z]/.test(word)) {
        return part;
      }

      return `<span class="word-token" data-word="${word}">${part}</span>`;
    }).join("");
  }

  function updatePlayIcon(isPlaying) {
    playPauseBtn.innerHTML = isPlaying
      ? `<i class="fas fa-pause"></i>`
      : `<i class="fas fa-play"></i>`;
  }

  function renderTranscript() {
    if (!subtitles.length) {
      transcriptList.innerHTML = `<p class="transcript-loading">No transcript available.</p>`;
      return;
    }

    transcriptList.innerHTML = subtitles.map((item, index) => `
      <div class="transcript-item" data-index="${index}">
        <div class="transcript-time">${formatTime(item.start)}</div>
        <div class="transcript-content">
          <div class="transcript-text-en">${wrapWords(item.textEn)}</div>
          <div class="transcript-text-zh">${item.textZh}</div>
        </div>
      </div>
    `).join("");

    document.querySelectorAll(".transcript-item").forEach(item => {
      item.addEventListener("click", () => {
        const index = Number(item.dataset.index);
        playSentence(index);
      });
    });

    document.querySelectorAll(".word-token").forEach(word => {
      word.addEventListener("click", event => {
        event.stopPropagation();

        const wordKey = event.currentTarget.dataset.word;
        showWordPopup(wordKey);
      });
    });
  }

  function setActiveSentence(index) {
    if (index < 0 || index >= subtitles.length) return;

    currentSentenceIndex = index;

    document.querySelectorAll(".transcript-item").forEach(item => {
      item.classList.remove("active");
    });

    const activeItem = document.querySelector(`.transcript-item[data-index="${index}"]`);

    if (activeItem) {
      activeItem.classList.add("active");
      activeItem.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }

  function playSentence(index) {
    const sentence = subtitles[index];

    if (!sentence) return;

    audio.currentTime = sentence.start;
    audio.play();
    setActiveSentence(index);
    updatePlayIcon(true);
  }

  function setSpeed(rate) {
    audio.playbackRate = rate;

    slowBtn.classList.toggle("active", rate === 0.75);
    normalBtn.classList.toggle("active", rate === 1);
  }

  function setWordPopupLoading(word) {
    wordTitle.textContent = word;
    wordPhonetic.textContent = "Loading...";
    wordPart.textContent = "...";
    wordMeaning.textContent = "Looking up this word...";
    wordExample.textContent = "Please wait a moment.";
    currentWordAudio = "";
    wordAudioBtn.disabled = true;
  }

  function setWordPopupError(word) {
    wordTitle.textContent = word;
    wordPhonetic.textContent = "Not found";
    wordPart.textContent = "-";
    wordMeaning.textContent = "Sorry, this word is not available in the dictionary yet.";
    wordExample.textContent = "Try another word from the transcript.";
    currentWordAudio = "";
    wordAudioBtn.disabled = true;
  }

  function parseDictionaryResponse(data, fallbackWord) {
    const entry = Array.isArray(data) ? data[0] : null;

    if (!entry) return null;

    const phoneticItem = entry.phonetics?.find(item => item.text && item.audio)
      || entry.phonetics?.find(item => item.text)
      || entry.phonetics?.find(item => item.audio)
      || {};

    const meaning = entry.meanings?.[0];
    const definition = meaning?.definitions?.[0];

    return {
      word: entry.word || fallbackWord,
      phonetic: phoneticItem.text || entry.phonetic || "/ /",
      audio: phoneticItem.audio || "",
      part: meaning?.partOfSpeech || "-",
      meaning: definition?.definition || "No definition available.",
      example: definition?.example || "No example sentence available."
    };
  }

  async function fetchWordDefinition(word) {
    if (dictionaryCache[word]) {
      return dictionaryCache[word];
    }

    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);

    if (!response.ok) {
      throw new Error(`Dictionary lookup failed: ${response.status}`);
    }

    const data = await response.json();
    const parsedData = parseDictionaryResponse(data, word);

    if (!parsedData) {
      throw new Error("Dictionary response format is invalid.");
    }

    dictionaryCache[word] = parsedData;
    return parsedData;
  }

  async function showWordPopup(wordKey) {
    if (!wordKey) return;

    wasPlayingBeforeWordPopup = !audio.paused;
    audio.pause();

    wordPopup.classList.add("show");
    setWordPopupLoading(wordKey);

    try {
      const wordData = await fetchWordDefinition(wordKey);

      wordTitle.textContent = wordData.word;
      wordPhonetic.textContent = wordData.phonetic;
      wordPart.textContent = wordData.part;
      wordMeaning.textContent = wordData.meaning;
      wordExample.textContent = wordData.example;

      currentWordAudio = wordData.audio;
      wordAudioBtn.disabled = !currentWordAudio;
    } catch (error) {
      console.error("Failed to fetch word definition:", error);
      setWordPopupError(wordKey);
    }
  }

  function closeWordPopup(shouldContinue = false) {
    wordPopup.classList.remove("show");

    if (shouldContinue && wasPlayingBeforeWordPopup) {
      audio.play();
    }
  }

  async function loadSubtitles() {
    try {
      const response = await fetch("assets/data/Ordering22714.json");

      if (!response.ok) {
        throw new Error(`Subtitle file not found: ${response.status}`);
      }

      const data = await response.json();

      const rawSubtitles = Array.isArray(data)
        ? data
        : data.subtitles || data.items || [];

      subtitles = rawSubtitles.map(normalizeSubtitleItem);

      renderTranscript();
    } catch (error) {
      console.error("Failed to load subtitles:", error);

      transcriptList.innerHTML = `
        <p class="transcript-loading">
          Failed to load transcript. Please check the JSON file path or format.
        </p>
      `;
    }
  }

  audio.addEventListener("loadedmetadata", () => {
    durationText.textContent = formatTime(audio.duration);
  });

  playPauseBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play();
      updatePlayIcon(true);
    } else {
      audio.pause();
      updatePlayIcon(false);
    }
  });

  audio.addEventListener("timeupdate", () => {
    const currentTime = audio.currentTime;

    currentTimeText.textContent = formatTime(currentTime);
    progressBar.value = audio.duration
      ? (currentTime / audio.duration) * 100
      : 0;

    const index = subtitles.findIndex(sentence =>
      currentTime >= sentence.start && currentTime <= sentence.end
    );

    if (index !== -1 && index !== currentSentenceIndex) {
      setActiveSentence(index);
    }

    if (repeatCurrent && currentSentenceIndex !== -1) {
      const currentSentence = subtitles[currentSentenceIndex];

      if (currentTime >= currentSentence.end) {
        audio.currentTime = currentSentence.start;
        audio.play();
      }
    }
  });

  progressBar.addEventListener("input", () => {
    if (!audio.duration) return;

    audio.currentTime = (progressBar.value / 100) * audio.duration;
  });

  audio.addEventListener("pause", () => {
    updatePlayIcon(false);
  });

  audio.addEventListener("play", () => {
    updatePlayIcon(true);
  });

  audio.addEventListener("ended", () => {
    updatePlayIcon(false);
  });

  slowBtn.addEventListener("click", () => {
    setSpeed(0.75);
  });

  normalBtn.addEventListener("click", () => {
    setSpeed(1);
  });

  repeatBtn.addEventListener("click", () => {
    repeatCurrent = !repeatCurrent;

    repeatBtn.classList.toggle("active", repeatCurrent);
    repeatBtn.textContent = repeatCurrent ? "Repeat On" : "Repeat Sentence";
  });

  closeWordPopupBtn.addEventListener("click", () => {
    closeWordPopup(false);
  });

  continuePracticeBtn.addEventListener("click", () => {
    closeWordPopup(true);
  });

  wordPopup.addEventListener("click", event => {
    if (event.target.id === "wordPopup") {
      closeWordPopup(false);
    }
  });

  wordAudioBtn.addEventListener("click", event => {
    event.stopPropagation();

    if (!currentWordAudio) return;

    const pronunciation = new Audio(currentWordAudio);
    pronunciation.play();
  });

  loadSubtitles();
});