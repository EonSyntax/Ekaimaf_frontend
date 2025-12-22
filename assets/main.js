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
    // set CSS variable for translate distance (width of one set)
    slider.style.setProperty("--partner-translate", `-${width}px`);
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

// Mini-carousel initializer for small slideshow cards (old/new house)
(function initMiniCarousels() {
  function bindCarousel(carousel) {
    const slides = Array.from(carousel.querySelectorAll(".mini-slide"));
    const prev = carousel.querySelector(".mini-prev");
    const next = carousel.querySelector(".mini-next");
    const dots = Array.from(carousel.querySelectorAll(".mini-dot"));
    const autoplay = carousel.dataset.autoplay === "true";
    // Make default faster: 2400ms (user requested quicker slides)
    const interval = parseInt(carousel.dataset.interval, 10) || 2400;

    if (slides.length <= 1) return;

    let index = slides.findIndex((s) => s.classList.contains("active"));
    if (index < 0) index = 0;
    let timer = null;

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, idx) => s.classList.toggle("active", idx === index));
      dots.forEach((d, idx) => d.classList.toggle("active", idx === index));
    }

    function nextSlide() {
      go(index + 1);
    }
    function prevSlide() {
      go(index - 1);
    }

    if (next)
      next.addEventListener("click", () => {
        nextSlide();
        reset();
      });
    if (prev)
      prev.addEventListener("click", () => {
        prevSlide();
        reset();
      });
    dots.forEach((d) =>
      d.addEventListener("click", (e) => {
        go(parseInt(d.dataset.index, 10));
        reset();
      })
    );

    function start() {
      if (!autoplay) return;
      stop();
      timer = setInterval(nextSlide, interval);
    }
    function stop() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }
    function reset() {
      stop();
      start();
    }

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    carousel.addEventListener("focusin", stop);
    carousel.addEventListener("focusout", start);

    // Pointer swipe support
    let isDown = false,
      startX = 0,
      moved = 0;
    carousel.addEventListener("pointerdown", (e) => {
      isDown = true;
      startX = e.clientX;
      carousel.setPointerCapture?.(e.pointerId);
      stop();
    });
    carousel.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      moved = e.clientX - startX;
    });
    carousel.addEventListener("pointerup", (e) => {
      if (!isDown) return;
      isDown = false;
      carousel.releasePointerCapture?.(e.pointerId);
      if (Math.abs(moved) > 40) {
        if (moved < 0) nextSlide();
        else prevSlide();
      }
      moved = 0;
      reset();
    });

    start();
  }

  document.querySelectorAll(".mini-carousel").forEach(bindCarousel);
})();

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
      sections: [
        {
          name: "Health & Wellness",
          icon: "bi-heart-pulse",
          programs: [
            {
              title: "Free Medical & Surgical Mission - November 2025",
              description:
              "Ekaima Charitable Aid Foundation and their partners (World Surgical Foundation, Ekopimo Ibia Foundation, Cake Box, Map International, America's Medical Outreach, Ambala, Dr Ikenna & Amelia Obioma Family) organized a free comprehensive medical and surgical mission at HaadMaids Hospital Ikot Ambang Akwa Ibom Nigeria providing modern renovation to the Hospitals Environment and Medical Wards, also provided free healthcare consultation, blood pressure checks, diabetes screening, and medication distribution to over 300 community members. Our team of healthcare professionals offered preventive care education and referred critical cases to proper medical facilities.",
              results: "300+ people treated | 60+ surgeries | 45+ medications distributed",
              images: [
                "./assets/images/DSC_7099.webp",
                "./assets/images/bob_160.webp",
                "./assets/images/DSC_7109.webp",
                "./assets/images/bob_169.webp",
                "./assets/images/bob_19.webp",
                "./assets/images/bob_160.webp",
                "./assets/images/DSC_7081.webp",
                "./assets/images/DSC_7079.webp",
                "./assets/images/DSC_7062.webp",
                "./assets/images/bob_1311JPG.webp",
                "./assets/images/bob_2.webp",
                "./assets/images/bob_106.webp",
                "./assets/images/bob_41.webp",
                "./assets/images/patientonbed.jpg",
                "./assets/images/patientward.jpg",
                "./assets/images/patientonbed.jpg",
                "./assets/images/DSC_7152.webp",
                "./assets/images/bob_17.webp",
                "./assets/images/bob_174.webp",
                "./assets/images/DSC_7041.webp",
                "./assets/images/DSC_7055.webp",
                "./assets/images/DSC_7067.webp",
                "./assets/images/DSC_7116.webp",
                "./assets/images/DSC_7149.webp",

              ],
              video: "https://www.youtube.com/embed/St9pE2bv0zQ",
            },
            
          ],
        },
      ],
    },
    {
      year: "2023",
      sections: [
        {
          name: "Health & Wellness",
          icon: "bi-heart-pulse",
          programs: [
            {
              title: "IKOT EYO MEDICAL AND SURGICAL MISSION - 2023",
              description:
                "Organized a comprehensive medical outreach at Ikot Akpamba providing free healthcare consultation, blood pressure checks, diabetes screening, and medication distribution to over 300 community members. Our team of healthcare professionals offered preventive care education and referred critical cases to proper medical facilities.",
              images: [
                "./assets/images/patientward.jpg",
                "./assets/images/patientonbed.jpg",
                "./assets/images/community.jpg",
                "./assets/images/elders.jpg",
                "./assets/images/hero-bg6.webp",
                "./assets/images/team.webp",
                "./assets/images/newhouse.png",
                "./assets/images/oldhouse.png",
                "./assets/images/widow.jpg",
                "./assets/images/widow2.jpg",
            ],
              video: "https://www.youtube.com/embed/r1Dy1bt8TL4/",
              results: "300+ people screened | 45+ medications distributed",
            },
            
          ],
        },
      ],
    },




    // {
    //   year: "2024",
    //   summary:
    //     "15+ Outreaches, 50+ Trainings, 20+ Scholarships, 1358+ Healthcare support and 20+ Family Support",
    //   sections: [
    //     {
    //       name: "Health & Wellness",
    //       icon: "bi-heart-pulse",
    //       // programs: [
    //       //   {
    //       //     title: "Community Medical Outreach - September 2024",
    //       //     description:
    //       //       "Organized a comprehensive medical outreach at Ikot Akpamba providing free healthcare consultation, blood pressure checks, diabetes screening, and medication distribution to over 300 community members. Our team of healthcare professionals offered preventive care education and referred critical cases to proper medical facilities.",
    //       //     images: [
    //       //       "./assets/images/patientward.jpg",
    //       //       "./assets/images/patientonbed.jpg",
    //       //     ],
    //       //     video: "https://www.youtube.com/embed/St9pE2bv0zQ",
    //       //     results: "300+ people screened | 45+ medications distributed",
    //       //   },
    //       //   {
    //       //     title: "Mobile Health Clinic - Monthly Initiative",
    //       //     description:
    //       //       "Launched a series of mobile health clinics visiting 5 different communities throughout 2024. Services included maternal health consultations, child nutrition programs, disease prevention seminars, and emergency medical aid.",
    //       //     images: ["./assets/images/supportlove.png"],
    //       //     video:
    //       //       "https://www.youtube.com/embed/-58OpkGumi8?si=PM8RCw4xRBwSnGlJ",
    //       //     results:
    //       //       "1358+ people received care | 12+ preventive programs conducted",
    //       //   },
    //       // ],
    //     },
    //     {
    //       name: "Empowerment",
    //       icon: "bi-briefcase",
    //       // programs: [
    //       //   {
    //       //     title: "Women's Vocational Skills Training - Ongoing",
    //       //     description:
    //       //       "Empowered over 50 women through intensive vocational training programs in tailoring, hairdressing, soap-making, and food processing. Participants received hands-on training, certification, and starter kits to begin their own enterprises.",
    //       //     images: ["./assets/images/trainingicon.png"],
    //       //     video: "https://www.youtube.com/embed/Ks-_Mh1QhMc",
    //       //     results:
    //       //       "50+ women trained | 35+ started small businesses | 120+ jobs created",
    //       //   },
    //       //   {
    //       //     title: "Widow & Vulnerable Support Program",
    //       //     description:
    //       //       "Built a new house for a widow and her blind son, completed in August 2024. Also distributed wrappers, rice, tomatoes, cash, and other essential items to widows and vulnerable families at Ikot Akpamba during Christmas 2024.",
    //       //     images: [
    //       //       "./assets/images/oldhouse.png",
    //       //       "./assets/images/newhouse.png",
    //       //       "./assets/images/widow.jpg",
    //       //       "./assets/images/widow2.jpg",
    //       //     ],
    //       //     video: "https://www.youtube.com/embed/e-IWRmpefzE",
    //       //     results:
    //       //       "18+ families supported | 1 home constructed | 250+ gift packages distributed",
    //       //   },
    //       // ],
    //     },
    //     {
    //       name: "Education",
    //       icon: "bi-book",
    //       // programs: [
    //       //   {
    //       //     title: "Scholarship Program - 2024 Academic Year",
    //       //     description:
    //       //       "Provided educational scholarships to 20+ underprivileged students across primary, secondary, and tertiary institutions. Support covered tuition fees, learning materials, and uniforms enabling these students to continue their education without financial barriers.",
    //       //     images: [
    //       //       "./assets/images/student.webp",
    //       //       "./assets/images/academy.png",
    //       //     ],
    //       //     video: "https://www.youtube.com/embed/xo1VjT_q7_w",
    //       //     results:
    //       //       "20+ students sponsored | 100% school attendance rate | 3 progressed to tertiary",
    //       //   },
    //       //   {
    //       //     title: "School Feeding & Learning Materials Initiative",
    //       //     description:
    //       //       "Launched a comprehensive school feeding program providing nutritious meals to 200+ students daily. Alongside nutrition, distributed learning materials including books, pens, notebooks, and educational resources to enhance classroom learning.",
    //       //     images: [
    //       //       "./assets/images/secsch.jpg",
    //       //       "./assets/images/feedkid.webp",
    //       //     ],
    //       //     video: "https://www.youtube.com/embed/9bZkp7q19f0",
    //       //     results:
    //       //       "200+ students fed daily | 5,000+ learning materials distributed | 35% academic improvement",
    //       //   },
    //       // ],
    //     },
    //     {
    //       name: "Zero Hunger",
    //       icon: "bi-basket",
    //       // programs: [
    //       //   {
    //       //     title: "Community Feeding Outreaches - 15+ Events",
    //       //     description:
    //       //       "Organized 15 community feeding outreaches throughout 2024 distributing nutritious meals, grains, and protein sources to vulnerable families and elderly persons. Each outreach reached 100-150 beneficiaries with specially prepared meals and food packages.",
    //       //     images: [
    //       //       "./assets/images/fruitgift.png",
    //       //       "./assets/images/community.jpg",
    //       //     ],
    //       //     video: "https://www.youtube.com/embed/kffacxfA7g4",
    //       //     results:
    //       //       "15+ outreaches | 1,800+ meals served | 500+ food packages distributed",
    //       //   },
    //       //   {
    //       //     title: "Agricultural Support & Farming Relief",
    //       //     description:
    //       //       "Provided farming tools, seeds, and agricultural training to 20+ farming families. Support included soil analysis, modern farming techniques, storage solutions, and market linkage to improve food production and household income.",
    //       //     images: ["./assets/images/shovel.png"],
    //       //     video: "https://www.youtube.com/embed/nfWlot6_LSw",
    //       //     results:
    //       //       "20+ farming families equipped | 40% increase in yields | Sustainable food security improved",
    //       //   },
    //       // ],
    //     },
    //   ],
    // },


    // {
    //   year: "2023",
    //   summary:
    //     "15+ Outreaches, 50+ Trainings, 20+ Scholarships, 1358+ Healthcare support and 20+ Family Support",
    //   sections: [
    //     {
    //       name: "Health & Wellness",
    //       icon: "bi-heart-pulse",
    //       programs: [
    //         {
    //           title: "Community Medical Outreach - September 2023",
    //           description:
    //             "Organized a comprehensive medical outreach at Ikot Akpamba providing free healthcare consultation, blood pressure checks, diabetes screening, and medication distribution to over 300 community members. Our team of healthcare professionals offered preventive care education and referred critical cases to proper medical facilities.",
    //           images: [
    //             "./assets/images/patientward.jpg",
    //             "./assets/images/patientonbed.jpg",
    //           ],
    //           video: "https://www.youtube.com/embed/St9pE2bv0zQ",
    //           results: "300+ people screened | 45+ medications distributed",
    //         },
    //       ],
    //     },
    //     {
    //       name: "Empowerment",
    //       icon: "bi-briefcase",
    //       programs: [
    //         {
    //           title: "Women's Vocational Skills Training - Ongoing",
    //           description:
    //             "Empowered over 50 women through intensive vocational training programs in tailoring, hairdressing, soap-making, and food processing. Participants received hands-on training, certification, and starter kits to begin their own enterprises.",
    //           images: ["./assets/images/trainingicon.png"],
    //           video: "https://www.youtube.com/embed/Ks-_Mh1QhMc",
    //           results:
    //             "50+ women trained | 35+ started small businesses | 120+ jobs created",
    //         },
    //         {
    //           title: "Widow & Vulnerable Support Program",
    //           description:
    //             "Built a new house for a widow and her blind son, completed in August 2024. Also distributed wrappers, rice, tomatoes, cash, and other essential items to widows and vulnerable families at Ikot Akpamba during Christmas 2024.",
    //           images: [
    //             "./assets/images/oldhouse.png",
    //             "./assets/images/newhouse.png",
    //             "./assets/images/widow.jpg",
    //             "./assets/images/widow2.jpg",
    //           ],
    //           video: "https://www.youtube.com/embed/e-IWRmpefzE",
    //           results:
    //             "18+ families supported | 1 home constructed | 250+ gift packages distributed",
    //         },
    //       ],
    //     },
    //     {
    //       name: "Education",
    //       icon: "bi-book",
    //       programs: [
    //         {
    //           title: "School Feeding & Learning Materials Initiative",
    //           description:
    //             "Launched a comprehensive school feeding program providing nutritious meals to 200+ students daily. Alongside nutrition, distributed learning materials including books, pens, notebooks, and educational resources to enhance classroom learning.",
    //           images: [
    //             "./assets/images/secsch.jpg",
    //             "./assets/images/feedkid.webp",
    //           ],
    //           video: "https://www.youtube.com/embed/9bZkp7q19f0",
    //           results:
    //             "200+ students fed daily | 5,000+ learning materials distributed | 35% academic improvement",
    //         },
    //       ],
    //     },
    //     {
    //       name: "Zero Hunger",
    //       icon: "bi-basket",
    //       programs: [
    //         {
    //           title: "Community Feeding Outreaches - 15+ Events",
    //           description:
    //             "Organized 15 community feeding outreaches throughout 2024 distributing nutritious meals, grains, and protein sources to vulnerable families and elderly persons. Each outreach reached 100-150 beneficiaries with specially prepared meals and food packages.",
    //           images: [
    //             "./assets/images/fruitgift.png",
    //             "./assets/images/community.jpg",
    //           ],
    //           video: "https://www.youtube.com/embed/kffacxfA7g4",
    //           results:
    //             "15+ outreaches | 1,800+ meals served | 500+ food packages distributed",
    //         },
    //         {
    //           title: "Agricultural Support & Farming Relief",
    //           description:
    //             "Provided farming tools, seeds, and agricultural training to 20+ farming families. Support included soil analysis, modern farming techniques, storage solutions, and market linkage to improve food production and household income.",
    //           images: ["./assets/images/shovel.png"],
    //           video: "https://www.youtube.com/embed/nfWlot6_LSw",
    //           results:
    //             "20+ farming families equipped | 40% increase in yields | Sustainable food security improved",
    //         },
    //       ],
    //     },
    //   ],
    // },


    // {
    //   year: "2022",
    //   summary:
    //     "15+ Outreaches, 50+ Trainings, 20+ Scholarships, 1358+ Healthcare support and 20+ Family Support",
    //   sections: [
    //     {
    //       name: "Health & Wellness",
    //       icon: "bi-heart-pulse",
    //       programs: [
    //         {
    //           title: "Community Medical Outreach - September 2024",
    //           description:
    //             "Organized a comprehensive medical outreach at Ikot Akpamba providing free healthcare consultation, blood pressure checks, diabetes screening, and medication distribution to over 300 community members. Our team of healthcare professionals offered preventive care education and referred critical cases to proper medical facilities.",
    //           images: [
    //             "./assets/images/patientward.jpg",
    //             "./assets/images/patientonbed.jpg",
    //           ],
    //           video: "https://www.youtube.com/embed/St9pE2bv0zQ",
    //           results: "300+ people screened | 45+ medications distributed",
    //         },
    //         {
    //           title: "Mobile Health Clinic - Monthly Initiative",
    //           description:
    //             "Launched a series of mobile health clinics visiting 5 different communities throughout 2024. Services included maternal health consultations, child nutrition programs, disease prevention seminars, and emergency medical aid.",
    //           images: ["./assets/images/supportlove.png"],
    //           video:
    //             "https://www.youtube.com/embed/-58OpkGumi8?si=PM8RCw4xRBwSnGlJ",
    //           results:
    //             "1358+ people received care | 12+ preventive programs conducted",
    //         },
    //       ],
    //     },
    //     {
    //       name: "Empowerment",
    //       icon: "bi-briefcase",
    //       programs: [
    //         {
    //           title: "Women's Vocational Skills Training - Ongoing",
    //           description:
    //             "Empowered over 50 women through intensive vocational training programs in tailoring, hairdressing, soap-making, and food processing. Participants received hands-on training, certification, and starter kits to begin their own enterprises.",
    //           images: ["./assets/images/trainingicon.png"],
    //           video: "https://www.youtube.com/embed/Ks-_Mh1QhMc",
    //           results:
    //             "50+ women trained | 35+ started small businesses | 120+ jobs created",
    //         },
    //         {
    //           title: "Widow & Vulnerable Support Program",
    //           description:
    //             "Built a new house for a widow and her blind son, completed in August 2024. Also distributed wrappers, rice, tomatoes, cash, and other essential items to widows and vulnerable families at Ikot Akpamba during Christmas 2024.",
    //           images: [
    //             "./assets/images/oldhouse.png",
    //             "./assets/images/newhouse.png",
    //             "./assets/images/widow.jpg",
    //             "./assets/images/widow2.jpg",
    //           ],
    //           video: "https://www.youtube.com/embed/e-IWRmpefzE",
    //           results:
    //             "18+ families supported | 1 home constructed | 250+ gift packages distributed",
    //         },
    //       ],
    //     },
    //     {
    //       name: "Education",
    //       icon: "bi-book",
    //       programs: [
    //         {
    //           title: "Scholarship Program - 2024 Academic Year",
    //           description:
    //             "Provided educational scholarships to 20+ underprivileged students across primary, secondary, and tertiary institutions. Support covered tuition fees, learning materials, and uniforms enabling these students to continue their education without financial barriers.",
    //           images: [
    //             "./assets/images/student.webp",
    //             "./assets/images/academy.png",
    //           ],
    //           video: "https://www.youtube.com/embed/xo1VjT_q7_w",
    //           results:
    //             "20+ students sponsored | 100% school attendance rate | 3 progressed to tertiary",
    //         },
    //         {
    //           title: "School Feeding & Learning Materials Initiative",
    //           description:
    //             "Launched a comprehensive school feeding program providing nutritious meals to 200+ students daily. Alongside nutrition, distributed learning materials including books, pens, notebooks, and educational resources to enhance classroom learning.",
    //           images: [
    //             "./assets/images/secsch.jpg",
    //             "./assets/images/feedkid.webp",
    //           ],
    //           video: "https://www.youtube.com/embed/9bZkp7q19f0",
    //           results:
    //             "200+ students fed daily | 5,000+ learning materials distributed | 35% academic improvement",
    //         },
    //       ],
    //     },
    //     {
    //       name: "Zero Hunger",
    //       icon: "bi-basket",
    //       programs: [
    //         {
    //           title: "Community Feeding Outreaches - 15+ Events",
    //           description:
    //             "Organized 15 community feeding outreaches throughout 2024 distributing nutritious meals, grains, and protein sources to vulnerable families and elderly persons. Each outreach reached 100-150 beneficiaries with specially prepared meals and food packages.",
    //           images: [
    //             "./assets/images/fruitgift.png",
    //             "./assets/images/community.jpg",
    //           ],
    //           video: "https://www.youtube.com/embed/kffacxfA7g4",
    //           results:
    //             "15+ outreaches | 1,800+ meals served | 500+ food packages distributed",
    //         },
    //         {
    //           title: "Agricultural Support & Farming Relief",
    //           description:
    //             "Provided farming tools, seeds, and agricultural training to 20+ farming families. Support included soil analysis, modern farming techniques, storage solutions, and market linkage to improve food production and household income.",
    //           images: ["./assets/images/shovel.png"],
    //           video: "https://www.youtube.com/embed/nfWlot6_LSw",
    //           results:
    //             "20+ farming families equipped | 40% increase in yields | Sustainable food security improved",
    //         },
    //       ],
    //     },
    //   ],
    // },
  ];

  // Build reports accordion. Use an explicit builder so we run whether DOMContentLoaded
  // has already fired or not. Wrap in try/catch to surface errors during rendering.
  function buildReportsAccordion() {
    try {
      const accordion = document.getElementById("reportsAccordion");
      if (!accordion) return;

      // clear any existing content to avoid duplicates
      accordion.innerHTML = "";

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
        // body.innerHTML = `<h5 class="report-summary">${report.summary}</h5>`;

        // add anchor targets for direct links from program pages
        const yearAnchor = document.createElement("div");
        yearAnchor.id = `year-${report.year}`;
        yearAnchor.className = "visually-hidden";
        body.appendChild(yearAnchor);

        // Handle sections (for 2024) vs stories (for other years)
        if (Array.isArray(report.sections) && report.sections.length > 0) {
          // New section-based layout for programs
          for (const section of report.sections) {
            const sectionAnchor = document.createElement("div");
            // full slug preserves words and replaces spaces with hyphens
            const slugFull = section.name.toLowerCase().replace(/\s+/g, "-");
            sectionAnchor.id = `year-${report.year}-${slugFull}`;
            // create a short alias (e.g. 'Health & Wellness' -> 'health') to support legacy links
            let shortKey = slugFull;
            if (slugFull.includes("health")) shortKey = "health";
            else if (slugFull.includes("empower")) shortKey = "empowerment";
            else if (slugFull.includes("education")) shortKey = "education";
            else if (slugFull.includes("zero") || slugFull.includes("hunger"))
              shortKey = "zero-hunger";
            else shortKey = slugFull.split("-")[0] || slugFull;
            const aliasAnchor = document.createElement("div");
            aliasAnchor.id = `year-${report.year}-${shortKey}`;
            aliasAnchor.className = "visually-hidden program-alias";
            // append alias just before the section so hash navigation finds it
            body.appendChild(aliasAnchor);
            sectionAnchor.className = "program-section";

            const sectionHeader = document.createElement("div");
            sectionHeader.className = "section-header";

            const sectionTitle = document.createElement("h3");
            sectionTitle.className = "section-title";
            sectionTitle.innerHTML = `<i class="bi ${section.icon}"></i> ${section.name}`;
            sectionHeader.appendChild(sectionTitle);
            sectionAnchor.appendChild(sectionHeader);

            const programsGrid = document.createElement("div");
            programsGrid.className = "programs-grid";

            for (const program of section.programs || []) {
              const programCard = document.createElement("div");
              programCard.className = "program-card";

              const cardContent = document.createElement("div");
              cardContent.className = "card-content";

              const programTitle = document.createElement("h4");
              programTitle.className = "program-title";
              programTitle.textContent = program.title;
              cardContent.appendChild(programTitle);

              const description = document.createElement("p");
              description.className = "program-description";
              description.textContent = program.description;
              cardContent.appendChild(description);

              // Add results box if available
              if (program.results) {
                const resultsBox = document.createElement("div");
                resultsBox.className = "program-results";
                resultsBox.innerHTML = `<strong>Impact Results:</strong><br>${program.results}`;
                cardContent.appendChild(resultsBox);
              }

              // Images gallery
              if (Array.isArray(program.images) && program.images.length > 0) {
                const imageGallery = document.createElement("div");
                imageGallery.className = "image-gallery";

                for (const image of program.images) {
                  const img = document.createElement("img");
                  img.src = image;
                  img.alt = program.title || "";
                  img.className = "gallery-image media-thumb";
                  img.dataset.mediaType = "image";
                  img.dataset.mediaSrc = image;
                  imageGallery.appendChild(img);
                }
                cardContent.appendChild(imageGallery);
              }

              // Video button and container
              if (program.video) {
                const videoContainer = document.createElement("div");
                videoContainer.className = "video-container";

                const videoBtn = document.createElement("button");
                videoBtn.className = "btn btn-play media-thumb";
                videoBtn.type = "button";
                videoBtn.dataset.mediaType = "youtube";
                videoBtn.dataset.mediaSrc = program.video;
                videoBtn.innerHTML = `<i class="bi bi-play-circle"></i> Watch Video`;
                videoContainer.appendChild(videoBtn);
                cardContent.appendChild(videoContainer);
              }

              programCard.appendChild(cardContent);
              programsGrid.appendChild(programCard);
            }

            sectionAnchor.appendChild(programsGrid);
            body.appendChild(sectionAnchor);
          }
        } else {
          // Legacy stories layout
          const healthAnchor = document.createElement("div");
          healthAnchor.id = `year-${report.year}-health`;
          healthAnchor.className = "program-anchor";
          const healthTitle = document.createElement("h4");
          healthTitle.textContent = "Health & Wellness";
          healthTitle.className = "mt-3 mb-2";
          healthAnchor.appendChild(healthTitle);
          body.appendChild(healthAnchor);

          for (const story of report.stories || []) {
            const storyElement = document.createElement("div");
            storyElement.className = "report-item mb-4";
            storyElement.innerHTML = `<p>${story.title}</p><p>${story.description}</p>`;

            if (Array.isArray(story.images) && story.images.length > 0) {
              const imageContainer = document.createElement("div");
              imageContainer.className = "report-images";
              for (const image of story.images) {
                const img = document.createElement("img");
                img.src = image;
                img.alt = story.title || "";
                img.className = "img-fluid media-thumb";
                img.dataset.mediaType = "image";
                img.dataset.mediaSrc = image;
                imageContainer.appendChild(img);
              }
              storyElement.appendChild(imageContainer);
            }

            body.appendChild(storyElement);
          }
        }

        collapse.appendChild(body);
        item.appendChild(header);
        item.appendChild(collapse);
        accordion.appendChild(item);
      }

      // After building accordion entries, wire up the media modal and hash navigation
      // Setup media modal
      const mediaModalEl = document.getElementById("mediaModal");
      const mediaModal = mediaModalEl
        ? new bootstrap.Modal(mediaModalEl)
        : null;
      const mediaContainer = document.getElementById("mediaContainer");

      function openMedia(type, src, title) {
        if (!mediaContainer) return;
        mediaContainer.innerHTML = "";
        console.debug && console.debug("openMedia()", { type, src, title });
        if (type === "image") {
          const img = document.createElement("img");
          img.src = src;
          img.alt = title || "";
          img.className = "img-fluid";
          mediaContainer.appendChild(img);
        } else if (type === "video") {
          const video = document.createElement("video");
          video.controls = true;
          video.autoplay = true;
          video.className = "w-100";
          const srcEl = document.createElement("source");
          srcEl.src = src;
          video.appendChild(srcEl);
          mediaContainer.appendChild(video);
        } else if (type === "youtube") {
          // Build iframe src safely (don't duplicate ? if already present)
          const delimiter = src.includes("?") ? "&" : "?";
          const params = "rel=0&autoplay=1";
          const iframeSrc = src + delimiter + params;

          const iframe = document.createElement("iframe");
          iframe.setAttribute("src", iframeSrc);
          iframe.setAttribute(
            "allow",
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; autoplay"
          );
          iframe.setAttribute("allowfullscreen", "");
          iframe.setAttribute(
            "referrerpolicy",
            "strict-origin-when-cross-origin"
          );
          iframe.setAttribute("loading", "lazy");
          // Make iframe fill the modal container
          iframe.style.width = "100%";
          iframe.style.height = "100%";
          iframe.style.border = "0";
          mediaContainer.appendChild(iframe);
        }
        mediaModal?.show();
      }

      // Delegate clicks for any media-thumb inside the accordion
      document.body.addEventListener("click", function (e) {
        const el = e.target.closest && e.target.closest(".media-thumb");
        if (!el) return;
        e.preventDefault();
        const type = el.dataset.mediaType;
        const src = el.dataset.mediaSrc;
        const title = el.alt || el.dataset.mediaTitle || "";
        if (type && src) openMedia(type, src, title);
      });

      // When modal closes, clear container to stop videos
      if (mediaModalEl) {
        mediaModalEl.addEventListener("hidden.bs.modal", function () {
          if (mediaContainer) mediaContainer.innerHTML = "";
        });
      }

      // Hash navigation: open the year accordion and scroll to program anchor
      function handleHashNavigation() {
        // Force main page scrolling, not inner containers

        // Hide donation overlay if it exists
        const donationOverlay = document.getElementById("donationModal");
        if (donationOverlay) {
          donationOverlay.style.display = "none";
        }

        const hash = (location.hash || "").replace(/^#/, "");
        if (!hash) return;

        // Accept year-2025 or year-2025-health
        const parts = hash.split("-");
        if (parts.length < 2) return;

        const year = parts[1];
        const collapseId = `collapse${year}`;
        const collapseEl = document.getElementById(collapseId);

        if (collapseEl) {
          const bsCollapse = bootstrap.Collapse.getOrCreateInstance(
            collapseEl,
            { toggle: false }
          );
          bsCollapse.show();

          // Calculate target scroll position with window-level scroll
          function scrollToElement(el) {
            const navHeight =
              document.querySelector(".navbar")?.offsetHeight || 0;
            const rect = el.getBoundingClientRect();
            const targetY = window.pageYOffset + rect.top - navHeight - 20;
            window.scrollTo({ top: targetY, behavior: "smooth" });
          }

          if (parts.length > 2) {
            // Scroll to program section (e.g., health-&-wellness)
            const programKey = parts.slice(2).join("-");
            const programAnchor = document.getElementById(
              `year-${year}-${programKey}`
            );
            if (programAnchor) {
              setTimeout(() => scrollToElement(programAnchor), 300);
            }
          } else {
            // Scroll to year section
            setTimeout(() => scrollToElement(collapseEl), 300);
          }
        }
      }

      // Run on load and when hash changes
      handleHashNavigation();
      window.addEventListener("hashchange", handleHashNavigation);
    } catch (err) {
      console.error("Failed to build reports accordion:", err);
      // leave a visible error message in the accordion so page owners see it
      const accordion = document.getElementById("reportsAccordion");
      if (accordion) {
        accordion.innerHTML = `<div class="alert alert-danger">Error loading reports. Check console for details.</div>`;
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", buildReportsAccordion);
  } else {
    // DOM already ready
    buildReportsAccordion();
  }
})();
