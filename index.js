var isTimerStoped;
var minutes;
var seconds;

var minutesToStart;
var mustPlaySounds;

var nbaSoundWasPlayed = false;

// Horn Variables
var minutesToHorn = 2;
var minutesPassedToHorn = 0;

initApplication();

function initApplication() {
  isTimerStoped = true;
  minutesToStart = document.getElementById('minutesToStart').value;
  
  if (minutesToStart === "" || minutesToStart < 1) {
    minutesToStart = "1";
    document.getElementById('minutesToStart').value = "1";
  }

  document.getElementById('minutes').innerHTML = minutesToStart;
  document.getElementById('seconds').innerHTML = "00";

  document.getElementById("timer").style.display = null;
  document.getElementById("finished-message").style.display = "none";

  setButtonsEnable();
  fnMustPlaySounds();
}

function goTimer() {
  if (!isTimerStoped) { 
    var presentTimeMinutes = document.getElementById('minutes').innerHTML;
    var presentTimeSeconds = document.getElementById('seconds').innerHTML;
    minutes = presentTimeMinutes;
    seconds = checkSecond(presentTimeSeconds - 1);

    if(seconds == 59){
      minutes = minutes - 1;
    }

    // Horn things
    if (presentTimeMinutes != minutes && minutesToStart != presentTimeMinutes) {
      minutesPassedToHorn += 1;
      if (minutesToHorn == minutesPassedToHorn == 1) {
        showAlertToNextParticipant();
        playHorn();
        minutesPassedToHorn = 0;
      }
    }

    // NBA things
    debugger;
    if (minutes == 0 && seconds == 10 && !nbaSoundWasPlayed) {
      playNBASound();
      nbaSoundWasPlayed = true;
    }

    // Finished timer things
    if(minutes == 0 && seconds == 0){
      document.getElementById("timer").style.display = "none";
      document.getElementById("finished-message").style.display = null;
      
      isTimerStoped = true;
      setButtonsEnable("pause");
    }

    document.getElementById('minutes').innerHTML = minutes
    document.getElementById('seconds').innerHTML = seconds;

    setTimeout(goTimer, 1000);
  }
}

function checkSecond(sec) {
  if (sec < 10 && sec >= 0) {sec = "0" + sec}; // add zero in front of numbers < 10
  if (sec < 0) {sec = "59"};
  return sec;
}

function playTimer(){
  if (minutes == 0 && seconds == 0) {
    resetTimer();
  }
  setButtonsEnable("play");
  isTimerStoped = false;
  goTimer();
}

function pauseTimer(){
  document.getElementById("timer").style.display = null;
  document.getElementById("finished-message").style.display = "none";
  setButtonsEnable("pause");
  isTimerStoped = true;
}

function resetTimer(){
  pauseTimer();
  initApplication();
}

function setParamsTimer(){
  if (isTimerStoped) {
    resetTimer();
  }
}

function setButtonsEnable(action){
  switch (action) {
    case "play":
      //buttonPause.Enable = true;
      document.getElementById('buttonPause').removeAttribute('disabled');

      //buttonPlay.Enable = false;
      document.getElementById('buttonPlay').setAttribute('disabled', 'disabled');

      //buttonReset.Enable = false;
      document.getElementById('buttonReset').setAttribute('disabled', 'disabled');

      document.getElementById('minutesToStart').setAttribute('disabled', 'disabled');

      break;

    default:
    case "pause":
      // buttonPause.Enable = false;
      document.getElementById('buttonPause').setAttribute('disabled', 'disabled');
      
      // buttonPlay.Enable = true;
      document.getElementById('buttonPlay').removeAttribute('disabled');

      // buttonReset.Enable = true;
      document.getElementById('buttonReset').removeAttribute('disabled');

      document.getElementById('minutesToStart').removeAttribute('disabled');

      break;
  }
}

function fnMustPlaySounds(){
  mustPlaySounds = document.getElementById('mustPlaySound').checked;
}

function playHorn(){
  if (mustPlaySounds) {
    var audio = new Audio('sounds/horn.mp3');
    audio.play();
  }
}

function playNBASound(){
  if (mustPlaySounds) {
    var audio = new Audio('sounds/nba-sound.mp3');
    audio.play();
  }
}

function showAlertToNextParticipant(){
  $.notify({
    title: '<strong> Next Participant!</strong>',
    message: " Come on, pass the stick.",
    icon: "glyphicon glyphicon-hand-right"
  },{
    delay: 3000,
    placement: {
      from: "bottom",
      align: "right"
    },
  });
}