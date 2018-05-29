function nToString(n) {
  return Math.round(n * 10000000) / 10000000;
}



const base = 60;
let clocktimer,dateObj, dm, ds, ms;
let readout='';
let m = 1, tm = 1,s = 0,ts = 0,show = true, init = 0, ii = 0;


function clearClock() {
    clearTimeout(clocktimer);
    m = 1; tm = 1; s = 0; ts = 0; ms = 0;
    init = 0; show = true;
    readout = '00:00.00';
    document.TestForm.stopwatch.value = readout;
    ii = 0;
}


function startTIME() {
    let cdateObj = new Date();
    let t = (cdateObj.getTime() - dateObj.getTime())-(s * 1000);
    if (t > 999) { s++; }
    if (s >= (m * base)) {
        ts = 0;
        m++;
    } else {
        ts = parseInt((ms / 100) + s);
        if(ts >= base) { ts = ts-((m - 1) * base); }
    }
    tm = parseInt((ms / 100) + m);
    ms = Math.round(t / 10);
    if (ms > 99) {ms = 0;}
    if (ms === 0) {ms = '00';}
    if (ms > 0 && ms <= 9) { ms = '0' + ms; }
    if (ts > 0) { ds = ts; if (ts < 10) { ds = '0'+ts; }} else { ds = '00'; }
    dm = tm - 1;
    if (dm > 0) { if (dm < 10) { dm = '0' + dm; }} else { dm = '00'; }
    readout = dm + ':' + ds + '.' + ms;
    if (show) { document.TestForm.stopwatch.value = readout; }
    clocktimer = setTimeout("startTIME()", 1);
}

function pause() {
    if (init === 0) {
        dateObj = new Date();
        startTIME();
        init = 1;
    } else {
        if (show) {
            show = false;
        } else {
            show = true;
        }
    }
}



    class Scene {
  constructor(context) {
    this.ctx = context;

    this.width = 800;
    this.height = 800;
    this.inputs = {};
    this.out = {};
    this.time = 0;
    this.state = 1;
    this.prevTime = 0;
    this.delta = 0;
    this.cargo = {
        mass: 1,
        y: 80,
        acc: 12,
        speed: 0
    }
    this.cross = {
        eps: 0,
        phi: 0
    }
  }

  start() {
    this.state = 0;
    this.inputs.start.html('Пауза');
  }

  pause() {
    this.state = 1;
    this.inputs.start.html('Старт');
  }

  reset() {
      this.pause();

      this.time = 0;
      this.state = 1;
      this.prevTime = 0;
      this.delta = 0;
      this.cargo.mass = 1;
      this.cargo.y =  80;
      this.cargo.acc = 12;
      this.cargo.speed = 0;
      this.cross.eps = 0;
      this.cross.phi = 0;
      
      this.lastStart.time = 0;
  }

  drawFloor() {
        let ctx = this.ctx;

        ctx.beginPath();
        ctx.moveTo(0, 760);
        ctx.lineTo(800, 760);
        ctx.stroke();

        for (let i = 0; i < 20; ++i) {
            ctx.beginPath();
            ctx.moveTo(i * 40, 800);
            ctx.lineTo(40 + i * 40, 760);
            ctx.stroke();
        }
  }

  drawRuler() {
        let ctx = this.ctx;

        ctx.beginPath();
        ctx.moveTo(0, 760);
        ctx.lineTo(0, 0);
        ctx.stroke();

        for (let i = 0; i < 19; ++i) {
            ctx.beginPath();
            ctx.moveTo(0, 760 - i * 40);
            ctx.lineTo(0, 760 - i * 40);
            ctx.stroke();

            if (i != 19) {
                ctx.lineWidth = 1;
                for (let j = 1; j < 10; ++j) {
                    ctx.beginPath();
                    ctx.moveTo(0, 760 - i * 40 - j * 4);
                    ctx.lineTo(10, 760 - i * 40 - j * 4);
                    ctx.stroke();
                }
                ctx.lineWidth = 2;
            }
            ctx.fillText(nToString(i * 0.1) + 'м', 20, 765 - i * 40);
        }
  }

  drawCross() {
    let ctx = this.ctx;
    ctx.beginPath();
    let xc = 500, yc = 350, delta = 200;
    ctx.moveTo(xc, yc);
    ctx.lineTo(xc, 760);
    ctx.moveTo(xc + 284, yc);
    ctx.arc(xc, yc, 284, 0, 2 * Math.PI);
    ctx.moveTo(xc + 294, yc);
    ctx.arc(xc, yc, 294, 0, 2 * Math.PI);
    ctx.moveTo(xc + 20, yc);
    ctx.arc(xc, yc, 20, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.save();
    ctx.translate(xc, yc);
    ctx.rotate(this.cross.phi);
    xc = yc = 0;
    ctx.moveTo(xc, yc);
    ctx.lineTo(xc - delta, yc - delta);
    ctx.moveTo(xc, yc);
    ctx.lineTo(xc + delta, yc - delta);
    ctx.moveTo(xc, yc);
    ctx.lineTo(xc - delta, yc + delta);
    ctx.moveTo(xc, yc);
    ctx.lineTo(xc + delta, yc + delta);
    ctx.fillRect(xc - 170, yc - 170, 40, 40);
    ctx.fillRect(xc - 170, yc + 130, 40, 40);
    ctx.fillRect(xc + 130, yc - 170, 40, 40);
    ctx.fillRect(xc + 130, yc + 130, 40, 40);
    ctx.restore();
    ctx.stroke();
  }

  drawCargo() {
    let ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(70, 50);
    ctx.lineTo(70, 760);
    ctx.moveTo(130, 50);
    ctx.arc(100, 50, 30, 0, 2 * Math.PI);
    ctx.moveTo(122, 29);
    ctx.lineTo(516, 335);
    ctx.moveTo(60, 80);
    ctx.fillRect(60, this.cargo.y, 20, 20);
    ctx.stroke();
  }

  initInput() {
    let inputs = this.inputs;
    inputs.h = $('#inputH');
    inputs.m1 = $('#inputM1');
    inputs.m2 = $('#inputM2');
    inputs.start = $('#inputStart');
    inputs.reset = $('#inputReset');
    inputs.r1 = $('#inputR1');
    inputs.r2 = $('#inputR2');
    // inputs.r3 = $('#inputR3');
    // inputs.r4 = $('#inputR4');

    this.updateInput();

    inputs.start.click((e) => {
      e.preventDefault();
      this.state == 0 ? this.pause() : this.start();
    });

    inputs.reset.click((e) => {
      e.preventDefault();
      this.reset();
    });
  }

  updateInput() {
    let inputs = this.inputs;
  }

  initOutput() {
    let out = this.out;
  }

  updateOutput() {
    let out = this.out;
  }

  updateLastOutput() {
    let out = this.out;
  }

  update() {
      this.cargo.speed += this.cargo.acc * this.time * 0.001;
      this.cargo.y = Math.min(80 + this.cargo.acc * ((this.time * 0.001) ** 2) / 2, 740);
      this.cross.phi -= 0.01;
  }

  render() {
      let ctx = this.ctx;
      ctx.clearRect(0, 0, this.width, this.height);
      this.drawFloor();
      this.drawRuler();
      this.drawCross();
      this.drawCargo();
  }

  startLoop() {
    this.prevTime = performance.now();

    let loop = (time) => {
      if (this.state == 0) {
        this.delta = time - this.prevTime;
        //this.delta *= this.timeScale;
        this.time += this.delta;
        this.update();
      }

      this.render();

      this.prevTime = time;
      this.frame = requestAnimationFrame(loop);
    };

    this.frame = requestAnimationFrame(loop);
  }
}

$(document).ready(() => {
  let canvas = $('#canvas');
  let height = canvas.height();
  let width = canvas.width();
  let size = height < width ? height : width;

  canvas.width(size);
  canvas.height(size);
  canvas.css('flex-grow', 0);

  canvas.attr('width', 800);
  canvas.attr('height', 800);

  let ctx = canvas[0].getContext('2d');

  ctx.lineWidth = 2;
  ctx.font = '500 15px Segoe UI';

  let scene = new Scene(ctx);

  scene.initInput();
  scene.initOutput();
  scene.startLoop();
});