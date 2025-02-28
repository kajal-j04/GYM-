document.querySelector(".mobile-btn").addEventListener("click", function () {
  document.querySelector(".menu").classList.toggle("active");
});

// Popup Functionality
function openPopup() {
  document.getElementById("popup").style.display = "block";
}

function closePopup() {
  document.getElementById("popup").style.display = "none";
}

// Close popup when clicking outside of it
window.onclick = function(event) {
  var popup = document.getElementById("popup");
  if (event.target === popup) {
    closePopup();
  }
};
