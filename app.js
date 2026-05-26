const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const applicationWebhookUrl = "https://script.google.com/macros/s/AKfycbz6BGT8za2GhqRvAxvH7SVs1FucFqYYGwLKhMYvOxi0PrO46eOPPOZ0em_U5imrMeKCJw/exec";

function showFormMessage(form, text, type = "success") {
  const existingMessage = form.querySelector(".form-message");
  if (existingMessage) existingMessage.remove();
  const message = document.createElement("p");
  message.className = `form-message ${type}`;
  message.textContent = text;
  form.appendChild(message);
}

document.querySelectorAll(".apply-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = form.querySelector("button[type='submit']");
    const applicationType = form.dataset.applicationType;
    const payload = {
      applicationType,
      submittedAt: new Date().toISOString(),
      page: window.location.href,
      ...Object.fromEntries(new FormData(form).entries())
    };
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }
    try {
      const response = await fetch(applicationWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!result.ok) throw new Error(result.error || "Submission failed.");
      form.reset();
      showFormMessage(form, "Application submitted. Thank you!");
    } catch (error) {
      showFormMessage(form, "Something went wrong. Please try again or contact Lynx directly.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = applicationType === "creator" ? "Submit creator application" : "Submit business application";
      }
    }
  });
});

const revealItems = document.querySelectorAll(".reveal, .about-card, .service-list article, .apply-choice, .application-panel");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });
  revealItems.forEach((item) => {
    item.classList.add("reveal");
    observer.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

const demoFrames = document.querySelectorAll(".video-frame");
function startDemoFrame(frame) {
  const iframe = frame.querySelector("iframe[data-src]");
  const video = frame.querySelector("video");
  if (iframe && !iframe.src) {
    iframe.src = iframe.dataset.src;
    frame.classList.add("is-playing");
  }
  if (video) {
    video.muted = true;
    video.playsInline = true;
    video.play().then(() => frame.classList.add("is-playing")).catch(() => {});
  }
}
function pauseDemoFrame(frame) {
  const video = frame.querySelector("video");
  if (video) {
    video.pause();
    frame.classList.remove("is-playing");
  }
}
if ("IntersectionObserver" in window) {
  const demoObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.isIntersecting ? startDemoFrame(entry.target) : pauseDemoFrame(entry.target));
  }, { threshold: 0.55 });
  demoFrames.forEach((frame) => demoObserver.observe(frame));
} else {
  demoFrames.forEach(startDemoFrame);
}
