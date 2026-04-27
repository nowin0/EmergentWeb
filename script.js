const pageMap = {
  "": "Home",
  "index.html": "Home",
  "platform.html": "Platform",
  "science.html": "Science",
  "applications.html": "Applications",
  "contact.html": "Contact Us",
};

const pageName = pageMap[window.location.pathname.split("/").pop()] || "Home";

document.querySelectorAll(".site-nav a").forEach((link) => {
  if (link.textContent.trim() === pageName) {
    link.classList.add("is-active");
  }
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const revealNodes = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealNodes.forEach((node) => revealObserver.observe(node));

const zoomableMedia = document.querySelectorAll("[data-lightbox]");

if (zoomableMedia.length > 0) {
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.setAttribute("aria-hidden", "true");
  lightbox.innerHTML = `
    <div class="lightbox__panel" role="dialog" aria-modal="true" aria-label="Expanded image view">
      <button class="lightbox__close" type="button" aria-label="Close full view">Close</button>
      <figure class="lightbox__figure">
        <div class="lightbox__image-wrap">
          <img class="lightbox__image" alt="" />
        </div>
        <figcaption class="lightbox__caption"></figcaption>
      </figure>
    </div>
  `;

  const image = lightbox.querySelector(".lightbox__image");
  const caption = lightbox.querySelector(".lightbox__caption");
  const closeButton = lightbox.querySelector(".lightbox__close");

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  zoomableMedia.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      image.src = trigger.dataset.lightbox;
      image.alt = trigger.dataset.lightboxAlt || "";
      caption.textContent = trigger.dataset.lightboxCaption || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  document.body.appendChild(lightbox);
}

const canvas = document.getElementById("bio-canvas");

if (canvas) {
  const ctx = canvas.getContext("2d");
  const nodes = [];
  const freeParticles = [];
  const nodeCount = 28;
  const freeCount = 22;

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    nodes.length = 0;
    freeParticles.length = 0;

    for (let i = 0; i < nodeCount; i += 1) {
      nodes.push({
        phase: (Math.PI * 2 * i) / nodeCount,
        radius: 5 + (i % 3),
      });
    }

    for (let i = 0; i < freeCount; i += 1) {
      freeParticles.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 0.28,
        vy: (Math.random() - 0.5) * 0.28,
        r: 1.6 + Math.random() * 2.8,
        color: ["#36c7ff", "#f250c5", "#9ee05d", "#ffb24c"][
          Math.floor(Math.random() * 4)
        ],
      });
    }
  }

  function drawBackground(width, height) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#0f1830");
    gradient.addColorStop(0.45, "#27155a");
    gradient.addColorStop(1, "#0f5167");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const glowA = ctx.createRadialGradient(
      width * 0.2,
      height * 0.22,
      0,
      width * 0.2,
      height * 0.22,
      width * 0.35
    );
    glowA.addColorStop(0, "rgba(54, 199, 255, 0.26)");
    glowA.addColorStop(1, "rgba(54, 199, 255, 0)");
    ctx.fillStyle = glowA;
    ctx.fillRect(0, 0, width, height);

    const glowB = ctx.createRadialGradient(
      width * 0.78,
      height * 0.18,
      0,
      width * 0.78,
      height * 0.18,
      width * 0.32
    );
    glowB.addColorStop(0, "rgba(242, 80, 197, 0.22)");
    glowB.addColorStop(1, "rgba(242, 80, 197, 0)");
    ctx.fillStyle = glowB;
    ctx.fillRect(0, 0, width, height);
  }

  function helixPoint(width, height, t, lane) {
    const x = width * 0.14 + t * width * 0.74;
    const wave = Math.sin(t * Math.PI * 4.8 + lane);
    const y = height * 0.48 + wave * Math.min(96, height * 0.14);
    const offset = Math.cos(t * Math.PI * 4.8 + lane) * 54;
    return { x, y, offset };
  }

  function drawHelix(width, height, time) {
    const shift = time * 0.00024;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";

    const gradients = [
      ["rgba(54, 199, 255, 0.9)", "rgba(158, 224, 93, 0.9)"],
      ["rgba(242, 80, 197, 0.9)", "rgba(255, 178, 76, 0.9)"],
    ];

    for (let lane = 0; lane < 2; lane += 1) {
      const lineGradient = ctx.createLinearGradient(0, 0, width, 0);
      lineGradient.addColorStop(0, gradients[lane][0]);
      lineGradient.addColorStop(1, gradients[lane][1]);
      ctx.strokeStyle = lineGradient;
      ctx.shadowBlur = 14;
      ctx.shadowColor = gradients[lane][0];
      ctx.beginPath();

      for (let i = 0; i <= 120; i += 1) {
        const t = i / 120;
        const point = helixPoint(width, height, t + shift, lane * Math.PI);
        const x = point.x;
        const y = point.y + (lane === 0 ? -point.offset * 0.2 : point.offset * 0.2);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 36; i += 1) {
      const t = i / 35 + shift;
      const a = helixPoint(width, height, t, 0);
      const b = helixPoint(width, height, t, Math.PI);
      ctx.strokeStyle = i % 2 === 0 ? "rgba(255, 255, 255, 0.32)" : "rgba(158, 224, 93, 0.24)";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y - a.offset * 0.2);
      ctx.lineTo(b.x, b.y + b.offset * 0.2);
      ctx.stroke();
    }

    nodes.forEach((node, index) => {
      const t = (index + 1) / (nodes.length + 1) + shift;
      const lane = index % 2 === 0 ? 0 : Math.PI;
      const point = helixPoint(width, height, t, lane);
      const y = point.y + (lane === 0 ? -point.offset * 0.2 : point.offset * 0.2);
      const color = ["#36c7ff", "#9ee05d", "#ffb24c", "#f250c5"][index % 4];
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.arc(point.x, y, node.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function drawFreeParticles(width, height) {
    for (let i = 0; i < freeParticles.length; i += 1) {
      const particle = freeParticles[i];
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x <= 0 || particle.x >= width) {
        particle.vx *= -1;
      }
      if (particle.y <= 0 || particle.y >= height) {
        particle.vy *= -1;
      }

      for (let j = i + 1; j < freeParticles.length; j += 1) {
        const other = freeParticles[j];
        const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
        if (distance < 128) {
          ctx.strokeStyle = `rgba(255,255,255,${0.08 - distance / 2200})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }
    }

    freeParticles.forEach((particle) => {
      ctx.beginPath();
      ctx.fillStyle = particle.color;
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function animate(time) {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    ctx.clearRect(0, 0, width, height);
    drawBackground(width, height);
    drawFreeParticles(width, height);
    drawHelix(width, height, time);
    window.requestAnimationFrame(animate);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  window.requestAnimationFrame(animate);
}
