// ---------- State ----------
const STORAGE_KEY = "studyPlannerTasks";
let tasks = loadTasks();
let currentFilter = "all";

// ---------- DOM ----------
const form = document.getElementById("taskForm");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const filterButtons = document.querySelectorAll(".filter-btn");

// ---------- LocalStorage ----------
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch (e) {
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn("Could not save tasks:", e);
  }
}

// ---------- Helpers ----------
function formatDate(isoDate) {
  const d = new Date(isoDate + "T00:00:00");
  if (isNaN(d)) return isoDate;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function priorityIcon(priority) {
  return { High: "🔴", Medium: "🟡", Low: "🟢" }[priority] || "";
}

// ---------- Actions ----------
function addTask(subject, topic, priority, deadline) {
  tasks.push({
    id: Date.now(),
    subject,
    topic,
    priority,
    deadline,
    completed: false
  });
  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.completed = !task.completed;
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

// ---------- Render ----------
function updateStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

  document.getElementById("totalCount").textContent = total;
  document.getElementById("completedCount").textContent = completed;
  document.getElementById("pendingCount").textContent = pending;
  document.getElementById("progressPercent").textContent = percent + "%";
  document.getElementById("progressDetail").textContent = `${completed} completed / ${total} total`;
  document.getElementById("progressFill").style.width = percent + "%";
}

function render() {
  updateStats();
  taskList.innerHTML = "";

  const visible = tasks.filter(t => {
    if (currentFilter === "pending") return !t.completed;
    if (currentFilter === "completed") return t.completed;
    return true;
  });

  emptyState.classList.toggle("hidden", visible.length > 0);

  visible.forEach(task => {
    const li = document.createElement("li");
    li.className = `task ${task.priority}` + (task.completed ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.completed;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const info = document.createElement("div");
    info.className = "task-info";
    const topic = document.createElement("div");
    topic.className = "task-topic";
    topic.textContent = task.topic;
    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent = `${task.subject} • 📅 ${formatDate(task.deadline)}`;
    info.append(topic, meta);

    const badge = document.createElement("span");
    badge.className = `badge ${task.priority}`;
    badge.textContent = `${priorityIcon(task.priority)} ${task.priority}`;

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.title = "Delete task";
    del.textContent = "🗑";
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, info, badge, del);
    taskList.appendChild(li);
  });
}

// ---------- Events ----------
form.addEventListener("submit", e => {
  e.preventDefault();
  const subject = document.getElementById("subject").value.trim();
  const topic = document.getElementById("topic").value.trim();
  const priority = document.getElementById("priority").value;
  const deadline = document.getElementById("deadline").value;
  if (!subject || !topic || !deadline) return;

  addTask(subject, topic, priority, deadline);
  form.reset();
  document.getElementById("priority").value = "Medium";
  document.getElementById("subject").focus();
});

filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.toggle("active", b === btn));
    render();
  });
});

// ---------- Init ----------
render();
