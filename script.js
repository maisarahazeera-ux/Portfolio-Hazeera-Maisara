// ===== 1. Mobile menu: open and close with the ☰ button =====
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');

menuBtn.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', isOpen);
  menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// Close the menu after tapping a link
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
  });
});

// ===== 2. Skill filter tabs =====
const tabs = document.querySelectorAll('.tab');
const skills = document.querySelectorAll('.skill-grid li');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Highlight the clicked tab
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    // Show only skills in that category
    const filter = tab.dataset.filter;
    skills.forEach(skill => {
      const show = filter === 'all' || skill.dataset.cat === filter;
      skill.classList.toggle('hide', !show);
    });
  });
});

// ===== 3. Project detail pop-ups =====
document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.open).showModal();
  });
});

document.querySelectorAll('dialog.detail').forEach(dialog => {
  // Close with the × button
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());
  // Close by clicking the dark area outside the box
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
});

// ===== 4. Contact form: opens the visitor's email app with the message =====
const form = document.getElementById('contact-form');
const note = document.getElementById('form-note');

form.addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = `Portfolio message from ${data.get('name')}`;
  const body = `${data.get('message')}\n\nFrom: ${data.get('name')} (${data.get('email')})`;
  window.location.href =
    `mailto:maisarahazeera@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  note.textContent = 'Your email app should open with the message ready to send.';
});

// ===== 5. Footer year updates itself =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== 6. Lanyard ID card: pull it like a rubber band =====
// The card hangs from a point at the top. While you drag it (or the strap),
// it follows your pointer: the lanyard turns toward you and the strap
// stretches and gets thinner, like rubber. Let go and two springs snap it
// back, so it bounces and wobbles before it settles.
const area = document.querySelector('.lanyard-area');
const lanyard = document.querySelector('.lanyard');
const strap = document.querySelector('.strap');
const card = document.querySelector('.id-card');
const hint = document.querySelector('.drag-hint');
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let restLen = 0;             // strap length when hanging still
let angle = 0, angleVel = 0; // swing, in radians
let len = 0, lenVel = 0;     // current strap length, in px
let dragging = false;
let start = null;            // where the drag began

const ANGLE_SPRING = 0.05;   // how hard the swing pulls back
const LENGTH_SPRING = 0.12;  // how hard the rubber strap snaps back
const DAMPING = 0.93;        // closer to 1 = more bouncy
const MAX_STRETCH = 3.5;     // strap can grow to 3.5x its normal length

function readRestLength() {
  lanyard.style.removeProperty('--strap');
  restLen = parseFloat(getComputedStyle(lanyard).getPropertyValue('--strap'));
  if (!dragging) len = restLen;
}

function draw() {
  const stretch = len / restLen;                       // 1 = normal
  const thin = Math.max(0.45, 1 / Math.sqrt(stretch)); // rubber gets thinner as it stretches
  lanyard.style.setProperty('--angle', `${angle}rad`);
  lanyard.style.setProperty('--strap', `${len}px`);
  strap.style.transform = `scaleX(${thin})`;
}

// The point the lanyard hangs from: top centre of its area
function hangPoint() {
  const box = area.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top };
}

function grab(event) {
  event.preventDefault();
  dragging = true;
  event.currentTarget.setPointerCapture(event.pointerId);
  card.classList.add('dragging');
  if (hint) hint.style.opacity = 0;
  const a = hangPoint();
  const dx = event.clientX - a.x, dy = event.clientY - a.y;
  start = { a, dist: Math.hypot(dx, dy), pointerAngle: Math.atan2(dx, dy), angle, len };
}

function pull(event) {
  if (!dragging) return;
  const dx = event.clientX - start.a.x, dy = event.clientY - start.a.y;
  // Turn by however much the pointer has moved around the hang point
  const turn = Math.atan2(dx, dy) - start.pointerAngle;
  angle = Math.max(-1.3, Math.min(1.3, start.angle - turn));
  // Stretch by however much further away the pointer is now
  const pulled = start.len + (Math.hypot(dx, dy) - start.dist);
  len = Math.max(restLen * 0.6, Math.min(restLen * MAX_STRETCH, pulled));
  angleVel = 0; lenVel = 0;
  draw();
}

function release(event) {
  if (!dragging) return;
  dragging = false;
  card.classList.remove('dragging');
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
}

// You can grab either the card or the strap
[card, strap].forEach(el => {
  el.addEventListener('pointerdown', grab);
  el.addEventListener('pointermove', pull);
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);
});

// Spring physics, run every frame
function tick() {
  if (!dragging) {
    angleVel = (angleVel - angle * ANGLE_SPRING) * DAMPING;
    angle += angleVel;
    lenVel = (lenVel - (len - restLen) * LENGTH_SPRING) * DAMPING;
    len = Math.max(restLen * 0.4, len + lenVel);
    draw();
  }
  requestAnimationFrame(tick);
}

readRestLength();
window.addEventListener('resize', readRestLength);
if (!calm) angleVel = 0.06; // a small swing on page load
draw();
tick();
