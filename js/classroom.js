/**
 * A class representing classrooms.
 * 
 * @Constructor
 *
 * @example
 *  var classroomExample = {
 *    classroomCode: "43",
 *    selected: 1,
 *    horas_aula: 0,
 *    vagas_ofertadas: 0,
 *    vagas_ocupadas: 0,
 *    alunos_especiais: 0,
 *    saldo_vagas: 0,
 *    pedidos_sem_vaga: 0,
 *		data_inicio: "31/07/2016",
 *		data_fim: "10/12/2016",
 *    teachers: [
 *      "First Guy",
 *      "Second Son",
 *      "third Weird"
 *    ],
 *    schedules: [{@link Schedule}],
 *    htmlElement: div.classroom-info
 *  }
 *
 * @see UI#createClassroomInfo
 */
 // IMPORTANT: the 'ui' variable must be already set up!
function Classroom(jsonObj, parentLecture) {
  this.parent = parentLecture;
  this.teachers = new Array();
  this.schedules = new Array();
  if (jsonObj) {
		this.data_inicio = jsonObj.data_inicio;
		this.data_fim = jsonObj.data_fim;
    this.classroomCode = new Array(); 
    this.horas_aula = jsonObj.horas_aula;
    this.vagas_ocupadas = jsonObj.vagas_ocupadas;
    this.alunos_especiais = jsonObj.alunos_especiais;
    this.saldo_vagas = jsonObj.saldo_vagas;
    this.pedidos_sem_vaga = jsonObj.pedidos_sem_vaga;
    this.selected = jsonObj.selected;
    // Array.slice(0) copies the _entire_ array.
		this.addTeachers(jsonObj.teachers);
    for (var i = 0; i < jsonObj.schedules.length; i++) {
      this.schedules.push(new Schedule(jsonObj.schedules[i], this));
    }
		if (jsonObj.classroomCode) {
			for (var i = 0; i < jsonObj.classroomCode.length; i++) {
				this.classroomCode.push(jsonObj.classroomCode[i]);
			}
		}
    this.htmlElement = ui.createClassroomInfo(this, parentLecture.code);
    if (this.selected) {
      addClass(this.htmlElement, 'classroom-selected');
    }
    this.addEventListeners();
  } else {
		this.data_inicio = null; 
		this.data_fim = null;
    this.classroomCode = null;
    this.horas_aula = null;
    this.vagas_ofertadas = null;
    this.vagas_ocupadas = null;
    this.alunos_especiais = null;
    this.saldo_vagas = null;
    this.pedidos_sem_vaga = null;
    this.selected = null;
    this.htmlElement = null;
  }
}

Classroom.prototype.addTeachers = function(teachers) {
	for (var i = 0; i < teachers.length; i++) {
		if (teachers[i].length > 1) {
			if (typeof(teachers[i]) == 'object') {
				var tmp = teachers[i].slice(0);
				for (var j = 0; j < tmp.length; j++) {
					this.teachers.push(tmp[j]);
				}
			}	else {
				this.teachers.push(teachers[i]);
			}
		} else {
			var tmp = teachers[i].slice(0);
			this.teachers.push(tmp[0]);
		}
	}
	this.removeDuplicates(this.teachers);
}


Classroom.prototype.removeDuplicates = function(teachers) {
	for (var i = 0; i < teachers.length; i++) {
		for (var j = i+1; j < teachers.length; j++) {
			if (JSON.stringify(teachers[i]) == JSON.stringify(teachers[j])) {
				teachers.splice(j,1);
				j--;
			}
		}
	}
}

/**
 *
 */
// Doesn't need to remove htmlElement because parent Lecture will
// remove the entire div.lecture-info
Classroom.prototype.delete = function() {
  for (var i = 0; i < this.schedules.length; i++) {
    this.schedules[i].delete();
  }
}

/**
 *
 */
Classroom.prototype.addClassInSchedules = function(className) {
  for (var i = 0; i < this.schedules.length; i++) {
    addClass(this.schedules[i].htmlElement, className);
  }
};

/**
 *
 */
Classroom.prototype.removeClassInSchedules = function(className) {
  for (var i = 0; i < this.schedules.length; i++) {
    removeClass(this.schedules[i].htmlElement, className);
  }
};

/**
 *
 */
Classroom.prototype.showBox = function() {
  this.addClassInSchedules('schedule-box-show');
  addClass(this.htmlElement, 'classroom-active');
};

/**
 *
 */
Classroom.prototype.hideBox = function() {
  this.removeClassInSchedules('schedule-box-show');
  removeClass(this.htmlElement, 'classroom-active');
};

Classroom.prototype.checkAndSetConflict = function() {
  var conflictNotSet = true;
  var lecture = this.parent;
  // Look for conflicting schedules. The active classroom doesn't have any
  // conflicts because it is active (obviously). Also there are conflicts only
  // if there is a combination being displayed.
  if (this != lecture.activeClassroom && lecture.parent.activeCombination) {
    var lecturesClassroom = lecture.parent.activeCombination.lecturesClassroom;
    for (var i = 0; i < lecturesClassroom.length; i++) {
      if (this.parent == lecturesClassroom[i].parent) {
        // Same lecture, skip.
        continue;
      }
      // Iterate over every schedule on this classroom and every active classroom
      // on the current active combination.
      for (var j = 0; j < this.schedules.length; j++) {
        for (var k = 0; k < lecturesClassroom[i].schedules.length; k++) {
          if (schedulesConflict(this.schedules[j], lecturesClassroom[i].schedules[k])) {
            // This schedule (one of many for this classroom) conflicts with some other
            // schedule from an active classroom. Set conflict highlight.
            addClass(this.schedules[j].htmlElement, 'schedule-box-highlight-conflict');
            if (conflictNotSet) {
              conflictNotSet = false;
              addClass(this.htmlElement, 'classroom-conflict');
            }
          }
        }
      }
    }
  }
}

/*
 * Maybe it's not needed, but to be safe and bug prone use it.
 */
Classroom.prototype.unsetConflict = function() {
  this.removeClassInSchedules('schedule-box-highlight-conflict');
}

/**
 * 
 */
Classroom.prototype.showOnHover = function() {
  var lecture = this.parent;

  if (!lecture.selected) {
    lecture.stopAnimationLoop();
  }

  if (lecture.activeClassroom) {
    lecture.activeClassroom.hideBox();
  }
  this.checkAndSetConflict();
  this.showBox();
  addClass(this.htmlElement, 'classroom-highlight');
}

/**
 *
 */
Classroom.prototype.hideOnHoverOut = function() {
  var lecture = this.parent;
  removeClass(this.htmlElement, 'classroom-highlight');
  this.hideBox();
  this.removeClassInSchedules('schedule-box-highlight-conflict');
  if (lecture.activeClassroom) {
    lecture.activeClassroom.showBox();
  }

  if (!lecture.selected) {
    lecture.animationLoopShowEachClassroom();
  }
}

/**
 * @param {Boolean} [shouldUpdate=true] - enables parent lecture and current plan's update
 */
Classroom.prototype.toggleClassroomSelection = function(shouldUpdate) {
  toggleClass(this.htmlElement, 'classroom-selected');
  this.selected = !this.selected;

  // These two lines are relevant when this function is called by effect of
  // toggling selection of all classrooms.
  var checkbox = this.htmlElement.getElementsByClassName('classroom-info-checkbox')[0];
  checkbox.checked = this.selected;

  // creates a 'true' default value for 'shouldUpdate'
  shouldUpdate = (typeof shouldUpdate !== 'undefined') ? shouldUpdate : true;
  if (shouldUpdate) {
    this.parent.update(this);
  }
}

/**
 * This function adds event listeners to 'mouseenter', 'mouseleave' and 'click'
 *
 * @see Classroom#showOnHover
 * @see Classroom#hideOnHoverOut
 * @see Classroom#toggleClassroomSelection
 */
Classroom.prototype.addEventListeners = function() {
  this.htmlElement.addEventListener('mouseenter', this.showOnHover.bind(this));
  this.htmlElement.addEventListener('mouseleave', this.hideOnHoverOut.bind(this));
  var checkbox = this.htmlElement.getElementsByClassName('classroom-info-checkbox')[0];
  checkbox.addEventListener('click', this.toggleClassroomSelection.bind(this));
};
