/* ═══════════════════════════════════════════════════════════════════
   Kingsley Kanjin Portfolio — script.js
   Fixes: Methods heading styled, image white-bg removed,
          slideshow uses is-active class consistently
   ═══════════════════════════════════════════════════════════════════ */

// ── Smooth scroll navigation ──────────────────────────────────────
function smoothNav() {
    document.querySelectorAll('.nav a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(a.getAttribute('href'));
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
    });
}

// ── Highlight active nav link on scroll ───────────────────────────
function highlightNav() {
    const ids = ['about', 'experience', 'skills', 'projects', 'maps', 'contact'];
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

// ── Rotate about-section banner images ───────────────────────────
function rotateBanner() {
    const imgs = document.querySelectorAll('.banner img');
    if (!imgs.length) return;
    let i = 0;
    function show() {
        imgs.forEach((im, idx) => im.classList.toggle('show', idx === i));
        i = (i + 1) % imgs.length;
    }
    show();
    setInterval(show, 3500);
}

// ── Build list HTML helper ────────────────────────────────────────
function listHTML(title, arr) {
    if (!Array.isArray(arr) || !arr.length) return '';
    return `
        <div>
            <h4 style="
                color: var(--accent2);
                font-family: 'DM Sans', sans-serif;
                font-size: 0.82em;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.6px;
                margin: 14px 0 8px;
            ">${title}</h4>
            <ul style="
                padding-left: 16px;
                margin: 0;
            ">
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

// ── Load and render project panels ───────────────────────────────
async function loadPanels() {
    try {
        const res  = await fetch('assets/projects.json');
        const data = await res.json();
        const host = document.getElementById('story-panels');
        host.innerHTML = '';

        data.forEach(p => {
            const el = document.createElement('section');
            el.className = 'panel';

            const methodsList     = listHTML('Methods',      p.methods);
            const dataList        = listHTML('Data Used',    p['Data']);
            const keyFindingsList = listHTML('Key Findings', p['Key findings']);

            const toolPills = Array.isArray(p.tools) && p.tools.length
                ? `<div class="pills" style="margin-top:14px;display:flex;flex-wrap:wrap;gap:8px;">
                       ${p.tools.map(t => `
                           <span style="
                               background: rgba(26,107,154,0.15);
                               border: 1px solid var(--border2);
                               color: var(--accent2);
                               border-radius: 20px;
                               padding: 4px 12px;
                               font-size: 0.78em;
                               font-weight: 600;
                               letter-spacing: 0.3px;
                           ">🛠 ${t}</span>`
                       ).join('')}
                   </div>`
                : '';

            el.innerHTML = `
                <div class="panel-body">
                    <div class="text">
                        <h3 style="
                            font-family: 'DM Serif Display', serif;
                            font-size: 1.25em;
                            color: var(--heading);
                            margin-bottom: 6px;
                        ">${p.title}</h3>

                        <div class="subtitle">${p.subtitle || ''}</div>

                        <p style="
                            color: var(--ink);
                            font-size: 0.92em;
                            line-height: 1.75;
                            margin: 10px 0;
                        ">${p.description || ''}</p>

                        ${methodsList}

                        <div class="meta">
                            ${dataList}
                            ${keyFindingsList}
                        </div>

                        ${toolPills}
                    </div>

                    <div class="map">
                        <img
                            class="panel-hero"
                            src="${p.hero_image}"
                            alt="${p.title}"
                            style="
                                width: 100%;
                                height: 440px;
                                object-fit: contain;
                                border-radius: 12px;
                                border: 1px solid var(--border);
                                background: var(--bg2);
                                display: block;
                            "
                        />
                    </div>
                </div>`;

            host.appendChild(el);
        });

        // Animate panels into view on scroll
        const obs = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) e.target.classList.add('visible');
            });
        }, { threshold: 0.12 });
        document.querySelectorAll('.panel').forEach(p => obs.observe(p));

    } catch (err) {
        console.error('Could not load projects.json:', err);
    }
}

// ── Full-width hero slideshow ─────────────────────────────────────
function rotateHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slideshow .slides img');
    if (!slides.length) return;

    // Mark slideshow as JS-controlled (disables CSS fallback animation)
    const section = document.querySelector('.hero-slideshow');
    if (section) section.classList.add('js-active');

    let index = 0;
    // Show first slide immediately
    slides[0].classList.add('is-active');

    setInterval(() => {
        slides[index].classList.remove('is-active');
        index = (index + 1) % slides.length;
        slides[index].classList.add('is-active');
    }, 5000); // rotate every 5 seconds
}

// ── Init on DOM ready ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    smoothNav();
    highlightNav();
    rotateBanner();
    loadPanels();
    rotateHeroSlideshow();
    document.getElementById('year').textContent = new Date().getFullYear();
});
