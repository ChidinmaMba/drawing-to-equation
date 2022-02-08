var currentDegree = 3;
var maxDegree = 10;
var headerHeight = 70;
var sideBarWidth = 170;

for(let i = 1; i<= maxDegree;i++) {
	let degreeDiv = document.createElement("div");
	let degree = document.createElement("input");
	degree.type="radio";
	degree.name = "rad";
	degree.addEventListener('change', changeDegree);
	degree.value = i;
	i == currentDegree ? degree.checked = true: null;
	var degree_text = document.createTextNode(`${i} \t\t\t`);
	degreeDiv.appendChild(degree);
	degreeDiv.appendChild(degree_text);
	document.getElementById("degree-selector").appendChild(degreeDiv);
}

function changeDegree(){
	currentDegree = parseInt(this.value);
}

var colors = [
	[117, 15, 4],
	[191, 131, 58],
	[191, 173, 58],
	[77, 135, 27],
	[27, 135, 72],
	[27, 135, 112],
	[27, 120, 135],
	[3, 53, 120],
	[120, 3, 56],
	[203, 90, 133],
	[191, 17, 191],
	[181, 13, 125],
	[191, 13, 0]
];

function shiftColors() {
	this.colors.unshift(this.colors.pop());
}

function getColor(){
	return colors[0];
}

// class to store and handle all perfect polynomaials
class AllShapes {
	constructor(){
		this.shapes=[]
	}

	addShape(shapeObject){
		this.shapes.push(shapeObject);
		redrawShapes();
		const node = document.createElement("li");
		const eq_text = document.createElement("p");
		const textnode = document.createTextNode(shapeObject.eq);
		const removeButton = document.createElement("button");
		removeButton.append(document.createTextNode("X"));
		eq_text.appendChild(textnode);
		eq_text.setAttribute("style",`color: rgb(${shapeObject.color[0]}, ${shapeObject.color[1]}, ${shapeObject.color[2]});`);
		node.appendChild(removeButton);
		node.appendChild(eq_text);
		removeButton.addEventListener('click', () => {
			this.removeShape(shapeObject);
			node.remove();
		});
		document.getElementById("graph_list").appendChild(node);
	}
	removeShape(shapeObject){
		const idx = this.shapes.indexOf(shapeObject);
		this.shapes.splice(idx, 1); 
		// redraw the canvas without the removed shape
		redrawShapes();
	}
}
var allShapes = new AllShapes();

function setup() {
	createCanvas(windowWidth*.98, windowHeight*.98);
	makeGrid();
}

class Line {
	constructor(degree) {
		this.xValues = [];
		this.yValues = [];
	}
	add_values(xValue, yValue) {
		this.xValues.push(xValue);
		this.yValues.push(yValue);
	}
}

var l = new Line(currentDegree);
function draw() {
	stroke(0);
	strokeWeight(2)
  if (mouseIsPressed && mouseY > headerHeight && mouseX < (windowWidth-sideBarWidth)) {
    line(mouseX, mouseY, pmouseX, pmouseY);
    var x = mouseX - (windowWidth/2);
    var y = (mouseY * -1) + (windowHeight/2);
    l.add_values(x, y);
  } 

  if(mouseIsPressed == false){
		if (l.xValues.length > 0) {
			if(l.xValues.length < 15){
				redrawShapes();
			}
			else{
				getPerfectPoly(l);
				l = new Line(currentDegree);
			}
		}
  }
}

// adjust canvas and redraw for when window size changes
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redrawShapes();
}

// function to parse through the Line object and call getData function
function getPerfectPoly(drawing){
	getData(
		JSON.stringify({
			"x": drawing.xValues,
			"y": drawing.yValues,
			"degree": currentDegree
		})
	);
}

// class for perfect polynomials objects after getData is called for each drawing
class Shape {
	constructor(fit, eq){
		this.fit = fit;
		this.eq = eq;
		this.color = getColor();
	}
}

// call server where regression is being done
// recieves json object (data) information
function getData(information) {
	fetch(`http://localhost:5000/getEquation/${information}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
			"Access-Control-Allow-Origin": "https://drawing-to-equation-server.herokuapp.com",
			"Access-Control-Allow-Methods": "GET"
		},
		// referrer: 'http://localhost:5000',
		// referrerPolicy: "origin-when-cross-origin",
		body: undefined,
		mode: "cors"
	})
		.then(response => response.json())
		.then(data => {
  		// console.log(data["fit"])
  		allShapes.addShape(new Shape(data["fit"], data["fit_eq"]));
  	});
}


// all in one function to set background and make grid
// used when canvas needs to be reset for initial render, deletions and insertions
function makeGrid() {
	var graphInterval = 0.04*windowHeight;
	var y_mid = Math.ceil((windowHeight/2) * (1/graphInterval)) * graphInterval; 
	var x_mid = Math.ceil((windowWidth/2) * (1/graphInterval)) * graphInterval;
	background(245);
  for (var x = 0; x < width; x += graphInterval) {
		for (var y = 0; y < height; y += graphInterval) {
			stroke(150);
			strokeWeight(0.01);
			// vertical lines
			line(x, 0, x, height);
			// horizontal lines
			line(0, y, width, y);
			
		}
	}
			strokeWeight(1);
			// vertical lines
			line(windowWidth/2, 0, windowWidth/2, height);
			// horizontal lines
			line(0, windowHeight/2, width, windowHeight/2);
}

function drawShape(shapeObject){
	noFill();
	beginShape();
	strokeWeight(2);
	shape_fit = shapeObject.fit;
	degree = shape_fit.length-1;
	for(let p = -1 * (Math.floor(windowWidth/2)); p < windowWidth; p+=5){
		y = 0
		for(let j = 0; j < degree+1; j++){
			y += shape_fit[j]*(p**(degree-j))
		}
		adjusted_p = p + (windowWidth/2);
		y = (y*-1) + (windowHeight/2);
		vertex(adjusted_p, y);
	}
	endShape();
}

function redrawShapes(){
	makeGrid();
	for(let i = 0; i < allShapes.shapes.length; i++) {
		stroke(allShapes.shapes[i].color);
		shiftColors();
		drawShape(allShapes.shapes[i]);
	}
}