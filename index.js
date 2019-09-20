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
var messageTimeout = 5000;
var isStartOfDaily = true;
var isShowingModal = true;
var mustInitAlignmentsTime = true;
var isAlignmentsTime = false;
var isTimeToFinish = false;
var startTime;

$(document).ready(function(){
  $(document).keypress(function(e){
    applyKeyEvent(e);
  })
})

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

    $scope.messageContainer = "";

    $scope.totalTime = "";

    $scope.peopleList = JSON.parse(JSON.stringify(peopleListOriginal));

    $scope.dailyFinished = false;

    $scope.finishDaily = function () {
      $scope.dailyFinished = false;
      $scope.messageContainer = "";
      
    }

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

    $scope.addItemToPeopleListOnEnter = function(name) {
      if (keyEvent.which === 13){
        $scope.addItemToPeopleList(name);
      }
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

          isTimerStoped = true;
          showAlertToNextParticipant();
          
        }
      }
      else {
        if (mustInitAlignmentsTime) {
          alignmentsTime();  
        }
        else{
          finishDaily();
        }
      }
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

  mustInitAlignmentsTime = true;
  isAlignmentsTime = false;
  isTimeToFinish = false;
  isShowingModal = false;
  isTimerStoped = true;
  minutesToStart = $scope.minutesToStart();
  minutesToHorn = $scope.minutesPerPerson;
  minutesPassedToHorn = 0;
  isStartOfDaily = true;

  $scope.$apply(function() {
        $scope.minutesMaster = minutesToStart;
        $scope.secondsMaster = "00";
        $scope.wasPaused = false;
    });

  setButtonsEnable();

  $('#okButtonModal').hide();
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
        $scope.nextParticipant();
        playHorn();
    }
    else{
      setTimeout(goTimerParticipants, 1000);
    }
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

  isTimerStoped = false;
  $scope.wasPaused = false;

  if (isStartOfDaily) {
    $scope.nextParticipant();
    isStartOfDaily = false;
    startTime = new Date();
    timer();
  }
  else{
    setTimeout(function() {
      goTimerParticipants();  
    }, 1000);
  }
  
  
}

function pauseTimer(){
  var $scope = getScope();
  $scope.wasPaused = true;
  setButtonsEnable("pause");
  isTimerStoped = true;

  // clearTimeout(t);
}

function resetTimer(finished = false){
  if(peopleListOriginal.length > 0){
    var $scope = getScope();
    $scope.peopleList = JSON.parse(JSON.stringify(peopleListOriginal));
    // $scope.$apply(function() {
        $scope.currentParticipant = "";
        $scope.minutesParticipant = $scope.minutesPerPerson;
        $scope.secondsParticipant = "00";
        
    // });

    if (!finished) {
      stopWatch.textContent = "00:00";
      seconds = 0; minutes = 0; hours = 0;
     
    }
  }

  pauseTimer();
  initApplication();
  clearTimeout(t);
  isStartOfDaily = true;

  $('#buttonNextParticipant').html('Participant Done!');
  $('#legendCurrentParticipant').html('Current Participant');
  $('#participantTimer').show();
  $('#okButtonModal').show();
}

function alignmentsTime()
{
  playHorn();
  isAlignmentsTime = true;
  mustInitAlignmentsTime = false;

  $('#buttonNextParticipant').html('Finish Daily!');
  $('#legendCurrentParticipant').html('');
  $('#participantTimer').hide();
  
  var $scope = getScope();
  $scope.removeItemFromPeopleList(0);
  $scope.currentParticipant = "Alignments"
  $scope.minutesParticipant = "";
  $scope.secondsParticipant = "";

  isTimerStoped = true;
  
  $scope.messageContainer = "It's time for Alignments!"
  
  showModalMessage();
  
  setTimeout(function() {
    closeModalMessage();
  }, messageTimeout);
  
}

function finishDaily() {
  setTimeout(function() {
    var $scope = getScope();
    $scope.$apply(function () {
      $scope.dailyFinished = true;
      $scope.messageContainer = "Total daily time: " + $scope.totalTime;
    })

    resetTimer(true);
    
    isShowingModal = true;
    showModalMessage();
    stopWatch.textContent = "00:00";
    seconds = 0; minutes = 0; hours = 0;

    playHorn2();

;  }, 10);
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

function playHorn2(){
  var $scope = getScope();
  if ($scope.mustPlaySounds) {
    var audio = new Audio('sounds/lets-go-team.mp3');
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

  $scope.messageContainer = "It's " + currentParticipantName + "'s turn!"

  showModalMessage();

  setTimeout(function() {
    closeModalMessage();
    isTimerStoped = false;

    // Chamar o GoTimerParticipants
      goTimerParticipants();

  }, messageTimeout);
}

function saveListOfPeopleInLocalStorage() {

  if (typeof(Storage) !== "undefined") {
    localStorage.setItem("DailyMeLastPeopleList", JSON.stringify(peopleListOriginal));
  }
}

function showConfig(){
  resetTimer();
  isShowingModal = true;
  $('#memberModal').modal('show');
}

function showModalMessage(){
  isShowingModal = true;
  $('#memberModalContainerMessage').modal({ backdrop: 'static', keyboard: false });
}

function closeModalMessage(){
  isShowingModal = false;
  $('#memberModalContainerMessage').modal('toggle');
}

function enableShortcuts() {
  debugger;
  isShowingModal = false;
  isAlignmentsTime = false;
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
  // seconds++;
  // if (seconds >= 60) {
  //     seconds = 0;
  //     minutes++;
  //     if (minutes >= 60) {
  //         minutes = 0;
  //         hours++;
  //     }
  // }

  var nowTime = new Date();
  var difference_ms = nowTime - startTime;
  difference_ms = difference_ms/1000;
  seconds = Math.floor(difference_ms % 60);
  difference_ms = difference_ms/60; 
  minutes = Math.floor(difference_ms % 60);

  // console.log(startTime + " - " + nowTime);
  // console.log(mins + " : " + secs);


  var timeNow = (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds); 
  stopWatch.textContent = timeNow; 

  var $scope = getScope();
  $scope.$apply(function() {
      $scope.totalTime = timeNow;
  });

  timer();
}

function timer() {
  t = setTimeout(add, 1000);
}

function diff_minutes(dt2, dt1)
{
  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
}
