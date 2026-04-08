import "./styles/variables.css";
import "./styles/reset.css";
import "./styles/layout.css";
import "./styles/typography.css";
import "./styles/controls.css";
import "./styles/visualization.css";

import { initTheme } from "./lib/dark-mode";
import { createLayout } from "./layout";
import { registerRoutes } from "./router";
import { mountHome } from "./pages/home/index";
import { mountNonlinear } from "./pages/nonlinear/index";
import { mountHiddenCorrelations } from "./pages/hidden-correlations/index";
import { mountQuantumTunneling } from "./pages/quantum-tunneling/index";

initTheme();

const app = document.getElementById("app")!;
const content = createLayout(app);

registerRoutes(content, [
  { path: "/", mount: mountHome },
  { path: "/nonlinear", mount: mountNonlinear },
  { path: "/hidden-correlations", mount: mountHiddenCorrelations },
  { path: "/quantum-tunneling", mount: mountQuantumTunneling },
]);
