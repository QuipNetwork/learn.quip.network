import { initTheme, isDark, toggleTheme } from "./lib/dark-mode";

initTheme();

const toggle = document.querySelector<HTMLButtonElement>(".theme-toggle")!;
toggle.hidden = false;
toggle.textContent = isDark() ? "☀️" : "🌙";
toggle.addEventListener("click", () => {
  toggleTheme();
  toggle.textContent = isDark() ? "☀️" : "🌙";
});
