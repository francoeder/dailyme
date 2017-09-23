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

var app = angular.module('myApp', ['ui.sortable']);
app.controller('myCtrl', function ($scope) {
    $scope.modalTitle = modalTitle;
    $scope.minutesMaster = minutesMaster;
    $scope.secondsMaster = secondsMaster;
    $scope.minutesPerPerson = 2;
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

});

$('#memberModal').modal({ backdrop: 'static', keyboard: false });

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
    });

  document.getElementById("timer").style.display = null;
  document.getElementById("finished-message").style.display = "none";

  setButtonsEnable();
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
  if (minutesMaster == 0 && secondsMaster == 0) {
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
  if(peopleListOriginal.length > 0){
    var $scope = getScope();

    $scope.peopleList = JSON.parse(JSON.stringify(peopleListOriginal));
  }

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

      document.getElementById('buttonConfig').setAttribute('disabled', 'disabled');

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
  $.notify({
    title: '<strong> Next Participant!</strong>',
    message: " Come on, pass the stick.",
    icon: "avatar.jpg"//"glyphicon glyphicon-hand-right"
  },{
    delay: 3000,
    placement: {
      from: "bottom",
      align: "right"
    },
    icon_type: 'image',
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

function getScope() {
  var appElement = document.querySelector('[ng-app=myApp]');
  var $scope = angular.element(appElement).scope();
  return $scope;
}