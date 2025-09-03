let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let workData = [];

function pad(n) {
  return n.toString().padStart(2, "0");
}

function normalizeDate(str) {
  if (!str) return "";
  const parts = str.split("-");
  if (parts.length !== 3) return str;
  return `${parts[0].padStart(4,"0")}-${parts[1].padStart(2,"0")}-${parts[2].padStart(2,"0")}`;
}

function parseCSV(text) {
  const rows = text.trim().split("\n");
  rows.shift(); // remove header
  return rows.map(line => {
    const parts = line.match(/("[^"]*"|[^,])+/g) || [];
    return {
      date: normalizeDate(parts[0]),
      hours: parseFloat(parts[1]) || 0,
      time: parts[2] || "",
      comment: (parts[3] || "").replace(/^"|"$/g, "")
    };
  });
}

async function loadCSV() {
  const footer = document.getElementById("footer");
  try {
    const resp = await fetch("work_log.csv");
    if (!resp.ok) {
      footer.textContent = "⚠️ work_log.csv not found.";
      return;
    }

    const text = await resp.text();
    if (!text.trim()) {
      footer.textContent = "⚠️ work_log.csv is empty.";
      return;
    }

    workData = parseCSV(text);

    const lastModified = resp.headers.get("Last-Modified");
    if (lastModified) {
      const lmDate = new Date(lastModified);
      footer.textContent = `Last updated: ${lmDate.toLocaleString()}`;
    } else {
      footer.textContent = "work_log.csv loaded.";
    }

    renderCalendar(currentYear, currentMonth);
  } catch (err) {
    footer.textContent = "⚠️ Error loading work_log.csv.";
    console.error(err);
  }
}

function renderCalendar(year, month) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const monthYear = document.getElementById("monthYear");
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  monthYear.textContent = firstDay.toLocaleString("default", { month: "long", year: "numeric" });

  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const offset = (startDay + 6) % 7; // Monday first

  // blank leading cells
  for (let i = 0; i < offset; i++) {
    const blank = document.createElement("div");
    blank.className = "day blank";
    calendar.appendChild(blank);
  }

  // actual days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    const cellDate = new Date(year, month, d);
    const weekday = cellDate.getDay();

    const dayElem = document.createElement("div");
    dayElem.className = "day";
    if (weekday === 6) dayElem.classList.add("saturday");
    if (weekday === 0) dayElem.classList.add("sunday");

    const number = document.createElement("div");
    number.className = "day-number";
    number.textContent = d;
    dayElem.appendChild(number);

    // highlight today
    const today = new Date();
    if (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      d === today.getDate()
    ) {
      dayElem.classList.add("today");
    }

    // find work log for this day
    const log = workData.find(r => r.date === dateStr);
    if (log) {
      // color intensity (1–10h)
      const intensity = Math.min(1, log.hours / 10);
      const green = 255 - Math.floor(intensity * 155);
      dayElem.style.backgroundColor = `rgb(${green},255,${green})`;

      // calculate monthly total
    const totalHours = workData
      .filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .reduce((sum, r) => sum + (r.hours || 0), 0);

document.getElementById("monthTotal").textContent = 
  `Total: ${totalHours}h`;


      // tooltip
      if (log.time || log.comment) {
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.textContent = `${log.hours}h ${log.time}\n${log.comment}`;
        dayElem.appendChild(tooltip);
      }

      // click popup
      dayElem.addEventListener("click", () => {
  const popup = document.getElementById("popup");
  const popupBody = document.getElementById("popupBody");
  if (!popup || !popupBody) {
    console.warn("Popup elements missing");
    return;
  }

  popupBody.innerHTML =
    `<b>${dateStr}</b><br>${log.hours} hours<br>${log.time}<br>${log.comment}`;

  // random pastel border
  const colors = ["#ffb6c1", "#add8e6", "#90ee90", "#ffd700", "#dda0dd"];
  const randColor = colors[Math.floor(Math.random() * colors.length)];
  document.querySelector(".popup-content").style.borderColor = randColor;

  popup.classList.remove("hidden");
});

      
    }

    calendar.appendChild(dayElem);
  }
}

// navigation
document.getElementById("prevMonth").addEventListener("click", () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar(currentYear, currentMonth);
});

document.getElementById("nextMonth").addEventListener("click", () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar(currentYear, currentMonth);
});

// close popup
const popupClose = document.getElementById("popupClose");
if (popupClose) {
  popupClose.addEventListener("click", () => {
    document.getElementById("popup").classList.add("hidden");
  });
}

// initial load
loadCSV();
