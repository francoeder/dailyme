var isTimerStoped;
var minutesToStart;
var mustPlaySounds;
var nbaSoundWasPlayed = false;
var minutesToHorn;
var minutesPassedToHorn;
var modalTitle = "DailyMe";
var peopleListOriginal = JSON.parse(localStorage.getItem("DailyMeLastPeopleList") || "[]");
var minutesMaster;
var secondsMaster;

$('#memberModal').modal({ backdrop: 'static', keyboard: false });

var app = angular.module('myApp', ['ui.sortable']);
app.controller('myCtrl', function ($scope) {
    $scope.modalTitle = modalTitle;
    $scope.minutesMaster = minutesMaster;
    $scope.secondsMaster = secondsMaster;
    $scope.minutesPerPerson = 2;
    $scope.minutesParticipant = $scope.minutesPerPerson;
    $scope.secondsParticipant = "00";
    $scope.currentParticipant = "";    
    $scope.mustPlaySounds = true;
    $scope.peopleToAdd = "";
    $scope.minutesToStart = function () {
        if (peopleListOriginal != undefined && $scope.minutesPerPerson != undefined) {
            return peopleListOriginal.length * $scope.minutesPerPerson;
        }
        else {
            return 1;
        }
    };

    $scope.peopleList = JSON.parse(JSON.stringify(peopleListOriginal));

    $scope.addItemToPeopleList = function(name){
        if (name != "") {
            var people = {name: name};
            $scope.peopleList.push(people);
            $scope.peopleToAdd = "";   
        }
    }
    
    $scope.removeItemFromPeopleList = function(index){
        $scope.peopleList.splice(index, 1);
    }

    $scope.setOriginalListOfPeople = function(){
      peopleListOriginal = JSON.parse(JSON.stringify($scope.peopleList));
    }

    $scope.isTheLastParticipant = function(){
      return $scope.peopleList.length == 0;
    }

    $scope.wasPaused = false;

    $scope.nextParticipant = function () {
      if ($scope.peopleList.length > 0) {
        if (!$scope.wasPaused) {
          var currentParticipantName = $scope.peopleList[0].name;
          $scope.currentParticipant = currentParticipantName;
          $scope.removeItemFromPeopleList(0);
          $scope.minutesParticipant = $scope.minutesPerPerson;
          $scope.secondsParticipant = "00";

          
        }
      }
      // else {
      //   resetTimer(true);
      // }
    };

    $scope.timerRunning = true;
    $scope.startTimer = function (){
        $scope.$broadcast('timer-start');
        $scope.timerRunning = true;
    };
    $scope.stopTimer = function (){
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
    };

});



function initApplication() {
  var $scope = getScope();

  $scope.setOriginalListOfPeople();

  saveListOfPeopleInLocalStorage();

  isTimerStoped = true;
  minutesToStart = $scope.minutesToStart();
  minutesToHorn = $scope.minutesPerPerson;
  minutesPassedToHorn = 0;

  $scope.$apply(function() {
        $scope.minutesMaster = minutesToStart;
        $scope.secondsMaster = "00";
        $scope.wasPaused = false;
    });

  // document.getElementById("timer").style.display = null;
  // document.getElementById("finished-message").style.display = "none";

  setButtonsEnable();
}

function goTimerParticipants() {
  if (!isTimerStoped) {
    var $scope = getScope();

    var presentTimeMinutes = $scope.minutesParticipant;
    var presentTimeSeconds = $scope.secondsParticipant;

    minutesParticipant = presentTimeMinutes;
    secondsParticipant = checkSecond(presentTimeSeconds - 1);

    if(secondsParticipant == 59){
      minutesParticipant = minutesParticipant - 1;
    }
    
    $scope.$apply(function() {
        $scope.minutesParticipant = minutesParticipant;
        $scope.secondsParticipant = secondsParticipant;
    });

    if (minutesParticipant == 0 && secondsParticipant == 0) {
      if ($scope.peopleList.length == 0) {
        setTimeout(function() {
          resetTimer(true);  
        }, 1000);
      }
      else {
        $scope.nextParticipant();
        showAlertToNextParticipant();
        playHorn();
      }
    }

    setTimeout(goTimerParticipants, 1000);
  }
}

function goTimer() {
  if (!isTimerStoped) { 
    var $scope = getScope();

    var presentTimeMinutes = $scope.minutesMaster;
    var presentTimeSeconds = $scope.secondsMaster;

    minutesMaster = presentTimeMinutes;
    secondsMaster = checkSecond(presentTimeSeconds - 1);

    if(secondsMaster == 59){
      minutesMaster = minutesMaster - 1;
    }
    
    $scope.$apply(function() {
        $scope.minutesMaster = minutesMaster;
        $scope.secondsMaster = secondsMaster;
    });

    // Horn things
    if (presentTimeMinutes != minutesMaster && minutesToStart != presentTimeMinutes) {
      minutesPassedToHorn += 1;
      if (minutesToHorn == minutesPassedToHorn == 1) {
        showAlertToNextParticipant();
        playHorn();
        minutesPassedToHorn = 0;
      }
    }

    // Finished timer things
    if(minutesMaster == 0 && secondsMaster == 0){
      document.getElementById("timer").style.display = "none";
      document.getElementById("finished-message").style.display = null;
      
      isTimerStoped = true;
      setButtonsEnable("pause");
    }

    setTimeout(goTimer, 1000);
  }
}

function checkSecond(sec) {
  if (sec < 10 && sec >= 0) {sec = "0" + sec}; // add zero in front of numbers < 10
  if (sec < 0) {sec = 59};
  return sec;
}

function playTimer(){
  var $scope = getScope();

  if (minutesMaster == 0 && secondsMaster == 0) {
    resetTimer();
  }
  setButtonsEnable("play");
  // goTimer();

  $scope.nextParticipant();
  isTimerStoped = false;
  $scope.wasPaused = false;

  setTimeout(function() {
    goTimerParticipants();
    
  }, 1000);
  
  timer();
}

function pauseTimer(){
  // document.getElementById("timer").style.display = null;
  // document.getElementById("finished-message").style.display = "none";
  var $scope = getScope();
  $scope.wasPaused = true;
  setButtonsEnable("pause");
  isTimerStoped = true;

  clearTimeout(t);
}

function resetTimer(finished = false){
  if(peopleListOriginal.length > 0){
    var $scope = getScope();
    $scope.peopleList = JSON.parse(JSON.stringify(peopleListOriginal));
    $scope.$apply(function() {
        $scope.currentParticipant = "";
        $scope.minutesParticipant = $scope.minutesPerPerson;
        $scope.secondsParticipant = "00";
    });

    if (!finished) {
      stopWatch.textContent = "00:00:00";
      seconds = 0; minutes = 0; hours = 0;
    }
  }

  pauseTimer();
  initApplication();
}

function finishDaily() {
  
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

      document.getElementById('buttonConfig').setAttribute('disabled', 'disabled');

      document.getElementById('buttonNextParticipant').removeAttribute('disabled');

      break;

    default:
    case "pause":
      // buttonPause.Enable = false;
      document.getElementById('buttonPause').setAttribute('disabled', 'disabled');
      
      // buttonPlay.Enable = true;
      document.getElementById('buttonPlay').removeAttribute('disabled');

      // buttonReset.Enable = true;
      document.getElementById('buttonReset').removeAttribute('disabled');

      document.getElementById('buttonConfig').removeAttribute('disabled');

      document.getElementById('buttonNextParticipant').setAttribute('disabled', 'disabled');

      break;
  }
}

function playHorn(){
  var $scope = getScope();
  if ($scope.mustPlaySounds) {
    var audio = new Audio('sounds/horn.mp3');
    audio.play();
  }
}

function playNBASound(){
  var $scope = getScope();
  if ($scope.mustPlaySounds) {
    var audio = new Audio('sounds/nba-sound.mp3');
    audio.play();
  }
}

function showAlertToNextParticipant(){
  var $scope = getScope();
  var currentParticipantName = $scope.currentParticipant;

  $.notify({
    title: '<strong> '+ currentParticipantName + '</strong>',
    message: ", is your time!",
    icon: "glyphicon glyphicon-hand-right"
  },{
    delay: 3000,
    placement: {
      from: "bottom",
      align: "right"
    },
    // icon_type: 'image',
    template: '<div data-notify="container" class="col-xs-11 col-sm-3 alert alert-{0}" role="alert">' +
		'<img data-notify="icon" class="img-circle pull-left">' +
		'<span data-notify="title">{1}</span>' +
		'<span data-notify="message">{2}</span>' +
	  '</div>'
  });
}

function saveListOfPeopleInLocalStorage() {

  if (typeof(Storage) !== "undefined") {
    localStorage.setItem("DailyMeLastPeopleList", JSON.stringify(peopleListOriginal));
  }
}

function showConfig(){
  resetTimer();
  $('#memberModal').modal('show');
}

function getScope() {
  var appElement = document.querySelector('[ng-app=myApp]');
  var $scope = angular.element(appElement).scope();
  return $scope;
}

var stopWatch = document.getElementById('stopwatch'),
start = document.getElementById('start'),
stop = document.getElementById('stop'),
clear = document.getElementById('clear'),
seconds = 0, minutes = 0, hours = 0,
t;

function add() {
  seconds++;
  if (seconds >= 60) {
      seconds = 0;
      minutes++;
      if (minutes >= 60) {
          minutes = 0;
          hours++;
      }
  }

  stopWatch.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);

  timer();
}

function timer() {
  t = setTimeout(add, 1000);
}