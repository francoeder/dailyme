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
var messageTimeout = 4000;

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
      debugger;
      if ($scope.peopleList.length > 0) {
        if (!$scope.wasPaused) {
          var currentParticipantName = $scope.peopleList[0].name;
          $scope.currentParticipant = currentParticipantName;
          $scope.removeItemFromPeopleList(0);
          $scope.minutesParticipant = $scope.minutesPerPerson;
          $scope.secondsParticipant = "00";

          isTimerStoped = true;
          showAlertToNextParticipant();
          
          // setTimeout(function() {
          //   isTimerStoped = false;
            
            
          // }, messageTimeout);
          
        }
      }
      else {
        debugger;
        finishDaily();
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

  isTimerStoped = true;
  minutesToStart = $scope.minutesToStart();
  minutesToHorn = $scope.minutesPerPerson;
  minutesPassedToHorn = 0;

  $scope.$apply(function() {
        $scope.minutesMaster = minutesToStart;
        $scope.secondsMaster = "00";
        $scope.wasPaused = false;
    });

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
        finishDaily();
      }
      else {
        $scope.nextParticipant();
        playHorn();
        setTimeout(function() {
          setTimeout(goTimerParticipants, 1000);
        }, messageTimeout);
      }
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
  $scope.nextParticipant();
  
  timer();
}

function pauseTimer(){
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
      stopWatch.textContent = "00:00";
      seconds = 0; minutes = 0; hours = 0;
    }
  }

  pauseTimer();
  initApplication();
}

function finishDaily() {
  setTimeout(function() {
    var $scope = getScope();
    $scope.$apply(function () {
      $scope.dailyFinished = true;
      $scope.messageContainer = "Daily finalizada em " + $scope.totalTime;
    }) 

    resetTimer(true);
    showModalMessage();
    stopWatch.textContent = "00:00"
;  }, 1000);
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

  $scope.messageContainer = currentParticipantName + ", you are the next!"
  showModalMessage();
  setTimeout(function() {
    closeModalMessage();
    isTimerStoped = false;

    // Chamar o GoTimerParticipants
    setTimeout(function() {
      goTimerParticipants();                        
    }, 1000);

  }, messageTimeout);
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

function showModalMessage(){
  $('#memberModalContainerMessage').modal('show');
}

function closeModalMessage(){
  $('#memberModalContainerMessage').modal('toggle');
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