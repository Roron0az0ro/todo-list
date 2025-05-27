const addBtn = document.getElementById("addBtn");
const taskInput = document.getElementById("taskInput");
const deadlineInput = document.getElementById("deadlineInput");
const priorityInput = document.getElementById("priorityInput");
const sortFilter = document.getElementById("sortFilter");
const taskList = document.getElementById("taskList");
const totalCountEl = document.getElementById("totalCount");
const completedCountEl = document.getElementById("completedCount");
const remainingCountEl = document.getElementById("remainingCount");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

function updateDateTime() {
  const dateTimeEl = document.getElementById("dateTime");
  const now = new Date();
  dateTimeEl.textContent = now.toLocaleString();
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    emptyMessage.style.display = "block";
  } else {
    emptyMessage.style.display = "none";
  }

  const sortedTasks = [...tasks];
  const sortBy = sortFilter.value;

  sortedTasks.sort((a, b) => {
    if (sortBy === "created") return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === "deadline") return new Date(a.deadline || Infinity) - new Date(b.deadline || Infinity);
    if (sortBy === "priority") {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
  });

  sortedTasks.forEach((task, index) => {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");

    const span = document.createElement("span");
    span.textContent = `${task.text} (${task.priority})`;

    span.addEventListener("click", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.textContent = "✏️";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () => {
      const newText = prompt("Edit Task:", task.text);
      if (newText !== null && newText.trim() !== "") {
        task.text = newText.trim();
      }

      const newDeadline = prompt("Edit Deadline (YYYY-MM-DD):", task.deadline || "");
      if (newDeadline !== null) {
        task.deadline = newDeadline.trim() || null;
      }

      const newPriority = prompt("Edit Priority (low, medium, high):", task.priority);
      if (["low", "medium", "high"].includes(newPriority)) {
        task.priority = newPriority;
      }

      saveTasks();
      renderTasks();
    });

    const meta = document.createElement("div");
    meta.classList.add("task-meta");
    const createdAt = new Date(task.createdAt);
    meta.innerHTML = `🕒 Created: ${createdAt.toLocaleDateString()}`;

    if (task.deadline) {
      const deadlineDate = new Date(task.deadline);
      meta.innerHTML += ` | 📅 Deadline: ${deadlineDate.toLocaleDateString()}`;

      const today = new Date();
      const daysLeft = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));

      if (daysLeft <= 1) {
        const reminder = document.createElement("div");
        reminder.classList.add("reminder");
        reminder.textContent =
          daysLeft === 0 ? "⚠️ Deadline is today!" :
          daysLeft < 0 ? "⛔ Deadline passed!" : "⚠️ Due tomorrow!";
        li.appendChild(reminder);
      }
    }

    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.classList.add("remove-btn");
    removeBtn.addEventListener("click", () => {
      tasks.splice(index, 1);
      saveTasks();
      renderTasks();
    });

    li.appendChild(span);
    li.appendChild(meta);
    li.appendChild(editBtn);
    li.appendChild(removeBtn);
    taskList.appendChild(li);
  });

  updateCounts();
}

function updateCounts() {
  totalCountEl.textContent = tasks.length;
  const completedCount = tasks.filter(t => t.completed).length;
  completedCountEl.textContent = completedCount;
  remainingCountEl.textContent = tasks.length - completedCount;
}

function addTask() {
  const text = taskInput.value.trim();
  const deadline = deadlineInput.value;
  const priority = priorityInput.value;

  if (text === "") return;

  const newTask = {
    text,
    deadline: deadline || null,
    priority,
    createdAt: new Date().toISOString(),
    completed: false
  };

  tasks.push(newTask);
  saveTasks();
  renderTasks();

  taskInput.value = "";
  deadlineInput.value = "";
  priorityInput.value = "low";
}

addBtn.addEventListener("click", addTask);
sortFilter.addEventListener("change", renderTasks);

setInterval(updateDateTime, 1000);
updateDateTime();
renderTasks();