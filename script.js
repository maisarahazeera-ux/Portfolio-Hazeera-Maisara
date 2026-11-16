/* =========================================================
   script.js: makes the page interactive
   1. Phone menu (☰)
   2. Skill filter tabs
   3. Project detail pop-ups (+ 3b. screenshot sliders)
   4. Contact form
   5. Footer year
   6. Stretchy lanyard ID card
   ========================================================= */


// ===== 1. Phone menu: open and close with the ☰ button =====

// Find the ☰ button and the menu in the HTML
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');

// When ☰ is clicked...
menuBtn.addEventListener('click', () => {
  // toggle() adds "open" if it's missing, removes it if it's there; returns true if now open
  const isOpen = menu.classList.toggle('open');
  // Tell screen readers whether the menu is open (also turns ☰ into × in the CSS)
  menuBtn.setAttribute('aria-expanded', isOpen);
  menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
});

// Close the menu after tapping any link inside it
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', false);
  });
});


// ===== 2. Skill filter tabs =====

const tabs = document.querySelectorAll('.tab');               // All, Frontend, Backend...
const skills = document.querySelectorAll('.skill-grid li');   // every skill box

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    // Un-highlight every tab...
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    // ...then highlight only the one that was clicked
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    // Read which category this tab is for, from data-filter="..." in the HTML
    const filter = tab.dataset.filter;

    // Show a skill if "All" is chosen or its data-cat matches; hide the rest
    skills.forEach(skill => {
      const show = filter === 'all' || skill.dataset.cat === filter;
      skill.classList.toggle('hide', !show);   // add "hide" when show is false
    });
  });
});


// ===== 3. Project detail pop-ups =====

// Every "View details" button has data-open="id-of-its-dialog"
document.querySelectorAll('[data-open]').forEach(button => {
  button.addEventListener('click', () => {
    // showModal() opens the <dialog> on top of the page and darkens the background
    const dialog = document.getElementById(button.dataset.open);
    dialog.showModal();
    // Start every screenshot slider from the first picture
    dialog.querySelectorAll('.slides').forEach(track => track.scrollTo({ left: 0, behavior: 'instant' }));
  });
});

document.querySelectorAll('dialog.detail').forEach(dialog => {
  // Close with the × button
  dialog.querySelector('.close').addEventListener('click', () => dialog.close());

  // Close by clicking the dark area outside the box
  // (clicking outside counts as clicking the dialog itself, not something inside it)
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  // Pressing Esc also closes it; the browser does that by itself
});


// ===== 3b. Screenshot sliders inside the pop-ups =====
// The slides scroll sideways (CSS scroll-snap), so swiping already works.
// This adds the ‹ › buttons, the dots, the "1 / 5" counter and arrow keys.

document.querySelectorAll('.slider').forEach(slider => {
  const track = slider.querySelector('.slides');           // the row that scrolls
  const slides = slider.querySelectorAll('.slide');
  const prev = slider.querySelector('.prev');
  const next = slider.querySelector('.next');
  const dotsBox = slider.querySelector('.dots');
  const count = slider.querySelector('.count');

  // Make one dot per slide
  const dots = [...slides].map((slide, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot';
    dot.setAttribute('aria-label', `Show screenshot ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsBox.appendChild(dot);
    return dot;
  });

  // Which slide is showing now? (how far it has scrolled ÷ one slide's width)
  function current() {
    if (!track.clientWidth) return 0;                      // pop-up still closed: width is 0
    return Math.round(track.scrollLeft / track.clientWidth);
  }

  // Scroll to slide number i (0 = first)
  function goTo(i) {
    const last = slides.length - 1;
    i = Math.max(0, Math.min(last, i));                    // stay within the first and last slide
    track.scrollTo({ left: i * track.clientWidth });
  }

  // Update the dots, counter and buttons to match the current slide
  function update() {
    const i = current();
    dots.forEach((dot, d) => dot.classList.toggle('active', d === i));
    count.textContent = `${i + 1} / ${slides.length}`;
    prev.disabled = i === 0;                               // can't go back from the first
    next.disabled = i === slides.length - 1;               // can't go forward from the last
  }

  prev.addEventListener('click', () => goTo(current() - 1));
  next.addEventListener('click', () => goTo(current() + 1));
  track.addEventListener('scroll', update);                // also runs after a swipe

  // Arrow keys work while this slider's pop-up is open
  slider.closest('dialog').addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft')  goTo(current() - 1);
    if (event.key === 'ArrowRight') goTo(current() + 1);
  });

  update();
});


// ===== 4. Contact form =====
// GitHub Pages has no server, so the form can't send email by itself.
// Instead it opens the visitor's email app with everything filled in.

const form = document.getElementById('contact-form');
const note = document.getElementById('form-note');   // small message under the button

form.addEventListener('submit', event => {
  event.preventDefault();               // stop the page from reloading

  const data = new FormData(form);      // read the name, email and message boxes
  const subject = `Portfolio message from ${data.get('name')}`;
  const body = `${data.get('message')}\n\nFrom: ${data.get('name')} (${data.get('email')})`;

  // A mailto: link opens the email app; encodeURIComponent makes spaces and symbols safe in a link
  window.location.href =
    `mailto:maisarahazeera@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  note.textContent = 'Your email app should open with the message ready to send.';
});


// ===== 5. Footer year updates itself =====
// So "© 2026" becomes "© 2027" next year without editing the HTML
document.getElementById('year').textContent = new Date().getFullYear();


// ===== 6. Lanyard ID card: pull it like a rubber band =====
// The card hangs from a point at the top. While you drag it (or the strap),
// the lanyard turns toward your pointer and the strap stretches and gets thinner.
// Let go and two "springs" pull it back, so it bounces and wobbles, then settles.

// Find the parts in the HTML
const area = document.querySelector('.lanyard-area');   // the space it hangs in
const lanyard = document.querySelector('.lanyard');     // strap + clip + card together
const strap = document.querySelector('.strap');
const card = document.querySelector('.id-card');
const hint = document.querySelector('.drag-hint');      // "Grab the card and pull it"

// true if the visitor turned off animations in their device settings
const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Numbers that change while it moves
let restLen = 0;             // strap length when hanging still (read from the CSS)
let angle = 0, angleVel = 0; // current swing (in radians) and how fast it's swinging
let len = 0, lenVel = 0;     // current strap length (px) and how fast it's changing
let dragging = false;        // is someone holding it right now?
let start = null;            // where the drag began

// Settings you can play with
const ANGLE_SPRING = 0.05;   // how hard the swing pulls back to the middle
const LENGTH_SPRING = 0.12;  // how hard the rubber strap snaps back
const DAMPING = 0.93;        // closer to 1 = bouncier (try 0.98 for jelly, 0.7 for stiff)
const MAX_STRETCH = 3.5;     // strap can grow to 3.5x its normal length

// Read the normal strap length from the CSS (--strap), e.g. 150px on desktop, 90px on phone
function readRestLength() {
  lanyard.style.removeProperty('--strap');   // remove any value we set, to see the CSS one
  restLen = parseFloat(getComputedStyle(lanyard).getPropertyValue('--strap'));
  if (!dragging) len = restLen;
}

// Send the current numbers to the CSS, which actually moves things on screen
function draw() {
  const stretch = len / restLen;                       // 1 = normal, 2 = twice as long...
  const thin = Math.max(0.45, 1 / Math.sqrt(stretch)); // rubber gets thinner as it stretches
  lanyard.style.setProperty('--angle', `${angle}rad`);
  lanyard.style.setProperty('--strap', `${len}px`);
  strap.style.transform = `scaleX(${thin})`;
}

// The point the lanyard hangs from: top centre of its area, in screen coordinates
function hangPoint() {
  const box = area.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top };
}

// When you press down on the card or strap
function grab(event) {
  event.preventDefault();                           // stop text selection / image dragging
  dragging = true;
  event.currentTarget.setPointerCapture(event.pointerId);   // keep following the pointer even if it leaves the card
  card.classList.add('dragging');                   // closed-hand cursor
  if (hint) hint.style.opacity = 0;                 // fade out the hint, they've found it

  // Remember where we started: distance and angle from the hang point to the pointer
  const a = hangPoint();
  const dx = event.clientX - a.x, dy = event.clientY - a.y;
  start = {
    a,
    dist: Math.hypot(dx, dy),            // straight-line distance (Pythagoras)
    pointerAngle: Math.atan2(dx, dy),    // angle from the hang point to the pointer
    angle,                               // the lanyard's angle at that moment
    len                                  // the strap's length at that moment
  };
}

// While you move the pointer (only does something if you're holding it)
function pull(event) {
  if (!dragging) return;
  const dx = event.clientX - start.a.x, dy = event.clientY - start.a.y;

  // Turn by however much the pointer has moved around the hang point
  const turn = Math.atan2(dx, dy) - start.pointerAngle;
  angle = Math.max(-1.3, Math.min(1.3, start.angle - turn));   // limit to about ±75°

  // Stretch by however much further away the pointer is now
  const pulled = start.len + (Math.hypot(dx, dy) - start.dist);
  len = Math.max(restLen * 0.6, Math.min(restLen * MAX_STRETCH, pulled));   // keep within limits

  angleVel = 0; lenVel = 0;   // no leftover bounce while holding
  draw();
}

// When you let go
function release(event) {
  if (!dragging) return;
  dragging = false;           // tick() below takes over and springs it back
  card.classList.remove('dragging');
  if (event.currentTarget.hasPointerCapture(event.pointerId)) {
    event.currentTarget.releasePointerCapture(event.pointerId);
  }
}

// You can grab either the card or the strap. Pointer events work for mouse, touch and pen.
[card, strap].forEach(el => {
  el.addEventListener('pointerdown', grab);
  el.addEventListener('pointermove', pull);
  el.addEventListener('pointerup', release);
  el.addEventListener('pointercancel', release);   // e.g. a phone call interrupts the touch
});

// Spring physics, run every frame (about 60 times a second)
function tick() {
  if (!dragging) {
    // Swing: the further from the middle, the harder it's pulled back; DAMPING slowly removes energy
    angleVel = (angleVel - angle * ANGLE_SPRING) * DAMPING;
    angle += angleVel;

    // Strap: the more it's stretched, the harder it snaps back; never shorter than 40%
    lenVel = (lenVel - (len - restLen) * LENGTH_SPRING) * DAMPING;
    len = Math.max(restLen * 0.4, len + lenVel);

    draw();
  }
  requestAnimationFrame(tick);   // ask the browser to run tick() again on the next frame
}

// Start everything
readRestLength();
window.addEventListener('resize', readRestLength);   // phone and desktop have different strap lengths
if (!calm) angleVel = 0.06;                          // a small swing when the page loads
draw();
tick();
