
document.addEventListener("DOMContentLoaded", function () {

  setTimeout(function () {
    document.getElementById("intro-text").classList.add("fade-in");
  }, 300);

  setTimeout(function () {
    document.getElementById("intro-text").classList.add("fade-out");
  }, 3000);

  setTimeout(function () {
    document.getElementById("intro-text").remove();
  }, 8000);
});