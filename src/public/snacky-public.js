let s = Snap(800, 800);

let fry1, fry2, fry3

Snap.load("/images/fries.svg", function (svg) {
  fry1 = svg.select("#fry_1");
  fry2 = svg.select("#fry_2");
  fry3 = svg.select("#fry_3");
  fry1.attr({x: 500, y: 500});
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
    let intervalID = window.setInterval(this.analyze.bind(this), 2000);
  }
  analyze() {
    this.analyser.getByteFrequencyData(this.dataArray);
    this.emitEvent('analyze', this.dataArray);
  }
}

let an = new AudioAnalyser(audioCtx, source);

an.addListener('analyze', handleAnalyzation);

function handleAnalyzation() {
  console.log('analyze');
  console.log(arguments);
}


//
// const animateFries = function(fry1, fry2, fry3, cb) {
//   console.log('animate');
//   let dur = 2000
//   fry1.animate({
//     transform: "r" + [360, [144, 147]]
//   }, dur, null, cb)
//   fry2.animate({
//     transform: "r" + [360, [144, 147]]
//   }, dur, null, cb)
//   fry3.animate({
//     transform: "r" + [8, [10, 150]]
//   }, dur, null, cb);
// }
