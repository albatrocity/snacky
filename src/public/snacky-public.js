// What is this, 2007? This is all in one file because I'm too lazy to
// hook up module loading for Babel.

// Gotta check for Safari because getByteFrequencyData returns all 0s :/
// Desktop Safari is fixed, but I guess not iOS?
// https://bugs.webkit.org/show_bug.cgi?id=125031
const ua = navigator.userAgent
const iOS = !!ua.match(/iPad/i) || !!ua.match(/iPhone/i);
const webkit = !!ua.match(/WebKit/i);
const iOSSafari = iOS && webkit && !ua.match(/CriOS/i);

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
  scale: 3.4,
  t1: 460,
  t2: 520,
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
    src: "01_Halftime%20Show",
    track_number: 1
  },
  {
    title: "You're Preapproved!",
    src: "02_You're%20Preapproved!",
    track_number: 2
  },
  {
    title: "Le Voyage Vers le Canape",
    src: "03_Le%20Voyage%20Vers%20le%20Canape",
    track_number: 3
  },
  {
    title: "Nugget",
    src: "04_Nugget",
    track_number: 4
  },
  {
    title: "I Forgot to Get Toilet Paper",
    src: "05_I%20Forgot%20to%20Get%20Toilet%20Paper",
    track_number: 5
  },
  {
    title: "Ryan's Lament",
    src: "06_Ryan's%20Lament",
    track_number: 6
  },
  {
    title: "Warm Face After a Cold Day",
    src: "07_Warm%20Face%20After%20a%20Cold%20Day",
    track_number: 7
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
    let intervalID = window.setInterval(this.analyze.bind(this), 50);
  }
  analyze() {
    this.analyser.getByteFrequencyData(this.dataArray);
    this.emitEvent('analyze', this.dataArray);
  }
}

let currentTrack;
let audioState;
let currentAnalyser;
let dancing        = true;
const $playControl = document.querySelector("#playPause");
const $nextControl = document.querySelector("#playNext");
const $nowPlaying  = document.querySelector("#nowPlaying");
const $toggleDance = document.querySelector("#toggleDance");
const $fallback    = document.querySelector("#fallback");
const $fallbackCt  = document.querySelector("#fallback .content");
$nextControl.style.display = 'none';
$fallback.style.display = 'none';

if (iOSSafari) {
  $toggleDance.style.display = 'none';
  $fallback.style.display = 'block';
  $fallbackCt.innerHTML = `
    <h2>Hey there, Safari user!</h2>
    <p>There's some fun visualizations to go along with the audio that unfortunately
      don't work on iOS Safari yet. Try this page in Chrome if you wanna see cool stuff,
      otherwise enjoy the tunes.
    </p>
    <a href='#' id='closeFallback'>Close</a>
  `;
  document.querySelector('#closeFallback').addEventListener('click', function(e) {
    e.preventDefault();
    $fallbackCt.style.display = 'none';
  })
}

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
  $nowPlaying.innerHTML = `<h4>${track.track_number}. ${track.title}</h4>`
}

function queueTrack(track) {
  let extension;
  if (audio) {audio.pause(); audioState = 'paused'};
  displayLoading();
  audio = new Audio();
  audio.crossOrigin = true;
  if (audio.canPlayType("audio/mp3")) {
    extension = ".mp3";
  } else if (audio.canPlayType("audio/ogg")) {
    extension = ".ogg";
  }
  s3URL = "https://s3.amazonaws.com/ross-brown/snacky/";
  audio.setAttribute("src", s3URL + track.src + extension);
  audio.load();
  if (currentAnalyser) {
    currentAnalyser.removeListener('analyze', animate);
  };
  currentAnalyser = new AudioAnalyser(audioCtx);
  if (dancing) {
    currentAnalyser.addListener('analyze', animate);
  }
  displayTrackInfo(track);
  audio.addEventListener('ended', nextTrack);
  audio.addEventListener('canplaythrough', playAudio);
  audio.addEventListener('waiting', displayLoading);
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
  }, 20);
}

function playAudio() {
  if(!audio) {return};
  // audio.volume = 0;
  audio.play();
  // fadeIn();
  audioState = 'playing';
  $playControl.innerHTML = "Pause";
};

function nextTrack() {
  if(typeof currentTrack === 'undefined'){
    currentTrack = 0;
  } else {
    currentTrack++;
  };
  if (currentTrack === tracks.length ) {
    currentTrack = 0;
    audioState = 'paused';
  }
  queueTrack(tracks[currentTrack]);
  $nextControl.style.display = 'inline';
}

function pauseTrack() {
  $playControl.innerHTML = "Play";
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
  if (modifier > 9.2) {
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
  if (value > 80 && Math.abs(value - currentColorValue) > 25) {
    colorIndex+=1;
    if (colorIndex === colors.length ) {colorIndex = 0};
    document.querySelector('body').style.backgroundColor = colors[colorIndex];
  }
  currentColorValue = value;
}
