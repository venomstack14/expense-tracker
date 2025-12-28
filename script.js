const monthPicker = document.getElementById("monthPicker");
const list = document.getElementById("list");
const pie = pieChart.getContext("2d");

const categoryColors = {
  Food: "#f97316",
  Transport: "#22c55e",
  Shopping: "#a855f7",
  Entertainment: "#ec4899",
  Other: "#64748b"
};

let store = JSON.parse(localStorage.getItem("expensePro")) || {};
let deleted = null;

monthPicker.value = new Date().toISOString().slice(0,7);

function getMonthData() {
  return store[monthPicker.value] || [];
}

function saveMonth(data) {
  store[monthPicker.value] = data;
  localStorage.setItem("expensePro", JSON.stringify(store));
}

function render() {
  const data = getMonthData();
  list.innerHTML = "";

  if (!data.length) {
    list.innerHTML = `<p class="empty">No transactions this month 💸</p>`;
  }

  let inc = 0, exp = 0, cats = {};

  data.forEach(t => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <span>${t.title} • ${t.category}</span>
      <strong>₹${t.amount}</strong>
    `;
    div.onclick = () => remove(t.id);
    list.appendChild(div);

    t.type === "income" ? inc += t.amount : exp += t.amount;
    if (t.type === "expense")
      cats[t.category] = (cats[t.category] || 0) + t.amount;
  });

  income.textContent = `₹${inc}`;
  expense.textContent = `₹${exp}`;
  balance.textContent = `₹${inc - exp}`;

  checkLimit(exp);
  drawPie(cats);
}

function drawPie(data) {
  pie.clearRect(0,0,260,260);
  const total = Object.values(data).reduce((a,b)=>a+b,0);
  let angle = 0;

  Object.entries(data).forEach(([cat,val])=>{
    const slice = (val/total)*Math.PI*2;
    pie.beginPath();
    pie.moveTo(130,130);
    pie.fillStyle = categoryColors[cat];
    pie.arc(130,130,100,angle,angle+slice);
    pie.fill();
    angle += slice;
  });
}

function remove(id) {
  const data = getMonthData();
  const index = data.findIndex(t=>t.id===id);
  deleted = data.splice(index,1)[0];
  saveMonth(data);
  undoToast.style.display="flex";
  setTimeout(()=>undoToast.style.display="none",4000);
  render();
}

undoBtn.onclick = () => {
  if (deleted) {
    const data = getMonthData();
    data.push(deleted);
    saveMonth(data);
    deleted = null;
    undoToast.style.display="none";
    render();
  }
};

addBtn.onclick = () => {
  if (!title.value || !amount.value) return;

  const data = getMonthData();
  data.push({
    id: Date.now(),
    title: title.value,
    amount: +amount.value,
    category: category.value,
    type: type.value
  });

  saveMonth(data);
  title.value = amount.value = "";
  render();
};

monthPicker.onchange = render;

limitInput.onchange = () => {
  localStorage.setItem("limit-"+monthPicker.value, limitInput.value);
};

function checkLimit(exp) {
  const limit = localStorage.getItem("limit-"+monthPicker.value);
  limitWarning.textContent =
    limit && exp > limit
    ? "⚠ You’ve crossed your monthly spending goal"
    : "";
}

document.onkeydown = e => {
  if (e.key === "Enter") addBtn.click();
  if (e.ctrlKey && e.key === "d") document.body.classList.toggle("dark");
  if (e.ctrlKey && e.key === "z") undoBtn.click();
};

render();
