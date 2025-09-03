# 🎯 Goal Calendar

A simple, visual **goal tracker** that lets you set **monthly goals** and track your actual progress.  
Perfect for workouts, study routines, writing projects, or any activity where time invested matters.  

Built with plain HTML, CSS, and JavaScript — no logins, no bloat.  
Just edit CSV files, push to GitHub Pages, and view your calendar online.  

---

## 📂 File Structure

/index.html
/style.css
/script.js
/work_log.csv
/confirmed.csv


- **index.html** → The calendar page.  
- **style.css** → Styling for the calendar, popup, and totals.  
- **script.js** → Logic to load CSV files, render calendar, handle popups.  
- **work_log.csv** → Your actual logged effort.  
- **confirmed.csv** → Your goals (planned or confirmed targets).  

---

## 📜 CSV Formats

### 1. work_log.csv (your actuals)  

date,hours,time,comment
2025-09-01,1,10:00-11:00,"Morning jog"
2025-09-02,2,19:00-21:00,"Gym 🏋️"
2025-09-03,1,20:00-21:00,"Yoga 🧘"


- **date** → `YYYY-MM-DD`  
- **hours** → number of hours you contributed that day  
- **time** → optional (e.g. `19:00-21:00`)  
- **comment** → optional notes  

### 2. confirmed.csv (your goals)  

date,hours
2025-09-01,10
2025-09-15,10
2025-09-30,20


- **date** → `YYYY-MM-DD` (when you set a goal or checkpoint)  
- **hours** → number of hours planned/confirmed for that point in the month  
- Multiple entries in a month accumulate into your total monthly goal.  

---

## 🖼️ Calendar Behavior

- **Logged days** → shaded green (darker = more hours contributed).  
- **Goal days** → 🦊 fox icon + blue border (so they stand out).  
- **Today** → red border.  
- **Weekends** → pink background (Saturdays lighter, Sundays brighter).  
- **Weekdays** → pale gray.  

---

## 📊 Monthly Totals

At the bottom-right of the calendar:  

- **Logged** → actual hours from `work_log.csv`.  
- **Goal (confirmed)** → total goal hours from `confirmed.csv`.  
- **Δ (difference)** = Logged − Goal  
  - Green if ahead of goal (Δ ≥ 0)  
  - Red if behind goal (Δ < 0)  

Example:  

Logged: 25h
Goal: 40h
Δ: -15h ⚠️ (falling behind)


---

## 📌 Popup Details

Click any day to see:  
- Logged hours, time ranges, and comments  
- Confirmed/goal hours for that day  
- Cute pastel border around popup 🎨  

---

## 🚀 Usage

1. Define your **goals** in `confirmed.csv`.  
2. Log your **actuals** in `work_log.csv`.  
3. Push to GitHub Pages:  
   ```bash
   git add work_log.csv confirmed.csv
   git commit -m "update goals and logs"
   git push

Open your GitHub Pages link (e.g. https://username.github.io/repo/).

🦊 Why Goal Calendar?

Visual feedback helps you stay consistent.

Know instantly if you’re ahead or falling behind.

Flexible: use it for workouts, language learning, writing, or side projects.

Cute fox 🦊 marks your goals — so they’re hard to miss!


🌟 Credits

Made with the wings of a sky-dwelling dragon 🐉
and the perseverance of foxes 🦊
