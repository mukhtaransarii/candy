// =====================================================
//  For Candy 💖  — app.js
// =====================================================

// ---------- Elements ----------
const askScreen   = document.getElementById('askScreen');
const loveScreen  = document.getElementById('loveScreen');
const yesBtn      = document.getElementById('yesBtn');
const noBtn       = document.getElementById('noBtn');
const hint        = document.getElementById('hint');
const kitty       = document.getElementById('kitty');
const kittySlot   = document.getElementById('kittyHappySlot');
const loveMsg     = document.getElementById('loveMsg');
const moreLoveBtn = document.getElementById('moreLoveBtn');
const replayBtn   = document.getElementById('replayBtn');

// ---------- Name from URL:  ?name=Candy ----------
const params   = new URLSearchParams(window.location.search);
const rawName  = (params.get('name') || '').trim().slice(0, 20);   // max 20 chars
const NAME     = rawName
  ? rawName.charAt(0).toUpperCase() + rawName.slice(1)             // candy → Candy
  : 'Cutie';                                                       // fallback

document.querySelectorAll('.js-name').forEach((el) => {
  el.textContent = NAME;            // textContent = safe, no HTML injection
});
document.title = `For ${NAME} 💖`;

// ---------- Config (edit these freely) ----------
const HEARTS = ['💖', '💕', '💗', '💓', '💞', '💘', '❤️', '🩷', '🌸', '✨'];

const NO_TEXTS = [
  'No 🙈', 'Are you sure? 🥺', 'Really?? 😢', 'Think again 💭',
  'Pleaseee 🙏', "Don't do this 😭", "I'll cry 😿", 'Last chance! 💔',
  'You can’t catch me 😜', 'Just press Yes 💖',
];

const HINTS = [
  'Choose wisely, princess 🎀', 'Hehe, nope 😝', 'That button is shy 🙈',
  'Yes is getting bigger 👀', 'The kitty is waiting 🐱', 'Resistance is futile 💘',
];

const LOVE_MESSAGES = [
  'You make every day sweeter than candy 🍬',
  'You are my favourite notification 📱💖',
  'Forever and always, it’s you 🌸',
  `My heart beats in your name, ${NAME} 💓`,
];

let dodgeCount = 0;
let yesScale   = 1;
let rainTimer  = null;

// =====================================================
//  1. Floating background hearts (always on)
// =====================================================
function spawnFloatHeart() {
  const h = document.createElement('div');
  h.className = 'float-heart';
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = 14 + Math.random() * 22 + 'px';
  h.style.animationDuration = 6 + Math.random() * 6 + 's';
  document.getElementById('bgHearts').appendChild(h);
  setTimeout(() => h.remove(), 12000);
}
setInterval(spawnFloatHeart, 500);

// =====================================================
//  2. Runaway NO button
// =====================================================
function moveNoButton() {
  // first dodge → detach from layout so it can roam the whole screen
  if (noBtn.style.position !== 'fixed') {
    const r = noBtn.getBoundingClientRect();
    noBtn.style.position = 'fixed';
    noBtn.style.left = r.left + 'px';
    noBtn.style.top = r.top + 'px';
    document.body.appendChild(noBtn);
  }

  const pad  = 16;
  const maxX = window.innerWidth  - noBtn.offsetWidth  - pad;
  const maxY = window.innerHeight - noBtn.offsetHeight - pad;

  // pick a spot not too close to current position
  let x, y, tries = 0;
  const cur = noBtn.getBoundingClientRect();
  do {
    x = pad + Math.random() * (maxX - pad);
    y = pad + Math.random() * (maxY - pad);
    tries++;
  } while (Math.hypot(x - cur.left, y - cur.top) < 150 && tries < 20);

  noBtn.style.left = x + 'px';
  noBtn.style.top  = y + 'px';
  noBtn.style.transform = `rotate(${Math.random() * 30 - 15}deg)`;

  // fun feedback
  dodgeCount++;
  noBtn.textContent = NO_TEXTS[Math.min(dodgeCount, NO_TEXTS.length - 1)];
  hint.textContent  = HINTS[dodgeCount % HINTS.length];

  // YES grows each time (capped)
  yesScale = Math.min(yesScale + 0.12, 2.2);
  yesBtn.style.transform = `scale(${yesScale})`;
}

// desktop: run on hover · mobile: run on touch · fallback: on click
noBtn.addEventListener('mouseenter', moveNoButton);
noBtn.addEventListener('touchstart', (e) => { e.preventDefault(); moveNoButton(); }, { passive: false });
noBtn.addEventListener('click', (e) => { e.preventDefault(); moveNoButton(); });

// =====================================================
//  3. YES → celebration
// =====================================================
yesBtn.addEventListener('click', (e) => {
  heartBurst(e.clientX, e.clientY, 30);

  // hide NO button wherever it ran off to
  noBtn.style.display = 'none';

  setTimeout(() => {
    askScreen.classList.add('hidden');
    loveScreen.classList.remove('hidden');
    loveScreen.classList.add('flex');

    // move kitty into celebration card, switch to happy face
    kitty.classList.add('happy');
    kittySlot.appendChild(kitty);

    startHeartRain();
    typeMessages();
  }, 350);
});

// ---------- Heart rain ----------
function spawnRainHeart() {
  const h = document.createElement('div');
  h.className = 'rain-heart';
  h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
  h.style.left = Math.random() * 100 + 'vw';
  h.style.fontSize = 18 + Math.random() * 28 + 'px';
  h.style.animationDuration = 2.5 + Math.random() * 3 + 's';
  document.body.appendChild(h);
  setTimeout(() => h.remove(), 6000);
}

function startHeartRain() {
  // big opening shower
  for (let i = 0; i < 60; i++) setTimeout(spawnRainHeart, i * 40);
  // gentle continuous rain
  clearInterval(rainTimer);
  rainTimer = setInterval(spawnRainHeart, 180);

  // a few bursts around the screen
  for (let i = 0; i < 5; i++) {
    setTimeout(() => heartBurst(
      Math.random() * window.innerWidth,
      Math.random() * window.innerHeight * 0.7,
      18
    ), 300 + i * 400);
  }
}

// ---------- Heart burst at a point ----------
function heartBurst(x, y, count = 16) {
  for (let i = 0; i < count; i++) {
    const h = document.createElement('div');
    h.className = 'burst-heart';
    h.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];
    h.style.left = x + 'px';
    h.style.top  = y + 'px';
    h.style.fontSize = 16 + Math.random() * 20 + 'px';
    const angle = Math.random() * Math.PI * 2;
    const dist  = 80 + Math.random() * 160;
    h.style.setProperty('--x', Math.cos(angle) * dist + 'px');
    h.style.setProperty('--y', Math.sin(angle) * dist + 'px');
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1300);
  }
}

// tap anywhere on celebration screen → hearts
loveScreen.addEventListener('click', (e) => {
  if (e.target.closest('button')) return;
  heartBurst(e.clientX, e.clientY, 14);
});

// ---------- Typewriter love messages ----------
let typingToken = 0;
async function typeMessages() {
  const myToken = ++typingToken;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  for (let m = 0; ; m = (m + 1) % LOVE_MESSAGES.length) {
    const text = LOVE_MESSAGES[m];
    for (let i = 1; i <= text.length; i++) {
      if (myToken !== typingToken) return;
      loveMsg.textContent = text.slice(0, i);
      await sleep(45);
    }
    await sleep(1800);
    for (let i = text.length; i >= 0; i--) {
      if (myToken !== typingToken) return;
      loveMsg.textContent = text.slice(0, i);
      await sleep(20);
    }
    await sleep(300);
  }
}

// ---------- Extra buttons ----------
moreLoveBtn.addEventListener('click', (e) => {
  heartBurst(e.clientX, e.clientY, 40);
  for (let i = 0; i < 40; i++) setTimeout(spawnRainHeart, i * 30);
});

replayBtn.addEventListener('click', () => {
  clearInterval(rainTimer);
  typingToken++;
  loveMsg.textContent = '';

  // reset kitty
  kitty.classList.remove('happy');
  document.querySelector('#askScreen .glass').prepend(kitty);

  // reset buttons
  dodgeCount = 0;
  yesScale = 1;
  yesBtn.style.transform = '';
  noBtn.removeAttribute('style');
  noBtn.textContent = NO_TEXTS[0];
  document.getElementById('btnArea').appendChild(noBtn);
  hint.textContent = HINTS[0];

  loveScreen.classList.add('hidden');
  loveScreen.classList.remove('flex');
  askScreen.classList.remove('hidden');
});
