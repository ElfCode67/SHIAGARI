const btn = document.querySelector(".post-box button");
const input = document.querySelector(".post-box input");
const main = document.querySelector(".main");

btn.onclick = () => {
  if (!input.value.trim()) return;

  const post = document.createElement("div");
  post.className = "post";
  post.innerHTML = `
    <div class="user">
      <img src="https://via.placeholder.com/40">
      <h4>You</h4>
    </div>
    <p>${input.value}</p>
  `;

  main.appendChild(post);
  input.value = "";
};