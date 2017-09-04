$(function(){

	// MathJax.Hub.Config({
	//   tex2jax: {inlineMath: [['$','$']]}
	// });

	MathJax.Hub.Config({
		"HTML-CSS" : { preferredFont : "Asana-Math"},
		extensions: ["tex2jax.js"],
		jax: ["input/TeX","output/HTML-CSS"],
	  tex2jax: {inlineMath: [['$','$']]}
	});

	$("#generate").change(function(event){
		var uploadedFile = event.target.files[0];
		if (uploadedFile) {
			var readFile = new FileReader();
			readFile.onload = function(e) {
				renderQuestions(e.target.result);

				MathJax.Hub.Queue(['Typeset', MathJax.Hub]);
			};
			readFile.readAsText(uploadedFile);
		} else {
			console.log("Failed to load file");
		}
	});

});

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}
