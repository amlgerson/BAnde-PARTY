const SPEED = 0.4; // vitesse du défilement (pixels / frame)
const GAP = 30;
const STORAGE_KEY = "aml_party_state";

const track = document.getElementById("track");
const checkboxes = document.querySelectorAll("#controls input");

let offset = 0;
let icons = [];

/* =======================
   SAUVEGARDE / CHARGEMENT
======================= */
function saveState() {
  const state = {};
  checkboxes.forEach(cb => {
    state[cb.dataset.id] = cb.checked;
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  const state = JSON.parse(saved);
  checkboxes.forEach(cb => {
    if (state.hasOwnProperty(cb.dataset.id)) {
      cb.checked = state[cb.dataset.id];
    }
  });
}

/* =======================
   CONSTRUCTION DU TRACK
======================= */
function buildTrack() {
  loadState();
  track.innerHTML = "";
  offset = 0;

  const active = [...checkboxes]
    .filter(cb => cb.checked)
    .map(cb => cb.dataset.id);

  if (active.length === 0) return;

  // duplication pour boucle infinie
  icons = [...active, ...active];

  icons.forEach(id => {
    const img = document.createElement("img");
    img.src = `icons/${id}.png`;
    track.appendChild(img);
  });
}

/* =======================
   ANIMATION CONTINUE
======================= */
function animate() {
  if (!track.children.length) {
    requestAnimationFrame(animate);
    return;
  }

  offset -= SPEED;

  const firstIcon = track.children[0];
  const iconWidth = firstIcon.offsetWidth + GAP;
  const resetPoint = iconWidth * (icons.length / 2);

  if (Math.abs(offset) >= resetPoint) {
    offset = 0;
  }

  track.style.transform = `translateX(${offset}px)`;
  requestAnimationFrame(animate);
}

/* =======================
   EVENTS
======================= */
checkboxes.forEach(cb =>
  cb.addEventListener("change", () => {
    saveState();
    buildTrack();
  })
);

// synchro inter-onglets (OBS <-> navigateur)
window.addEventListener("storage", () => {
  buildTrack();
});

/* =======================
   MODE OBS
======================= */
const params = new URLSearchParams(window.location.search);
if (params.get("controls") === "0") {
  document.getElementById("controls").style.display = "none";
}

/* =======================
   INIT
======================= */
buildTrack();
requestAnimationFrame(animate);
