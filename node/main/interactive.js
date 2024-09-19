var canvas = document.getElementById("cnvs");
var context = canvas.getContext("2d");
var width = window.innerWidth;
var height = window.innerHeight;

canvas.width = width;
canvas.height = height;

var image = new Image();
image.src = "../card/men.jpg";
var imageWidth = 70;
var imageHeight = 70;
var isDragging = false;
var offsetX, offsetY;

var x = (width - imageWidth) / 2;
var y = (height - imageHeight) / 2;

function calcLine(x, y, len, width, step = 10) {
  res = [];
  for (let i = 0; i < len; i++) res << [x + (width + step) * i, y];
  return res;
}

function generateElementsLine(x, y, len, width, elements) {
  for (let i = 0; i < len; i++) {
    context.clearRect(0, 0, width, height);
    context.drawImage(image, x, y, imageWidth, imageHeight);
  }
}

image.onload = function () {
  drawImage();
};

this.canvas.addEventListener("mousedown", function (e) {
  var rect = canvas.getBoundingClientRect();
  var mouseX = e.clientX - rect.left;
  var mouseY = e.clientY - rect.top;

  isDragging = true;
  offsetX = x - mouseX;
  offsetY = y - mouseY;
});

this.canvas.addEventListener("mousemove", function (e) {
  if (isDragging) {
    var rect = canvas.getBoundingClientRect();
    x = e.clientX - rect.left + offsetX;
    y = e.clientY - rect.top + offsetY;
    drawImage();
  }
});

this.canvas.addEventListener("mouseup", function () {
  isDragging = false;
});

this.canvas.addEventListener("mouseleave", function () {
  isDragging = false;
});
