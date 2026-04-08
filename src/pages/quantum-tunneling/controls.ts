import { LandscapeCanvas } from "./LandscapeCanvas";

export function createTunnelingControls(
  canvas: LandscapeCanvas,
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "viz-controls";

  // 1. Starting position slider
  const sliderGroup = document.createElement("div");
  sliderGroup.className = "control-group";

  const sliderLabel = document.createElement("label");
  sliderLabel.textContent = "Starting position";

  const sliderValue = document.createElement("span");
  sliderValue.className = "control-value";
  sliderValue.textContent = "22";

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = "10";
  slider.max = "40";
  slider.step = "1";
  slider.value = "22";
  slider.setAttribute("aria-label", "Starting position");

  slider.addEventListener("input", () => {
    const val = Number(slider.value);
    sliderValue.textContent = String(val);
    canvas.setStartX(val);
  });

  sliderGroup.append(sliderLabel, slider, sliderValue);

  // 2. Show classical path checkbox
  const classicalGroup = document.createElement("div");
  classicalGroup.className = "control-group";

  const classicalCheck = document.createElement("div");
  classicalCheck.className = "checkbox-group";

  const classicalInput = document.createElement("input");
  classicalInput.type = "checkbox";
  classicalInput.checked = true;
  classicalInput.id = "qt-classical";

  const classicalLabel = document.createElement("label");
  classicalLabel.textContent = "Show classical path";
  classicalLabel.setAttribute("for", "qt-classical");

  classicalInput.addEventListener("change", () => {
    canvas.setShowClassical(classicalInput.checked);
  });

  classicalCheck.append(classicalInput, classicalLabel);
  classicalGroup.append(classicalCheck);

  // 3. Show quantum tunneling checkbox
  const quantumGroup = document.createElement("div");
  quantumGroup.className = "control-group";

  const quantumCheck = document.createElement("div");
  quantumCheck.className = "checkbox-group";

  const quantumInput = document.createElement("input");
  quantumInput.type = "checkbox";
  quantumInput.checked = true;
  quantumInput.id = "qt-quantum";

  const quantumLabel = document.createElement("label");
  quantumLabel.textContent = "Show quantum tunneling";
  quantumLabel.setAttribute("for", "qt-quantum");

  quantumInput.addEventListener("change", () => {
    canvas.setShowQuantum(quantumInput.checked);
  });

  quantumCheck.append(quantumInput, quantumLabel);
  quantumGroup.append(quantumCheck);

  wrap.append(sliderGroup, classicalGroup, quantumGroup);
  return wrap;
}
