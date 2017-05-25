/**
 * 
 */
var canvas = document.getElementById("canvas");
var player;
var playerName;
var boss;
var allCharacters = [];
var walls = [];
var round = 0;
var fighting = false;
var bossFight = false;
var spells = [];
var creatingSpell = false;
var invest;
var levelwon = false;

var droppables = [];

// Neccessary??
// var headGear = new gear(1,"Hood","hGear");
// var armor = new gear(1,"ragged Clothes","armor");
// var legGear = new gear(1,"Trousers","lGear");
// var boots = new gear(1,"Ugly boots","boots");
// var weapon = new gear(1,"Dagger","weapon");

// var exp = 99;
// var expNeeded = 100;
// var playerLevel = 1;

var directions = ["up","down","left","right"];
var weapons = ["Axe","Daggers","Sword","Greatsword","Bow","Hammer","Spear"];
var upgradeColor = ["blue","#80bfff","#80ffff","#66ffb3","#d9ff66","#ffff1a","#ffdf80","#ff9f80","#ff794d","Lime"];

var hgear = [new gear(2,"Leather Helmet","hGear"),new gear(3,"Steel Helmet","hGear"),new gear(4,"Elvish Helmet","hGear"),new gear(5,"Dragonpriest Mask","hGear"),new gear(6,"Obsidian Helmet","hGear"),new gear(7,"Dragonbone Helmet","hGear"),new gear(8,"Godly Helmet","hGear"),new gear(9,"Shard Helmet","hGear"),new gear(10,invest+" Helmet","hGear")]
var armor = [new gear(2,"Leather Armor","armor"),new gear(3,"Steel Armor","armor"),new gear(4,"Elvish Armor","armor"),new gear(5,"Mistcloak","armor"),new gear(6,"Obsidian Armor","armor"),new gear(7,"Dragonbone Armor","armor"),new gear(8,"Godly Armor","armor"),new gear(9,"Shard Armor","armor"),new gear(10,invest+" Armor","armor")]
var lgear = [new gear(2,"Leather Trousers","lGear"),new gear(3,"Steel Knee Pads","lGear"),new gear(4,"Elvish Knee Pads","lGear"),new gear(5,"Awakened Trousers","lGear"),new gear(6,"Obsidian Knee Pads","lGear"),new gear(7,"Dragonbone Knee Pads","lGear"),new gear(8,"Godly Knee Pads","lGear"),new gear(9,"Lower Shard Armor","lGear"),new gear(10,invest+" Knee Pads","lGear")]
var boots = [new gear(2,"Leather Boots","boots"),new gear(3,"Steel Boots","boots"),new gear(4,"Elvish Boots","boots"),new gear(5,"Bone Boots","boots"),new gear(6,"Obsidian Boots","boots"),new gear(7,"Dragonbone Boots","boots"),new gear(8,"Godly Boots","boots"),new gear(9,"Shard Boots","boots"),new gear(10,invest+" Boots","boots")]
var material = ["Iron","Steel","Elvish","Flaming","Obsidian","Dragonbone","Godly","Shard",invest];

var playerLog = $("#pseudo-console #player-did");
var enemyLog = $("#pseudo-console #enemy-did");

//Necessary ???
// var strength = 1;		//increases Weapon dmg
// var dexterity = 1;		//increases hit rate, dodge rate
// var willpower = 1;		//increases mana
// var magic = 1;			//increases spell effectivity

function giveBirth(){
	$("#spell-creation").hide();
	$("#button-group").hide();
	playerName = prompt("What's the Heros name?");
	invest = prompt("What is used for magic?");
	arrowListener();
	keyListener();
	player  = new Character(20,20,"red",0,0,"player");
	startGame();
}
function startGame(){
//	$("#spell-creation").hide();
//	$("#button-group").hide();
	$("#next-level").hide();
	droppables = [];
    clearCanvas();
    walls = [];
    allCharacters = [];
    boss = {};
	normalizeStats(false);
	//var wall = new Character(20, 20, "black", 100,40,"wall");
        createLevel();
        spawnEnemies();
		spawnDroppables();
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
            this.hGear = new gear(1,"Hood","hGear");
			this.armor = new gear(1,"ragged Clothes","armor");
			this.lGear = new gear(1,"Trousers","lGear");
			this.boots = new gear(1,"Ugly boots","boots");
			this.weapon = new gear(1,"Dagger","weapon")
            
            this.hp = 20;
			this.mana = 10;
			this.strength = 1;
			this.dexterity = 1;
			this.willpower = 1;
			this.magic = 1;
			this.exp = 0;
			this.expNeeded = 100;
			this.playerLevel = 1;
        }
	else if(type == "enemy"){
            var rand = Math.floor(Math.random()*3)+1;
            var randLvl = (Math.floor(Math.random()*player.playerLevel));
            this.level = Math.min(0 + randLvl, 9);
            this.atk = this.level+ 1;
            this.hp = (this.level+1) * rand;
            this.color = upgradeColor[this.level];
            allCharacters.push(this);
	}
        else if(type == "boss"){
            var rand = Math.floor(Math.random()*4)+3; //3-6
			this.level = player.playerLevel;
			var randAtk = Math.floor(Math.random()*this.level);
            this.atk = this.level + randAtk;
            this.hp = this.level*rand;
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
				if(this.type == "enemy"){
					if(!bossHere(this.x,this.y-20)){
						this.y = this.y - 20;
					}
				}
				else if(this.type == "player"){
					this.y = this.y-20;
				}
				else if(this.type == "boss"){
					if(!isCollidingWithChar(this.x,this.y-20)){
						this.y = this.y-20;
					}
					
				}
			}
		}
		else if(dir == "down"){
			if(this.y != canvas.height-this.height && !(isColliding(this.x, this.y+20, this.width, this.height))) {
				if(this.type == "enemy"){
					if(!bossHere(this.x,this.y+20)){
						this.y = this.y + 20;
					}
				}
				else if(this.type == "player"){
					this.y = this.y+20;
				}
				else if(this.type == "boss"){
					if(!isCollidingWithChar(this.x,this.y+20)){
						this.y = this.y+20;
					}
					
				}
			}
		}
		else if(dir == "left"){
			if(this.x != 0 && !(isColliding(this.x-20, this.y, this.width, this.height))){
				if(this.type == "enemy"){
					if(!bossHere(this.x-20,this.y)){
						this.x = this.x - 20;
					}
				}
				else if(this.type == "player"){
					this.x = this.x-20;
				}
				else if(this.type == "boss"){
					if(!isCollidingWithChar(this.x-20,this.y)){
						this.x = this.x-20;
					}
					
				}
			}
		}
		else if(dir == "right"){
			if(this.x != canvas.width-this.width && !(isColliding(this.x+20, this.y, this.width, this.height))){
				if(this.type == "enemy"){
					if(!bossHere(this.x+20,this.y)){
						this.x = this.x + 20;
					}
				}
				else if(this.type == "player"){
					this.x = this.x+20;
				}
				else if(this.type == "boss"){
					if(!isCollidingWithChar(this.x+20,this.y)){
						this.x = this.x+20;
					}
					
				}
			}
		}
        if(this.type == "player"){
        	playerLog.text(playerName+" is moving...");
        	enemyLog.text("");
        	update();   
        }
	}
}

function gear(strength, name, type){
    this.strength = strength;
    this.name = name;
    this.type = type;
}

function spell(cost, power, type, name, upgrade){
	this.cost = cost;
	this.power = power;
	this.type = type;
	this.name = name;
	this.upgrade = upgrade;
	
	spells.push(this);
}

function investiture(amount,x,y){
	this.amount = amount;
	this.name = invest;
	this.x = x;
	this.y = y;
	this.color = "grey";
	droppables.push(this);
	
	this.draw =  function(){
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = this.color;
		ctx.fillRect(this.x,this.y,20,20);
	}
	this.pickedUp = function(){
		if(this.x == player.x && this.y == player.y){
			player.mana += this.amount;
			playerLog.text(playerName+" found "+invest+"!");
			for(var i = 0; i < droppables.length; i++){
				if(droppables[i].x == this.x && droppables[i].y == this.y){
					droppables.splice(i,1);
				}
			}
		}
	}
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
	$("#attack-btn").click(function(){
		if(fighting){
			if(!bossFight){
				normalAttack(player, getEnemyAtPosition(player.x, player.y));
			}
			else if(bossFight){
				normalAttack(player,boss);
			}
			update();
		}
	});

	$("#spell-creation button#spell-btn").click(function(){
		var name;
		var type;
		var power;
		var cost;
		var upgrade;
		
		name = document.screation.spellname.value;
		type = document.screation.spelltype.value;
		power = document.screation.spellpower.value;
		upgrade = document.screation.upgradetype.value;
		
		
		// power = Math.round((player.playerLevel*10)* (0.01*power));
		// cost = 2*power;
		var maxCost = (player.playerLevel-1)*10;
		cost = Math.max(Math.round(maxCost * (power*0.01)),1);
		power = Math.max(1,Math.round(cost/3));
		var nSpell = new spell(cost,power,type,name,upgrade);
		
		if(type!="upgrade"){
			$("#fighting-buttons .row .col-md-10").append("<button type='button' class='btn cast-spell' value="+(spells.length-1)+" onclick='castSpell(this.value)'>"+name+" "+cost+"</button>");
		}
		else {
			$("#fighting-buttons .row .col-md-10").append("<button type='button' class='btn cast-spell' value="+(spells.length-1)+" disabled>"+name+" "+cost+"</button>");
		}
		$("#spell-creation").hide();
		creatingSpell=false;
		normalizeStats(true);
		update();
	});
	$("#next-level").click(function(){
		nextLevel();
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
	if(!levelwon){
	if(!creatingSpell){
	// Write Instrunction Page and link it from the game
	
	if(!fighting){
		$("#round").text("Round: "+round++);
		clearCanvas();
	        player.draw();
	        $("#hp").text("HP: "+player.hp);
			$("#mana").text("MP: "+player.mana);
	        $("#weapon").text(player.weapon.name+": "+player.weapon.strength);
	        $("#head-gear").text(player.hGear.name+": "+player.hGear.strength);
	        $("#armor").text(player.armor.name+": "+player.armor.strength);
	        $("#leg-gear").text(player.lGear.name+": "+player.lGear.strength);
	        $("#boots").text(player.boots.name+": "+player.boots.strength);
	        $("#player-level").text("Lv: " +player.playerLevel);
	        $("#exp").text("XP: " + player.exp + "/" + player.expNeeded);
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
	    for(var i = 0; i < allCharacters.length; i++){
			var e = allCharacters[i];
			if(updateCollide(e.x, e.y,i)){
				upgrade(e);
			}
		}
	    boss.draw();
		drawWalls();
		
		for(var i = 0; i < droppables.length; i++){
			droppables[i].draw();
			droppables[i].pickedUp();
		}
	}
	
	else if(fighting){
		var enemy = bossFight ? boss : getEnemyAtPosition(player.x,player.y);
		attackPlayer(enemy);
	}
	
	
	if(isCollidingWithChar(player.x, player.y)){
		if(!fighting){
			playerLog.text("A Fight!");
		}
		fighting = true;
		clearCanvas();
		var e = getEnemyAtPosition(player.x, player.y);
		
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = player.color;
		ctx.fillRect(40,100,player.width,player.height);
		
		var enemy = canvas.getContext("2d");
		enemy.fillStyle = e.color;
		enemy.fillRect(340,100,e.width,e.height);
		
		var enemyHealth = canvas.getContext("2d");
		enemyHealth.font = "20px Arial";
		enemyHealth.fillText("HP: "+e.hp,380,100);
		
		
		
		//alert("fight! Enemy Level: "+ getEnemyAtPosition(player.x,player.y).level);
	}
	else if(bossHere(player.x, player.y)){
		if(!fighting){
			playerLog.text("A Fight!");
		}
		fighting = true;
		bossFight = true;
		clearCanvas();
		
		var ctx = canvas.getContext("2d");
		ctx.fillStyle = player.color;
		ctx.fillRect(40,100,player.width,player.height);
		
		var enemy = canvas.getContext("2d");
		enemy.fillStyle = boss.color;
		enemy.fillRect(340,100,boss.width,boss.height);
		
		var enemyHealth = canvas.getContext("2d");
		enemyHealth.font = "20px Arial";
		enemyHealth.fillText("HP: "+boss.hp,380,100);
	}
}}
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

function bossHere(x,y){
	if(x == boss.x && y == boss.y){
		return true;
	}
	else{
		return false;
	}
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

function createSpell(){
	playerLog.text(playerName+" leveld up!");
	$("#spell-creation").show();
}
function spawnDroppables(){
	var randNr = Math.floor((Math.random()*3));
	for(var i = 0; i < randNr; i++){
		var randX = Math.floor((Math.random() * 24)+1)*20;
        var randY = Math.floor((Math.random() * 20))*20;
			while(isColliding(randX,randY,20,20) || isCollidingWithChar(randX,randY)){
				randX = Math.floor((Math.random() * 24)+1)*20;
				randY = Math.floor((Math.random() * 20))*20;
			}
		var drop = new investiture(player.playerLevel*5,randX,randY);
	}
}
function spawnEnemies(){
    var randNr = Math.floor((Math.random()*12)+1);
    for(var i = 0; i <= randNr; i++){
        var randX = Math.floor((Math.random() * 24)+1)*20;
        var randY = Math.floor((Math.random() * 20))*20;
        while(isColliding(randX,randY,20,20) || isCollidingWithChar(randX,randY)){
            randX = Math.floor((Math.random() * 24)+1)*20;
            randY = Math.floor((Math.random() * 20))*20;
        }
        if(i != randNr){
            var enemy = new Character(20,20,"blue",randX,randY,"enemy");
        }
        else {
            var boss = new Character(20,20,"green",randX,randY,"boss");
        }
    }
    
}

function getEnemyAtPosition(x,y){
	for(var i = 0; i < allCharacters.length; i++){
		var temp = allCharacters[i];
		if(x == temp.x && y == temp.y){
			return allCharacters[i];
			break;
		}
	}
}

function castSpell(spell){
	if(spells[spell].cost > player.mana){
		playerLog.text("Not enough Mana!");
	}
	else if(spells[spell].type=="heal" && spells[spell].cost <= player.mana){
			var efficiency = spells[spell].power + Math.min(Math.round(0.3 * player.magic),10);
			player.hp += efficiency;
			player.mana -= spells[spell].cost;
			playerLog.text(playerName+" healed "+efficiency+" Damage");
			update();
		}
	if(fighting){
		if(!bossFight){
		var enemy = getEnemyAtPosition(player.x,player.y);
		if(spells[spell].type=="dmg" && spells[spell].cost <= player.mana){
			var efficiency = spells[spell].power + Math.min(Math.round(0.3 * player.magic),17);
			enemy.hp = enemy.hp - efficiency;
			player.mana -= spells[spell].cost;
		playerLog.text(playerName+" casts "+spells[spell].name+" for "+efficiency+" damage!");
		if(enemy.hp <= 0){
			enemyDefeated(enemy);
		}
		}
		update();
	}
	else if(bossFight){
		if(spells[spell].type=="dmg" && spells[spell].cost <= player.mana){
			var efficiency = spells[spell].power + Math.min(Math.round(0.3 * player.magic),17);
			boss.hp = boss.hp - efficiency;
			player.mana -= spells[spell].cost;
			playerLog.text(playerName+" casts "+spells[spell].name+" for "+efficiency+" damage!");
			
			if(boss.hp <= 0){
				gainXP(boss);
				fighting = false;
				bossFight = false;
			}
		}
		update();
}}
$("#mana").text("MP: "+player.mana);}

function upgrade(char){
	char.hp = (char.level+2)*3;
	char.atk = (char.level+2)+2;
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

function normalAttack(player, enemy){
	var atkDmg = player.weapon.strength + Math.min(Math.round(0.25*player.strength),5);
	var rng = Math.floor((Math.random()*100)+1);
	atkDmg = rng+player.dexterity*2 >= 32 ? atkDmg : 0;
	if(!bossFight){
	enemy.hp = enemy.hp - atkDmg;
	playerLog.text(playerName+" did "+atkDmg+" Damage with "+player.weapon.name+"!");
	
	if(enemy.hp <= 0){
		enemyDefeated(enemy);
	}
	}
	else if(bossFight){
		boss.hp = boss.hp-atkDmg;
		playerLog.text(playerName+" did "+atkDmg+" Damage with "+player.weapon.name+"!");
		
		if(boss.hp<=0){
			gainXP(boss);
			fighting = false;
			bossFight = false;
		}
	}
}

function attackPlayer(enemy){
	var atkDmg = enemy.atk;
	var hitAt = Math.floor((Math.random()*4));
	var dmg;
	var hitRate = Math.floor((Math.random()*100)+1);
	var missRate = Math.min(50,player.dexterity*2);
	hitRate = hitRate >= missRate ? 1 : 0;
	switch(hitAt){
		case 0: dmg = Math.max(1,atkDmg-player.hGear.strength)*hitRate;
		player.hp = player.hp - dmg;
		enemyLog.text("Foe hit "+player.hGear.name+" for "+dmg+" Damage!");
		break;
		case 1: dmg = Math.max(1,atkDmg-player.armor.strength)*hitRate;
		player.hp = player.hp - dmg;
		enemyLog.text("Foe hit "+player.armor.name+" for "+dmg+" Damage!");
		break;
		case 2: dmg = Math.max(1,atkDmg-player.lGear.strength)*hitRate;
		player.hp = player.hp - dmg;
		enemyLog.text("Foe hit "+player.lGear.name+" for "+dmg+" Damage!");
		break;
		case 3: dmg = Math.max(1,atkDmg-player.boots.strength)*hitRate;
		player.hp = player.hp - dmg;
		enemyLog.text("Foe hit "+player.boots.name+" for "+dmg+" Damage!");
		break;
	}
	$("#hp").text("HP: "+player.hp);
	if(player.hp<=0){
		gameover();
	}
}

function gainXP(enemy){
	player.exp += (enemy.level+1)*10 + (enemy.atk+enemy.hp);
	if(player.exp >= player.expNeeded && player.playerLevel<11){
		creatingSpell = true;
		createSpell();
		player.exp = player.exp - player.expNeeded;
		player.expNeeded += 100;
		$("#player-level").text("Lv: "+player.playerLevel++);
	}
	if(bossFight){
		clearCanvas();
		levelwon = true;
		$("#next-level").show();
	}
}

function normalizeStats(afterFight){
	var tempStrength = 1;
	var tempDexterity = 1;
	var tempWillpower = 1;
	var tempMagic = 1;
	var exhaustion = 0;
	for(var i=0; i<spells.length; i++){
		var gain = 1;
		if(spells[i].type=="upgrade"){
			gain = gain * spells[i].power;
			if(spells[i].upgrade!="willpower"){
				exhaustion += spells[i].cost;
			}
		}
		switch(spells[i].upgrade){
			case "strength":
			tempStrength += gain;
			break;
			
			case "dexterity":
			tempDexterity += gain;
			break;
			
			case "willpower":
			tempWillpower += gain;
			break;
			
			case "magic":
			tempMagic += gain;
			break;
		}
	}
	
	player.strength = tempStrength;
	player.dexterity = tempDexterity;
	player.willpower = tempWillpower;
	player.magic = tempMagic;
	
	if(!afterFight){
		player.mana = Math.max(0,17 + 3*player.willpower - exhaustion);
		player.hp = 29 + player.strength;
	}
}

function enemyDefeated(enemy){
	enemyLog.text("Enemy defeated!");
	gainXP(enemy);
	for(var i = 0; i< allCharacters.length; i++){
		if(allCharacters[i].x == enemy.x && allCharacters[i].y == enemy.y){
			allCharacters.splice(i,1);
		}
	}
	if(allCharacters.length == 0 && !bossFight){
		var randItem = Math.floor((Math.random()*5));
		var rarity = Math.min(player.playerLevel-1, 8);
		switch(randItem){
			case 0:
			var takeItem = confirm(playerName+" found "+hgear[rarity].name+", Power: "+hgear[rarity].strength+". Take it?");
			if(takeItem){
				player.hGear = hgear[rarity];
			}
			break;
			case 1:
			var takeItem = confirm(playerName+" found "+armor[rarity].name+", Power: "+armor[rarity].strength+". Take it?");
			if(takeItem){
				player.armor = armor[rarity];
			} 
			break;
			case 2:
			var takeItem = confirm(playerName+" found "+lgear[rarity].name+", Power: "+lgear[rarity].strength+". Take it?");
			if(takeItem){
				player.lGear = lgear[rarity];
			} 
			break;
			case 3:
			var takeItem = confirm(playerName+" found "+boots[rarity].name+", Power: "+boots[rarity].strength+". Take it?");
			if(takeItem){
				player.boots = boots[rarity];
			} 
			break;
			case 4:
			var randWeapon = Math.floor((Math.random()*weapons.length));
			var takeItem = confirm(playerName+" found "+material[rarity]+" "+weapons[randWeapon]+", Power: "+(rarity+2)+". Take it?");
			if(takeItem){
				player.weapon = new gear(rarity+2, material[rarity]+" "+weapons[randWeapon], "weapon");
			} 
			break;
			
		}
	}
	fighting = false;
}

function nextLevel(){
	levelwon = false;
	
	player.x = 0;
	player.y = 0;
	
	startGame();
}

function gameover(){
	round = 0;
	fighting = false;
	bossFight = false;
	player.x = 0;
	player.y = 0;
	spells = [];
	
	player.playerLevel = 1;
	player.exp = 0;
	player.expNeeded = 100;
	
	player.hGear = new gear(1,"Hood","hGear");
	player.armor = new gear(1,"ragged Clothes","armor");
	player.lGear = new gear(1,"Trousers","lGear");
	player.boots = new gear(1,"Ugly boots","boots");
	player.weapon = new gear(1,"Dagger","weapon");
	
	alert(playerName+" died!");
	$(".btn.cast-spell").each(function(){
		this.remove();
	});
	startGame();
}

$(document).ready(giveBirth());
