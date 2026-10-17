const dialog = document.querySelector(".lightbox");
const thumbs = [...document.querySelectorAll(".thumb")];

if (dialog && thumbs.length && typeof dialog.showModal === "function") {
  const image = dialog.querySelector(".lightbox-image");
  const title = dialog.querySelector(".lightbox-title");
  const place = dialog.querySelector(".lightbox-place");
  const date = dialog.querySelector(".lightbox-date");
  let current = 0;

  const show = (index, pointer = false) => {
    current = (index + thumbs.length) % thumbs.length;
    const thumb = thumbs[current];
    const source = thumb.querySelector("img");
    image.removeAttribute("srcset");
    image.src = source.currentSrc || source.src;
    image.setAttribute("width", source.getAttribute("width"));
    image.setAttribute("height", source.getAttribute("height"));
    image.style.setProperty("--r", source.getAttribute("width") / source.getAttribute("height"));
    image.sizes = "90vw";
    image.srcset = source.srcset;
    image.alt = source.alt;
    title.textContent = thumb.dataset.title || source.alt;
    place.textContent = thumb.dataset.place || "";
    date.textContent = thumb.dataset.date || "";
    if (dialog.open) return;
    dialog.showModal();
    if (pointer) dialog.focus();
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      show(index, event.detail > 0);
    });
  });

  dialog.querySelector(".lightbox-prev").addEventListener("click", () => show(current - 1));
  dialog.querySelector(".lightbox-next").addEventListener("click", () => show(current + 1));

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });

  dialog.addEventListener("close", () => {
    image.removeAttribute("srcset");
    image.src = "data:,";
    thumbs[current].focus();
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog || event.target === dialog.querySelector("figure")) dialog.close();
  });
}
