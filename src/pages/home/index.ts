import content from "./content.html?raw";

export function mountHome(container: HTMLElement): void {
  if (!container.querySelector(".home-page")) {
    container.insertAdjacentHTML("beforeend", content);
  }
}
