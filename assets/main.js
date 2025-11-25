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
