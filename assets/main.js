// Testimonials Carousel - Infinite carousel with auto-play
(function initTestimonialsCarousel() {
  const carousel = document.querySelector(".testimonials-carousel");
  const track = carousel?.querySelector(".testimonials-track");
  const prevBtn = document.querySelector(".carousel-btn-prev");
  const nextBtn = document.querySelector(".carousel-btn-next");
  const indicators = document.querySelectorAll(".indicator");

  if (!carousel || !track) return;

  let currentIndex = 0;
  const totalCards = 3; // Number of unique testimonials
  let autoplayTimer = null;

  // Drag / swipe state
  let isDragging = false;
  let startX = 0;
  let movedX = 0;
  let pointerId = null;

  function updateCarousel() {
    const offset = currentIndex * 100;
    track.style.transform = `translateX(-${offset}%)`;

    // Update indicators
    indicators.forEach((indicator, index) => {
      indicator.classList.toggle("active", index === currentIndex % totalCards);
    });
  }

  function nextSlide() {
    currentIndex++;

    // When we reach the duplicate (after the last unique card), wrap to start
    if (currentIndex >= totalCards + 1) {
      currentIndex = 0;
      track.style.transition = "none"; // Disable animation for reset
      updateCarousel();
      void track.offsetHeight; // force reflow
      track.style.transition = "transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)";
    } else {
      updateCarousel();
    }

    resetAutoplay();
  }

  function prevSlide() {
    if (currentIndex === 0) {
      // Jump to duplicate of last card instantly
      currentIndex = totalCards;
      track.style.transition = "none";
      updateCarousel();
      void track.offsetHeight;
      track.style.transition = "transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)";
    }

    currentIndex--;
    updateCarousel();
    resetAutoplay();
  }

  function autoplay() {
    nextSlide();
  }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(autoplay, 5000);
  }

  function pauseAutoplay() {
    clearInterval(autoplayTimer);
  }

  // Pointer / touch drag handlers
  function onPointerDown(e) {
    // Only respond to primary pointer
    if (e.button && e.button !== 0) return;
    isDragging = true;
    pointerId = e.pointerId;
    startX = e.clientX;
    movedX = 0;
    track.style.transition = "none";
    pauseAutoplay();
    try {
      e.target.setPointerCapture?.(pointerId);
    } catch (err) {
      // ignore
    }
  }

  function onPointerMove(e) {
    if (!isDragging || e.pointerId !== pointerId) return;
    const currentX = e.clientX;
    movedX = currentX - startX;
    const width =
      carousel.clientWidth || carousel.getBoundingClientRect().width || 1;
    const deltaPercent = (movedX / width) * 100;
    const baseOffset = currentIndex * 100;
    // Move track proportionally while dragging
    track.style.transform = `translateX(-${baseOffset - deltaPercent}%)`;
  }

  function onPointerUp(e) {
    if (!isDragging || (e.pointerId && e.pointerId !== pointerId)) return;
    isDragging = false;
    try {
      e.target.releasePointerCapture?.(pointerId);
    } catch (err) {
      // ignore
    }

    const threshold = 50; // px required to trigger slide
    if (Math.abs(movedX) > threshold) {
      if (movedX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    } else {
      // Not enough movement: snap back to current
      track.style.transition = "transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)";
      updateCarousel();
      resetAutoplay();
    }

    pointerId = null;
    movedX = 0;
  }

  // Event listeners
  nextBtn?.addEventListener("click", nextSlide);
  prevBtn?.addEventListener("click", prevSlide);

  // Click on indicators
  indicators.forEach((indicator) => {
    indicator.addEventListener("click", function () {
      currentIndex = parseInt(this.dataset.index);
      updateCarousel();
      resetAutoplay();
    });
  });

  // Pause autoplay on hover/focus
  carousel.addEventListener("mouseenter", pauseAutoplay);
  carousel.addEventListener("mouseleave", () => resetAutoplay());
  carousel.addEventListener("focus", pauseAutoplay, true);
  carousel.addEventListener("blur", () => resetAutoplay(), true);

  // Pointer events for swipe/drag (works for mouse + touch)
  carousel.addEventListener("pointerdown", onPointerDown, { passive: true });
  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerup", onPointerUp);
  document.addEventListener("pointercancel", onPointerUp);
  carousel.addEventListener("pointerleave", onPointerUp);

  // Initialize
  updateCarousel();
  resetAutoplay();
})();

// Event image lightbox handler
(function initEventLightbox() {
  const lightbox = document.getElementById("eventLightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const imageTrigger = document.getElementById("eventImageTrigger");
  const closeBtn = lightbox?.querySelector(".lightbox-close");

  if (!lightbox || !imageTrigger) return;

  // Open lightbox
  imageTrigger.addEventListener("click", function (e) {
    e.preventDefault();
    const eventImg = imageTrigger.querySelector("img");
    if (eventImg) {
      lightboxImage.src = eventImg.src;
      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  });

  // Close lightbox
  function closeLightbox() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "auto";
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeLightbox);
  }

  // Close on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && lightbox?.classList.contains("active")) {
      closeLightbox();
    }
  });

  // Close on outside click (clicks pass through lightbox-content due to pointer-events: none)
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });
})();

// Sticky navbar - attach scroll listener to add/remove sticky class as user scrolls
(function initStickyNavbar() {
  const nav = document.querySelector(".navbar");
  if (!nav) return;

  function setBodySpacing(stuck) {
    const navHeight = nav.getBoundingClientRect().height || 0;
    if (stuck) {
      document.documentElement.style.setProperty(
        "--sticky-nav-height",
        navHeight + "px"
      );
      document.body.style.paddingTop = navHeight + "px";
    } else {
      document.documentElement.style.removeProperty("--sticky-nav-height");
      document.body.style.paddingTop = "";
    }
  }

  function isForceStickyEnabled() {
    return document.body?.classList.contains("force-sticky-nav");
  }

  function toggleSticky() {
    const scrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const forceSticky = isForceStickyEnabled();
    const shouldStick = forceSticky || scrollY > 0;

    if (shouldStick && !nav.classList.contains("navbar-sticky")) {
      nav.classList.add("navbar-sticky");
      nav.classList.add("navbar-centered");
      setBodySpacing(true);
    } else if (!shouldStick && nav.classList.contains("navbar-sticky")) {
      nav.classList.remove("navbar-sticky");
      nav.classList.remove("navbar-centered");
      setBodySpacing(false);
    }
  }

  // Attach scroll listener immediately and keep it active
  window.addEventListener("scroll", toggleSticky, { passive: true });
  window.addEventListener("resize", toggleSticky);
  window.addEventListener("load", toggleSticky);

  // Also attach listeners for user interaction to ensure sticky works on first scroll
  // even if scroll event doesn't fire reliably on first interaction
  function onFirstInteraction() {
    toggleSticky();
  }
  window.addEventListener("wheel", onFirstInteraction, { passive: true });
  window.addEventListener("touchstart", onFirstInteraction, { passive: true });
  window.addEventListener("touchmove", onFirstInteraction, { passive: true });
  window.addEventListener("keydown", onFirstInteraction);

  // Call once on init to ensure proper state
  toggleSticky();
})();

// Load shared donation modal from external file
fetch("./assets/donation-modal.html")
  .then((response) => response.text())
  .then((html) => {
    const modalContainer = document.createElement("div");
    modalContainer.innerHTML = html;
    document.body.insertBefore(
      modalContainer.firstElementChild,
      document.body.lastElementChild
    );

    // Setup modal event listeners after injection
    setupDonationModal();
  })
  .catch((error) => console.error("Failed to load donation modal:", error));

function setupDonationModal() {
  const modalOverlay = document.getElementById("donationModal");
  const modalCloseBtn = document.getElementById("donationModalClose");
  const donateButtons = document.querySelectorAll(".donate");

  if (!modalOverlay) return;

  // Open modal on donate button click
  donateButtons.forEach((btn) => {
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      modalOverlay.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  // Close button click
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", function () {
      modalOverlay.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  }

  // Click outside modal to close
  modalOverlay.addEventListener("click", function (event) {
    if (event.target === modalOverlay) {
      modalOverlay.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });

  // Escape key to close
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modalOverlay?.classList.contains("active")) {
      modalOverlay.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });
}

// Partner logos infinite slider: duplicate track, compute duration, pause on hover/focus
document.addEventListener("DOMContentLoaded", function () {
  const slider = document.querySelector(".partner-slider");
  if (!slider) return;
  const track = slider.querySelector(".partner-track");
  if (!track) return;

  // Duplicate content for seamless loop
  track.innerHTML = track.innerHTML + track.innerHTML;

  // Compute duration based on half track width (one set) and a pixels-per-second speed
  function recompute() {
    // children after duplication
    const items = Array.from(track.children);
    const half = Math.floor(items.length / 2);
    if (half === 0) return;

    // measure total width of first half
    let width = 0;
    for (let i = 0; i < half; i++) {
      const r = items[i].getBoundingClientRect();
      width += r.width;
    }

    // account for gap (CSS gap) between items
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    width += gap * Math.max(0, half - 1);

    // speed: px per second (tune as needed)
    const speed = 80; // px/s
    let duration = Math.max(6, Math.round(width / speed));

    // set CSS variable to control animation duration
    slider.style.setProperty("--partner-duration", duration + "s");
  }

  // Pause on keyboard focus for accessibility
  track.querySelectorAll("a").forEach((a) => {
    a.addEventListener("focus", () => {
      track.style.animationPlayState = "paused";
    });
    a.addEventListener("blur", () => {
      track.style.animationPlayState = "running";
    });
  });

  // Ensure hover CSS already pauses; set initial values
  recompute();
  window.addEventListener("resize", recompute);
});

document.addEventListener("DOMContentLoaded", function () {
  const heroCarousel = document.querySelector("#heroCarousel");
  if (heroCarousel) {
    new bootstrap.Carousel(heroCarousel, {
      interval: 2000,
      ride: "carousel",
    });
  }

  // Handle navbar active link and page indicator
  handleNavbarActiveState();

  // Listen for dropdown show/hide events to update indicator
  const programsDropdown = document.getElementById("navbarDropdown");
  if (programsDropdown) {
    programsDropdown.addEventListener(
      "shown.bs.dropdown",
      handleNavbarActiveState
    );
    programsDropdown.addEventListener(
      "hidden.bs.dropdown",
      handleNavbarActiveState
    );
  }
});

function handleNavbarActiveState() {
  const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
  const currentPath = normalizePath(window.location.pathname);
  const programsDropdown = document.getElementById("navbarDropdown");
  const dropdownMenu =
    programsDropdown?.parentElement?.querySelector(".dropdown-menu");

  // Check if dropdown is currently open by checking the show class on the dropdown menu
  const isDropdownOpen = dropdownMenu?.classList.contains("show");

  // Find all program links
  const programLinks = Array.from(
    dropdownMenu?.querySelectorAll(".dropdown-item") || []
  );
  const programLinkHrefs = programLinks.map((link) =>
    normalizePath(
      new URL(link.getAttribute("href"), window.location.href).pathname
    )
  );

  // Check if current page is a program page
  const isOnProgramPage = programLinkHrefs.includes(currentPath);

  // Clear all active classes first from nav-links
  navLinks.forEach((link) => link.classList.remove("active"));

  // Clear all active classes from dropdown items
  programLinks.forEach((link) => link.classList.remove("active"));

  // Handle regular nav links
  navLinks.forEach((link) => {
    const href = (link.getAttribute("href") || "").trim();
    const togglesDropdown = link.matches('[data-bs-toggle="dropdown"]');

    if (!href || href === "#" || href.startsWith("#")) {
      return;
    }

    const linkPath = normalizePath(
      new URL(href, window.location.href).pathname
    );

    // For regular links (not on a program page)
    if (!togglesDropdown && currentPath === linkPath && !isOnProgramPage) {
      link.classList.add("active");
    }
  });

  // Handle Programs dropdown special case
  if (isOnProgramPage) {
    if (isDropdownOpen) {
      // Dropdown is open: highlight the active child link
      programLinks.forEach((link) => {
        const linkPath = normalizePath(
          new URL(link.getAttribute("href"), window.location.href).pathname
        );
        if (currentPath === linkPath) {
          link.classList.add("active");
        }
      });
    } else {
      // Dropdown is closed: highlight Programs toggle instead
      programsDropdown.classList.add("active");
    }
  }
}

function normalizePath(pathname) {
  if (!pathname) return "/";
  let path = pathname.split("?")[0].split("#")[0];
  if (!path.startsWith("/")) path = "/" + path;
  if (path !== "/" && path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  if (
    path.toLowerCase().endsWith("/index") ||
    path.toLowerCase().endsWith("/index.html")
  ) {
    return "/";
  }
  return path.toLowerCase() || "/";
}

// Initialize Reports Accordion (from dropd.js)
(function initReportsAccordion() {
  const reports = [
    {
      year: "2025",
      summary:
        "3 Outreaches, 23 Trainings, 58 Scholarships, 237 Health care support and 18 Family Support and counting",
      stories: [],
    },
    {
      year: "2024",
      summary:
        "3 Outreaches, 23 Trainings, 58 Scholarships, 237 Health care support and 18 Family Support",
      stories: [
        {
          title:
            "Ekaima Charitable Aid Foundation bean building a new house for a widow and her blind son.",
          description:
            "The house was completed, furnished and handed over in August 2024",
          images: [
            "./assets/images/oldhouse.png",
            "./assets/images/newhouse.png",
          ],
        },
        {
          title:
            "Ekaima Charitable Aid Foundation Sharing wrappers, rice, tomatoes, cash, etc. to widows and vulnerable at Ikot Akpamba in Nsit Ubium LGA during Christmas 2024.",
          description: "",
          images: ["./assets/images/widow.jpg", "/assets/images/widow2.jpg"],
        },
      ],
    },
    {
      year: "2023",
      summary:
        "3 Outreaches, 23 Trainings, 58 Scholarships, 237 Health care support and 18 Family Support",
      stories: [],
    },
    {
      year: "2022",
      summary:
        "3 Outreaches, 23 Trainings, 58 Scholarships, 237 Health care support and 18 Family Support",
      stories: [],
    },
  ];

  document.addEventListener("DOMContentLoaded", function () {
    const accordion = document.getElementById("reportsAccordion");

    if (accordion) {
      for (const [index, report] of reports.entries()) {
        const item = document.createElement("div");
        item.className = "accordion-item";

        const header = document.createElement("h2");
        header.className = "accordion-header";
        header.id = `heading${report.year}`;

        const button = document.createElement("button");
        button.className = `accordion-button ${index === 1 ? "" : "collapsed"}`;
        button.type = "button";
        button.dataset.bsToggle = "collapse";
        button.dataset.bsTarget = `#collapse${report.year}`;
        button.setAttribute("aria-expanded", `${index === 1}`);
        button.setAttribute("aria-controls", `collapse${report.year}`);
        button.innerHTML = `<span>${report.year}</span>`;

        header.appendChild(button);

        const collapse = document.createElement("div");
        collapse.id = `collapse${report.year}`;
        collapse.className = `accordion-collapse collapse ${
          index === 1 ? "show" : ""
        }`;
        collapse.setAttribute("aria-labelledby", `heading${report.year}`);
        collapse.dataset.bsParent = "#reportsAccordion";

        const body = document.createElement("div");
        body.className = "accordion-body";
        body.innerHTML = `<h5 class="report-summary">${report.summary}</h5>`;

        for (const story of report.stories) {
          const storyElement = document.createElement("div");
          storyElement.className = "report-item mb-4";
          storyElement.innerHTML = `<p>${story.title}</p><p>${story.description}</p>`;

          if (story.images.length > 0) {
            const imageContainer = document.createElement("div");
            imageContainer.className = "report-images";
            for (const image of story.images) {
              const img = document.createElement("img");
              img.src = image;
              img.alt = story.title;
              imageContainer.appendChild(img);
            }
            storyElement.appendChild(imageContainer);
          }

          body.appendChild(storyElement);
        }

        collapse.appendChild(body);
        item.appendChild(header);
        item.appendChild(collapse);
        accordion.appendChild(item);
      }
    }
  });
})();
