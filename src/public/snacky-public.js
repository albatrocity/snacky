// What is this, 2007? This is all in one file because I'm too lazy to
// hook up module loading for Babel.

let bandSVG = Snap("#band_svg");
let titleSVG = Snap("#title_svg");
let coverSVG = Snap("#cover");
bandSVG.attr({ viewBox: "-30 -10 340 200" })
titleSVG.attr({ viewBox: "-30 -80 240 200" })

let vol1_letters = ["vol1_v", "vol1_o", "vol1_l", "vol1_1"];
Snap.load("/images/vol1.svg", function(svg) {
  vol1_letters = vol1_letters.map(function(id, i) {
    let lt = svg.select("#" + id);
    titleSVG.append(lt);
    return lt;
  });
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

let mascot;
const mascotCoords = {
  scale: 3.6,
  t1: 440,
  t2: 470,
  r1: 0,
  r2: 0
};
Snap.load("/images/mascot_vector.svg", function(svg) {
  mascot = svg.select("#mascot");
  mascot.transform("s4,t10,50");
  coverSVG.append(svg);
  scaleMascot();
});


const tracks = [
  {
    title: "Halftime Show",
    src: "http://ross-brown.s3.amazonaws.com/01_Halftime%20Show"
  },
  {
    title: "You're Preapproved!",
    src: "http://ross-brown.s3.amazonaws.com/02_You're%20Preapproved!"
  },
  {
    title: "Le Voyage Vers le Canape",
    src: "http://ross-brown.s3.amazonaws.com/03_Le%20Voyage%20Vers%20le%20Canape"
  },
  {
    title: "Nugget",
    src: "http://ross-brown.s3.amazonaws.com/04_Nugget"
  },
  {
    title: "I Forgot to Get Toilet Paper",
    src: "http://ross-brown.s3.amazonaws.com/05_I%20Forgot%20to%20Get%20Toilet%20Paper"
  },
  {
    title: "Ryan's Lament",
    src: "http://ross-brown.s3.amazonaws.com/06_Ryan's%20Lament"
  },
  {
    title: "Warm Face After a Cold Day",
    src: "http://ross-brown.s3.amazonaws.com/07_Warm%20Face%20After%20a%20Cold%20Day"
  }
];

let audio;
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let analyzeEvent = new Event('analyze');

class AudioAnalyser extends EventEmitter {
  constructor(audioCtx, source) {
    super();
    this.source = source = audioCtx.createMediaElementSource(audio);
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

let currentTrack;
let audioState;
let currentAnalyser;
let dancing = true;
const $playControl = document.querySelector("#playPause");
const $nextControl = document.querySelector("#playNext");
const $nowPlaying  = document.querySelector("#nowPlaying");
const $toggleDance = document.querySelector("#toggleDance");
$nextControl.style.display = 'none';

$toggleDance.addEventListener('click', toggleDancing);

function toggleDancing(e) {
  if (e) {e.preventDefault();}
  if (dancing) {
    dancing = false;
    if (currentAnalyser) {
      currentAnalyser.removeListener('analyze', animate);
    }
    $toggleDance.innerHTML = "Start dancing";
  } else {
    dancing = true;
    if (currentAnalyser) {
      currentAnalyser.addListener('analyze', animate);
    }
    $toggleDance.innerHTML = "Stop dancing";
  }
}

function displayTrackInfo(track) {
  $nowPlaying.innerHTML = `<h4>${tracks.indexOf(track)+1}. ${track.title}</h4>`
}

function queueTrack(track) {
  let extension;
  if (audio) {audio.pause(); audioState = 'paused'};
  displayLoading();
  audio = new Audio();
  window.audio = audio;
  if (audio.canPlayType("audio/mp3")) {
    extension = ".mp3";
  } else if (audio.canPlayType("audio/ogg")) {
    extension = ".ogg";
  }
  audio.setAttribute("src", track.src + extension);
  audio.load();
  if (currentAnalyser) {
    currentAnalyser.removeListener('analyze', animate);
  };
  currentAnalyser = new AudioAnalyser(audioCtx);
  if (dancing) {
    currentAnalyser.addListener('analyze', animate);
  }
  displayTrackInfo(track);
  // audio.addEventListener('ended', nextTrack);
  // audio.addEventListener('canplaythrough', playAudio);
  // audio.addEventListener('waiting', displayLoading);
};

function displayLoading() {
  $playControl.innerHTML = "...";
  audioState = 'loading';
}

function fadeIn() {
  let fadePoint = 0.5;
  let fadeAudio = setInterval(function () {
    if ((audio.currentTime < fadePoint) && (audio.volume != 1.0)) {
        audio.volume += 0.1;
    }
    if (audio.volume === 1.0) {
        clearInterval(fadeAudio);
    }
  }, 200);
}

function playAudio() {
  if(!audio) {return};
  audio.volume = 0;
  audio.play();
  audioState = 'playing';
  $playControl.innerHTML = "Pause";
};

function nextTrack() {
  if(typeof currentTrack === 'undefined'){
    currentTrack = 0;
  } else {
    currentTrack++;
  };
  if (currentTrack+1 === tracks.length ) {
    currentTrack = 0;
    audioState = 'paused';
  } else {
    queueTrack(tracks[currentTrack]);
  }
  $nextControl.style.display = 'inline';
}

function pauseTrack() {
  $playControl.innerHTML = "&#9654";
  audio.pause();
  audioState = 'paused';
}

function resumeTrack() {
  $playControl.innerHTML = "Pause";
  audio.play();
  audioState = 'playing';
}

$playControl.addEventListener("click", function(e) {
  e.preventDefault();
  if (audioState == 'playing') {
    pauseTrack();
  } else if (audioState == 'paused') {
    resumeTrack();
  } else {
    nextTrack();
  }
});

$nextControl.addEventListener("click", function(e) {
  e.preventDefault();
  nextTrack();
})


function animate() {
  let anData = arguments;
  vol1_letters.forEach(function(letter) {
    let index = vol1_letters.indexOf(letter);
    let offIndex = index+1;
    let freq = index + 50;
    let scaled = anData[freq]/100
    if (scaled < 0.5) {scaled = 0.5};

    let hOffset = 0;
    if (index > (vol1_letters.length/2)) {
      hOffset = index + (anData[freq]/10)/(offIndex*0.5);
    } else {
      hOffset = index - (anData[freq]/10)/(offIndex*0.5);
    }
    letter.animate({transform: "s"+ scaled + "t"+ hOffset + "," + 0}, 20);
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
  scaleMascot(snareLevel/10);
  incrementBgColor(snareLevel);
}

let currentMascotRotate = 0;
let mascotRotateDir = 1;
function scaleMascot(modifier) {
  modifier = modifier || 1;
  let scale = mascotCoords.scale + (modifier/90);
  let t1 = mascotCoords.t1 - modifier;
  let t2 = mascotCoords.t2 - modifier;
  let r1 = mascotCoords.r1 - modifier;
  if (modifier > 10) {
    // If there's a peak in the frequency...
    if (Math.abs(currentMascotRotate - r1) > 1.1) {
      // swith dancing directions
      if (mascotRotateDir === 1) {
        mascotRotateDir = -1;
      } else {
        mascotRotateDir = 1;
      };
    }
    currentMascotRotate = r1
  }
  r1 = r1*mascotRotateDir;
  let string = `s${scale},t${t1},${t2}r${r1};`
  mascot.animate({transform: string}, 30);
}

let colors = [
  "#be4f5e", "#ffdd65", "#0b7347", "#fe8721", "#d5cec4", "#e35d0c",
  "#7d464b", "#ece6da"
];

let colorIndex = 0;
let currentColorValue = 0;
function incrementBgColor(value) {
  if (value > 85 && Math.abs(value - currentColorValue) > 25) {
    colorIndex+=1;
    if (colorIndex === colors.length ) {colorIndex = 0};
    document.querySelector('body').style.backgroundColor = colors[colorIndex];
  }
  currentColorValue = value;
}
