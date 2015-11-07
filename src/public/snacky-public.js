let s = Snap(800, 800);
s.attr({ viewBox: "-20 -100 600 600" })

let fry1, fry2, fry3

Snap.load("/images/fries.svg", function(svg) {
  fry1 = svg.select("#fry_1");
  fry2 = svg.select("#fry_2");
  fry3 = svg.select("#fry_3");
  s.append(fry1);
  s.append(fry2);
  s.append(fry3);

});

let vol1_letters = ["vol1_v", "vol1_o", "vol1_l", "vol1_1"];
Snap.load("/images/vol1.svg", function(svg) {
  vol1_letters = vol1_letters.map(function(id, i) {
    let lt = svg.select("#" + id);
    s.append(lt);
    return lt;
  });
  let an = new AudioAnalyser(audioCtx, source);
  an.addListener('analyze', animate);
});

let snacky_letters =  ["snacky_s", "snacky_n", "snacky_a", "snacky_c",
                        "snacky_k", "snacky_y"
                      ];
Snap.load("/images/snacky.svg", function(svg) {
  snacky_letters = snacky_letters.map(function(id, i) {
    let lt = svg.select("#" + id);
    s.append(lt);
    return lt;
  });
});

const myAudio = document.querySelector('audio');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let source = audioCtx.createMediaElementSource(myAudio);
let analyzeEvent = new Event('analyze');

class AudioAnalyser extends EventEmitter {
  constructor(audioCtx, source) {
    super();
    // vol1_letters[1].animate({transform: "s"+ 20 + "r0,0,0"}, 4000);
    this.analyser = audioCtx.createAnalyser();
    this.analyser.connect(audioCtx.destination);
    this.analyser.fftSize = 2048;

    const bufferLength = this.analyser.frequencyBinCount;
    this.dataArray = new Uint8Array(bufferLength)
    source.connect(this.analyser);
    let intervalID = window.setInterval(this.analyze.bind(this), 30);
  }
  analyze() {
    this.analyser.getByteFrequencyData(this.dataArray);
    this.emitEvent('analyze', this.dataArray);
  }
}

function animate() {
  let anData = arguments;
  vol1_letters.forEach(function(letter) {
    let freq = vol1_letters.indexOf(letter) + 500;
    let scaled = anData[freq]/100
    if (scaled < 0.3) {scaled = 0.3};
    letter.animate({transform: "s"+ scaled + "r0,0,0"}, 10);
  });
  snacky_letters.forEach(function(letter) {
    let index = snacky_letters.indexOf(letter)
    let freq = index + 200;
    let scaled = anData[freq]/100
    if (scaled < 0.5) {scaled = 0.5};
    if (scaled > 1.5) {scaled = 1.5};
    let rAngle = (index + anData[freq] - 50);
    if (rAngle < -30) {rAngle = -30};
    if (rAngle > 30) {rAngle = 30};
    letter.animate({transform: "s"+ scaled + "r"+rAngle}, 10);
  });
}
