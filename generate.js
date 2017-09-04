function renderQuestions( str )
{
	graphs = [];
	$("#spinner").attr("hidden", false);
	var html = $('#questions');
	html.html("");

	html.append(Mustache.render(Templates.Header, {'title': 'Questions'}));

	json = parseJson(str);
	if(json.error == true)
	{
		alert("No questions found.")
	}
	else
	{
		workings = [];
		length = 0;
		for(var key in json)
			if(!isNaN(parseInt(key)))
			{
				html.append(renderQuestion ( json[key], length++ ));
				workings.push({"id":(length-1), "working": json[key].workings});
			}
		html.append(Mustache.render(Templates.Score, {'id': $(".q").length, 'workings': workings}))
		renderFooter();
	}

}

function renderFooter() {
		var html = $('#questions');

		html.append(Mustache.render(Templates.Scripts, {}));

		$("#questions").attr("hidden", false);
		$("#spinner").attr("hidden", true);
}


function parseJson( str )
{
	var jsonString = '';

	//Remove Comments, Tabs and Backslashes
	var lines = str.split(/[\r\n]+/g);
	lines.forEach(function(line) {
		testline = line.replace(/\s/g, '');
		if(!(testline.charAt(0) == '/' && testline.charAt(1) == '/'))
			jsonString += line + '\n';
	});
	jsonString = jsonString.replace(/\t/g, '  ');
	jsonString = jsonString.replace(/\\[\s]*\n/g, '');

	return JSON.parse(jsonString);
}

function renderQuestion( json , id )
{
	var data = {'id': id.toString(),
							'reference': json.reference,
							'difficulty': json.difficulty,
							'question': json.question,
							'images': [],
							'graphs': [],
							'answers': [],
							'hint': json.hint};

	for(var i in json.images)
		if(json.images[i].url != '')
			data.images.push({'url': json.images[i].url, 'caption': json.images[i].caption});

	if(json.answer_type == 'single')
	{
		data.correct = -1;
		for(var i in json.answers)
		{
			if(json.answers[i].correctness == '+')
				data.correct = i;
			data.answers.push({'index': i, 'answer': json.answers[i].answer});
		}

		return Mustache.render(Templates.Single, data);
	}

	else if(json.answer_type == 'multiple')
	{
		for(var i in json.answers)
			data.answers.push({'index': i, 'answer': json.answers[i].answer, 'correctness': json.answers[i].correctness});

		return Mustache.render(Templates.Multiple, data);
	}

	else if(json.answer_type == 'sort')
	{
		for(var i in json.answers)
			data.answers.push({'index': i, 'answer': json.answers[i].answer, 'correctness': json.answers[i].correctness});

		return Mustache.render(Templates.Sort, data);
	}

	else if(json.answer_type == 'blank_answer')
	{
		data.question = '';
		var blank = 0;
		for(var i in json.question)
			if(typeof json.question[i] === 'string')
				data.question += json.question[i];
			else if(typeof json.question[i] === 'number')
			{
				var size = 0;
				var j = json.answers.reduce(function(a, b, c) { if(b.correctness == json.question[i]) return c; else return a; }, -1);
				var array = '"' + json.answers[j].answer.replace(/,/g, '","') + '"';
				data.answers.push({'answer': array.toLowerCase()});
				size = JSON.parse('['+ array +']').reduce(function(a, b) { return Math.max(a, b.length); }, 0);
				data.question += '<input class="blank" type="text" size="'+ size +'" id="' + blank++ + '_' + id + '"></input>';
			}

		return Mustache.render(Templates.Blank, data);
	}

	else if(json.answer_type == 'cloze_answer')
	{
		data.answers = '';
		for(var i = 0; i < json.answers.answer.length; i = i + 2)
			data.answers += '"' + json.answers.answer[i].replace(/\s/g, '').replace(/\|/g, '","') + '",';

		return Mustache.render(Templates.Cloze, data);
	}

	else if(json.answer_type == 'matrix_sort_answer')
	{
		data.questions = [];
		for(var i in json.answers)
		{
			data.answers.push({'index': i, 'answer': json.answers[i].answer, 'value': Math.random()});
			data.questions.push({'index': i, 'question': json.answers[i].correctness});
		}
		data.answers.sort(function(a,b){return a.value - b.value});
		for(var i in data.answers) data.answers[i].position = i;

		return Mustache.render(Templates.Matrix, data);
	}

	else
		return Mustache.render(Templates.Default, {'id': id.toString()});
}
