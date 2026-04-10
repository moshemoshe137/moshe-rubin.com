const yearElement = document.querySelector("#current-year");
const contactModal = document.querySelector("#contact-modal");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const openContactButton = document.querySelector("[data-open-contact]");
const closeContactButtons = document.querySelectorAll("[data-close-contact]");
const heroTitleText = document.querySelector("[data-hero-title-text]");
const cards = document.querySelectorAll(".card");
const hero = document.querySelector(".hero");
const heroLede = document.querySelector(".hero .lede");
const heroEyebrow = document.querySelector(".hero .eyebrow");
const heroTitle = document.querySelector(".hero h1");
const heroActions = document.querySelector(".hero-actions");
const contentGrid = document.querySelector(".content-grid");
const formEndpoint = "https://formsubmit.co/ajax/1c288caac1d97b49f78246d936563080";
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const sidebarTransitionDuration = 460;

document.documentElement.classList.add("js");

const desktopSidebarQuery = window.matchMedia("(min-width: 900px)");

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

if (heroTitleText) {
  const finalTitle = "moshe rubin";

  if (reducedMotionQuery.matches) {
    heroTitleText.textContent = finalTitle;
  } else {
    heroTitleText.textContent = "";

    let characterIndex = 0;

    const typeNextCharacter = () => {
      characterIndex += 1;
      heroTitleText.textContent = finalTitle.slice(0, characterIndex);

      if (characterIndex >= finalTitle.length) {
        return;
      }

      const baseDelay = finalTitle[characterIndex] === " " ? 140 : 95;
      const jitter = Math.floor(Math.random() * 250);
      const occasionalPause = Math.random() < 0.22 ? 90 : 0;
      const nextDelay = baseDelay + jitter + occasionalPause;

      window.setTimeout(typeNextCharacter, nextDelay);
    };

    window.setTimeout(typeNextCharacter, 380);
  }
}

if (cards.length > 0) {
  if (reducedMotionQuery.matches || !("IntersectionObserver" in window)) {
    cards.forEach((card) => {
      card.classList.add("is-visible");
    });
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px",
      },
    );

    cards.forEach((card) => {
      observer.observe(card);
    });
  }
}

let heroSidebarThreshold = 0;
const heroSidebarReleaseOffset = 96;
let pendingSidebarPinTimeout = 0;

const updateHeroSidebarThreshold = () => {
  if (!hero) {
    heroSidebarThreshold = 0;
    return;
  }

  const thresholdTarget = heroLede ?? hero;
  const thresholdTop = thresholdTarget.getBoundingClientRect().top + window.scrollY;

  heroSidebarThreshold = Math.max(thresholdTop, 0);
};

const animateSidebarTransition = (nextPinned) => {
  const animatedElements = [
    hero,
    heroTitle,
    heroEyebrow,
    heroLede,
    heroActions,
    ...cards,
  ].filter(Boolean);

  if (animatedElements.length === 0 || reducedMotionQuery.matches) {
    document.body.classList.toggle("has-sidebar", nextPinned);
    return;
  }

  const firstRects = new Map(
    animatedElements.map((element) => [element, element.getBoundingClientRect()]),
  );

  document.body.classList.toggle("has-sidebar", nextPinned);

  animatedElements.forEach((element) => {
    const firstRect = firstRects.get(element);
    const lastRect = element.getBoundingClientRect();

    if (!firstRect || !lastRect.width || !lastRect.height) {
      return;
    }

    const deltaX = firstRect.left - lastRect.left;
    const deltaY = firstRect.top - lastRect.top;
    const scaleX = firstRect.width / lastRect.width;
    const scaleY = firstRect.height / lastRect.height;

    if (
      Math.abs(deltaX) < 0.5 &&
      Math.abs(deltaY) < 0.5 &&
      Math.abs(scaleX - 1) < 0.01 &&
      Math.abs(scaleY - 1) < 0.01
    ) {
      return;
    }

    element.animate(
      [
        {
          transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`,
        },
        {
          transform: "translate(0, 0) scale(1, 1)",
        },
      ],
      {
        duration: sidebarTransitionDuration,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "both",
      },
    );
  });
};

const clearPendingSidebarPin = () => {
  if (pendingSidebarPinTimeout) {
    window.clearTimeout(pendingSidebarPinTimeout);
    pendingSidebarPinTimeout = 0;
  }
};

const queueSidebarPin = () => {
  if (pendingSidebarPinTimeout || document.body.classList.contains("has-sidebar")) {
    return;
  }

  pendingSidebarPinTimeout = window.setTimeout(() => {
    pendingSidebarPinTimeout = 0;

    if (!desktopSidebarQuery.matches || window.scrollY < heroSidebarThreshold) {
      return;
    }

    animateSidebarTransition(true);
  }, 120);
};

const syncHeroSidebarState = () => {
  if (!contentGrid) {
    clearPendingSidebarPin();
    document.body.classList.remove("has-sidebar");
    return;
  }

  const currentScrollY = window.scrollY;
  const isPinned = document.body.classList.contains("has-sidebar");
  let shouldPinHero = false;

  if (desktopSidebarQuery.matches) {
    shouldPinHero = isPinned
      ? currentScrollY >= heroSidebarThreshold - heroSidebarReleaseOffset
      : currentScrollY >= heroSidebarThreshold;
  }

  if (!shouldPinHero) {
    clearPendingSidebarPin();
  }

  if (shouldPinHero === isPinned) {
    return;
  }

  if (shouldPinHero) {
    queueSidebarPin();
    return;
  }

  animateSidebarTransition(false);
};

updateHeroSidebarThreshold();
syncHeroSidebarState();

window.addEventListener("scroll", syncHeroSidebarState, { passive: true });

if (typeof desktopSidebarQuery.addEventListener === "function") {
  desktopSidebarQuery.addEventListener("change", () => {
    updateHeroSidebarThreshold();
    syncHeroSidebarState();
  });
} else if (typeof desktopSidebarQuery.addListener === "function") {
  desktopSidebarQuery.addListener(() => {
    updateHeroSidebarThreshold();
    syncHeroSidebarState();
  });
}

window.addEventListener("resize", () => {
  updateHeroSidebarThreshold();
  syncHeroSidebarState();
});

const setFormStatus = (message, state = "") => {
  if (!formStatus) {
    return;
  }

  formStatus.textContent = message;
  if (state) {
    formStatus.dataset.state = state;
    return;
  }

  delete formStatus.dataset.state;
};

const openContactModal = () => {
  if (!contactModal) {
    return;
  }

  contactModal.hidden = false;
  document.body.style.overflow = "hidden";
  setFormStatus("");

  const firstField = contactModal.querySelector("[data-contact-first-field]");
  firstField?.focus();
};

const closeContactModal = () => {
  if (!contactModal) {
    return;
  }

  contactModal.hidden = true;
  document.body.style.overflow = "";
  openContactButton?.focus();
};

openContactButton?.addEventListener("click", openContactModal);

closeContactButtons.forEach((button) => {
  button.addEventListener("click", closeContactModal);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && contactModal && !contactModal.hidden) {
    closeContactModal();
  }
});

contactForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = contactForm.querySelector('button[type="submit"]');
  const formData = new FormData(contactForm);

  formData.append("_subject", "New message from mosherubin.com");
  formData.append("_captcha", "false");
  formData.append("_template", "table");

  setFormStatus("Sending...", "");
  submitButton?.setAttribute("disabled", "disabled");

  try {
    const response = await fetch(formEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Request failed");
    }

    contactForm.reset();
    setFormStatus("Message sent. I'll get back to you soon.", "success");
  } catch {
    setFormStatus(
      "That didn't send. Please try again in a bit or use LinkedIn for now.",
      "error",
    );
  } finally {
    submitButton?.removeAttribute("disabled");
  }
});
