function nToString(n) {
  return Math.round(n * 10000000) / 10000000;
}

class Scene {
  constructor(context) {
    this.ctx = context;

    this.width = 800;
    this.height = 800;

    this.block = {
      type: 0,
      mass: 15,
      r1: 100,
      r2: 60,
      ang: 0,
      speed: 0,
      acc: 0
    }

    this.leftCargo = {
      pos: 200,
      speed: 0,
      acc: 0,
      mass: 11,
      T: 0
    }

    this.rightCargo = {
      pos: 200,
      speed: 0,
      acc: 0,
      mass: 10,
      T: 0
    }

    this.lastStart = {
      time: 0,
      E: 0,
      T1: 0,
      T2: 0,
      a1: 0,
      a2: 0
    }

    this.scale = 40;
    this.inputs = {};
    this.out = {};
    this.time = 0;
    this.timeScale = 1;
    this.rulerEnabled = true;
    this.state = 1;
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
    let block = this.block;
    let left = this.leftCargo;
    let right = this.rightCargo;

    this.pause();

    this.time = 0;
    this.curTime = 0;
    
    block.ang = 0;
    left.pos = right.pos = 200;
    block.speed = left.speed = right.speed = 0;
    block.acc = left.acc = right.acc = 0;
    left.T = right.T = 0;

    this.lastStart.time = 0; 
  }

  initInput() {
    let inputs = this.inputs;

    inputs.type = $('#inputType');
    inputs.scale = $('#inputScale');
    inputs.m = $('#inputM');
    inputs.m1 = $('#inputM1');
    inputs.m2 = $('#inputM2');
    inputs.ruler = $('#inputRuler');
    inputs.start = $('#inputStart');
    inputs.reset = $('#inputReset');
    inputs.r1 = $('#inputR1');
    inputs.r2 = $('#inputR2');
    inputs.speed = $('#inputSpeed');

    this.updateInput();

    inputs.type.change((e) => {
      this.block.type = parseInt(e.target.value);
    });

    inputs.scale.change((e) => {
      if (e.target.valueAsNumber >= 0.05) {
        this.scale = 400 / e.target.valueAsNumber;
        this.reset();
      } else
        inputs.scale.val(400 / this.scale);
    });

    inputs.m.change((e) => {
      if (e.target.valueAsNumber >= 0)
        this.block.mass = e.target.valueAsNumber;
      else
        inputs.m.val(this.block.mass);
    });

    inputs.m1.change((e) => {
      if (e.target.valueAsNumber > 0) {
        this.leftCargo.mass = e.target.valueAsNumber;
        this.lastStart.time = 0;
      } else
        inputs.m1.val(this.leftCargo.mass);
    });

    inputs.m2.change((e) => {
      if (e.target.valueAsNumber > 0) {
        this.rightCargo.mass = e.target.valueAsNumber;
        this.lastStart.time = 0;
      } else
        inputs.m2.val(this.rightCargo.mass);
    });

    inputs.ruler.change((e) => {
      this.rulerEnabled = e.target.checked;
    });

    inputs.start.click((e) => {
      e.preventDefault();
      this.state == 0 ? this.pause() : this.start();
    });

    inputs.reset.click((e) => {
      e.preventDefault();
      this.reset();
    });

    inputs.r1.change((e) => {
      let r = e.target.valueAsNumber;
      if (r > 0) {
        this.block.r1 = r;

        if (this.block.r2 > this.block.r1) {
          this.block.r2 = this.block.r1;
          inputs.r2.val(this.block.r2);
        }
      }
      else
        inputs.r1.val(this.block.r1);
    });

    inputs.r2.change((e) => {
      let r = e.target.valueAsNumber;
      if (r >= 0 && r <= this.block.r1)
        this.block.r2 = r;
      else
        inputs.r2.val(this.block.r2);
    });

    let timeLabel = $('#timeScale');
    inputs.speed.change((e) => {
      this.timeScale = Math.pow(2, e.target.valueAsNumber);
      timeLabel.html(this.timeScale + 'x');
    });
  }

  updateInput() {
    let inputs = this.inputs;

    inputs.scale.val(400 / this.scale);
    inputs.m.val(this.block.mass);
    inputs.m1.val(this.leftCargo.mass);
    inputs.m2.val(this.rightCargo.mass);
    inputs.r1.val(this.block.r1);
    inputs.r2.val(this.block.r2);
    inputs.ruler.prop('checked', this.rulerEnabled);

    inputs.r1.attr('step', 20 / this.scale);
    inputs.r2.attr('step', 20 / this.scale);
  }

  initOutput() {
    let out = this.out;

    out.time = $('#outTime');
    out.angacc = $('#outA0');
    out.angspeed = $('#outV0');
    out.ang = $('#outAng');
    out.a1 = $('#outA1');
    out.a2 = $('#outA2');
    out.v1 = $('#outV1');
    out.v2 = $('#outV2');
    out.h1 = $('#outH1');
    out.h2 = $('#outH2');
    out.T1 = $('#outT1');
    out.T2 = $('#outT2');

    out.lastTime = $('#outLastTime');
    out.lastE = $('#outLastA0');
    out.lastA1 = $('#outLastA1');
    out.lastA2 = $('#outLastA2');
    out.lastT1 = $('#outLastT1');
    out.lastT2 = $('#outLastT2');
  }

  updateOutput()
  {
    let out = this.out;
    let left = this.leftCargo;
    let right = this.rightCargo;
    let scale = this.scale;

    out.time.html((this.time / 1000).toFixed(2));

    out.a1.html((left.acc / scale).toPrecision(2));
    out.a2.html((right.acc / scale).toPrecision(2));
    out.angacc.html((this.block.acc * 100 / this.block.r1 / scale).toPrecision(2));

    out.v1.html((left.speed / scale).toPrecision(2));
    out.v2.html((right.speed / scale).toPrecision(2));
    out.angspeed.html((this.block.speed * 100 / this.block.r1 / scale).toPrecision(2));

    out.ang.html(nToString(this.block.ang * 100 / this.block.r1 / scale).toFixed(3));
    out.h1.html(((400 - left.pos) / scale).toFixed(3));
    out.h2.html(((400 - right.pos) / scale).toFixed(3));

    out.T1.html(left.T.toPrecision(3));
    out.T2.html(right.T.toPrecision(3));
  }

  updateLastOutput()
  {
    let out = this.out;
    let scale = this.scale;

    out.lastTime.html(this.lastStart.time.toFixed(2));
    out.lastA1.html((this.lastStart.a1 / scale).toPrecision(2))
    out.lastA2.html((this.lastStart.a2 / scale).toPrecision(2))
    out.lastT1.html(this.lastStart.T1.toPrecision(3));
    out.lastT2.html(this.lastStart.T2.toPrecision(3));
    out.lastE.html((this.lastStart.E * 100 / this.block.r1 / scale).toPrecision(2));
  }

  drawCeil() {
    let ctx = this.ctx;

    ctx.beginPath();
    ctx.moveTo(0, 40);
    ctx.lineTo(800, 40);
    ctx.stroke();

    for (let i = 0; i < 20; ++i) {
      ctx.beginPath();
      ctx.moveTo(i * 40, 40);
      ctx.lineTo(40 + i * 40, 0);
      ctx.stroke();
    }
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

  drawRuler()
  {
    let ctx = this.ctx;

    ctx.beginPath();
    ctx.moveTo(600, 760);
    ctx.lineTo(600, 360);
    ctx.stroke();

    for (let i = 0; i < 11; ++i) {
      ctx.beginPath();
      ctx.moveTo(600, 760 - i * 40);
      ctx.lineTo(620, 760 - i * 40);
      ctx.stroke();

      if (i != 10) {
        ctx.lineWidth = 1;
        for (let j = 1; j < 10; ++j) {
          ctx.beginPath();
          ctx.moveTo(600, 760 - i * 40 - j * 4);
          ctx.lineTo(610, 760 - i * 40 - j * 4);
          ctx.stroke();
        }
        ctx.lineWidth = 2;
      }

      if (this.scale <= 40)
        ctx.fillText(nToString(i * 40 / this.scale) + 'м', 620, 765 - i * 40)
      else
        ctx.fillText(nToString(i * 4000 / this.scale) + 'см', 620, 765 - i * 40);
    }
  }

  drawBlock() {
    let ctx = this.ctx;
    let block = this.block;
    let r1 = 100;
    let r2 = 100 * block.r2 / block.r1;

    ctx.fillStyle = '#bbb';

    ctx.beginPath();
    ctx.arc(400, 200, 100, 0, 2 * Math.PI);

    if (block.type != 1)
      ctx.fill();

    ctx.stroke();

    if (block.type == 0) {
      ctx.beginPath();
      ctx.arc(400, 200, r2, 0, 2 * Math.PI);

      ctx.save();
      ctx.clip()
      ctx.clearRect(400 - r2, 200 - r2, 2 * r2, 2 * r2);
      ctx.restore();

      ctx.stroke();
    }

    ctx.fillStyle = '#000';

    ctx.beginPath();
    ctx.moveTo(400, 200);
    ctx.lineTo(400, 40);
    ctx.stroke();

    ctx.save();
    ctx.translate(400, 200);
    ctx.rotate(block.ang);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r1, 0);
    ctx.stroke();

    if (block.type == 0) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-r2, 0);
      ctx.stroke();
    }

    ctx.fillText(block.mass + 'кг', 0, r1 / 2);

    ctx.textBaseline = 'bottom';

    ctx.fillText(block.r1 + 'м', r1 / 2, 0);

    if (block.type == 0 && block.r2 > 0)
      ctx.fillText(block.r2 + 'м', -r2 / 2, 0);

    ctx.restore();
  }

  drawСargo(cargo, left) {
    let ctx = this.ctx;
    let xpos = left ? 300 : 500;

    ctx.beginPath();
    ctx.moveTo(xpos, 200);
    ctx.lineTo(xpos, 280 + cargo.pos);
    ctx.stroke();

    ctx.rect(xpos - 30, 280 + cargo.pos, 60, 80);
    ctx.stroke();

    ctx.fillText(cargo.mass + 'кг', xpos, 320 + cargo.pos);

    if (this.rulerEnabled) {
      ctx.setLineDash([5, 3]);
      ctx.beginPath();
      ctx.moveTo(xpos + 30, 360 + cargo.pos);
      ctx.lineTo(600, 360 + cargo.pos);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  update() {
    let dt = this.delta / 1000;
    let scale = this.scale;
    const g = 9.80665 * scale;

    let left = this.leftCargo;
    let right = this.rightCargo;
    let block = this.block;

    switch (block.type) {
      case 1:
        left.acc = ( left.mass - right.mass ) * g / ( right.mass + left.mass + this.block.mass * 2 / 3 );
        break;
      case 2:
        left.acc = ( left.mass - right.mass ) * g / ( right.mass + left.mass + this.block.mass * 2 / 5 );
        break;
      default:
        left.acc = ( left.mass - right.mass ) * g / ( right.mass + left.mass + this.block.mass / 2 + (this.block.mass / 2) * Math.pow(block.r2 / block.r1, 2) );
    }
    right.acc = -left.acc;
    block.acc = right.acc / 100;

    left.T = left.mass * (g - left.acc) / scale;
    right.T = right.mass * (g - right.acc) / scale;

    left.speed += dt * left.acc;
    right.speed += dt * right.acc;
    block.speed += dt * block.acc;

    if (left.speed == 0)
      dt = 0;

    left.nextPos = left.pos + left.speed * dt;
    right.nextPos = right.pos + right.speed * dt;
    block.nextAng = block.ang + dt * block.speed;

    if (left.nextPos > 400 || right.nextPos > 400) {
      if (left.nextPos > 400) {
        dt = (400 - left.pos) / left.speed;
      } else {
        dt = (400 - right.pos) / right.speed;
      }

      left.nextPos = left.pos + left.speed * dt;
      right.nextPos = right.pos + right.speed * dt;
      block.nextAng = block.ang + dt * block.speed;

      this.lastStart.a1 = left.acc;
      this.lastStart.a2 = right.acc;
      this.lastStart.T1 = left.T;
      this.lastStart.T2 = right.T;
      this.lastStart.E = block.acc;

      this.updateLastOutput();

      block.acc = left.acc = right.acc = 0;
      block.speed = left.speed = right.speed = 0;
    }

    left.pos = left.nextPos;
    right.pos = right.nextPos;

    block.ang = block.nextAng;
    this.lastStart.time += dt;
  }

  render() {
    let ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    this.drawFloor();
    this.drawCeil();
    this.drawBlock();

    ctx.textBaseline = 'bottom';
    ctx.textAlign = 'left'; 

    if (this.rulerEnabled)
      this.drawRuler();

    ctx.textAlign = 'center'; 
    ctx.textBaseline = 'middle';

    this.drawСargo(this.leftCargo, true);
    this.drawСargo(this.rightCargo, false);

    this.updateOutput();
  }

  startLoop() {
    this.prevTime = performance.now();

    let loop = (time) => {
      if (this.state == 0) {
        this.delta = time - this.prevTime;
        this.delta *= this.timeScale;
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
  ctx.font = '500 15px Segoe UI';;

  let scene = new Scene(ctx);

  scene.initInput();
  scene.initOutput();
  scene.startLoop();
});