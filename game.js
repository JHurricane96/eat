var canvas = document.getElementById("game");
var context = canvas.getContext("2d");
var pauseMenu = document.getElementById("pause-menu");
var startMenu = document.getElementById("start-menu");
var victoryMenu = document.getElementById("victory-menu");
var lossMenu = document.getElementById("loss-menu");
var modeButtons = toArray(document.getElementsByClassName("start-menu-choice-btn"));
var player;
var enemies = [];
var score = 0;
var paused = false;
var gameLoop = {};
var victorious = "undetermined";
var timeFactorChange = 0;
var xOffset, yOffset;

function startGame(event) {
	modeButtons.forEach(function(button) {
		button.removeEventListener("click", startGame);
	});
	startMenu.style.display = "none";

	if (event.target.getAttribute("data-mode") === "normal") {
		initializeNormal();
	}
	else {
		initializeWithRepulsors();
	}

	gameLoop.loopFunction = mainLoop;
	gameLoop.loop = setInterval(gameLoop.loopFunction, 17);
}

function restartGame(event) {
	if (event.keyCode === 82) {
		window.removeEventListener("keydown", restartGame);
		restart();
	}
}

function controlPlayer(event) {
	var mouseX = event.pageX - canvas.offsetLeft + canvas.width/2;
	var mouseY = event.pageY - canvas.offsetTop + canvas.height/2;
	if (Screen.scale == 2) {
		mouseY = (mouseY / 2) - yOffset;
		mouseX = (mouseX / 2) - xOffset;
	}
	enemies.push(player.accelerate.bind(player)((new Vector(mouseX, mouseY))));
}

function adjustTimeSpeed(event) {
	if (event.keyCode == 37 && timeFactor.factor > timeFactor.min)
		timeFactorChange--;
	else if (event.keyCode == 38 && Screen.scale == 1) {
		context.scale(2, 2);
		Screen.scale++;
	}
	else if (event.keyCode == 39 && timeFactor.factor < timeFactor.max)
		timeFactorChange++;
	else if (event.keyCode == 40 && Screen.scale == 2) {
		context.restore();
		context.scale(0.5, 0.5);
		Screen.scale--;
	}
}

function pause(event) {
	if (event.keyCode == 27) {
		if (paused) {
			canvas.addEventListener("click", controlPlayer);
			window.addEventListener("keydown", adjustTimeSpeed);
			gameLoop.loop = setInterval(gameLoop.loopFunction, 17);
			paused = false;
			pauseMenu.style.display = "none";
		}
		else {
			canvas.removeEventListener("click", controlPlayer);
			window.removeEventListener("keydown", adjustTimeSpeed);
			clearInterval(gameLoop.loop);
			paused = true;
			pauseMenu.style.display = "block";
		}
	}
}

function addGameEvents() {
	canvas.addEventListener("click", controlPlayer);
	window.addEventListener("keydown", adjustTimeSpeed);
	window.addEventListener("keydown", pause);
}

function initializeWithRepulsors() {
	var init = initParams.withRepulsors;
	player = new Player(new Vector(Screen.width/2, Screen.height/2), init.playerSize, new Vector(0, 0));
	for (var i = 0; i < init.enemiesNo; ++i) {
		if (i < init.repulsorsNo) {
			enemies[i] = new Repulsor(
				new Vector(0, 0),
				(Math.random() * (init.repulsorMaxSize - init.repulsorMinSize)) + init.repulsorMinSize,
				new Vector(
					((2 * Math.random()) - 1) * init.repulsorVelocityFactor,
					((2 * Math.random()) - 1) * init.repulsorVelocityFactor
				)
			);
		}
		else {
			enemies[i] = new Blob(
				new Vector(0, 0),
				(Math.random() * 20) + 5,
				new Vector(
					((2 * Math.random()) - 1) * init.enemyVelocityFactor,
					((2 * Math.random()) - 1) * init.enemyVelocityFactor
				)
			);
		}
		enemies[i].position = new Vector(
			(Math.random() * (Screen.width - 2 * enemies[i].size)) + enemies[i].size,
			(Math.random() * (Screen.height - 2 * enemies[i].size)) + enemies[i].size
		);
		for (var j = 0; j < enemies.length - 1; ++j) {
			if (checkOverlap(enemies[i], enemies[j])) {
				enemies[i].position = new Vector(
					(Math.random() * (Screen.width - 2 * enemies[i].size)) + enemies[i].size,
					(Math.random() * (Screen.height - 2 * enemies[i].size)) + enemies[i].size
				);
			}
		}
		while (checkOverlap(enemies[i], player)) {
			enemies[i].position = new Vector(
				(Math.random() * (Screen.width - 2 * enemies[i].size)) + enemies[i].size,
				(Math.random() * (Screen.height - 2 * enemies[i].size)) + enemies[i].size
			);
		}
	}
	addGameEvents();
}

function initializeNormal() {
	player = new Player(new Vector(Screen.width/2, Screen.height/2), 12, new Vector(0, 0));
	for (var i = 0; i < playerNos.enemies; ++i) {
		enemies[i] = new Blob(new Vector(0, 0), (Math.random() * 20) + 5, new Vector(((2 * Math.random()) - 1)/20, ((2 * Math.random()) - 1)/20));
		enemies[i].position = new Vector((Math.random() * (Screen.width - 2 * enemies[i].size)) + enemies[i].size, (Math.random() * (Screen.height - 2 * enemies[i].size)) + enemies[i].size);
		for (var j = 0; j < enemies.length - 1; ++j) {
			if (checkOverlap(enemies[i], enemies[j])) {
				enemies[i].position = new Vector((Math.random() * (Screen.width - 2 * enemies[i].size)) + enemies[i].size, (Math.random() * (Screen.height - 2 * enemies[i].size)) + enemies[i].size);
			}
		}
		while (checkOverlap(enemies[i], player)) {
			enemies[i].position = new Vector((Math.random() * (Screen.width - 2 * enemies[i].size)) + enemies[i].size, (Math.random() * (Screen.height - 2 * enemies[i].size)) + enemies[i].size);
		}
	}
	addGameEvents();
}

function updateGame() {
	var toDelete = [];
	var finalTotalEnemyMass = 0;
	player.bounceCheck();
	for (var i = 0; i < enemies.length; ++i) {
		enemy = enemies[i];
		enemy.bounceCheck();
		Blob.eatCheck(player, enemy);
		if (player.mass <= 0) {
			victorious = "lost";
			break;
		}
		else if (enemy.mass <= 0 && toDelete.indexOf(i) == -1) {
			toDelete.push(i);
			score++;
		}
		if (enemy instanceof Repulsor)
			enemy.repel(player);
		for (var j = i + 1; j < enemies.length; ++j) {
			enemyOther = enemies[j];
			Blob.eatCheck(enemy, enemyOther);
			if (enemy.mass <= 0 && toDelete.indexOf(i) == -1)
				toDelete.push(i);
			else if (enemyOther.mass <= 0 && toDelete.indexOf(j) == -1)
				toDelete.push(j);
			if (enemy instanceof Repulsor)
				enemy.repel(enemyOther)
			if (enemyOther instanceof Repulsor)
				enemyOther.repel(enemy);
		}
		enemy.position.add(Vector.mult(enemy.velocity, timeFactor.factor));
	}
	if (victorious == "lost")
		return;
	player.position.add(Vector.mult(player.velocity, timeFactor.factor));

	toDelete.sort(function (a, b) {
		return b - a;
	});
	toDelete.forEach(function (index) {
		enemies.splice(index, 1);
	});

	enemies.forEach(function (enemy) {
		finalTotalEnemyMass += enemy.mass;
	});
	if (finalTotalEnemyMass < player.mass) {
		victorious = "won";
	}

	if (timeFactorChange !== 0) {
		timeFactor.factor += timeFactorChange;
		timeFactorChange = 0;
	}
}

function render() {
	if (Screen.scale == 2) {
		context.restore();
		context.save();
		xOffset = Screen.width/4 - player.position.x;
		yOffset = Screen.height/4 - player.position.y;
		if (player.position.x < Screen.width / 4)
			xOffset = 0;
		else if (player.position.x > Screen.width * 3 / 4)
			xOffset = -Screen.width / 2;
		if (player.position.y < Screen.height / 4)
			yOffset = 0;
		else if (player.position.y > Screen.height * 3 / 4)
			yOffset = -Screen.height / 2;
		context.translate(xOffset, yOffset);
	}
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.lineWidth = Render.enemyLineWidth;
	enemies.forEach(function (enemy) {
		if (enemy instanceof Repulsor) {
			context.fillStyle = "rgba(0, " + (255 - Math.round(enemy.size)) + "0, 0, 0.8)";
			context.strokeStyle = Render.enemyRepulsorStrokeStyle;
		}
		else {
			context.fillStyle = "rgba(" + (255 - Math.round(enemy.size)) + ", 0, 0, 0.8)";
			context.strokeStyle = Render.enemyStrokeStyle;
		}
		context.beginPath();
			context.arc(enemy.position.x, enemy.position.y, enemy.size, 0, 2 * Math.PI);
		context.fill();
		context.stroke();
	});
	context.lineWidth = Render.playerLineWidth;
	context.strokeStyle = Render.playerStrokeStyle;
	context.fillStyle = "rgba(0, 0, " + (255 - Math.round(player.size)) + ", 0.8)"
	context.beginPath();
		context.arc(player.position.x, player.position.y, player.size, 0, 2 * Math.PI);
	context.fill();
	context.stroke();

	//document.getElementById('fps').innerHTML = window.mozPaintCount / (Date.now() - starttime) * 1000;
}

function clearEvents() {
	canvas.removeEventListener("click", controlPlayer);
	window.removeEventListener("keydown", adjustTimeSpeed);
	window.removeEventListener("keydown", pause);
	clearInterval(gameLoop.loop);
}

function checkEndGame() {
	if (victorious == "lost") {
		clearEvents();
		lossMenu.style.display = "block";
		window.addEventListener("keydown", restartGame);
	}
	else if (victorious == "won") {
		clearEvents();
		victoryMenu.style.display = "block";
		window.addEventListener("keydown", restartGame);
	}
}

function mainLoop() {
	checkEndGame();
	updateGame();
	render();
}

function setup() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	Screen.width = window.innerWidth;
	Screen.height = window.innerHeight;
	modeButtons.forEach(function(button) {
		button.addEventListener("click", startGame);
	});
}

function restart() {
	lossMenu.style.display = "none";
	victoryMenu.style.display = "none";
	startMenu.style.display = "initial";
	victorious = "undetermined";
	timeFactorChange = 0;
	modeButtons.forEach(function(button) {
		button.addEventListener("click", startGame);
	});
}

setup();
