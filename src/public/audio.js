// const myAudio = document.querySelector('audio');
// const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
// let source = audioCtx.createMediaElementSource(myAudio);
// let analyzeEvent = new Event('analyze');
//
// class AudioAnalyser extends EventEmitter {
//   constructor(audioCtx, source) {
//     super();
//     this.analyser = audioCtx.createAnalyser();
//     this.analyser.connect(audioCtx.destination);
//     this.analyser.fftSize = 2048;
//
//     const bufferLength = this.analyser.frequencyBinCount;
//     this.dataArray = new Uint8Array(bufferLength)
//     source.connect(this.analyser);
//     let intervalID = window.setInterval(this.analyze.bind(this), 20);
//   }
//   analyze() {
//     this.analyser.getByteFrequencyData(an.dataArray);
//     this.emitEvent('analyze');
//   }
// }
//
// let an = new AudioAnalyser(audioCtx, source);
