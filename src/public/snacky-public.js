let s = Snap(800, 800);

let fry1, fry2, fry3

Snap.load("/images/fries.svg", function (svg) {
  fry1 = svg.select("#fry_1");
  fry2 = svg.select("#fry_2");
  fry3 = svg.select("#fry_3");
  s.append(fry1);
  s.append(fry2);
  s.append(fry3);

});

const myAudio = document.querySelector('audio');
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let source = audioCtx.createMediaElementSource(myAudio);
let analyzeEvent = new Event('analyze');

class AudioAnalyser extends EventEmitter {
  constructor(audioCtx, source) {
    super();
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

let an = new AudioAnalyser(audioCtx, source);

an.addListener('analyze', handleAnalyzation);

function handleAnalyzation() {
  fry1.animate({ transform: "s"+ arguments[50]/50  + "r0,0,0" }, 30);
  fry2.animate({ transform: "s"+ arguments[49]/50  + "r0,0,0" }, 30);
  fry3.animate({ transform: "s"+ arguments[51]/50 + "r0,0,0" }, 30);
}
