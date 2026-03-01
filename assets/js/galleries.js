document.addEventListener("DOMContentLoaded", () => {
  /* -----------------------------
   * Masonry initialization
   * ----------------------------- */

  if (typeof Masonry !== "function") {
    console.error("Masonry is not loaded");
    return;
  }

  if (typeof imagesLoaded !== "function") {
    console.error("imagesLoaded is not loaded");
    return;
  }

  document.querySelectorAll(".grid").forEach(grid => {
    imagesLoaded(grid, () => {
      new Masonry(grid, {
        itemSelector: ".grid-item",
        percentPosition: true,
        gutter: 16
      });
    });
  });

   const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCredit = document.getElementById("lightbox-credit");
  const prevBtn = document.querySelector(".lightbox-prev");
  const nextBtn = document.querySelector(".lightbox-next");

  if (!lightbox || !lightboxImg) return;

  let images = [];
  let currentIndex = 0;

  function showImage(index) {
    const img = images[index];
    if (!img) return;

    lightboxImg.src = img.src;
    lightboxCredit.textContent = img.dataset.credit || "";
    currentIndex = index;
  }

  function openLightbox(img) {
    const gallery = img.closest(".grid");
    images = Array.from(gallery.querySelectorAll(".grid-item img"));
    currentIndex = images.indexOf(img);

    showImage(currentIndex);
    lightbox.classList.remove("hidden");
  }

  function closeLightbox() {
    lightbox.classList.add("hidden");
    lightboxImg.src = "";
    lightboxCredit.textContent = "";
    images = [];
  }

  function showNext() {
    showImage((currentIndex + 1) % images.length);
  }

  function showPrev() {
    showImage((currentIndex - 1 + images.length) % images.length);
  }

  document.querySelectorAll(".grid-item img").forEach(img => {
    img.addEventListener("click", () => openLightbox(img));
  });

  nextBtn.addEventListener("click", e => {
    e.stopPropagation();
    showNext();
  });

  prevBtn.addEventListener("click", e => {
    e.stopPropagation();
    showPrev();
  });

  lightbox.addEventListener("click", closeLightbox);

  document.querySelector(".lightbox-content")
    .addEventListener("click", e => e.stopPropagation());

  document.addEventListener("keydown", e => {
    if (lightbox.classList.contains("hidden")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") showNext();
    if (e.key === "ArrowLeft") showPrev();
  });
 
});