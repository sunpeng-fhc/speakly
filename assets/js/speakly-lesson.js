document.addEventListener("DOMContentLoaded", async () => {
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

  let lessonData = null;
  let subtitles = [];
  let vocabularies = [];
  let currentSentenceIndex = -1;
  let repeatCurrent = false;
  let wasPlayingBeforeWordPopup = false;
  let currentWordAudio = "";

  const dictionaryCache = {};
  const vocabularyMap = {};

  let lastAudioTime = 0;
  let lastActiveIndex = -1;
  let isUserSeeking = false;

  function getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("slug");
  }

  function formatTime(seconds) {
    if (!seconds || Number.isNaN(seconds)) return "00:00";

    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);

    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  // function formatDuration(seconds) {
  //   if (!seconds) return "Practice Time";
  //
  //   const minutes = Math.ceil(seconds / 60);
  //   return `${minutes} Mins`;
  // }

  function formatDuration(seconds) {
    if (!seconds) return "";

    const totalSeconds = Number(seconds);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;

    if (minutes === 0) {
      return `${remainingSeconds}s`;
    }

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  function cleanWord(rawWord) {
    return rawWord
        .toLowerCase()
        .replace(/[^a-z'-]/g, "")
        .replace(/^'+|'+$/g, "");
  }

  function normalizeSubtitleItem(item, index) {
    return {
      id: item.id || index + 1,
      start: Number(item.startTime ?? 0),
      end: Number(item.endTime ?? 0),
      textEn: item.sentence || "",
      textZh: item.translation || "",
      sortOrder: item.sortOrder ?? index
    };
  }

  function buildVocabularyMap(list) {
    list.forEach(item => {
      if (!item.word) return;

      const key = cleanWord(item.word);

      if (!key) return;

      vocabularyMap[key] = {
        word: item.word,
        phonetic: item.phonetic || "/ /",
        part: item.partOfSpeech || "-",
        meaning: item.meaning || item.simpleDefinition || "No meaning available.",
        example: item.exampleSentence || "No example sentence available."
      };
    });
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

  function renderLessonHeader(lesson) {
    const categoryEl = document.getElementById("lessonCategory");
    const titleEl = document.getElementById("lessonTitle");
    const summaryEl = document.getElementById("lessonSummary");
    const metaEl = document.getElementById("lessonMeta");

    if (categoryEl) {
      categoryEl.innerHTML = `
        <i class="fas fa-book-open"></i> ${lesson.categoryName || "English Lesson"}
      `;
    }

    if (titleEl) {
      titleEl.textContent = lesson.title || "Untitled Lesson";
    }

    if (summaryEl) {
      summaryEl.textContent = lesson.summary || "Practice real English with audio and subtitles.";
    }

    if (metaEl) {
      metaEl.innerHTML = `
        <span><i class="fas fa-layer-group"></i> ${lesson.level || "A1 Beginner"}</span>
        <span><i class="fas fa-headphones"></i> Listening & Shadowing</span>
        <span><i class="fas fa-clock"></i> ${formatDuration(lesson.durationSeconds)}</span>
      `;
    }
  }

  function renderAudioInfo(lesson) {
    const audioTitle = document.getElementById("audioTitle");
    const audioSubtitle = document.getElementById("audioSubtitle");

    if (audioTitle) {
      audioTitle.textContent = lesson.title || "Lesson Audio";
    }

    if (audioSubtitle) {
      audioSubtitle.textContent = `${lesson.level || "A1 Beginner"} • Audio Shadowing Practice`;
    }

    if (lesson.audioUrl) {
      audio.src = lesson.audioUrl;
      audio.load();
    }
  }

  function renderLessonInfo(lesson) {
    const lessonInfoList = document.getElementById("lessonInfoList");

    if (!lessonInfoList) return;

    lessonInfoList.innerHTML = `
      <div class="col-md-6">
        <div class="lesson-info-card">
          <strong>Level</strong>
          <span>${lesson.level || "A1 Beginner"}</span>
        </div>
      </div>

      <div class="col-md-6">
        <div class="lesson-info-card">
          <strong>Skill</strong>
          <span>Listening & Shadowing</span>
        </div>
      </div>

      <div class="col-md-6">
        <div class="lesson-info-card">
          <strong>Topic</strong>
          <span>${lesson.categoryName || "General English"}</span>
        </div>
      </div>

      <div class="col-md-6">
        <div class="lesson-info-card">
          <strong>Duration</strong>
          <span>${formatDuration(lesson.durationSeconds)}</span>
        </div>
      </div>
    `;
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
          <div class="transcript-text-zh">${item.textZh || ""}</div>
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
    if (index === currentSentenceIndex) return;

    currentSentenceIndex = index;

    document.querySelectorAll(".transcript-item").forEach(item => {
      item.classList.remove("active");
    });

    const activeItem = document.querySelector(`.transcript-item[data-index="${index}"]`);

    if (activeItem) {
      activeItem.classList.add("active");
    }
  }

  function playSentence(index) {
    const sentence = subtitles[index];

    if (!sentence) return;

    isUserSeeking = true;
    lastActiveIndex = index;

    audio.currentTime = sentence.start;
    audio.play();

    setActiveSentence(index);
    updatePlayIcon(true);
  }

  function getCurrentSubtitleIndex(currentTime) {
    let activeIndex = -1;

    for (let i = 0; i < subtitles.length; i++) {
      if (currentTime >= subtitles[i].start) {
        activeIndex = i;
      } else {
        break;
      }
    }

    return activeIndex;
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
    wordMeaning.textContent = "Sorry, this word is not available yet.";
    wordExample.textContent = "Try another word from the transcript.";
    currentWordAudio = "";
    wordAudioBtn.disabled = true;
  }

  function showLocalVocabulary(wordKey) {
    const localWord = vocabularyMap[wordKey];

    if (!localWord) return false;

    wordTitle.textContent = localWord.word;
    wordPhonetic.textContent = localWord.phonetic;
    wordPart.textContent = localWord.part;
    wordMeaning.textContent = localWord.meaning;
    wordExample.textContent = localWord.example;

    currentWordAudio = "";
    wordAudioBtn.disabled = true;

    return true;
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

    const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`
    );

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

    const hasLocalWord = showLocalVocabulary(wordKey);

    if (hasLocalWord) return;

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

  async function loadLessonDetail() {
    const slug = getSlugFromUrl();

    if (!slug) {
      transcriptList.innerHTML = `<p class="transcript-loading">Lesson slug is missing.</p>`;
      return;
    }

    try {
      transcriptList.innerHTML = `<p class="transcript-loading">Loading transcript...</p>`;

      lessonData = await SpeaklyAPI.getLessonBySlug(slug);

      subtitles = (lessonData.segments || [])
          .map(normalizeSubtitleItem)
          .sort((a, b) => a.start - b.start);

      vocabularies = lessonData.vocabularies || [];

      buildVocabularyMap(vocabularies);

      renderLessonHeader(lessonData);
      renderAudioInfo(lessonData);
      renderLessonInfo(lessonData);
      renderTranscript();

    } catch (error) {
      console.error("Failed to load lesson detail:", error);

      transcriptList.innerHTML = `
        <p class="transcript-loading">
          Failed to load lesson detail. Please check the API or slug.
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

    const index = getCurrentSubtitleIndex(currentTime);

    console.log({
      currentTime,
      index,
      sentence: subtitles[index]?.textEn,
      start: subtitles[index]?.start
    });

    if (index === -1) return;

    if (index < lastActiveIndex && !isUserSeeking) {
      return;
    }

    if (index !== currentSentenceIndex) {
      setActiveSentence(index);
      lastActiveIndex = index;
    }

    lastAudioTime = currentTime;
    isUserSeeking = false;

    if (repeatCurrent && currentSentenceIndex !== -1) {
      const currentSentence = subtitles[currentSentenceIndex];

      if (currentTime >= currentSentence.end) {
        isUserSeeking = true;
        audio.currentTime = currentSentence.start;
        audio.play();
      }
    }
  });

  progressBar.addEventListener("input", () => {
    if (!audio.duration) return;

    isUserSeeking = true;
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

  loadLessonDetail();
});