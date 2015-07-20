//A class for all circles

function Blob(position, size, velocity) {
	this.position = position;
	this.size = size;
	this.mass = size*size; //Mass is proportional to area. Size is radius
	this.velocity = velocity;
}

//A class for the Player. Inherits from Blob.

function Player(position, size, velocity) {
	Blob.call(this, position, size, velocity);
	this.accelerationMagnitude = 0.2;
}

//A class for repulsor objects. Inherits from Blob.

function Repulsor(position, size, velocity) {
	Blob.call(this, position, size, velocity);
}

//A function to check if two blobs are within eating distance
//If they are, eating occurs. Big blob eats small blob.
//The common area between the two blobs is removed from the smaller blob and
//added to the bigger blob. Momentum is conserved.

Blob.eatCheck = function (blob1, blob2) {
	if (checkOverlap(blob1, blob2)) {
		var blob1MomentumOld = Vector.mult(blob1.velocity, blob1.mass);
		var blob2MomentumOld = Vector.mult(blob2.velocity, blob2.mass);
		var d = Vector.dist(blob1.position, blob2.position);
		if (blob2.size > blob1.size) {
			var massDiff = calcMassDiff(blob1.size, blob2.size, d);
			if (blob1.mass <= 13 || massDiff == blob1.size * blob1.size) {
				blob2.velocity = Vector.add(
					blob1MomentumOld,
					blob2MomentumOld
				).mult(1 / (blob1.mass + blob2.mass));
				blob2.mass += blob1.mass;
				blob2.size = Math.sqrt(blob2.mass);
				blob1.mass = 0;
				blob1.size = 0;
			}
			else {
				blob2.mass += (massDiff);
				blob2.size = Math.sqrt(blob2.mass);
				blob1.mass -= (massDiff);
				blob1.size = Math.sqrt(blob1.mass);
				blob2.velocity = blob2MomentumOld.mult(1 / blob2.mass);
				blob1.velocity = blob1MomentumOld.mult(1 / blob1.mass);
			}
		}
		else {
			var massDiff = calcMassDiff(blob2.size, blob1.size, d);
			if (blob2.mass <= 13 || massDiff == blob2.size * blob2.size) {
				blob1.velocity = Vector.add(
					blob1MomentumOld,
					blob2MomentumOld
				).mult(1 / (blob1.mass + blob2.mass));
				blob1.mass += blob2.mass;
				blob1.size = Math.sqrt(blob1.mass);
				blob2.mass = 0;
				blob2.size = 0;
			}
			else {
				blob2.mass -= (massDiff);
				blob2.size = Math.sqrt(blob2.mass);
				blob1.mass += (massDiff);
				blob1.size = Math.sqrt(blob1.mass);
				blob2.velocity = blob2MomentumOld.mult(1 / blob2.mass);
				blob1.velocity = blob1MomentumOld.mult(1 / blob1.mass);
			}
		}
	}
}

//A function to calculate the common area between two circles.
//r = Radius of smaller circle.
//R = Radius of bigger circle.
//d = distance between their centers.
//Taken from http://mathworld.wolfram.com/Circle-CircleIntersection.html

function calcMassDiff(r, R, d) {
	if (d < R - r)
		return r*r;
	var massDiff = r*r*Math.acos((d*d + r*r - R*R)/(2*d*r));
	massDiff += R*R*Math.acos((d*d + R*R - r*r)/(2*d*R));
	massDiff -= 0.5*Math.sqrt((-d+r+R) * (d+r-R) * (d-r+R) * (d+r+R));
	//Division by Pi is because mass here is simply r * r, not area.
	massDiff /= Math.PI;
	return massDiff;
} 

//Enables bouncing

Blob.prototype.bounceCheck = function ()  {
	var pos = this.position;
	var size = this.size;
	if ((pos.x + size) >= Screen.width) {
		this.velocity.x = -this.velocity.x;
		this.position.x = Screen.width - size;
	}
	else if ((pos.x - size) <= 0) {
		this.velocity.x = -this.velocity.x;
		this.position.x = size;
	}
	if ((pos.y + size) >= Screen.height) {
		this.velocity.y = -this.velocity.y;
		this.position.y = Screen.height - size;
	}
	else if ((pos.y - size) <= 0) {
		this.velocity.y = -this.velocity.y;
		this.position.y = size;
	}
}

Player.prototype = Object.create(Blob.prototype);
Player.prototype.constructor = Player;

Repulsor.prototype = Object.create(Blob.prototype);
Repulsor.prototype.constructor = Repulsor;

//Function to control the player
//This ejects a mass 1/20th the player's mass, and the player's mass is only 19/20th of the original now.
//Ejection observes conservation of momentum and mass.

Player.prototype.accelerate = function (clickPos) {
	var fromClickToCurPos = Vector.subtract(this.position, clickPos).unit();
	var ejectedMass = new Blob(Vector.subtract(this.position, Vector.mult(
		fromClickToCurPos, Math.sqrt(this.mass/20) + Math.sqrt(this.mass) + Render.playerLineWidth + Render.enemyLineWidth)
	), Math.sqrt(this.mass/20), Vector.mult(fromClickToCurPos, -19/5).add(this.velocity));
	this.mass = this.mass*19/20;
	this.size = Math.sqrt(this.mass);
	this.velocity.add(fromClickToCurPos.mult(this.accelerationMagnitude));
	return ejectedMass;
}

//Function to repel a blob
//Observes Newton's Third and Second Laws and momentum is conserved.
//Force of repulsion = (M * m)/((dist/2.5)^4)

Repulsor.prototype.repel = function (blob) {
	var dist = Vector.dist(this.position, blob.position);
	var fromRepulsorToBlob = Vector.subtract(blob.position, this.position).unit();
	blob.velocity.add(Vector.mult(
		fromRepulsorToBlob,
		this.mass / Math.pow(dist / 2.5, 4)
	));
	this.velocity.add(Vector.mult(
		fromRepulsorToBlob,
		(blob.mass * -1) / Math.pow(dist / 2.5, 4)
	));
}

//Function to check overlap of two blobs

function checkOverlap(blob1, blob2) {
	var dist = Vector.dist(blob1.position, blob2.position);
	if (dist < blob1.size + blob2.size)
		return true;
	else
		return false;
}