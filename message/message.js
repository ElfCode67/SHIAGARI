const chat = document.getElementById("chatWindow");
const dragHandle = document.getElementById("dragHandle");
const minBtn = document.getElementById("minBtn");

let offsetX, offsetY, isDragging = false;

// Drag
dragHandle.onmousedown = (e) => {
  isDragging = true;
  offsetX = e.clientX - chat.offsetLeft;
  offsetY = e.clientY - chat.offsetTop;
};

document.onmousemove = (e) => {
  if (!isDragging) return;
  chat.style.left = e.clientX - offsetX + "px";
  chat.style.top = e.clientY - offsetY + "px";
};

document.onmouseup = () => isDragging = false;

// Minimize
minBtn.onclick = () => {
  chat.classList.toggle("minimized");
};