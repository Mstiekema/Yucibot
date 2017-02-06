var socket = io.connect();

(function() {
	var isAttached = false;
	var submit = document.querySelector('.submit');

	function submitPoll() {
		var q = $("input[id='pQuestion']").val();
		var answers = new Array;
		$("input[id='answer[]']").each(function() {
		    a = ($(this).val())
		    answers.push(a)
		});
		var pushAnswers = JSON.stringify(answers)
		var newPoll = {
			question: q,
			answers: pushAnswers
		}
		socket.emit('createPoll', newPoll)
		window.location.href = "/poll"
	}

	if (!submit) return;
	if (isAttached) return;

	submit.addEventListener('click', submitPoll);
	isAttached = true;
})();

$(".addAnswer").click(function() {
	$(".allAnswers").append('<input id="answer[]" type="text"><br>');
});

$(".goPoll").click(function() {
	window.location.href = "/poll/" + this.closest("p").id + "/result"
});

$(".remPoll").click(function() {
	socket.emit('remPoll', this.closest("p").id)
	alert("Succesfully removed the poll with id " + this.closest("p").id)
	setTimeout(function () { window.location.reload() }, 300);
});
