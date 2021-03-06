
var ui = new UI();
var state;
var searchBox;
var database;
// Old codebase was using 5
var matrusp_current_state_version = 6;

state = new State();
database = new Database();
database.loadDB('db/db_usp.txt', 1);
searchBox = new SearchBox();

if (window.location.hash.substr(1)) {
	ui.loadStateFromServer(window.location.hash.substr(1));
	history.pushState('', document.title, window.location.pathname);
} else if (localStorage.getItem('state')) {
	state.clear();
	state.load(JSON.parse(localStorage.getItem('state')));
	saveStateOnLocalStorage();
}
setTimeout(function(){ui.scrollActiveCombinationToView()}, 100);

