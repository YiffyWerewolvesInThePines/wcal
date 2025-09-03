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
    // split CSV safely
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

  for (let i=0; i<offset; i++) {
    const blank = document.createElement("div");
    blank.className = "day blank";
    calendar.appendChild(blank);
  }

  for (let d=1; d<=daysInMonth; d++) {
    const dateStr = `${year}-$
