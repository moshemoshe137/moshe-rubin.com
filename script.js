const yearElement = document.querySelector("#current-year");
const contactModal = document.querySelector("#contact-modal");
const contactForm = document.querySelector("#contact-form");
const formStatus = document.querySelector("#form-status");
const openContactButton = document.querySelector("[data-open-contact]");
const closeContactButtons = document.querySelectorAll("[data-close-contact]");
const formEndpoint = "https://formsubmit.co/ajax/mosherubin137@gmail.com";

if (yearElement) {
  yearElement.textContent = String(new Date().getFullYear());
}

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
