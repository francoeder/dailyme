function applyKeyEvent(key) {
	if (!isShowingModal) {

		if (!isAlignmentsTime) {
			if(key.wich == 32 || key.keyCode == 32){
				if (isTimerStoped) {
					playTimer();
				}
				else{
					pauseTimer();
				}
			}	
		}
		
		if (key.wich == 13 || key.keyCode == 13) {
			debugger;
			if (!isAlignmentsTime) {
				if (!isTimerStoped) {
					var $scope = getScope();
					$scope.nextParticipant();	
				}
			}
			else{
				finishDaily();
			}
		}
	}	
}