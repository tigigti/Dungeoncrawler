/**
 * 
 */
var canvas = document.getElementById("canvas");
var player;
var boss;
var allCharacters = [];
var walls = [];
var round = 0;
var fighting = false;

var headGear = new gear(1,"Ugly head","hGear");
var armor = new gear(1,"ragged Clothes","armor");
var legGear = new gear(1,"Trousers","lGear");
var boots = new gear(1,"Ugly boots","boots");
var weapon = new gear(1,"Dagger","weapon");

var exp = 0;
var expNeeded = 100;
var playerLevel = 2;

var directions = ["up","down","left","right"];
var upgradeColor = ["blue","#80bfff","#80ffff","#66ffb3","#d9ff66","#ffff1a","#ffdf80","#ff9f80","#ff794d","Lime"];

function startGame(){
        clearCanvas();
        walls = [];
        allCharacters = [];
        boss = {};
	arrowListener();
	keyListener();
	player  = new Character(20,20,"red",0,0,"player");
	//var wall = new Character(20, 20, "black", 100,40,"wall");
        createLevel();
        spawnEnemies();
	update();
}

function Character(width, height, color, x, y, type){
	this.width = width;
	this.height = height;
	this.color = color;
	this.x = x;
	this.y = y;
	this.type = type;
        
	
        if(type == "player"){
            this.headGear = headGear;
            this.armor = armor;
            this.legGear = legGear;
            this.boots = boots;
            this.weapon = weapon;
            
            this.hp = 9 + playerLevel;
        }
	else if(type == "enemy"){
            var rand = Math.floor(Math.random()*3)+1;
            var randLvl = (Math.floor(Math.random()*playerLevel));
            this.atk = playerLevel * rand;
            this.hp = playerLevel;
            this.level = Math.min(0 + randLvl, 9);
            this.color = upgradeColor[this.level];
            allCharacters.push(this);
	}
        else if(type == "boss"){
            var rand = Math.floor(Math.random()*4);
            this.atk = playerLevel + playerLevel * rand;
            this.hp = playerLevel + 10;
            boss = this;
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
			if(this.y != canvas.height-this.height && !(isColliding(this.x, this.y+20, this.width, this.height))) {
				this.y = this.y + 20;
			}
		}
		else if(dir == "left"){
			if(this.x != 0 && !(isColliding(this.x-20, this.y, this.width, this.height))){
				this.x = this.x - 20;
			}
		}
		else if(dir == "right"){
			if(this.x != canvas.width-this.width && !(isColliding(this.x+20, this.y, this.width, this.height))){
				this.x = this.x + 20;
			}
		}
        if(this.type == "player"){
        	update();   
        }
	}
}

function gear(strength, name, type){
    this.strength = strength;
    this.name = name;
    this.type = type;
}

function clearCanvas(){
	var clear = canvas.getContext("2d");
	clear.fillStyle = "white";
	clear.fillRect(0,0,canvas.width,canvas.height);
}

function arrowListener(){
	$("#up-btn").click(function(){
            if(!fighting){
		player.move("up");
            }
	});
	$("#down-btn").click(function(){
            if(!fighting){
		player.move("down");
            }
	});
	$("#right-btn").click(function(){
            if(!fighting){
		player.move("right");
            }
	});
	$("#left-btn").click(function(){
            if(!fighting){
		player.move("left");
            }
	});
}

function keyListener(){
	document.addEventListener("keydown",function(event){
		if(event.keyCode == 37 && !fighting){
			player.move("left");
		}
		else if(event.keyCode == 38 && !fighting){
			player.move("up");
		}
		else if(event.keyCode == 39 && !fighting){
			player.move("right");
		}
		else if(event.keyCode == 40 && !fighting){
			player.move("down");
		}
	});
}

function update(){
	//TODO: Check for collision. If Player collides, fight begins.
	//Don't let enemies and boss collide.
	//If player collides set fighting = true
	//For Fighting: Clear Canvas. Display player and enemy on Canvas with their respective health. 
	//Make an Update function for fighting. When fight starts, the player can choose with what to attack.
	//After he attacked the Enemy attacks in the same iteration. Afterwards wait for user input again and call the fightUpdate again.
	//Continue until either dies. Get exp if player wins. At lvl up: make function to create a Spell.
	//Exp after fighting regular enemies: 10 + enemy.level*(enemy.atk+enemy.hp);
	for(var i = 0; i < allCharacters.length; i++){
		var e = allCharacters[i];
		if(updateCollide(e.x, e.y,i)){
			upgrade(e);
		}
	}
	
	if(!fighting){
		$("#round").text("Round: "+round++);
		clearCanvas();
	        player.draw();
	        $("#hp").text("HP: "+player.hp);
	        $("#weapon").text(player.weapon.name+": "+player.weapon.strength);
	        $("#head-gear").text(player.headGear.name+": "+player.headGear.strength);
	        $("#armor").text(player.armor.name+": "+player.armor.strength);
	        $("#leg-gear").text(player.legGear.name+": "+player.legGear.strength);
	        $("#boots").text(player.boots.name+": "+player.boots.strength);
	        $("#player-level").text("Lv: " +playerLevel);
	        $("#exp").text("XP: " + exp + "/" + expNeeded);
	        for(var i = 0; i < allCharacters.length; i++){
	            if(round%(allCharacters[i].level+2) == 0){
	                var rand = Math.floor(Math.random()*4);
	                allCharacters[i].move(directions[rand]);
	            }
			allCharacters[i].draw();
		}
	    if(round%2 == 0){
		    var rand = Math.floor(Math.random()*4);
		    boss.move(directions[rand]);
	    };
	    boss.draw();
		drawWalls();
	}
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

function isCollidingWithChar(x,y){
	for(var i = 0; i < allCharacters.length; i++){
		var e = allCharacters[i];
		if(x+20 > e.x && x < e.x+20 && y >= e.y && y < e.y+20 && e){
			return true;
			break;
		}
	}
	return false;
}

function updateCollide(x,y,i){
	for(var j = i+1; j < allCharacters.length; j++){
		var e = allCharacters[j];
		if(e.x == x && e.y == y){
			allCharacters.splice(j, 1);
			return true;
			break;
		}
	}
	return false;
}

function createLevel(){
    var randNr = Math.floor((Math.random() * 20) + 1);
    for(var i = 0; i < randNr; i++){
        var randX = Math.floor((Math.random() * 24)+1)*20;
        var randY = Math.floor((Math.random() * 20))*20;
        var randHeight = Math.floor((Math.random() * 4) + 1)*20;
        var randWidth = Math.floor((Math.random() * 4) + 1)*20;
        var wall = new Character(randWidth, randHeight, "black",randX,randY,"wall");
    }
}

function spawnEnemies(){
    var randNr = Math.floor((Math.random()*16)+1);
    for(var i = 0; i < randNr; i++){
        var randX = Math.floor((Math.random() * 24)+1)*20;
        var randY = Math.floor((Math.random() * 20))*20;
        while(isColliding(randX,randY,20,20) || isCollidingWithChar(randX,randY)){
            randX = Math.floor((Math.random() * 24)+1)*20;
            randY = Math.floor((Math.random() * 20))*20;
        }
        if(i != randNr-1){
            var enemy = new Character(20,20,"blue",randX,randY,"enemy");
        }
        else {
            var boss = new Character(20,20,"green",randX,randY,"boss");
        }
    }
    
}

function upgrade(char){
	char.hp *= 2;
	char.atk *= 2;
	if(char.level < 9){
		char.level += 1;
		char.color = upgradeColor[char.level];
	}
	sortAllChars();
	
}

function sortAllChars(){
	var swapped = true;
	while(swapped){
		var swapped = false;
		for(var i = 0; i < allCharacters.length-1; i++){
			if(allCharacters[i].level < allCharacters[i+1].level){
				var temp = allCharacters[i];
				allCharacters[i] = allCharacters[i+1];
				allCharacters[i+1] = temp;
				swapped = true;
			}
		}
	}
}

$(document).ready(startGame());