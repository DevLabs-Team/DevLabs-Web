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
     CURSOR SECTION STATES
     ======================================== */
  const cursorSections = document.querySelectorAll('[data-cursor]');
  let currentCursorSection = '';

  const cursorSectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
          const section = entry.target.dataset.cursor;
          if (section !== currentCursorSection) {
            currentCursorSection = section;
            cursor.classList.remove('cursor--hero', 'cursor--about', 'cursor--stats', 'cursor--projects', 'cursor--team', 'cursor--tech', 'cursor--contact');
            follower.classList.remove('cursor--hero', 'cursor--about', 'cursor--stats', 'cursor--projects', 'cursor--team', 'cursor--tech', 'cursor--contact');
            cursor.classList.add('cursor--' + section);
            follower.classList.add('cursor--' + section);
          }
        }
      });
    },
    { threshold: [0.3, 0.5, 0.7], rootMargin: '-10% 0px -10% 0px' }
  );

  cursorSections.forEach((s) => cursorSectionObserver.observe(s));

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
     TERMINAL — INTERACTIVE
     ======================================== */
  const termInput = document.getElementById('terminal-input');
  const termOutput = document.getElementById('terminal-output');
  const termBody = document.getElementById('terminal-body');
  const termWelcome = termOutput ? termOutput.querySelector('.terminal__welcome') : null;
  let cmdHistory = [];
  let historyIndex = -1;

  const TERM_COMMANDS = {
    help: () => [
      { text: 'Available commands:', cls: 'terminal__output-line--accent' },
      { text: '  help      — Show this help' },
      { text: '  about     — About DevLabs Team' },
      { text: '  projects  — List our projects' },
      { text: '  team      — Show team members' },
      { text: '  contact   — How to reach us' },
      { text: '  tech      — Our tech stack' },
      { text: '  meme      — Random dev meme / quote' },
      { text: '  secret    — ???' },
      { text: '  glitch    — Toggle glitch mode (Konami alt)' },
      { text: '  clear     — Clear terminal' },
      { text: '  github    — Open GitHub org' },
    ],
    about: () => [
      { text: 'DevLabs Team — We build the future of code.', cls: 'terminal__output-line--accent' },
      { text: 'A dev organization focused on open source,' },
      { text: 'innovation, and community-driven projects.' },
    ],
    projects: () => {
      const grid = document.getElementById('repos-grid');
      const cards = grid ? grid.querySelectorAll('.project-card__name') : [];
      if (cards.length) {
        const lines = [{ text: 'Top projects:', cls: 'terminal__output-line--accent' }];
        cards.forEach((c) => lines.push({ text: '  → ' + c.textContent.trim() }));
        return lines;
      }
      return [{ text: '  Loading projects... check the Projects section above!' }];
    },
    team: () => [
      { text: 'Fetching team from GitHub API...', cls: 'terminal__output-line--accent' },
      { text: '  → Check the Team section below for all members.' },
    ],
    contact: () => [
      { text: 'Contact:', cls: 'terminal__output-line--accent' },
      { text: '  Email: devlabs@elmarcels.xyz' },
      { text: '  GitHub: github.com/DevLabs-Team' },
    ],
    tech: () => [
      { text: 'Tech Stack:', cls: 'terminal__output-line--accent' },
      { text: '  TypeScript, Node.js, React, Python, Next.js,' },
      { text: '  GitHub Actions, DevSecOps, AI/ML, Docker,' },
      { text: '  PostgreSQL, Kubernetes, Terraform, MongoDB,' },
      { text: '  Astro, Vue.js, Svelte, Rust, Go, AWS,' },
      { text: '  Supabase, Firebase, Vercel, Git, Nginx,' },
      { text: '  REST APIs, GraphQL, Redis, Tailwind CSS,' },
      { text: '  Three.js, Prisma, Electron, Netlify,' },
      { text: '  Cloudflare, Ansible, Expo, RabbitMQ,' },
      { text: '  Grafana, Prometheus, Auth0' },
    ],
    github: () => {
      window.open('https://github.com/DevLabs-Team', '_blank');
      return [{ text: 'Opening GitHub in new tab...', cls: 'terminal__output-line--accent' }];
    },
    meme: () => {
      const memes = [
        '"There are only 10 types of people in the world: those who understand binary and those who don\'t."',
        '"A SQL query walks into a bar, sees two tables and asks... Can I JOIN you?"',
        '"Why do programmers prefer dark mode? Because light attracts bugs."',
        '"Debugging is like being the detective in a crime movie where you are also the murderer."',
        '"I don\'t have a life. I have a terminal.',
        '"The code works. I don\'t know why."',
        '"It works on my machine ¯\\_(ツ)_/¯"',
        '"There\'s no place like 127.0.0.1"',
        '"First, solve the problem. Then, write the code." — John Johnson',
        '"Talk is cheap. Show me the code." — Linus Torvalds',
        '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
        '"Programs must be written for people to read." — Harold Abelson',
        '"The best error message is the one that never shows up." — Thomas Fuchs',
        '"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra',
        '"It\'s not a bug — it\'s an undocumented feature."',
        '"Weeks of coding can save you hours of planning."',
        '"Code never lies, comments sometimes do." — Ron Jeffries',
        '" deleted entire production db. It was a weekend." — @softwaregov',
      ];
      const pick = memes[Math.floor(Math.random() * memes.length)];
      return [
        { text: '  ┌' + '─'.repeat(52) + '┐', cls: 'terminal__output-line--accent' },
        { text: '  │ ' + pick.substring(0, 50), cls: '' },
        { text: '  └' + '─'.repeat(52) + '┘', cls: 'terminal__output-line--accent' },
      ];
    },
    clear: () => 'CLEAR',
  };

  function termPrint(lines) {
    lines.forEach((l) => {
      const div = document.createElement('div');
      div.className = 'terminal__output-line' + (l.cls ? ' ' + l.cls : '');
      div.textContent = l.text;
      termOutput.appendChild(div);
    });
  }

  function termPrintHTML(html) {
    const div = document.createElement('div');
    div.className = 'terminal__output-line terminal__output-line--accent';
    div.innerHTML = html;
    termOutput.appendChild(div);
  }

  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = termInput.value.trim().toLowerCase();
        termInput.value = '';
        if (!cmd) return;
        cmdHistory.push(cmd);
        historyIndex = cmdHistory.length;

        // Print the command
        const cmdDiv = document.createElement('div');
        cmdDiv.className = 'terminal__output-line terminal__output-line--cmd';
        cmdDiv.textContent = '$ ' + cmd;
        termOutput.appendChild(cmdDiv);

        // Execute
        const handler = TERM_COMMANDS[cmd];
        if (handler) {
          const result = handler();
          if (result === 'CLEAR') {
            termOutput.innerHTML = '';
          } else {
            termPrint(result);
          }
        } else {
          termPrint([{ text: `command not found: ${cmd}. Type "help" for available commands.`, cls: 'terminal__output-line--error' }]);
        }

        // Scroll to bottom
        if (termBody) termBody.scrollTop = termBody.scrollHeight;
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
          historyIndex--;
          termInput.value = cmdHistory[historyIndex] || '';
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < cmdHistory.length - 1) {
          historyIndex++;
          termInput.value = cmdHistory[historyIndex] || '';
        } else {
          historyIndex = cmdHistory.length;
          termInput.value = '';
        }
      }
    });

    // Focus terminal on click
    if (termBody) {
      termBody.addEventListener('click', () => termInput.focus());
    }
  }

  /* ========================================
     COUNTER ANIMATION (Stats)
     ======================================== */

  function initHeroAnimations() {
    // Focus terminal input
    const termInput = document.getElementById('terminal-input');
    if (termInput) setTimeout(() => termInput.focus(), 500);
  }
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
        initHoverSounds();
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
        initHoverSounds();
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

  /* ========================================
     i18n — LANGUAGE TOGGLE
     ======================================== */
  const translations = {
    es: {
      'nav.home': 'Inicio', 'nav.about': 'Sobre nosotros', 'nav.stats': 'N&uacute;meros',
      'nav.projects': 'Proyectos', 'nav.team': 'Equipo', 'nav.tech': 'Tech Stack', 'nav.contact': 'Contacto',
      'hero.badge': 'Organizaci&oacute;n de desarrollo',
      'hero.subtitle': 'Construimos el futuro del c&oacute;digo,<br>una l&iacute;nea a la vez.',
      'hero.ctaGithub': 'Ver en GitHub', 'hero.ctaAbout': 'Conocer m&aacute;s',
      'terminal.welcome': 'Bienvenido al terminal de DevLabs Team. Escribe <span class="terminal__highlight">help</span> para ver los comandos disponibles.',
      'about.title': 'Sobre nosotros',
      'about.intro': 'Somos un equipo de desarrolladores apasionados por la tecnolog&iacute;a y el c&oacute;digo limpio. Nuestra misi&oacute;n es crear soluciones innovadoras que impacten de forma positiva.',
      'about.card1.title': 'Innovaci&oacute;n', 'about.card1.text': 'Exploramos nuevas tecnolog&iacute;as y metodolog&iacute;as para crear soluciones que marcan la diferencia en la industria.',
      'about.card2.title': 'Comunidad', 'about.card2.text': 'Un equipo apasionado que comparte conocimiento, crece junto a otros y construye en abierto.',
      'about.card3.title': 'Excelencia', 'about.card3.text': 'C&oacute;digo limpio, buenas pr&aacute;cticas y est&aacute;ndares altos en todo lo que construimos y desplegamos.',
      'about.card4.title': 'Velocidad', 'about.card4.text': 'Desarrollo &aacute;gil y eficiente, sin sacrificar la calidad del producto final ni la experiencia del usuario.',
      'stats.repos': 'Repositorios', 'stats.members': 'Miembros', 'stats.opensource': 'Open Source', 'stats.coding': 'Coding',
      'projects.title': 'Proyectos', 'projects.cta': 'Ver todos los repositorios',
      'team.title': 'Equipo',
      'contact.title': 'Contacto', 'contact.text': '&iquest;Tienes una idea? &iquest;Quieres colaborar?<br>Estamos abiertos a nuevos talentos y proyectos.',
      'footer.rights': 'Todos los derechos reservados.', 'footer.made': 'Hecho con &#9889; desde Espa&ntilde;a',
    },
    en: {
      'nav.home': 'Home', 'nav.about': 'About us', 'nav.stats': 'Numbers',
      'nav.projects': 'Projects', 'nav.team': 'Team', 'nav.tech': 'Tech Stack', 'nav.contact': 'Contact',
      'hero.badge': 'Development organization',
      'hero.subtitle': 'We build the future of code,<br>one line at a time.',
      'hero.ctaGithub': 'View on GitHub', 'hero.ctaAbout': 'Learn more',
      'terminal.welcome': 'Welcome to DevLabs Team terminal. Type <span class="terminal__highlight">help</span> to see available commands.',
      'about.title': 'About us',
      'about.intro': 'We are a team of developers passionate about technology and clean code. Our mission is to create innovative solutions that have a positive impact.',
      'about.card1.title': 'Innovation', 'about.card1.text': 'We explore new technologies and methodologies to create solutions that make a difference in the industry.',
      'about.card2.title': 'Community', 'about.card2.text': 'A passionate team that shares knowledge, grows with others, and builds in the open.',
      'about.card3.title': 'Excellence', 'about.card3.text': 'Clean code, best practices, and high standards in everything we build and deploy.',
      'about.card4.title': 'Speed', 'about.card4.text': 'Agile and efficient development, without sacrificing product quality or user experience.',
      'stats.repos': 'Repositories', 'stats.members': 'Members', 'stats.opensource': 'Open Source', 'stats.coding': 'Coding',
      'projects.title': 'Projects', 'projects.cta': 'View all repositories',
      'team.title': 'Team',
      'contact.title': 'Contact', 'contact.text': 'Got an idea? Want to collaborate?<br>We are open to new talent and projects.',
      'footer.rights': 'All rights reserved.', 'footer.made': 'Made with &#9889; from Spain',
    },
  };

  let currentLang = localStorage.getItem('devlabs-lang') || 'es';

  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('devlabs-lang', lang);
    const dict = translations[lang];
    document.documentElement.lang = lang === 'es' ? 'es' : 'en';

    // Transition effect
    document.body.classList.add('i18n-transitioning');
    setTimeout(() => {
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.innerHTML = dict[key];
      });
      document.body.classList.remove('i18n-transitioning');
    }, 250);

    // Update toggle label
    const label = document.getElementById('lang-label');
    if (label) label.textContent = lang === 'es' ? 'EN' : 'ES';
  }

  const langBtn = document.getElementById('lang-toggle');
  if (langBtn) {
    langBtn.addEventListener('click', () => {
      applyLang(currentLang === 'es' ? 'en' : 'es');
    });
  }
  // Apply saved language on load
  if (currentLang !== 'es') applyLang(currentLang);

  /* ========================================
     PARALLAX ON HERO LAYERS
     ======================================== */
  const parallaxLayers = document.querySelectorAll('[data-parallax-speed]');

  function updateParallax() {
    const scrollY = window.scrollY;
    parallaxLayers.forEach((layer) => {
      const speed = parseFloat(layer.dataset.parallaxSpeed) || 0;
      layer.style.transform = `translateY(${scrollY * speed}px)`;
    });
  }

  window.addEventListener('scroll', updateParallax, { passive: true });

  /* ========================================
     GITHUB API — FETCH TEAM MEMBERS
     ======================================== */
  const teamGrid = document.getElementById('team-grid');
  if (teamGrid) {
    fetch('/api/members')
      .then((r) => r.json())
      .then((data) => {
        const members = Array.isArray(data) ? data : (data && data.members) || [];
        if (!Array.isArray(members) || members.length === 0) {
          teamGrid.innerHTML = `
            <div class="team-card reveal-up" style="text-align:center; grid-column:1/-1;">
              <p class="repos-empty">Los miembros del equipo son privados en GitHub.<br>
              <span style="color:var(--accent);font-size:0.75rem;">Para que aparezcan aqu&iacute;, el due&ntilde;o debe iniciar sesi&oacute;n para sincronizar el equipo.</span></p>
            </div>`;
          return;
        }
        renderTeam(members);
      })
      .catch(() => {
        teamGrid.innerHTML = `<p class="repos-empty">Error al cargar equipo.</p>`;
      });
  }

  function renderTeam(members) {
    if (!teamGrid) return;
    teamGrid.innerHTML = members.map((m) => `
      <div class="team-card reveal-up" data-tilt>
        <div class="team-card__glow"></div>
        <a href="miembro.html?user=${m.login}" class="team-card__avatar-link" data-transition="glitch">
          <img class="team-card__avatar" src="${m.avatar_url}" alt="${m.login}" loading="lazy">
        </a>
        <h3 class="team-card__name"><a href="miembro.html?user=${m.login}" class="team-card__name-link" data-transition="glitch">${m.login}</a></h3>
        <span class="team-card__role">Member</span>
        <a href="miembro.html?user=${m.login}" class="team-card__link magnetic" data-strength="10" data-transition="glitch">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          Ver perfil
        </a>
      </div>
    `).join('');
    teamGrid.querySelectorAll('.reveal-up').forEach((el) => revealObserver.observe(el));
    teamGrid.querySelectorAll('[data-tilt]').forEach(initTilt);
    teamGrid.querySelectorAll('.magnetic').forEach(initMagnetic);
    teamGrid.querySelectorAll('.team-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--mouse-y', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
    });
    initHoverSounds();
  }

  /* ========================================
     BACK TO TOP — TELEPORT
     ======================================== */
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    if (backToTop) {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      backToTop.classList.add('teleporting');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
      setTimeout(() => {
        backToTop.classList.remove('teleporting');
      }, 700);
    });
  }

  /* ========================================
     CLICK RIPPLE EFFECT
     ======================================== */
  const rippleContainer = document.getElementById('click-ripple');

  document.addEventListener('click', (e) => {
    if (!rippleContainer) return;
    if (e.target.closest('a, button, input, .terminal, .nav')) return;
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    rippleContainer.appendChild(ripple);
    setTimeout(() => ripple.remove(), 900);
  });

  /* ========================================
     GLITCH ON FAST SCROLL
     ======================================== */
  const glitchOverlay = document.getElementById('glitch-overlay');
  let lastScrollY = window.scrollY;
  let glitchTimeout = null;

  window.addEventListener('scroll', () => {
    if (!glitchOverlay) return;
    const delta = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;
    if (delta > 120) {
      glitchOverlay.classList.add('active');
      clearTimeout(glitchTimeout);
      glitchTimeout = setTimeout(() => glitchOverlay.classList.remove('active'), 200);
    }
  }, { passive: true });

  /* ========================================
     HOVER SOUNDS (Web Audio API)
     ======================================== */
  let audioCtx = null;
  let soundEnabled = false;
  const soundToggle = document.getElementById('sound-toggle');
  const soundOnIcon = document.getElementById('sound-on-icon');
  const soundOffIcon = document.getElementById('sound-off-icon');

  function playHoverSound() {
    if (!soundEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
  }

  function playClickSound() {
    if (!soundEnabled || !audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.1);
  }

  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      soundEnabled = !soundEnabled;
      soundToggle.classList.toggle('active', soundEnabled);
      if (soundOnIcon) soundOnIcon.style.display = soundEnabled ? 'block' : 'none';
      if (soundOffIcon) soundOffIcon.style.display = soundEnabled ? 'none' : 'block';
      if (soundEnabled) playClickSound();
    });
  }

  // Attach hover sounds to interactive elements
  function initHoverSounds() {
    document.querySelectorAll('a, button, .btn, .tech__item, .about__card, .project-card, .team-card').forEach((el) => {
      el.addEventListener('mouseenter', playHoverSound);
    });
    document.querySelectorAll('a, button, .btn').forEach((el) => {
      el.addEventListener('click', playClickSound);
    });
  }
  initHoverSounds();

  /* ========================================
     SECRET SECTION (terminal command)
     ======================================== */
  const secretSection = document.getElementById('secret');
  const secretClose = document.getElementById('secret-close');

  TERM_COMMANDS.secret = () => {
    if (secretSection) {
      secretSection.style.display = 'block';
      secretSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return [
      { text: 'Accessing classified data...', cls: 'terminal__output-line--accent' },
      { text: '  ███████╗██╗   ██╗███████╗', cls: 'terminal__output-line--accent' },
      { text: '  ██╔════╝╚██╗ ██╔╝██╔════╝', cls: 'terminal__output-line--accent' },
      { text: '  ███████╗ ╚████╔╝ ███████╗', cls: 'terminal__output-line--accent' },
      { text: '  ╚════██║  ╚██╔╝  ╚════██║', cls: 'terminal__output-line--accent' },
      { text: '  ███████║   ██║   ███████║', cls: 'terminal__output-line--accent' },
      { text: '  ╚══════╝   ╚═╝   ╚══════╝', cls: 'terminal__output-line--accent' },
      { text: '  ↓ Secret section unlocked below! ↓', cls: 'terminal__output-line--success' },
    ];
  };

  if (secretClose) {
    secretClose.addEventListener('click', () => {
      secretSection.style.display = 'none';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ========================================
     COPY EMAIL TOAST
     ======================================== */
  document.querySelectorAll('.copy-email').forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const email = el.dataset.email;
      if (!email) return;
      navigator.clipboard.writeText(email).then(() => {
        const toast = document.getElementById('toast');
        const toastText = document.getElementById('toast-text');
        if (toast && toastText) {
          toastText.textContent = email + ' copied!';
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2500);
        }
      });
    });
  });

  /* ========================================
     STAR FIELD (3D parallax)
     ======================================== */
  const starCanvas = document.getElementById('star-field');
  if (starCanvas) {
    const sCtx = starCanvas.getContext('2d');
    let sw, sh;
    let stars = [];
    const STAR_COUNT = 200;
    let starMouseX = 0, starMouseY = 0;

    document.addEventListener('mousemove', (e) => {
      starMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      starMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    function initStars() {
      sw = starCanvas.width = window.innerWidth;
      sh = starCanvas.height = window.innerHeight;
      stars = [];
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: Math.random() * sw - sw / 2,
          y: Math.random() * sh - sh / 2,
          z: Math.random() * 1200 + 200,
          size: Math.random() * 1.5 + 0.3,
          hue: Math.random() > 0.8 ? 270 : 185,
        });
      }
    }

    function drawStars() {
      sCtx.clearRect(0, 0, sw, sh);
      const cx = sw / 2;
      const cy = sh / 2;
      stars.forEach((s) => {
        const px = (s.x + starMouseX * 30 * (1 - s.z / 1400)) * (800 / s.z) + cx;
        const py = (s.y + starMouseY * 30 * (1 - s.z / 1400)) * (800 / s.z) + cy;
        const alpha = Math.max(0, Math.min(1, 1 - s.z / 1400)) * 0.8;
        const r = s.size * (800 / s.z);
        sCtx.beginPath();
        sCtx.arc(px, py, Math.max(r, 0.3), 0, Math.PI * 2);
        sCtx.fillStyle = `hsla(${s.hue}, 100%, 75%, ${alpha})`;
        sCtx.fill();
        s.z -= 0.4;
        if (s.z < 1) {
          s.z = 1200 + Math.random() * 200;
          s.x = Math.random() * sw - sw / 2;
          s.y = Math.random() * sh - sh / 2;
        }
      });
      requestAnimationFrame(drawStars);
    }

    initStars();
    drawStars();
    window.addEventListener('resize', initStars);
  }

  /* ========================================
     NEON TRAIL CURSOR
     ======================================== */
  const neonCanvas = document.getElementById('neon-trail');
  if (neonCanvas) {
    const nCtx = neonCanvas.getContext('2d');
    let nw, nh;
    let trail = [];
    const TRAIL_MAX = 25;

    function resizeNeon() {
      nw = neonCanvas.width = window.innerWidth;
      nh = neonCanvas.height = window.innerHeight;
    }

    document.addEventListener('mousemove', (e) => {
      trail.push({ x: e.clientX, y: e.clientY, age: 0 });
      if (trail.length > TRAIL_MAX) trail.shift();
    });

    function drawTrail() {
      nCtx.clearRect(0, 0, nw, nh);
      for (let i = 0; i < trail.length; i++) {
        trail[i].age++;
        const t = trail[i];
        const progress = i / trail.length;
        const alpha = (1 - progress) * 0.6 * Math.max(0, 1 - t.age / 30);
        const radius = 3 + progress * 8;
        if (alpha <= 0) continue;
        nCtx.beginPath();
        nCtx.arc(t.x, t.y, radius, 0, Math.PI * 2);
        nCtx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        nCtx.fill();
        nCtx.beginPath();
        nCtx.arc(t.x, t.y, radius * 0.5, 0, Math.PI * 2);
        nCtx.fillStyle = `rgba(168, 85, 247, ${alpha * 0.6})`;
        nCtx.fill();
      }
      trail = trail.filter((t) => t.age < 30);
      requestAnimationFrame(drawTrail);
    }

    resizeNeon();
    drawTrail();
    window.addEventListener('resize', resizeNeon);
  }

  /* ========================================
     KONAMI CODE (glitch mode)
     ======================================== */
  const KONAMI = [38,38,40,40,37,39,37,39,66,65];
  let konamiIndex = 0;
  let glitchModeActive = false;

  document.addEventListener('keydown', (e) => {
    if (e.keyCode === KONAMI[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === KONAMI.length) {
        konamiIndex = 0;
        glitchModeActive = !glitchModeActive;
        document.body.classList.toggle('glitch-mode', glitchModeActive);
        const badge = document.getElementById('glitch-badge');
        if (badge) {
          badge.classList.toggle('show', glitchModeActive);
          if (glitchModeActive) setTimeout(() => badge.classList.remove('show'), 3000);
        }
        if (glitchModeActive) {
          document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
          setTimeout(() => { document.documentElement.style.filter = ''; }, 5000);
        } else {
          document.documentElement.style.filter = '';
        }
      }
    } else {
      konamiIndex = 0;
    }
  });

  // Glitch command via terminal
  TERM_COMMANDS.glitch = () => {
    glitchModeActive = !glitchModeActive;
    document.body.classList.toggle('glitch-mode', glitchModeActive);
    const badge = document.getElementById('glitch-badge');
    if (badge) {
      badge.classList.toggle('show', glitchModeActive);
      if (glitchModeActive) setTimeout(() => badge.classList.remove('show'), 3000);
    }
    if (glitchModeActive) {
      document.documentElement.style.filter = 'invert(1) hue-rotate(180deg)';
      setTimeout(() => { document.documentElement.style.filter = ''; }, 5000);
    } else {
      document.documentElement.style.filter = '';
    }
    return [
      { text: glitchModeActive ? 'GLITCH MODE: ACTIVATED' : 'GLITCH MODE: DEACTIVATED', cls: 'terminal__output-line--accent' },
      { text: glitchModeActive ? '  Inverting colors for 5 seconds...' : '  Colors restored.' },
    ];
  };

  /* ========================================
     DRAG TO EXPLORE (tech stack)
     ======================================== */
  const techGrid = document.getElementById('tech-grid');
  if (techGrid) {
    let dragSrc = null;
    techGrid.addEventListener('dragstart', (e) => {
      const item = e.target.closest('.tech__item');
      if (!item) return;
      dragSrc = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', '');
    });
    techGrid.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      const item = e.target.closest('.tech__item');
      if (item && item !== dragSrc) item.classList.add('drag-over');
    });
    techGrid.addEventListener('dragleave', (e) => {
      const item = e.target.closest('.tech__item');
      if (item) item.classList.remove('drag-over');
    });
    techGrid.addEventListener('drop', (e) => {
      e.preventDefault();
      const target = e.target.closest('.tech__item');
      if (target && dragSrc && target !== dragSrc) {
        const allItems = [...techGrid.querySelectorAll('.tech__item')];
        const srcIdx = allItems.indexOf(dragSrc);
        const tgtIdx = allItems.indexOf(target);
        if (srcIdx < tgtIdx) {
          techGrid.insertBefore(dragSrc, target.nextSibling);
        } else {
          techGrid.insertBefore(dragSrc, target);
        }
      }
      techGrid.querySelectorAll('.tech__item').forEach((el) => {
        el.classList.remove('dragging', 'drag-over');
      });
    });
    techGrid.addEventListener('dragend', () => {
      techGrid.querySelectorAll('.tech__item').forEach((el) => {
        el.classList.remove('dragging', 'drag-over');
      });
    });
  }

  /* ---- Page Transitions ---- */
  const tvOverlay = document.getElementById('tv-overlay');
  const tvLinks = document.querySelectorAll('a[href$=".html"]');
  const TV_OFF_MS = 550;
  const TV_ON_MS  = 600;

  function buildTvInner() {
    tvOverlay.innerHTML = '<div class="tv-overlay__screen"></div><div class="tv-overlay__beam"></div>';
  }

  function buildGlitchInner() {
    tvOverlay.innerHTML = `
      <div class="glitch-transition__noise"></div>
      <div class="glitch-transition__bars"></div>
      <div class="glitch-transition__flash"></div>
    `;
  }

  function buildScanlineInner() {
    tvOverlay.innerHTML = `
      <div class="scanline-transition__line"></div>
      <div class="scanline-transition__fill"></div>
    `;
  }

  const TRANSITION_MS = { tv: 550, glitch: 500, scanline: 600 };

  // On load: if coming from a transition, play the "on" version then hide
  const savedTransition = sessionStorage.getItem('pageTransition');
  if (savedTransition) {
    sessionStorage.removeItem('pageTransition');
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'none';

    if (savedTransition === 'glitch') {
      buildGlitchInner();
      tvOverlay.style.display = 'flex';
      tvOverlay.classList.add('glitch-in');
      setTimeout(() => {
        tvOverlay.style.display = 'none';
        tvOverlay.classList.remove('glitch-in');
        tvOverlay.innerHTML = '';
        if (preloader) preloader.style.display = '';
      }, TRANSITION_MS.glitch);
    } else if (savedTransition === 'scanline') {
      buildScanlineInner();
      tvOverlay.style.display = 'flex';
      tvOverlay.classList.add('scanline-in');
      setTimeout(() => {
        tvOverlay.style.display = 'none';
        tvOverlay.classList.remove('scanline-in');
        tvOverlay.innerHTML = '';
        if (preloader) preloader.style.display = '';
      }, TRANSITION_MS.scanline);
    } else {
      // tv (default)
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
  }

  // Intercept inter-page links
  tvLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === window.location.pathname.split('/').pop()) return;
      e.preventDefault();
      const type = link.dataset.transition || 'tv';

      if (type === 'glitch') {
        buildGlitchInner();
        tvOverlay.style.display = 'flex';
        tvOverlay.classList.add('glitch-out');
        sessionStorage.setItem('pageTransition', 'glitch');
        setTimeout(() => { window.location.href = href; }, TRANSITION_MS.glitch);
      } else if (type === 'scanline') {
        buildScanlineInner();
        tvOverlay.style.display = 'flex';
        tvOverlay.classList.add('scanline-out');
        sessionStorage.setItem('pageTransition', 'scanline');
        setTimeout(() => { window.location.href = href; }, TRANSITION_MS.scanline);
      } else {
        buildTvInner();
        tvOverlay.style.display = 'flex';
        tvOverlay.classList.add('tv-off');
        sessionStorage.setItem('pageTransition', 'tv');
        setTimeout(() => { window.location.href = href; }, TV_OFF_MS);
      }
    });
  });

})();

/* ── Newsroom-style article modal (global) ── */
window.openNewsModal = (function() {
  return function openNewsModal(opts) {
    opts = opts || {};
    if (document.getElementById('news-modal')) { closeNewsModal(); }

    function closeNewsModal() {
      var m = document.getElementById('news-modal');
      if (!m) return;
      m.classList.add('news-modal--closing');
      setTimeout(function() { if (m && m.parentNode) m.parentNode.removeChild(m); }, 300);
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) { if (e.key === 'Escape') closeNewsModal(); }

    var modal = document.createElement('div');
    modal.className = 'news-modal';
    modal.id = 'news-modal';
    modal.innerHTML =
      '<div class="news-modal__backdrop" data-close></div>' +
      '<div class="news-modal__panel" role="dialog" aria-modal="true">' +
        '<button class="news-modal__close" data-close aria-label="Cerrar">' +
          '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
        '<div class="news-modal__scroll">' +
          '<div class="news-modal__meta">' +
            (opts.tag ? '<span class="news-modal__tag" style="color:' + (opts.tagColor || '#0066cc') + ';border-color:' + (opts.tagColor || '#0066cc') + '30;background:' + (opts.tagColor || '#0066cc') + '15">' + opts.tag + '</span>' : '') +
            '<div class="news-modal__author-row">' +
              '<img class="news-modal__avatar" src="' + opts.avatar + '" alt="' + opts.author + '">' +
              '<div class="news-modal__author-info">' +
                '<span class="news-modal__author">@' + opts.author + '</span>' +
                '<span class="news-modal__date">' + opts.date + '</span>' +
              '</div>' +
            '</div>' +
          '</div>' +
          (opts.project ? '<div class="news-modal__project">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> ' + opts.project +
          '</div>' : '') +
          '<h1 class="news-modal__title">' + opts.title + '</h1>' +
          '<div class="news-modal__body">' + opts.content + '</div>' +
          (opts.link ? '<a href="' + opts.link + '" target="_blank" class="news-modal__link magnetic" data-strength="10">' +
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg> Ver repositorio</a>' : '') +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);

    modal.querySelectorAll('[data-close]').forEach(function(el) {
      el.addEventListener('click', closeNewsModal);
    });
    document.addEventListener('keydown', onKey);

    requestAnimationFrame(function() { modal.classList.add('news-modal--open'); });
  };
})();
