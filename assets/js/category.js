document.addEventListener("DOMContentLoaded", async () => {
    const category = getCategoryFromUrl();

    if (!category) {
        showCategoryError("Category parameter is missing.");
        return;
    }

    try {
        const data = await SpeaklyAPI.getCategoryDetail(category);
        renderCategoryPage(data);
    } catch (error) {
        console.error("Failed to load category detail:", error);
        showCategoryError("Failed to load category detail.");
    }
});

function getCategoryFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("category");
}

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
function getCategoryIcon(categoryName) {
    const name = (categoryName || "").toLowerCase();

    if (name.includes("work")) return "fas fa-briefcase";
    if (name.includes("food")) return "fas fa-utensils";
    if (name.includes("shopping")) return "fas fa-cart-shopping";
    if (name.includes("transport")) return "fas fa-bus";
    if (name.includes("daily")) return "fas fa-sun";

    return "fas fa-book-open";
}

function renderCategoryPage(data) {
    const icon = getCategoryIcon(data.name);

    document.title = `Speakly - ${data.name}`;

    document.querySelector("main").dataset.pageTitle = data.name;

    document.getElementById("categoryBreadcrumb").textContent = data.name;

    document.getElementById("categoryTag").innerHTML = `
    <i class="${icon}"></i> ${data.name}
  `;

    document.getElementById("categoryTitle").textContent =
        `Practice ${data.name} With Real-Life Lessons`;

    document.getElementById("categoryDescription").textContent =
        data.description || "Practice real English with short listening and shadowing lessons.";

    renderInfoPills(data);
    renderFeaturedLesson(data.featuredLesson);
    renderLessonList(data.lessons || []);
}

function renderInfoPills(data) {
    const totalMinutes = Math.ceil((data.totalDurationSeconds || 0) / 60);

    document.getElementById("categoryInfoPills").innerHTML = `
    <span><i class="fas fa-book-open"></i> ${data.lessonCount || 0} Lessons</span>
    <span><i class="fas fa-clock"></i> ${totalMinutes} mins</span>
    <span><i class="fas fa-headphones"></i> Listening</span>
    <span><i class="fas fa-microphone"></i> Shadowing</span>
  `;
}

function renderFeaturedLesson(lesson) {
    const card = document.getElementById("featuredLessonCard");
    const startBtn = document.getElementById("startFirstLessonBtn");

    if (!lesson) {
        card.innerHTML = `
      <span class="start-card-label">
        <i class="fas fa-star"></i> Start Here
      </span>
      <h3>No lesson yet</h3>
      <p>This category does not have lessons yet.</p>
    `;

        startBtn.style.display = "none";
        return;
    }

    const lessonUrl = `lesson-detail.html?slug=${lesson.slug}`;

    startBtn.href = lessonUrl;

    card.innerHTML = `
    <span class="start-card-label">
      <i class="fas fa-star"></i> Start Here
    </span>

    <h3>${lesson.title}</h3>

    <p>${lesson.summary || "Start with this recommended lesson."}</p>

    <div class="start-card-meta">
      <span><i class="fas fa-seedling"></i> ${lesson.level || "A1"}</span>
      <span><i class="fas fa-clock"></i> ${formatDuration(lesson.durationSeconds)}</span>
    </div>

    <a href="${lessonUrl}" class="start-card-btn">
      Start This Lesson
    </a>
  `;
}

function renderLessonList(lessons) {
    const lessonList = document.getElementById("lessonList");

    if (!lessons.length) {
        lessonList.innerHTML = `
      <div class="col-12">
        <p class="text-center">No lessons available in this category yet.</p>
      </div>
    `;
        return;
    }

    lessonList.innerHTML = lessons.map(lesson => {
        const lessonUrl = `lesson-detail.html?slug=${lesson.slug}`;
        const image = lesson.coverImage || "assets/img/blog/author_post02.jpg";

        return `
      <div class="col-xl-4 col-md-6">
        <div class="speakly-lesson-card">
          <div class="lesson-thumb">
            <a href="${lessonUrl}">
              <img src="${image}" alt="${lesson.title}">
            </a>
            <span class="lesson-badge">
              <i class="${getCategoryIcon(lesson.categoryName)}"></i> ${lesson.categoryName || "Lesson"}
            </span>
          </div>

          <div class="lesson-card-content">
            <h3>
              <a href="${lessonUrl}">
                ${lesson.title}
              </a>
            </h3>

            <div class="lesson-meta">
              <span><i class="fas fa-seedling"></i> ${lesson.level || "A1"}</span>
              <span><i class="fas fa-clock"></i> ${formatDuration(lesson.durationSeconds)}</span>
            </div>

            <p>
              ${lesson.summary || "Practice this lesson with audio and subtitles."}
            </p>

            <a href="${lessonUrl}" class="start-lesson-btn">
              Start Lesson
            </a>
          </div>
        </div>
      </div>
    `;
    }).join("");
}

function showCategoryError(message) {
    const lessonList = document.getElementById("lessonList");

    if (lessonList) {
        lessonList.innerHTML = `
      <div class="col-12">
        <p class="text-center">${message}</p>
      </div>
    `;
    }
}