const SPEED = 0.4;
const GAP = 30;
const STORAGE_KEY = "aml_party_state";
const CHANNEL_NAME = "aml_party_channel";

const track = document.getElementById("track");
const checkboxes = document.querySelectorAll("#controls input");
const channel = new BroadcastChannel(CHANNEL_NAME);

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
  channel.postMessage(state); // 🔥 synchro OBS
}

function loadState(stateFromChannel = null) {
  const state = stateFromChannel
    ? stateFromChannel
    : JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

  checkboxes.forEach(cb => {
    if (state.hasOwnProperty(cb.dataset.id)) {
      cb.checked = state[cb.dataset.id];
    }
  });
}

/* =======================
   CONSTRUCTION DU TRACK
======================= */
function buildTrack(state = null) {
  loadState(state);
  track.innerHTML = "";
  offset = 0;

  const active = [...checkboxes]
    .filter(cb => cb.checked)
    .map(cb => cb.dataset.id);

  if (active.length === 0) return;

  const loopIcons = [...active, ...active];

  loopIcons.forEach(id => {
    const img = document.createElement("img");
    img.src = `icons/${id}.png`;
    track.appendChild(img);
  });

  icons = loopIcons;
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

  const iconWidth = track.children[0].offsetWidth + GAP;
  const resetPoint = iconWidth * (icons.length / 2);

  if (Math.abs(offset) >= resetPoint) offset = 0;

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

// 🔥 RÉCEPTION DES UPDATES (OBS)
channel.onmessage = (event) => {
  buildTrack(event.data);
};

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
