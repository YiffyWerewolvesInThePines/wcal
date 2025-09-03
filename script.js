let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();
let workData = [];
let confirmedData = [];

function pad(n) {
  return n.toString().padStart(2, "0");
}

function normalizeDate(str) {
  if (!str) return "";
  const parts = str.split("-");
  if (parts.length !== 3) return str;
  return `${parts[0].padStart(4,"0")}-${parts[1].padStart(2,"0")}-${parts[2].padStart(2,"0")}`;
}

function parseCSV(text, type) {
  const rows = text.trim().split("\n");
  rows.shift(); // remove header
  return rows.map(line => {
    const parts = line.match(/("[^"]*"|[^,])+/g) || [];
    if (type === "work") {
      return {
        date: normalizeDate(parts[0]),
        hours: parseFloat(parts[1]) || 0,
        time: parts[2] || "",
        comment: (parts[3] || "").replace(/^"|"$/g, "")
      };
    } else if (type === "confirmed") {
      return {
        date: normalizeDate(parts[0]),
        hours: parseFloat(parts[1]) || 0
      };
    }
  });
}

async function loadCSV() {
  const footer = document.getElementById("footer");
  try {
    const [workResp, confResp] = await Promise.all([
      fetch("work_log.csv"),
      fetch("confirmed.csv")
    ]);

    if (!workResp.ok) {
      footer.textContent = "⚠️ work_log.csv not found.";
      return;
    }

    const workText = await workResp.text();
    if (!workText.trim()) {
      footer.textContent = "⚠️ work_log.csv is empty.";
      return;
    }
    workData = parseCSV(workText, "work");

    if (confResp.ok) {
      const confText = await confResp.text();
      if (confText.trim()) {
        confirmedData = parseCSV(confText, "confirmed");
      }
    }

    renderCalendar(currentYear, currentMonth);
  } catch (err) {
    footer.textContent = "⚠️ Error loading CSV files.";
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

    // work log for this day
    const log = workData.find(r => r.date === dateStr);
    if (log) {
      const intensity = Math.min(1, log.hours / 10);
      const green = 255 - Math.floor(intensity * 155);
      dayElem.style.backgroundColor = `rgb(${green},255,${green})`;

      if (log.time || log.comment) {
        const tooltip = document.createElement("div");
        tooltip.className = "tooltip";
        tooltip.textContent = `${log.hours}h ${log.time}\n${log.comment}`;
        dayElem.appendChild(tooltip);
      }

      dayElem.addEventListener("click", () => openPopup(dateStr, log.hours, log.time, log.comment, []));
    }

    // confirmed for this day
    const confirmed = confirmedData.filter(c => c.date === dateStr);
    if (confirmed.length > 0) {
      dayElem.classList.add("confirmed");
      const fox = document.createElement("div");
      fox.className = "fox";
      fox.textContent = "🦊";
      dayElem.appendChild(fox);

      const totalConfirmed = confirmed.reduce((sum, c) => sum + c.hours, 0);

      dayElem.addEventListener("click", () => {
        openPopup(dateStr, null, null, null, confirmed);
      });
    }

    calendar.appendChild(dayElem);
  }

  // monthly totals
  const totalLogged = workData
    .filter(r => {
      const d = new Date(r.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((sum, r) => sum + (r.hours || 0), 0);

  const totalConfirmed = confirmedData
    .filter(c => {
      const d = new Date(c.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .reduce((sum, c) => sum + (c.hours || 0), 0);

  const diff = totalLogged - totalConfirmed;

  const monthTotalElem = document.getElementById("monthTotal");
  if (totalLogged > 0 || totalConfirmed > 0) {
    let diffText = diff >= 0 ? `+${diff}h` : `${diff}h`;
    let diffColor = diff >= 0 ? "green" : "red";
    monthTotalElem.innerHTML = `
      Logged: ${totalLogged}h<br>
      Confirmed: ${totalConfirmed}h<br>
      Δ: <span style="color:${diffColor}">${diffText}</span>
    `;
  } else {
    monthTotalElem.textContent = "No data this month";
  }
}

function openPopup(dateStr, hours, time, comment, confirmed) {
  const popup = document.getElementById("popup");
  const popupBody = document.getElementById("popupBody");
  if (!popup || !popupBody) return;

  let content = `<b>${dateStr}</b><br>`;
  if (hours !== null) content += `${hours} hours<br>`;
  if (time) content += `${time}<br>`;
  if (comment) content += `${comment}<br>`;
  if (confirmed.length > 0) {
    const totalConfirmed = confirmed.reduce((sum, c) => sum + c.hours, 0);
    content += `<br>🦊 Confirmed: ${totalConfirmed}h`;
  }

  popupBody.innerHTML = content;

  const colors = ["#ffb6c1", "#add8e6", "#90ee90", "#ffd700", "#dda0dd"];
  const randColor = colors[Math.floor(Math.random() * colors.length)];
  document.querySelector(".popup-content").style.borderColor = randColor;

  popup.classList.remove("hidden");
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
