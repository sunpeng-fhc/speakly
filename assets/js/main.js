(function ($) {
	"use strict";

/*=============================================
	=    		 Preloader			      =
=============================================*/
function preloader() {
	$('#preloader').delay(0).fadeOut();
};

$(window).on('load', function () {
	preloader();
	wowAnimation();
});



/*=============================================
	=    		Mobile Menu			      =
=============================================*/
//SubMenu Dropdown Toggle
if ($('.menu-area li.menu-item-has-children ul').length) {
	$('.menu-area .navigation li.menu-item-has-children').append('<div class="dropdown-btn"><span class="fas fa-angle-down"></span></div>');

}

//Mobile Nav Hide Show
if ($('.mobile-menu').length) {

	var mobileMenuContent = $('.menu-area .main-menu').html();
	$('.mobile-menu .menu-box .menu-outer').append(mobileMenuContent);

	//Dropdown Button
	$('.mobile-menu li.menu-item-has-children .dropdown-btn').on('click', function () {
		$(this).toggleClass('open');
		$(this).prev('ul').slideToggle(300);
	});
	//Menu Toggle Btn
	$('.mobile-nav-toggler').on('click', function () {
		$('body').addClass('mobile-menu-visible');
	});

	//Menu Toggle Btn
	$('.menu-backdrop, .mobile-menu .close-btn').on('click', function () {
		$('body').removeClass('mobile-menu-visible');
	});
}



/*=============================================
	=     Menu sticky & Scroll to top      =
=============================================*/
$(window).on('scroll', function () {
	var scroll = $(window).scrollTop();
	if (scroll < 245) {
		$("#sticky-header").removeClass("sticky-menu");
        $('.scroll-to-target').removeClass('open');
		$("#header-fixed-height").removeClass("active-height");

	} else {
		$("#sticky-header").addClass("sticky-menu");
        $('.scroll-to-target').addClass('open');
		$("#header-fixed-height").addClass("active-height");
	}
});


/*=============================================
	=    		 Scroll Up  	         =
=============================================*/
if ($('.scroll-to-target').length) {
  $(".scroll-to-target").on('click', function () {
    var target = $(this).attr('data-target');
    // animate
    $('html, body').animate({
      scrollTop: $(target).offset().top
    }, 1000);

  });
}


/*=============================================
	=           Data Background             =
=============================================*/
$("[data-background]").each(function () {
	$(this).css("background-image", "url(" + $(this).attr("data-background") + ")")
})

/*===========================================
	=            OffCanvas Active     =
=============================================*/
$('.offcanvas-toggle a').on('click', function () {
	$('body').addClass('offCanvas-menu-visible');
	return false;
});

$('.offCanvas-overlay, .offCanvas-toggle').on('click', function () {
	$('body').removeClass('offCanvas-menu-visible');
});


/*=============================================
	=            Header Search            =
=============================================*/
$(".search-open-btn").on("click", function () {
    $(".search__popup").addClass("search-opened");
    $(".search-popup-overlay").addClass("search-popup-overlay-open");
});
$(".search-close-btn").on("click", function () {
    $(".search__popup").removeClass("search-opened");
    $(".search-popup-overlay").removeClass("search-popup-overlay-open");
});


/*=============================================
	=          Dark Light Toggler     =
=============================================*/
function tg_theme_toggler() {

    $('.modeSwitch').on("change", function () {
        toggleTheme();
    });

    // set toggle theme scheme
    function tg_set_scheme(tg_theme) {
        localStorage.setItem('tg_theme_scheme', tg_theme);
        document.documentElement.setAttribute("tg-theme", tg_theme);
    }

    // toggle theme scheme
    function toggleTheme() {
        if (localStorage.getItem('tg_theme_scheme') === 'dark') {
            tg_set_scheme('light');
        } else {
            tg_set_scheme('dark');
        }
    }

    // set the first theme scheme
    function tg_init_theme() {
        if (localStorage.getItem('tg_theme_scheme') === 'dark') {
            tg_set_scheme('dark');
            document.querySelector('.modeSwitch').checked = true;
        } else {
            tg_set_scheme('light');
            document.querySelector('.modeSwitch').checked = false;
        }
    }
    tg_init_theme();
}
if ($(".modeSwitch").length > 0) {
    tg_theme_toggler();
}


/*=============================================
	=    		Brand Active		      =
=============================================*/
$('.brand-active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: true,
	arrows: false,
	slidesToShow: 6,
	slidesToScroll: 2,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 5,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});



/*=============================================
	=    		Featured Active		      =
=============================================*/
$('.featured-post-active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: true,
    arrows: true,
    prevArrow: '<button type="button" class="slick-prev"><i class="flaticon-next"></i></button>',
    nextArrow: '<button type="button" class="slick-next"><i class="flaticon-next"></i></button>',
	slidesToShow: 4,
	slidesToScroll: 1,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});


/*=============================================
	=    		Editor Active		      =
=============================================*/
$('.editor-post-active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: false,
    arrows: true,
    prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-arrow-left"></i></button>',
    nextArrow: '<button type="button" class="slick-next"><i class="fas fa-arrow-right"></i></button>',
    appendArrows: ".editor-nav",
	slidesToShow: 3,
	slidesToScroll: 1,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});

/*=============================================
	=    		Editor Active		      =
=============================================*/
$('.editor-post-active-two').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: false,
    arrows: true,
    prevArrow: '<button type="button" class="slick-prev"><i class="fas fa-arrow-left"></i></button>',
    nextArrow: '<button type="button" class="slick-next"><i class="fas fa-arrow-right"></i></button>',
    appendArrows: ".editor-nav-two",
	slidesToShow: 4,
	slidesToScroll: 1,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
			}
		},
	]
});


/*=============================================
	=    		overlay post Active		      =
=============================================*/
$('.overlay-post-active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: true,
    arrows: false,
	slidesToShow: 4,
	slidesToScroll: 1,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});


/*=============================================
	=    		Trending Active		      =
=============================================*/
$('.trending-post-active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: true,
    arrows: true,
    prevArrow: '<button type="button" class="slick-prev"><i class="flaticon-next"></i></button>',
    nextArrow: '<button type="button" class="slick-next"><i class="flaticon-next"></i></button>',
	slidesToShow: 4,
	slidesToScroll: 1,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});


/*=============================================
	=    		Coin Active		      =
=============================================*/
$('.coin-active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: true,
    arrows: false,
	slidesToShow: 7,
	slidesToScroll: 2,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 5,
				slidesToScroll: 2,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 1,
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});

/*=============================================
	=    		overlay post Active		      =
=============================================*/
$('.instagram-active').slick({
	dots: false,
	infinite: true,
	speed: 1000,
	autoplay: true,
    arrows: false,
	slidesToShow: 8,
	slidesToScroll: 1,
	responsive: [
		{
			breakpoint: 1200,
			settings: {
				slidesToShow: 5,
				slidesToScroll: 1,
				infinite: true,
			}
		},
		{
			breakpoint: 992,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 1
			}
		},
		{
			breakpoint: 767,
			settings: {
				slidesToShow: 3,
				slidesToScroll: 1,
				arrows: false,
			}
		},
		{
			breakpoint: 575,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 1,
				arrows: false,
			}
		},
	]
});


/*=============================================
	=    		Trending slider  	       =
=============================================*/
const TrendingSlider = new Swiper(".ta-trending-slider", {
slidesPerView: 1,
loop: true,
slideToClickedSlide: true,
direction: "vertical",
autoplay: {
    delay: 4000,
},
speed: 800,
});


/*=============================================
	=    		Magnific Popup		      =
=============================================*/
$('.popup-image').magnificPopup({
	type: 'image',
	gallery: {
		enabled: true
	}
});

/* magnificPopup video view */
$('.popup-video').magnificPopup({
	type: 'iframe'
});


/*=============================================
	=    		 Wow Active  	         =
=============================================*/
function wowAnimation() {
	var wow = new WOW({
		boxClass: 'wow',
		animateClass: 'animated',
		offset: 0,
		mobile: false,
		live: true
	});
	wow.init();
}

 
})(jQuery);




const audio = document.getElementById("lessonAudio");
const transcriptList = document.getElementById("transcriptList");
const currentEnglish = document.getElementById("currentEnglish");
const currentChinese = document.getElementById("currentChinese");

let subtitles = [];
let currentSentenceIndex = -1;
let repeatCurrent = false;

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = Math.floor(seconds % 60);
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

function renderTranscript() {
  transcriptList.innerHTML = subtitles.map((item, index) => `
    <div class="transcript-item" data-index="${index}">
      <div class="transcript-time">${formatTime(item.start)}</div>
      <div>
        <div class="transcript-text-en">${item.textEn}</div>
        <div class="transcript-text-zh">${item.textZh || ""}</div>
      </div>
    </div>
  `).join("");

  document.querySelectorAll(".transcript-item").forEach(item => {
    item.addEventListener("click", () => {
      playSentence(Number(item.dataset.index));
    });
  });
}

function playSentence(index) {
  const sentence = subtitles[index];
  audio.currentTime = sentence.start;
  audio.play();
  setActiveSentence(index);
}

function setActiveSentence(index) {
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

  currentEnglish.textContent = subtitles[index].textEn;
  currentChinese.textContent = subtitles[index].textZh || "";
}

audio.addEventListener("timeupdate", () => {
  const currentTime = audio.currentTime;

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

document.getElementById("slowBtn").addEventListener("click", () => {
  audio.playbackRate = 0.75;
});

document.getElementById("normalBtn").addEventListener("click", () => {
  audio.playbackRate = 1;
});

document.getElementById("repeatBtn").addEventListener("click", () => {
  repeatCurrent = !repeatCurrent;
  document.getElementById("repeatBtn").textContent = repeatCurrent
    ? "Repeat On"
    : "Repeat Sentence";
});

fetch("assets/data/Ordering22714.json")
  .then(res => res.json())
  .then(data => {
    subtitles = data;
    renderTranscript();
  })
  .catch(error => {
    console.error("Failed to load subtitles:", error);
  });


