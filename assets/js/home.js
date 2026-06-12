const API_BASE_URL = 'http://localhost:8080/api';

document.addEventListener('DOMContentLoaded', () => {
    loadHomePage();
});

async function loadHomePage() {
    try {
        const response = await fetch(`${API_BASE_URL}/home`);

        if (!response.ok) {
            throw new Error('Failed to load home page data');
        }

        const result = await response.json();
        const data = result.data || result;

        renderHero(data.heroLesson);
        renderCategories(data.categories || []);
        renderRecentLessons(data.recentLessons || []);
        renderFeaturedLessons(data.featuredLessons || []);

    } catch (error) {
        console.error('Home page load failed:', error);
    }
}

/* Hero */
function renderHero(lesson) {
    const container = document.getElementById('homeHero');
    if (!container || !lesson) return;

    container.innerHTML = `
        <div class="banner-post-thumb-three">
            <a href="lesson-detail.html?slug=${lesson.slug}">
                <img src="${safeImage(lesson.coverImage)}" alt="${escapeHtml(lesson.title)}">
            </a>
        </div>

        <div class="banner-post-content-three">
            <h2 class="post-title bold-underline">
                <a href="lesson-detail.html?slug=${lesson.slug}">
                    ${escapeHtml(lesson.title)}
                </a>
            </h2>

            <div class="blog-post-meta white-blog-meta">
                <ul class="list-wrap">
                    <li>
                        <i class="flaticon-user"></i>
                        ${formatLevel(lesson.level)}
                    </li>
                    <li>
                        <i class="flaticon-history"></i>
                        ${formatDuration(lesson.durationSeconds)}
                    </li>
                </ul>
            </div>

            <br>

            <a href="lesson-detail.html?slug=${lesson.slug}" class="post-tag">
                Start Lesson
            </a>
        </div>
    `;
}

/* Categories */
function renderCategories(categories) {
    const container = document.getElementById('homeCategories');
    if (!container) return;

    if (!categories.length) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = categories.map(category => `
        <div class="col-xl-2 col-lg-3 col-md-4 col-6">
            <div class="categories-item">
                <div class="categories-img">
                    <a href="category.html?category=${category.slug}">
                        <img src="${safeImage(category.coverImage)}" alt="${escapeHtml(category.name)}">
                    </a>
                </div>
                <div class="categories-content">
                    <a href="category.html?category=${category.slug}">
                        ${escapeHtml(category.shortName || category.name)}
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

/* Recently Added Lessons */
function renderRecentLessons(lessons) {
    const container = document.getElementById('recentLessons');
    if (!container) return;

    if (!lessons.length) {
        container.innerHTML = '';
        return;
    }

    const mainLesson = lessons[0];
    const sideLessons = lessons.slice(1, 4);

    container.innerHTML = `
        <div class="col-xl-6">
            ${renderRecentMainCard(mainLesson)}
        </div>

        <div class="col-xl-6">
            ${sideLessons.map(renderRecentSideCard).join('')}
        </div>
    `;
}

function renderRecentMainCard(lesson) {
    return `
        <div class="ta-overlay-post">
            <div class="overlay-post-thumb">
                <a href="lesson-detail.html?slug=${lesson.slug}">
                    <img src="${safeImage(lesson.coverImage)}" alt="${escapeHtml(lesson.title)}">
                </a>
            </div>

            <div class="overlay-post-content">
                <a href="category.html?category=${lesson.categorySlug || ''}" class="post-tag">
                    New Lesson
                </a>

                <h2 class="post-title">
                    <a href="lesson-detail.html?slug=${lesson.slug}">
                        ${escapeHtml(lesson.title)}
                    </a>
                </h2>

                <div class="blog-post-meta">
                    <ul class="list-wrap">
                        <li><i class="flaticon-user"></i>${formatLevel(lesson.level)}</li>
                        <li><i class="flaticon-history"></i>${formatDuration(lesson.durationSeconds)}</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

function renderRecentSideCard(lesson) {
    return `
        <div class="ta-horizontal-post">
            <div class="horizontal-post-thumb">
                <a href="lesson-detail.html?slug=${lesson.slug}">
                    <img src="${safeImage(lesson.coverImage)}" alt="${escapeHtml(lesson.title)}">
                </a>
            </div>

            <div class="horizontal-post-content">
                <a href="category.html?category=${lesson.categorySlug || ''}" class="post-tag">
                    ${escapeHtml(lesson.categoryShortName || lesson.categoryName || 'Lesson')}
                </a>

                <h2 class="post-title">
                    <a href="lesson-detail.html?slug=${lesson.slug}">
                        ${escapeHtml(lesson.title)}
                    </a>
                </h2>

                <div class="blog-post-meta">
                    <ul class="list-wrap">
                        <li><i class="flaticon-user"></i>${formatLevel(lesson.level)}</li>
                        <li><i class="flaticon-history"></i>${formatDuration(lesson.durationSeconds)}</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

/* Featured Lessons */
function renderFeaturedLessons(lessons) {
    const container = document.getElementById('featuredLessons');
    if (!container) return;

    if (!lessons.length) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = lessons.map(lesson => `
        <div class="col-lg-4 col-md-6 col-sm-6">
            <div class="featured-post-item healthy-post">
                <div class="featured-post-thumb">
                    <a href="lesson-detail.html?slug=${lesson.slug}">
                        <img src="${safeImage(lesson.coverImage)}" alt="${escapeHtml(lesson.title)}">
                    </a>
                </div>

                <div class="featured-post-content">
                    <a href="category.html?category=${lesson.categorySlug || ''}" class="post-tag">
                        ${escapeHtml(lesson.categoryShortName || lesson.categoryName || 'Lesson')}
                    </a>

                    <h2 class="post-title">
                        <a href="lesson-detail.html?slug=${lesson.slug}">
                            ${escapeHtml(lesson.title)}
                        </a>
                    </h2>

                    <div class="blog-post-meta">
                        <ul class="list-wrap">
                            <li><i class="flaticon-user"></i>${formatLevel(lesson.level)}</li>
                            <li><i class="flaticon-history"></i>${formatDuration(lesson.durationSeconds)}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

/* Helpers */
// function formatDuration(seconds) {
//     if (!seconds || seconds <= 0) return '5 Mins';
//     return `${Math.ceil(seconds / 60)} Mins`;
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

function formatLevel(level) {
    if (!level) return 'A1 Beginner';

    const text = String(level).trim();

    if (text.toLowerCase().includes('beginner')) {
        return escapeHtml(text);
    }

    if (text.toUpperCase() === 'A1') {
        return 'A1 Beginner';
    }

    return escapeHtml(text);
}

function safeImage(url) {
    return url || 'assets/img/blog/tr_banner_post.jpg';
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';

    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}