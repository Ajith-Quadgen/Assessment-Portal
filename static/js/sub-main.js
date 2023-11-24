document.addEventListener('keydown', function (e) {
    if (e.shiftKey && e.ctrlKey && e.code == 'KeyI') {
      e.preventDefault();
    }
    if (e.code == "Escape") {
      e.preventDefault();
    }
  });
  
function enterFullScreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();     // Firefox
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();  // Safari
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();      // IE/Edge
    }
  };

  function crossCheckScreenSize(){
    const screenWidth = window.outerWidth;
    const screenHeight = window.outerHeight;
    const pageWidth = screen.availWidth;
    const pageHeight = screen.availHeight;
    const isScreenEqualToPage = screenWidth === pageWidth && screenHeight === pageHeight;
    return isScreenEqualToPage;
  }
// Show or hide buttons based on scroll position
window.addEventListener('scroll', function() {
  const scrollTopButton = document.getElementById('scrollTopButton');
  const scrollBottomButton = document.getElementById('scrollBottomButton');

  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    scrollTopButton.style.display = 'block';
    scrollBottomButton.style.display = 'block';
  } else {
    scrollTopButton.style.display = 'none';
    scrollBottomButton.style.display = 'none';
  }
});

if(document.getElementById('scrollTopButton')){
// Scroll to top when the "Scroll to Top" button is clicked
document.getElementById('scrollTopButton').addEventListener('click', function() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Scroll to bottom when the "Scroll to Bottom" button is clicked
document.getElementById('scrollBottomButton').addEventListener('click', function() {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: 'smooth'
  });
});
}
