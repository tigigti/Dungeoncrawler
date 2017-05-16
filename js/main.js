/**
 * 
 */
var canvas = document.getElementById("canvas");
var player;
var allCharacters = [];
var walls = [];
var round = 0;
var level = 1;

function startGame(){
	arrowListener();
	keyListener();
	player  = new Character(20,20,"red",0,0,"player");
	var wall = new Character(20, 20, "black", 100,40,"wall");
	update();
}

function Character(width, height, color, x, y, type){
	this.width = width;
	this.height = height;
	this.color = color;
	this.x = x;
	this.y = y;
	this.type = type;
	
	if(type != "wall"){
		allCharacters.push(this);
	}
	else {
		walls.push(this);
	}
	
	this.draw =  function(){
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,this.width,this.height);
	}
	
	this.move = function(dir){
		if(dir == "up"){
			if(this.y != 0 && !(isColliding(this.x, this.y-20, this.width, this.height))){
				this.y = this.y - 20;
			}
		}
		else if(dir == "down"){
			if(this.y != canvas.height-this.height && !isColliding(this.x, this.y+20, this.width, this.height)){
				this.y = this.y + 20;
			}
		}
		else if(dir == "left"){
			if(this.x != 0 && !isColliding(this.x-20, this.y, this.width, this.height)){
				this.x = this.x - 20;
			}
		}
		else if(dir == "right"){
			if(this.x != canvas.width-this.width && !isColliding(this.x+20, this.y, this.width, this.height)){
				this.x = this.x + 20;
			}
		}
		update();
	}
}

function clearCanvas(){
	var clear = canvas.getContext("2d");
	clear.fillStyle = "white";
	clear.fillRect(0,0,canvas.width,canvas.height);
}

function arrowListener(){
	$("#up-btn").click(function(){
		player.move("up");
	});
	$("#down-btn").click(function(){
		player.move("down");
	});
	$("#right-btn").click(function(){
		player.move("right");
	});
	$("#left-btn").click(function(){
		player.move("left");
	});
}

function keyListener(){
	document.addEventListener("keydown",function(event){
		if(event.keyCode == 37){
			player.move("left");
		}
		else if(event.keyCode == 38){
			player.move("up");
		}
		else if(event.keyCode == 39){
			player.move("right");
		}
		else if(event.keyCode == 40){
			player.move("down");
		}
	});
}

function update(){
	$("#round").text("Round: "+round++);
	clearCanvas();
	for(var i = 0; i < allCharacters.length; i++){
		allCharacters[i].draw();
	}
	drawWalls();
}

function drawWalls(){
	for(var i = 0; i < walls.length; i++){
		walls[i].draw();
	}
}

function isColliding(x, y, width, height){
	for(var i = 0; i < walls.length; i++){
		var w = walls[i];
		if(x+width > w.x && x < w.x+w.width && y >= w.y && y < w.y+w.height){
			return true;
			break;
		}
	}
	return false;
}

$(document).ready(startGame());