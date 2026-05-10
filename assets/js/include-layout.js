document.addEventListener("DOMContentLoaded", () => {

  loadHTML("site-header", "partials/header.html", () => {
    setActiveNav();
    setBreadcrumb();
  });

  loadHTML("site-footer", "partials/footer.html");

});

function loadHTML(elementId, filePath, callback) {

  const element = document.getElementById(elementId);

  if (!element) return;

  fetch(filePath)
    .then(response => {

      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}`);
      }

      return response.text();

    })
    .then(html => {

      element.innerHTML = html;

      if (typeof callback === "function") {
        callback();
      }

    })
    .catch(error => {
      console.error(error);
    });
}

function setActiveNav() {

  const main = document.querySelector("main");
  const navKey = main?.dataset.nav;

  document.querySelectorAll(".navigation li").forEach(li => {
    li.classList.remove("active");
  });

  const navMap = {
    "home": 'a[href="index.html"]',
    "daily-lessons": 'a[href="daily-lessons.html"]',
    "categories": '.menu-item-has-children',
    "about": 'a[href="about.html"]',
    "contact": 'a[href="contact.html"]'
  };

  const selector = navMap[navKey];

  if (!selector) return;

  const target = document.querySelector(selector);

  if (!target) return;

  if (target.classList.contains("menu-item-has-children")) {

    target.classList.add("active");

  } else {

    target.closest("li")?.classList.add("active");

  }

  const params = new URLSearchParams(window.location.search);
  const currentCategory = params.get("category");

  if (currentCategory) {

    document.querySelectorAll("[data-category]").forEach(link => {

      link.classList.remove("active-category");

      if (link.dataset.category === currentCategory) {
        link.classList.add("active-category");
      }

    });

  }

}

function setBreadcrumb() {

  const breadcrumbCurrent = document.getElementById("breadcrumbCurrent");

  if (!breadcrumbCurrent) return;

  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  const categoryMap = {
    "daily-life": "Daily Life English",
    "food": "Food English",
    "shopping": "Shopping English",
    "transportation": "Transportation English",
    "work": "Work English"
  };

  if (category && categoryMap[category]) {
    breadcrumbCurrent.textContent = categoryMap[category];
    return;
  }

  const main = document.querySelector("main");

  breadcrumbCurrent.textContent =
    main?.dataset.pageTitle || "Page";

}