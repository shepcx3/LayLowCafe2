// Lay Low Cafe — small progressive enhancements. The page works without JS.
document.documentElement.classList.add("js");

// Opening hours in 24h time, Kingston local time. Index 0 = Sunday.
// Keep in sync with the hours text and the JSON-LD in index.html.
const HOURS = [
  [7, 16], // Sun
  [7, 16], // Mon
  [7, 16], // Tue
  [7, 16], // Wed
  [7, 16], // Thu
  [7, 16], // Fri
  [7, 16], // Sat
];

function kingstonNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Toronto",
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type) => parts.find((p) => p.type === type).value;
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

function fmt(hour) {
  const h = hour % 12 || 12;
  return `${h}${hour < 12 ? "am" : "pm"}`;
}

function openStatus() {
  const { day, minutes } = kingstonNow();
  const [open, close] = HOURS[day];
  if (minutes >= open * 60 && minutes < close * 60) {
    return { open: true, label: `Open now · until ${fmt(close)}` };
  }
  if (minutes < open * 60) {
    return { open: false, label: `Opens today at ${fmt(open)}` };
  }
  const [nextOpen] = HOURS[(day + 1) % 7];
  return { open: false, label: `Closed · opens ${fmt(nextOpen)}` };
}

// Live open/closed pill
const status = openStatus();
document.querySelectorAll("[data-open-status]").forEach((el) => {
  el.classList.add(status.open ? "is-open" : "is-closed");
  el.querySelector(".label").textContent = status.label;
});

// Header border once scrolled
const header = document.querySelector(".site-header");
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Menu tabs. Without JS every category simply shows, one after another.
const tablist = document.querySelector('[role="tablist"]');
if (tablist) {
  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  };
  tablist.hidden = false;
  select(tabs[0]);
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(tab));
    tab.addEventListener("keydown", (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      const next = tabs[(i + step + tabs.length) % tabs.length];
      select(next);
      next.focus();
    });
  });
}

// Late Night: hide events once their day is over (Kingston time), so the list never goes stale.
const eventList = document.querySelector("[data-events]");
if (eventList) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date()); // YYYY-MM-DD
  eventList.querySelectorAll("[data-date]").forEach((li) => {
    if (li.dataset.date < today) li.remove();
  });
  if (!eventList.querySelector("[data-date]")) {
    document.querySelector("[data-events-empty]").hidden = false;
  }
}

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
