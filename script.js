let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth();

function pad(n) {
  return n.toString().padStart(2, "0");
}

function renderCalendar(year, month) {
  const calendar = document.getElementById("calendar");
  calendar.innerHTML = "";

  const monthYear = document.getElementById("monthYear");
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  monthYear.textContent = firstDay.toLocaleString("default", { month: "long", year: "numeric" });

  const startDay = firstDay.getDay(); // Sunday = 0
  const daysInMonth = lastDay.getDate();

  const offset = (startDay + 6) % 7; // shift to Monday-first

  // empty slots
  for (let i=0; i<offset; i++) {
    const blank = document.createElement("div");
    blank.className = "day blank";
    calendar.appendChild(blank);
  }

  // days
  for (let d=1; d<=daysInMonth; d++) {
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

    calendar.appendChild(dayElem);
  }
}

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

// initial render
renderCalendar(currentYear, currentMonth);
