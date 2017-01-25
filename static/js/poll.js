var socket = io.connect();

(function() {
	var isAttached = false;
	var submit = document.querySelector('.submit');
	
	function submitPoll() {
		var q = $("input[id='pQuestion']").val();
		var answers = {}
		$("input[id='answer[]']").each(function() {
		    a = ($(this).val())
		    answers[a] = 0
		});
		var pushAnswers = JSON.stringify(answers)
		var newPoll = {
			question: q,
			answers: pushAnswers
		}
		console.log(newPoll)
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