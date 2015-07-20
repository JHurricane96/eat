//Important global variables

var Screen = {
	"width": 1200,
	"height": 600,
	"scale": 1
}

var Render = {
	"playerLineWidth": 1,
	"enemyLineWidth": 1,
	"playerStrokeStyle": "blue",
	"playerFillStyle": "rgb(30, 100, 255)",
	"enemyStrokeStyle": "red",
	"enemyFillStyle": "red",
	"enemyRepulsorStrokeStyle": "green",
	"enemyRepulsorFillStyle": "green"
}

var initParams = {
	"withRepulsors" : {
		"enemiesNo": 100,
		"repulsorsNo": 9,
		"enemyMinSize": 10,
		"enemyMaxSize": 30,
		"enemyVelocityFactor": 1/20,
		"repulsorMinSize": 5,
		"repulsorMaxSize": 25,
		"repulsorVelocityFactor": 1/20,
		"playerSize": 20
	},
	"normal": {
		"enemiesNo": 250,
		"enemyMinSize": 5,
		"enemyMaxSize": 25,
		"enemyVelocityFactor": 1/20,
		"playerSize": 12
	}
}

var playerNos = {
	"enemies": 200,
	"repulsors": 7
}

var timeFactor = {
	"factor": 1,
	"max": 100,
	"min": 1
}