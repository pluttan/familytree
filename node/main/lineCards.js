class Card {
  constructor(id, con) {
    this.id = id;
    this.w = 10; //todo bd
    this.h = 10; //todo bd
    this.x = 10; //todo bd
    this.y = 10; //todo bd
    this.context = con;
  }

  draw() {
    this.context.clear();
    this.context.con.fillText(this.id, this.x, this.y + this.h);
  }
}

class Context {
  constructor(id = "cnvs", w = window.innerWidth, h = window.innerHeight) {
    this.canvas = document.getElementById(id);
    this.con = this.canvas.getContext("2d");
    this.w = w;
    this.h = h;
    this.eventMouseDown = [];
    this.eventMouseMove = [];
    this.eventMouseUp = [];
    this.eventMouseLeave = [];
    this.events();
  }

  clear() {
    this.con.clearRect(0, 0, this.w, this.h);
  }

  events() {
    this.canvas.addEventListener("mousedown", function (e) {
      for (let i of this.eventMouseDown) i();
    });

    this.canvas.addEventListener("mousemove", function (e) {
      for (let i of this.eventMouseMove) i();
    });

    this.canvas.addEventListener("mouseup", function () {
      for (let i of this.eventMouseUp) i();
    });

    this.canvas.addEventListener("mouseleave", function () {
      for (let i of this.eventMouseLeave) i();
    });
  }
}

var con = new Context();

var card = new Card(123, con);
card.draw();

class Line {
  constructor(
    cards = [0, 0],
    x,
    y,
    context = document.getElementById("cnvs").getContext("2d")
  ) {}

  calcLine(x, y, ids, width, step = 10) {
    res = [];
    for (let i of ids) res << [Card.new(x + res.length * (width + step), y, i)];
    return res;
  }
}
