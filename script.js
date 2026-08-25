/* ========================================
   DevLabs Team — Animations v2
   ======================================== */

(function () {
  'use strict';

  /* ========================================
     PRELOADER
     ======================================== */
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
      initHeroAnimations();
    }, 2200);
  });

  // Fallback
  setTimeout(() => {
    if (!preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
      document.body.style.overflow = '';
      initHeroAnimations();
    }
  }, 4000);

  /* ========================================
     CUSTOM CURSOR
     ======================================== */
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    // Smooth follow
    cursorX += (mouseX - cursorX) * 0.25;
    cursorY += (mouseY - cursorY) * 0.25;
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;

    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effects on interactive elements
  const hoverTargets = document.querySelectorAll('a, button, .magnetic, [data-tilt]');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });

  /* ========================================
     GRID BACKGROUND (Canvas)
     ======================================== */
  const canvas = document.getElementById('grid-bg');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h;
    const spacing = 55;
    let particles = [];
    let mouseCanvasX = 0, mouseCanvasY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseCanvasX = e.clientX;
      mouseCanvasY = e.clientY;
    });

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      initParticles();
    }

    function initParticles() {
      particles = [];
      const count = Math.floor((w * h) / 35000);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: Math.random() * 1.8 + 0.4,
          alpha: Math.random() * 0.4 + 0.1,
          hue: Math.random() > 0.7 ? 270 : 185, // purple or cyan
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // Grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.025)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= w; x += spacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Mouse influence
        const dx = mouseCanvasX - p.x;
        const dy = mouseCanvasY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.x -= dx * force * 0.01;
          p.y -= dy * force * 0.01;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 60%, ${p.alpha})`;
        ctx.fill();
      });

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            const alpha = 0.06 * (1 - dist / 110);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    resize();
    draw();
    window.addEventListener('resize', resize);
  }

  /* ========================================
     SCROLL REVEAL
     ======================================== */
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-scale');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  /* ========================================
     NAV SCROLL EFFECT
     ======================================== */
  const nav = document.getElementById('nav');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });

  /* ========================================
     SMOOTH SCROLL
     ======================================== */
  document.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ========================================
     ACTIVE NAV LINK
     ======================================== */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__link');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY + 120;
    sections.forEach((section) => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach((link) => {
          link.style.color = '';
          if (link.getAttribute('href') === '#' + id) {
            link.style.color = 'var(--accent)';
          }
        });
      }
    });
  });

  /* ========================================
     TERMINAL TYPING EFFECT
     ======================================== */
  let terminalRunning = false;

  function initTerminalTyping() {
    if (terminalRunning) return;
    terminalRunning = true;

    const lines = document.querySelectorAll('.terminal__line');
    const cursors = document.querySelectorAll('.terminal__cursor');
    const typeSpeed = 28;

    // Reset everything
    lines.forEach((line) => {
      line.classList.remove('typed');
      const cmd = line.querySelector('.terminal__cmd');
      if (cmd && cmd.dataset.text) {
        cmd.textContent = '';
      }
    });
    cursors.forEach((c) => c.classList.remove('active'));

    function typeLine(lineIndex) {
      if (lineIndex >= lines.length) {
        terminalRunning = false;
        return;
      }

      const line = lines[lineIndex];
      const cmd = line.querySelector('.terminal__cmd');
      const cursor = line.querySelector('.terminal__cursor');
      const text = cmd ? cmd.dataset.text : null;

      // Show this line
      line.classList.add('typed');

      if (cursor) {
        // Remove cursor from all, add to current
        cursors.forEach((c) => c.classList.remove('active'));
        cursor.classList.add('active');
      }

      if (text) {
        let i = 0;
        const type = () => {
          if (i < text.length) {
            cmd.textContent += text[i];
            i++;
            setTimeout(type, typeSpeed + Math.random() * 12);
          } else {
            // Done typing this line, move to next
            if (cursor) cursor.classList.remove('active');
            setTimeout(() => typeLine(lineIndex + 1), 300);
          }
        };
        type();
      } else {
        // No text to type (success line), just show and move on
        setTimeout(() => typeLine(lineIndex + 1), 200);
      }
    }

    // Start typing after a short delay
    setTimeout(() => typeLine(0), 600);
  }

  function initHeroAnimations() {
    initTerminalTyping();
  }

  // Replay terminal when scrolled back into view
  const terminalEl = document.getElementById('terminal');
  if (terminalEl) {
    const termObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !terminalRunning) {
            initTerminalTyping();
          }
        });
      },
      { threshold: 0.5 }
    );
    termObserver.observe(terminalEl);
  }

  /* ========================================
     COUNTER ANIMATION (Stats)
     ======================================== */
  const statNumbers = document.querySelectorAll('.stat__number');
  const statBars = document.querySelectorAll('.stat__bar-fill');

  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Animate numbers
          statNumbers.forEach((el) => {
            const target = parseInt(el.dataset.target);
            if (el.dataset.animated) return;
            el.dataset.animated = '1';

            let current = 0;
            const duration = 2000;
            const step = target / (duration / 16);
            const animate = () => {
              current += step;
              if (current >= target) {
                el.textContent = target;
              } else {
                el.textContent = Math.floor(current);
                requestAnimationFrame(animate);
              }
            };
            setTimeout(animate, 500);
          });

          // Animate bars
          statBars.forEach((bar, i) => {
            setTimeout(() => {
              bar.classList.add('animated');
            }, 500 + i * 200);
          });
        }
      });
    },
    { threshold: 0.3 }
  );

  const statsSection = document.getElementById('stats');
  if (statsSection) statsObserver.observe(statsSection);

  /* ========================================
     MAGNETIC BUTTONS
     ======================================== */
  const magneticEls = document.querySelectorAll('.magnetic');

  magneticEls.forEach((el) => {
    const strength = parseInt(el.dataset.strength) || 20;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => { el.style.transition = ''; }, 400);
    });
  });

  /* ========================================
     3D TILT ON CARDS
     ======================================== */
  const tiltEls = document.querySelectorAll('[data-tilt]');

  tiltEls.forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const tiltX = (0.5 - y) * 8;
      const tiltY = (x - 0.5) * 8;
      el.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
      el.style.transition = 'transform 0.1s';

      // Update CSS custom properties for glow
      el.style.setProperty('--mouse-x', (x * 100) + '%');
      el.style.setProperty('--mouse-y', (y * 100) + '%');
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  });

  /* ========================================
     PARALLAX ON ORBS
     ======================================== */
  const orbs = document.querySelectorAll('.orb');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    orbs.forEach((orb, i) => {
      const speed = (i + 1) * 0.03;
      orb.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });

  /* ========================================
     MOUSE GLOW ON CARDS
     ======================================== */
  document.querySelectorAll('.about__card, .project-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty('--mouse-x', x + '%');
      card.style.setProperty('--mouse-y', y + '%');
    });
  });

  /* ========================================
     TEXT SCRAMBLE EFFECT (Hero Title)
     ======================================== */
  class TextScramble {
    constructor(el) {
      this.el = el;
      this.chars = '!<>-_\\/[]{}—=+*^?#________';
      this.update = this.update.bind(this);
    }

    setText(newText) {
      const oldText = this.el.textContent;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => (this.resolve = resolve));
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = Math.floor(Math.random() * 20);
        const end = start + Math.floor(Math.random() * 20);
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }

    update() {
      let output = '';
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.28) {
            char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.queue[i].char = char;
          }
          output += `<span class="scramble-char">${char}</span>`;
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }
  }

  // Apply scramble to hero badge on load
  setTimeout(() => {
    const badge = document.querySelector('.hero__badge');
    if (badge) {
      const original = badge.textContent.trim();
      const scrambler = new TextScramble(badge);
      scrambler.setText(original);
    }
  }, 2500);

  /* ========================================
     GITHUB API — FETCH REPOS
     ======================================== */
  const LANG_COLORS = {
    JavaScript: '#f7df1e', TypeScript: '#3178c6', HTML: '#e34c26',
    CSS: '#563d7c', Python: '#3572A5', Java: '#b07219', 'C++': '#f34b7d',
    C: '#555555', Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516',
    PHP: '#4F5D95', Shell: '#89e051', Dart: '#00B4AB', Kotlin: '#A97BFF',
    Swift: '#F05138', Vue: '#41b883', SCSS: '#c6538c', Lua: '#000080',
    Zig: '#ec915c', Haskell: '#5e5086', 'Jupyter Notebook': '#DA5B0B',
  };

  const LANG_SVG = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`;
  const ARROW_SVG = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;

  function buildRepoCard(repo) {
    const desc = repo.description || 'Sin descripción';
    const langColor = LANG_COLORS[repo.language] || '#888';
    const lang = repo.language || '—';
    const license = repo.license ? repo.license.spdx_id : '';
    const updated = new Date(repo.updated_at).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    return `
      <div class="project-card reveal-up" data-tilt>
        <div class="project-card__glow"></div>
        <div class="project-card__header">
          ${LANG_SVG}
          <span class="project-card__status">
            <span class="project-card__status-dot"></span>
            ${repo.private ? 'Private' : 'Public'}
          </span>
        </div>
        <h3 class="project-card__name">${repo.name}</h3>
        <p class="project-card__desc">${desc}</p>
        <div class="project-card__footer">
          ${repo.language ? `<span class="project-card__lang">
            <span class="project-card__lang-dot" style="background:${langColor}"></span> ${lang}
          </span>` : ''}
          ${license ? `<span class="project-card__license">${license}</span>` : ''}
          <span class="project-card__updated">${updated}</span>
        </div>
        <a href="${repo.html_url}" target="_blank" class="project-card__link magnetic" data-strength="15">
          Ver repositorio ${ARROW_SVG}
        </a>
      </div>
    `;
  }

  function buildRepoCardLarge(repo) {
    const desc = repo.description || 'Sin descripción';
    const langColor = LANG_COLORS[repo.language] || '#888';
    const license = repo.license ? repo.license.spdx_id : '';
    const updated = new Date(repo.updated_at).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    return `
      <div class="repo-full reveal-up" data-tilt>
        <div class="project-card__glow"></div>
        <div class="repo-full__header">
          <div class="repo-full__icon">${LANG_SVG}</div>
          <div class="repo-full__info">
            <h3 class="repo-full__name">${repo.name}</h3>
            <p class="repo-full__desc">${desc}</p>
          </div>
        </div>
        <div class="repo-full__meta">
          ${repo.language ? `<span class="project-card__lang">
            <span class="project-card__lang-dot" style="background:${langColor}"></span> ${repo.language}
          </span>` : ''}
          <span class="project-card__stat">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            ${repo.stargazers_count}
          </span>
          <span class="project-card__stat">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v6M6 9v6M6 9l6-3 6 3"/></svg>
            ${repo.forks_count}
          </span>
          ${license ? `<span class="project-card__license">${license}</span>` : ''}
          <span class="project-card__updated">${updated}</span>
        </div>
        <a href="${repo.html_url}" target="_blank" class="project-card__link magnetic" data-strength="15">
          Ver repositorio ${ARROW_SVG}
        </a>
      </div>
    `;
  }

  // Fetch repos for index.html (3 most recent)
  const reposGrid = document.getElementById('repos-grid');
  if (reposGrid && !document.getElementById('repos-full-grid')) {
    fetch('https://api.github.com/orgs/DevLabs-Team/repos?sort=updated&per_page=3')
      .then((r) => r.json())
      .then((repos) => {
        if (!Array.isArray(repos) || repos.length === 0) {
          reposGrid.innerHTML = `<p class="repos-empty">No hay repositorios aún.</p>`;
          return;
        }
        reposGrid.innerHTML = repos.map(buildRepoCard).join('');
        // Re-init reveal and tilt for new elements
        reposGrid.querySelectorAll('.reveal-up').forEach((el) => {
          el.classList.add('reveal-up');
          revealObserver.observe(el);
        });
        reposGrid.querySelectorAll('[data-tilt]').forEach(initTilt);
        reposGrid.querySelectorAll('.magnetic').forEach(initMagnetic);
        reposGrid.querySelectorAll('.project-card').forEach((card) => {
          card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
            card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
          });
        });
      })
      .catch(() => {
        reposGrid.innerHTML = `<p class="repos-empty">Error al cargar repositorios.</p>`;
      });
  }

  // Fetch all repos for repositories.html
  const reposFullGrid = document.getElementById('repos-full-grid');
  if (reposFullGrid) {
    const countEl = document.getElementById('repos-count');
    fetch('https://api.github.com/orgs/DevLabs-Team/repos?sort=updated&per_page=100')
      .then((r) => r.json())
      .then((repos) => {
        if (!Array.isArray(repos) || repos.length === 0) {
          reposFullGrid.innerHTML = `<p class="repos-empty">No hay repositorios aún.</p>`;
          return;
        }
        if (countEl) countEl.textContent = repos.length;
        reposFullGrid.innerHTML = repos.map(buildRepoCardLarge).join('');
        // Init observers and interactions for new elements
        reposFullGrid.querySelectorAll('.reveal-up').forEach((el) => revealObserver.observe(el));
        reposFullGrid.querySelectorAll('[data-tilt]').forEach(initTilt);
        reposFullGrid.querySelectorAll('.magnetic').forEach(initMagnetic);
        reposFullGrid.querySelectorAll('.repo-full').forEach((card) => {
          card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
            card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
          });
        });
      })
      .catch(() => {
        reposFullGrid.innerHTML = `<p class="repos-empty">Error al cargar repositorios.</p>`;
      });
  }

  /* ---- Helper: init tilt on dynamic elements ---- */
  function initTilt(el) {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      el.style.transform = `perspective(800px) rotateX(${(0.5 - y) * 8}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
      el.style.transition = 'transform 0.1s';
      el.style.setProperty('--mouse-x', (x * 100) + '%');
      el.style.setProperty('--mouse-y', (y * 100) + '%');
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });
  }

  /* ---- Helper: init magnetic on dynamic elements ---- */
  function initMagnetic(el) {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0, 0)';
      el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
      setTimeout(() => { el.style.transition = ''; }, 400);
    });
  }

  /* ---- TV Page Transition ---- */
  const tvOverlay = document.getElementById('tv-overlay');
  const tvLinks = document.querySelectorAll('a[href$=".html"]');
  const TV_OFF_MS = 550;
  const TV_ON_MS  = 600;

  function buildTvInner() {
    tvOverlay.innerHTML = '<div class="tv-overlay__screen"></div><div class="tv-overlay__beam"></div>';
  }

  // On load: if coming from a TV transition, play turn-on then hide
  if (sessionStorage.getItem('tvTransition')) {
    sessionStorage.removeItem('tvTransition');
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'none';
    buildTvInner();
    tvOverlay.style.display = 'flex';
    tvOverlay.classList.add('tv-on');
    setTimeout(() => {
      tvOverlay.style.display = 'none';
      tvOverlay.classList.remove('tv-on');
      tvOverlay.innerHTML = '';
      if (preloader) preloader.style.display = '';
    }, TV_ON_MS);
  }

  // Intercept inter-page links: play turn-off then navigate
  tvLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === window.location.pathname.split('/').pop()) return;
      e.preventDefault();
      buildTvInner();
      tvOverlay.style.display = 'flex';
      tvOverlay.classList.add('tv-off');
      sessionStorage.setItem('tvTransition', '1');
      setTimeout(() => { window.location.href = href; }, TV_OFF_MS);
    });
  });

})();
