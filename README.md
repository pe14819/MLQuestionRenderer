# MLQuestionRenderer
Local HTML tool to preview .quiz files rendered for https://mlbook.cs.bris.ac.uk/.
Details on .quiz files can be found here https://github.com/COMS30301/quiz.

To run the tool load the index.html into any browser and select the .quiz file you wish to load. Images must be within the local directory to be previewed.

The main rendering accours in generate.js which parses the .quiz files and then mustache.js (https://github.com/janl/mustache.js/) renders the results with using the templates in template.js. The Latex is rendered with MathJax (https://github.com/mathjax/MathJax).
