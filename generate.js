graphs = [];

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
		html.append(Mustache.render(Templates.Score, {'id': $(".q").length, 'workings': workings}));
		drawGraphs();
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

	for(var i in json.graphs)
	{
		var j = graphs.length;
		data.graphs.push({'graph' : j + '_graph'});
		graphs.push({"url" : json.graphs[i].url, "id" : j + '_graph', "algorithm" : json.graphs[i].algorithm});
	}

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

function drawGraphs()
{
	for(var i in graphs)
		$.ajax({ url: graphs[i].url, success: function(file_content) {
				var csv = parseCSV(file_content);
				generateGraph(csv, graphs[i].id, graphs[i].algorithm);
			}
		});
}

function parseCSV( str )
{
	var csv = []

	var lines = str.split(/[\r\n]+/g);
	lines.forEach(function(line) {
		var val = line.split(',').map(function(n){return(parseInt(n))});
		if(val.length >= 3)
			csv.push({"x": val[0], "y": val[1], "class": val[2]});
	});

	return csv;
}

function generateGraph( csv, id, algorithm )
{
	var s = document.getElementById(id);
	var svg = d3.select(s);

	minX = 0, maxX = 0;
	minY = 0, maxY = 0;
	for(var i in csv)
	{
		minX = Math.min(csv[i].x, minX);
		minY = Math.min(csv[i].y, minY);
		maxX = Math.max(csv[i].x, maxX);
		maxY = Math.max(csv[i].y, maxY);
	}

	var padding = 20;
	var size = 300;

	var xScale = d3.scaleLinear()
			.domain([minX, maxX])
			.range([padding, size + padding]);
	var yScale = d3.scaleLinear()
			.domain([minY, maxY])
			.range([size + padding, padding]);

	svg.attr("viewbox", 0 + "," + 0 + "," + (size + padding*2) + "," + (size + padding*2))
								.attr("class", "graph")
								.attr("height", size + padding*2)
								.attr("width", size + padding*2);

	svg.selectAll("circle")
		.data(csv)
		.enter()
		.append("circle")
		.attr("cx", function(d) {
			return xScale(d.x);
		})
		.attr("cy", function(d) {
			return yScale(d.y);
		})
		.attr("fill", function(d) {
			if(d.class == 1) return "#f11";
			else return "#11f";
		})
		.attr("r", 2);

	var xAxis = d3.axisBottom(xScale);
	var yAxis = d3.axisLeft(yScale);

	svg.append("g")
		.attr("transform", "translate(0,"+ yScale(0) +")")
		.call(xAxis);
	svg.append("g")
		.attr("transform", "translate("+ xScale(0) +",0)")
		.call(yAxis);

	if(algorithm == "knn")
	{
		var dataset = [];
		var classes = [];
		for(var i in csv)
		{
			dataset.push([csv[i].x, csv[i].y]);
			classes.push(csv[i].class)
		}

		var knn = new ML.SL.KNN.default(dataset, classes);

		var n_features = [];
		var scale = 2;
		for(var y = maxY; y > minY - 1; y--)
			for(var x = minX; x < maxX + 1; x++)
			{
				n_features.push(knn.predict([x, y]));
			}

	  svg.selectAll("path")
	    .data(d3.contours()
	        .size([maxX-minX+1, maxY-minY+1])
	      (n_features))
	    .enter().append("path")
	      .attr("d", d3.geoPath(d3.geoIdentity().scale(size / (maxX-minX+1))))
				.attr("fill", "transparent")
	      .attr("stroke", function(d) {
																	if(d.value == 0.5) return "#f11";
																	else return "transparent";
																	})
				.attr("transform", "translate("+(padding)+","+(padding)+")" );
	}
	if(algorithm == "svm")
	{
		var dataset = [];
		var classes = [];
		for(var i in csv)
		{
			dataset.push([csv[i].x, csv[i].y]);
			classes.push(csv[i].class)
		}

		var options = {
		  C: 0.01,
		  tol: 10e-4,
		  maxPasses: 10,
		  maxIterations: 10000,
		  kernel: 'rbf',
		  kernelOptions: {
		    sigma: 0.5
		  }
		};

		var svm = new ML.SL.SVM(options);

		svm.train(dataset, classes);

		var n_features = [];
		var scale = 2;
		for(var y = maxY; y > minY - 1; y--)
			for(var x = minX; x < maxX + 1; x++)
			{
				n_features.push(svm.predict([x, y]));
				console.log(svm.predict([x, y]));
			}

		svg.selectAll("path")
			.data(d3.contours()
					.size([maxX-minX+1, maxY-minY+1])
				(n_features))
			.enter().append("path")
				.attr("d", d3.geoPath(d3.geoIdentity().scale(size / (maxX-minX+1))))
				.attr("fill", "transparent")
				.attr("stroke", function(d) {
																	if(d.value == 0.5) return "#f11";
																	else return "#11f";
																	})
				.attr("transform", "translate("+(padding)+","+(padding)+")" );
	}
}
