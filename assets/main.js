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

  function toggleSticky() {
    const scrollY =
      window.scrollY ||
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const shouldStick = scrollY > 0;

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
            "/assets/images/oldhouse.png",
            "/assets/images/newhouse.png",
          ],
        },
        {
          title:
            "Ekaima Charitable Aid Foundation Sharing wrappers, rice, tomatoes, cash, etc. to widows and vulnerable at Ikot Akpamba in Nsit Ubium LGA during Christmas 2024.",
          description: "",
          images: ["/assets/images/widow.jpg", "/assets/images/widow2.jpg"],
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
