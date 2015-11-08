let bandSVG = Snap("#band_svg");
let titleSVG = Snap("#title_svg");
bandSVG.attr({ viewBox: "-30 -30 380 230" })
titleSVG.attr({ viewBox: "-30 -100 240 200" })


let vol1_letters = ["vol1_v", "vol1_o", "vol1_l", "vol1_1"];
Snap.load("/images/vol1.svg", function(svg) {
  vol1_letters = vol1_letters.map(function(id, i) {
    let lt = svg.select("#" + id);
    titleSVG.append(lt);
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
    bandSVG.append(lt);
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
    let index = vol1_letters.indexOf(letter);
    let offIndex = index+1;
    let freq = index + 50;
    let scaled = anData[freq]/100
    if (scaled < 0.3) {scaled = 0.3};

    let hOffset = 0;
    if (index+1 > (vol1_letters.length/2)) {
      hOffset = index + (anData[freq]/10)/(offIndex*0.5);
    } else {
      hOffset = index - (anData[freq]/10)/(offIndex*0.5);
    }
    letter.animate({transform: "s"+ scaled + "t"+ hOffset + "," + 0}, 10);
  });
  snacky_letters.forEach(function(letter) {
    let index = snacky_letters.indexOf(letter)
    let freq = index + 300;
    let scaled = anData[freq]/100
    if (scaled < 0.5) {scaled = 0.5};
    if (scaled > 1.5) {scaled = 1.5};
    let rAngle = (index + anData[freq] - 50);
    if (rAngle < -30) {rAngle = -30};
    if (rAngle > 30) {rAngle = 30};
    letter.animate({transform: "s"+ scaled + "r"+rAngle + "t10,10"}, 10);
  });

  let snareLevel = anData[250];
  incrementBgColor(snareLevel);
}

let colors = [
  "#be4f5e", "#ffdd65", "#0b7347", "#fe8721", "#d5cec4", "#e35d0c",
  "#7d464b", "#ece6da"
];

let colorIndex = 0;
let currentColorValue = 0;
function incrementBgColor(value) {
  // console.log(Math.abs(currentColorValue - value));
  if (value > 85 && Math.abs(value - currentColorValue) > 25) {
    colorIndex+=1;
    if (colorIndex === colors.length ) {colorIndex = 0};
    document.querySelector('body').style.backgroundColor = colors[colorIndex];
  }
  currentColorValue = value;
}
