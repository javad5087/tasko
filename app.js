(() => {
  "use strict";

  const STORAGE_KEY = "weekly-tasks-v1";
  const WEEKDAYS = ["یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه", "شنبه"]; // getDay() → نام

  // ---------- تاریخ جلالی ----------
  const jalaliFmt = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    day: "numeric", month: "long", year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("fa-IR", { hour: "numeric", minute: "2-digit", hour12: false });
  const faNum = new Intl.NumberFormat("fa-IR");

  const jalaliText = (d) => {
    const p = Object.fromEntries(jalaliFmt.formatToParts(d).map((x) => [x.type, x.value]));
    return `${p.day} ${p.month} ${p.year}`;
  };

  const keyOf = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const atNoon = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);

  // شروع هفته: شنبه
  const weekStart = (d, offsetWeeks = 0) => {
    const s = atNoon(d);
    s.setDate(s.getDate() - ((s.getDay() + 1) % 7) + offsetWeeks * 7);
    return s;
  };

  // ---------- ذخیره‌سازی ----------
  let data = {};
  try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { data = {}; }
  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} };

  const uid = () => Math.random().toString(36).slice(2, 10);

  // ---------- وضعیت ----------
  let weekOffset = 0;
  let openKey = keyOf(new Date());

  const daysEl = document.getElementById("days");

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  // ---------- رندر ----------
  function renderWeek() {
    const today = new Date();
    const todayKey = keyOf(today);
    const start = weekStart(today, weekOffset);
    daysEl.replaceChildren();

    // اگر روز باز در این هفته نیست، اولین روز (یا امروز) را باز کن
    const keys = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i); return keyOf(d);
    });
    if (!keys.includes(openKey)) openKey = keys.includes(todayKey) ? todayKey : keys[0];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      const key = keyOf(d);

      const section = el("section", "day");
      section.dataset.key = key;
      section.style.setProperty("--i", i);
      if (key === todayKey) section.classList.add("today");
      if (key === openKey) section.classList.add("open");

      const head = el("button", "day-head");
      head.type = "button";
      head.setAttribute("aria-expanded", key === openKey);
      head.append(el("span", "day-title", WEEKDAYS[d.getDay()]), el("span", "day-count"));
      head.addEventListener("click", () => openDay(key));

      const body = el("div", "day-body");
      const inner = el("div", "day-inner");

      const date = el("p", "day-date");
      date.dataset.date = jalaliText(d);
      inner.append(date, el("ul", "tasks"));

      const add = el("form", "add");
      const input = el("input");
      input.type = "text";
      input.placeholder = "تسک جدید اضافه کن…";
      input.enterKeyHint = "done";
      input.autocomplete = "off";
      input.setAttribute("aria-label", "تسک جدید");
      add.append(input);
      add.addEventListener("submit", (e) => {
        e.preventDefault();
        const t = input.value.trim();
        if (!t) return;
        (data[key] ||= []).push({ id: uid(), t, d: false });
        save();
        input.value = "";
        renderTasks(section);
        input.focus();
      });
      inner.append(add);

      body.append(inner);
      section.append(head, body);
      daysEl.append(section);
      renderTasks(section);
    }
    daysEl.append(el("div", "safe-bottom"));
    updateClock();
  }

  function renderTasks(section) {
    const key = section.dataset.key;
    const list = data[key] || [];
    const ul = section.querySelector(".tasks");
    ul.replaceChildren();

    if (!list.length) {
      const p = el("li", "empty", "هنوز کاری نداری.");
      ul.append(p);
    }

    for (const task of list) {
      const li = el("li", "task" + (task.d ? " done" : ""));
      const cb = el("input", "check");
      cb.type = "checkbox";
      cb.checked = task.d;
      cb.setAttribute("aria-label", task.t);
      cb.addEventListener("change", () => {
        task.d = cb.checked;
        save();
        li.classList.toggle("done", task.d);
        updateCount(section);
      });

      const label = el("span", "task-text", task.t);

      const del = el("button", "del", "×");
      del.type = "button";
      del.setAttribute("aria-label", "حذف");
      del.addEventListener("click", () => {
        data[key] = (data[key] || []).filter((x) => x.id !== task.id);
        if (!data[key].length) delete data[key];
        save();
        renderTasks(section);
      });

      li.append(cb, label, del);
      ul.append(li);
    }
    updateCount(section);
  }

  function updateCount(section) {
    const list = data[section.dataset.key] || [];
    const done = list.filter((x) => x.d).length;
    section.querySelector(".day-count").textContent =
      list.length ? `${faNum.format(done)}/${faNum.format(list.length)}` : "";
  }

  function openDay(key) {
    if (key === openKey) return;
    openKey = key;
    for (const s of daysEl.querySelectorAll(".day")) {
      const isOpen = s.dataset.key === key;
      s.classList.toggle("open", isOpen);
      s.querySelector(".day-head").setAttribute("aria-expanded", isOpen);
    }
    updateClock();
  }

  // تاریخ جلالی + ساعت زیر عنوان روز باز
  function updateClock() {
    const now = new Date();
    for (const s of daysEl.querySelectorAll(".day")) {
      const p = s.querySelector(".day-date");
      const isToday = s.classList.contains("today");
      p.textContent = isToday ? `${p.dataset.date} — ${timeFmt.format(now)}` : p.dataset.date;
    }
  }

  // ---------- کنترل‌ها ----------
  document.getElementById("prevWeek").addEventListener("click", () => { weekOffset--; renderWeek(); });
  document.getElementById("nextWeek").addEventListener("click", () => { weekOffset++; renderWeek(); });
  document.getElementById("todayBtn").addEventListener("click", () => {
    weekOffset = 0; openKey = keyOf(new Date()); renderWeek();
  });

  setInterval(updateClock, 30 * 1000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    // اگر اپ از دیروز باز مانده، به امروز برگرد
    const nowKey = keyOf(new Date());
    if (renderWeek.lastDay && renderWeek.lastDay !== nowKey) { weekOffset = 0; openKey = nowKey; renderWeek(); }
    renderWeek.lastDay = nowKey;
    updateClock();
  });
  renderWeek.lastDay = keyOf(new Date());

  renderWeek();

  // ---------- سرویس‌ورکر (کار آفلاین) ----------
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
  }
})();
