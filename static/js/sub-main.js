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