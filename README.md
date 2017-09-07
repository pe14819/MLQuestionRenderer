# MLQuestionRenderer
Local HTML tool to preview .quiz files rendered for https://mlbook.cs.bris.ac.uk/.
Details on .quiz files can be found here https://github.com/COMS30301/quiz.

To run the tool load the index.html into any browser and select the .quiz file you wish to load. Images must be within the local directory to be previewed.

The main rendering accours in generate.js which parses the .quiz files and then mustache.js (https://github.com/janl/mustache.js/) renders the results with using the templates in template.js. The Latex is rendered with MathJax (https://github.com/mathjax/MathJax).

## Graphs
I have some initial work here on displaying graphs and ML learning algorithms.

To display the graphs d3 is used (https://github.com/d3, https://github.com/d3/d3-contour) and the machine learing is done with ml.js (https://github.com/mljs/ml). Currently graphs are loaded with some semi csv files put in the csv directory. This means the tool with graphs is not currently local, you will need to run a simple HTML server ("python -m SimpleHTTPServer" in terminal, or whatever server method you choose) in order to load the csv files from the server. A possible fix for this is making the csv written in the .quiz file itself.

Currently only knn has been implemented so the other algorithms need to be looked through and implemented
