document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initScrollEffects();
  initScrollSpy();
  initReveal();
  initLightbox();
  initComparisonTable();
  initContactForm();
});


function initMobileNav() {
  const toggle = document.getElementById("nav-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

 
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}


function initScrollEffects() {
  const header = document.getElementById("site-header");

  const progress = document.createElement("div");
  progress.className = "progress-bar";
  progress.setAttribute("aria-hidden", "true");
  document.body.appendChild(progress);

  const topBtn = document.createElement("button");
  topBtn.type = "button";
  topBtn.className = "back-to-top";
  topBtn.setAttribute("aria-label", "Back to top");
  topBtn.textContent = "\u2191";
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(topBtn);

  let ticking = false;
  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (header) header.classList.toggle("is-scrolled", y > 10);
    progress.style.width = max > 0 ? `${(y / max) * 100}%` : "0";
    topBtn.classList.toggle("is-visible", y > 600);
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    },
    { passive: true }
  );
  update();
}


function initScrollSpy() {
  const links = document.querySelectorAll("#main-nav a[href^='#']");
  if (!links.length || !("IntersectionObserver" in window)) return;

  const map = new Map();
  links.forEach((link) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (target) map.set(target, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((l) => {
            l.classList.remove("is-active");
            l.removeAttribute("aria-current");
          });
          const active = map.get(entry.target);
          active.classList.add("is-active");
          active.setAttribute("aria-current", "true");
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  map.forEach((_, section) => observer.observe(section));
}


function initReveal() {
  const items = document.querySelectorAll(
    ".city-section, .city-facts, .city-footer, .card, .comparison, .contact, .quick-nav"
  );

  if (!("IntersectionObserver" in window)) return; 

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  items.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.transitionDelay = el.classList.contains("card") ? `${(i % 3) * 90}ms` : "0ms";
    observer.observe(el);
  });
}


function initLightbox() {
  const thumbs = Array.from(document.querySelectorAll(".gallery-grid img"));
  if (!thumbs.length) return;

  
  const box = document.createElement("div");
  box.className = "lightbox";
  box.setAttribute("role", "dialog");
  box.setAttribute("aria-modal", "true");
  box.setAttribute("aria-label", "Photo viewer");
  box.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
    <button type="button" class="lightbox-prev" aria-label="Previous photo">&#8249;</button>
    <figure class="lightbox-figure">
      <img src="" alt="">
      <figcaption></figcaption>
    </figure>
    <button type="button" class="lightbox-next" aria-label="Next photo">&#8250;</button>`;
  document.body.appendChild(box);

  const bigImg = box.querySelector("img");
  const caption = box.querySelector("figcaption");
  const closeBtn = box.querySelector(".lightbox-close");
  let group = [];
  let index = 0;
  let lastFocused = null;

  const show = (i) => {
    index = (i + group.length) % group.length;
    const img = group[index];
    bigImg.src = img.src;
    bigImg.alt = img.alt;
    const cap = img.closest("figure")?.querySelector("figcaption");
    caption.textContent = cap ? cap.textContent : img.alt;
  };

  const open = (img) => {
    group = Array.from(img.closest(".gallery-grid").querySelectorAll("img"));
    lastFocused = document.activeElement;
    show(group.indexOf(img));
    box.classList.add("is-open");
    document.body.style.overflow = "hidden";
    closeBtn.focus();
  };

  const close = () => {
    box.classList.remove("is-open");
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  thumbs.forEach((img) => {
    img.tabIndex = 0;
    img.setAttribute("role", "button");
    img.addEventListener("click", () => open(img));
    img.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open(img);
      }
    });
  });

  closeBtn.addEventListener("click", close);
  box.querySelector(".lightbox-prev").addEventListener("click", () => show(index - 1));
  box.querySelector(".lightbox-next").addEventListener("click", () => show(index + 1));
  box.addEventListener("click", (e) => {
    if (e.target === box) close(); 
  });

  document.addEventListener("keydown", (e) => {
    if (!box.classList.contains("is-open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });
}


function initComparisonTable() {
  const table = document.querySelector(".comparison-table");
  if (!table) return;

  const headers = Array.from(table.querySelectorAll("thead th"));

  const toggleColumn = (col) => {
    const cells = table.querySelectorAll(
      `thead th:nth-child(${col + 1}), tbody td:nth-child(${col + 1})`
    );
    const on = !headers[col].classList.contains("is-highlighted");
    table.querySelectorAll(".is-highlighted").forEach((c) => c.classList.remove("is-highlighted"));
    if (on) cells.forEach((c) => c.classList.add("is-highlighted"));
  };

  headers.forEach((th, i) => {
    if (i === 0) return; 
    th.tabIndex = 0;
    th.title = "Click to highlight this city";
    th.addEventListener("click", () => toggleColumn(i));
    th.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleColumn(i);
      }
    });
  });
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.noValidate = true; 

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const rules = {
    name: (v) => (v.trim().length < 2 ? "Please enter your name." : ""),
    email: (v) => (!emailPattern.test(v.trim()) ? "Please enter a valid email address." : ""),
    message: (v) => (v.trim().length < 10 ? "Your message should be at least 10 characters." : ""),
  };

  const showError = (field, msg) => {
    const row = field.closest(".form-row");
    let err = row.querySelector(".field-error");
    if (msg) {
      if (!err) {
        err = document.createElement("span");
        err.className = "field-error";
        err.id = `${field.id}-error`;
        row.appendChild(err);
      }
      err.textContent = msg;
      field.setAttribute("aria-invalid", "true");
      field.setAttribute("aria-describedby", err.id);
      row.classList.add("has-error");
    } else {
      if (err) err.remove();
      field.removeAttribute("aria-invalid");
      field.removeAttribute("aria-describedby");
      row.classList.remove("has-error");
    }
    return !msg;
  };

  const validateField = (field) => {
    const rule = rules[field.name];
    return rule ? showError(field, rule(field.value)) : true;
  };

  
  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".form-row").classList.contains("has-error")) validateField(field);
    });
  });

  
  const status = document.createElement("p");
  status.className = "form-status";
  status.setAttribute("role", "status");
  status.hidden = true;
  form.appendChild(status);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.hidden = true;

    const fields = Array.from(form.querySelectorAll("input, textarea")).filter(
      (f) => rules[f.name]
    );
    const results = fields.map(validateField);

    if (results.includes(false)) {
      fields[results.indexOf(false)].focus();
      return;
    }

    
    const first = form.elements["name"].value.trim().split(" ")[0];
    status.textContent = `Thanks, ${first}! The form is valid, but this demo doesn't send messages yet.`;
    status.hidden = false;
    form.reset();
  });
}