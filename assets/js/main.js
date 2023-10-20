document.addEventListener("DOMContentLoaded", function () {
  const audioElement = document.getElementById("custom-audio");

  // Fade-in effect
  setTimeout(() => {
    document.getElementById("intro-text").classList.add("fade-in");
  }, 1000);

  // Play custom audio
  setTimeout(() => {
    audioElement.play();
  }, 4000);  // 4 seconds delay

  // Show navigation (You can customize this part)
  setTimeout(() => {
    document.getElementById("nav-container").style.display = "block";
  }, 5000);  // 5 seconds delay
});
