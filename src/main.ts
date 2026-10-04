import "./styles/variables.css";
import "./styles/reset.css";
import "./styles/layout.css";
import "./styles/typography.css";
import "./styles/controls.css";
import "./styles/visualization.css";

import { initTheme, isDark, toggleTheme } from "./lib/dark-mode";
import { registerRoutes } from "./router";
import { mountHome } from "./pages/home/index";
import { mountNonlinear } from "./pages/nonlinear/index";
import { mountHiddenCorrelations } from "./pages/hidden-correlations/index";
import { mountQuantumTunneling } from "./pages/quantum-tunneling/index";

initTheme();

const toggle = document.querySelector<HTMLButtonElement>(".theme-toggle")!;
toggle.hidden = false;
toggle.textContent = isDark() ? "☀️" : "🌙";
toggle.addEventListener("click", () => {
  toggleTheme();
  toggle.textContent = isDark() ? "☀️" : "🌙";
});

const content = document.getElementById("page-content")!;

registerRoutes(content, [
  { path: "/", mount: mountHome },
  { path: "/nonlinear", mount: mountNonlinear },
  { path: "/hidden-correlations", mount: mountHiddenCorrelations },
  { path: "/quantum-tunneling", mount: mountQuantumTunneling },
]);
