/**
 * A class representing combinations.
 * 
 * @Constructor
 *
 * @example
 *  var combinationExemple = {
 *    parent: {@link Plan},
 *    classrooms: [{@link Classroom}], // classrooms.length === parent.lectures.length
 *    htmlElement: div
 *  }
 *
 * @see Plan#computeCombinations
 */
function Combination(combinationIndices, plan) {
  this.parent = plan;
  this.lecturesClassroom = new Array();

  for (var i = 0; i < combinationIndices.length; i++) {
    var classroomIndex = combinationIndices[i];
    if (classroomIndex == -1) {
      // Lecture not selected
      continue;
    }
    this.lecturesClassroom.push(plan.lectures[i].classrooms[classroomIndex]);
  }

  this.htmlElement = ui.createCombinationBoard(this);
  this.addEventListeners();
}

Combination.prototype.delete = function() {
  if (this.parent.combinations.length == 1) {
    this.htmlElement.parentNode.style.width = '0px';
  }
  this.htmlElement.parentNode.removeChild(this.htmlElement);

  // All htmlElements removed, now remove itself from the plan and
  // update it.
  var indexOnParent = this.parent.combinations.indexOf(this);
  this.parent.combinations.splice(indexOnParent, 1);
}

/**
 *
 */
Combination.prototype.getSimilarityScore = function(otherCombination) {
  var sameClassroomsCounter = 0;
  for (var i = 0; i < this.lecturesClassroom.length; i++) {
    for (var j = 0; j < otherCombination.lecturesClassroom.length; j++) {
      if (this.lecturesClassroom[i] == otherCombination.lecturesClassroom[j]) {
        sameClassroomsCounter++;
      }
    }
  }
  return sameClassroomsCounter;
};

Combination.prototype.setHighlight = function() {
  addClass(this.htmlElement, 'combination-highlight');
};

Combination.prototype.unsetHighlight = function() {
  removeClass(this.htmlElement, 'combination-highlight');
};

Combination.prototype.setCombination = function() {
  this.parent.setCombination(this);
};

Combination.prototype.addEventListeners = function() {
  this.htmlElement.addEventListener('click', this.setCombination.bind(this));
}