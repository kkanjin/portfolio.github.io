// ── Dark / Light mode toggle ──────────────────────────────────────
function initTheme() {
    const html        = document.documentElement;
    const btn         = document.getElementById('themeToggle');
    const icon        = btn ? btn.querySelector('.theme-icon') : null;
    const saved       = localStorage.getItem('theme') || 'dark';

    html.setAttribute('data-theme', saved);
    if (icon) icon.textContent = saved === 'dark' ? '🌙' : '☀️';

    if (btn) {
        btn.addEventListener('click', () => {
            const current = html.getAttribute('data-theme');
            const next    = current === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('theme', next);
            if (icon) icon.textContent = next === 'dark' ? '🌙' : '☀️';
        });
    }
}

// ── Floating nav — shrinks + glows on scroll ──────────────────────
function initFloatingNav() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 60) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }, { passive: true });
}

// ── Highlight active nav link on scroll ───────────────────────────
function highlightNav() {
    const ids = ['about','stats','experience','skills','projects','maps','contact'];
    const obs = new IntersectionObserver(entries => {
        entries.forEach(en => {
            const link = document.querySelector('.nav a[href="#' + en.target.id + '"]');
            if (link) link.classList.toggle('active', en.isIntersecting);
        });
    }, { threshold: 0.4 });
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) obs.observe(el);
    });
}

// ── Smooth scroll ─────────────────────────────────────────────────
function smoothNav() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const target = document.querySelector(a.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// ── Scroll reveal sections ────────────────────────────────────────
function initReveal() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
}

// ── Animated stat counters ────────────────────────────────────────
function animateCounter(el, target, duration = 1800) {
    const start    = performance.now();
    const isLarge  = target > 100;

    function update(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        const current  = Math.round(eased * target);
        el.textContent = isLarge ? current.toLocaleString() : current;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = isLarge ? target.toLocaleString() : target;
    }
    requestAnimationFrame(update);
}

function initCounters() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const item    = e.target;
                const target  = parseInt(item.getAttribute('data-target'), 10);
                const counter = item.querySelector('.counter');
                if (counter && !item.dataset.animated) {
                    item.dataset.animated = '1';
                    animateCounter(counter, target);
                }
                obs.unobserve(item);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.stat-item[data-target]').forEach(el => obs.observe(el));
}

// ── Animated skill bars ───────────────────────────────────────────
function initSkillBars() {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.querySelectorAll('.skill-bar-fill').forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    if (width) {
                        setTimeout(() => { bar.style.width = width + '%'; }, 200);
                    }
                });
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });
    const skillsSection = document.getElementById('skills');
    if (skillsSection) obs.observe(skillsSection);
}

// ── Build list HTML helper ────────────────────────────────────────
function listHTML(title, arr) {
    if (!Array.isArray(arr) || !arr.length) return '';
    return `
        <div>
            <h4 style="
                color: var(--accent);
                font-family: 'Space Mono', monospace;
                font-size: 0.75em;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin: 14px 0 8px;
            ">${title}</h4>
            <ul style="padding-left: 16px; margin: 0;">
                ${arr.map(x => `
                    <li style="
                        color: var(--muted);
                        font-size: 0.88em;
                        line-height: 1.6;
                        margin: 4px 0;
                    ">${x}</li>
                `).join('')}
            </ul>
        </div>`;
}

// ── Load project panels ───────────────────────────────────────────
async function loadPanels() {
    try {
        const res  = await fetch('assets/projects.json');
        const data = await res.json();
        const host = document.getElementById('story-panels');
        if (!host) return;
        host.innerHTML = '';

        data.forEach(p => {
            const el = document.createElement('section');
            el.className = 'panel';

            const methodsList     = listHTML('Methods',      p.methods);
            const dataList        = listHTML('Data Used',    p['Data']);
            const keyFindingsList = listHTML('Key Findings', p['Key findings']);

            const toolPills = Array.isArray(p.tools) && p.tools.length
                ? `<div class="pills">
                       ${p.tools.map(t => `<span class="pill">⚙ ${t}</span>`).join('')}
                   </div>`
                : '';

            el.innerHTML = `
                <div class="panel-body">
                    <div class="text">
                        <h3>${p.title}</h3>
                        <div class="subtitle">${p.subtitle || ''}</div>
                        <p>${p.description || ''}</p>
                        ${methodsList}
                        <div class="meta">
                            ${dataList}
                            ${keyFindingsList}
                        </div>
                        ${toolPills}
                    </div>
                    <div class="map">
                        <img class="panel-hero"
                             src="${p.hero_image}"
                             alt="${p.title}" />
                    </div>
                </div>`;

            host.appendChild(el);
        });

        // Animate panels in on scroll
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    obs.unobserve(e.target);
                }
            });
        }, { threshold: 0.08 });
        document.querySelectorAll('.panel').forEach(p => obs.observe(p));

    } catch (err) {
        console.error('Could not load projects.json:', err);
    }
}

// ── Init ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initFloatingNav();
    smoothNav();
    highlightNav();
    initReveal();
    initCounters();
    initSkillBars();
    loadPanels();
    document.getElementById('year').textContent = new Date().getFullYear();
});
