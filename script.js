
let dead = false;
let started = false;
let score = 0;

let creepers = [];

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1000;
canvas.height = 666;

scoreCounter = document.getElementById('scoreCounter')

let background_image = new Image()
background_image.src = 'images/cloudy_background.png'

let player = {
	x: 104,
	y: canvas.height - 100 - 80,
	width: 80,
	height: 80,
	sprite: new Image(),

	jumping: false,

	move_speed: 5,
	jump_strength: 12,
	fall_speed: 2,
	maxFallSpeed: 10,
	acceleration: 0.3,

	jump_sound: new Audio('sounds/jump.wav'),

	fall: function(){
		this.fall_speed += this.acceleration
		this.fall_speed = Math.min(this.fall_speed, this.maxFallSpeed)
		this.y += this.fall_speed;
	},
	jump: function(){
		if(dead){
			retry()
		}else if(this.y + this.height === terrain.y || this.jumping && dead === false){
			if(!this.jumping){this.jump_sound.play()}
			this.fall_speed = 0;
			this.y -= this.jump_strength;
			this.jumping = true;
			started = true;
			player.sprite.src = jump_steve;
	
			setTimeout(()=>{
				this.jumping = false;
				this.fall_speed = 0;
			}, 200)
		}
	}
}

class Creeper{
	constructor(){
		this.width = 80;
		this.height = 80;
		this.x =  canvas.width;
		this.y = terrain.y - this.width,
		this.speed = 7;

		this.sprite = new Image()
		this.normal_sprite = 'images/creeper/creeper.png'
		this.exploding_sprite = 'images/creeper/exploding_creeper.png'
		this.sprite.src = this.normal_sprite

		this.ssss_sound = new Audio('sounds/creeper/creeper_ssssss.mp3')
		this.boom_sound = new Audio('sounds/creeper/creeper_boom.flac')
	}

	move = function(){
		this.x -= this.speed
	}

	checkCollision(player){
        if((this.x <= player.x && player.x <= this.x + this.width || 
			this.x <= player.x + player.width && player.x + player.width <= this.x + this.width) &&
			this.y <= player.y + player.height){
			this.explode()
		}
	}
	ignite(){
		this.sprite.src = this.exploding_sprite
		setTimeout(() => this.sprite.src = this.normal_sprite, 100)
		this.ssss_sound.play()
		setTimeout(() => {
			this.ssss_sound.pause();
            this.ssss_sound.currentTime = 0
		}, 750)
	}; 
	explode(){
		this.sprite.src = 'images/blank.png';
		player.sprite.src = 'images/blank.png';
		player.jumping = false;
		dead = true;
		started = false;
		clearInterval(creeperInterval)
		this.ssss_sound.pause();
        this.ssss_sound.currentTime = 0
		this.boom_sound.play()
	}
}

idle_steve = 'images/steve/idle_steve.png';
jump_steve = 'images/steve/jumping_steve.png';
player.sprite.src = idle_steve;

const terrain = {
	x: -75,
	y: canvas.height - 100,
	width: canvas.width + 150,
	height: 100,
	sprite: new Image()
}

terrain.sprite.src = 'images/terrain.png'

const keys = {
	left: false,
	right: false,
}
function draw(player){
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.drawImage(background_image, 0,0, canvas.width, canvas.width)

	creepers.forEach(creeper => {
		ctx.drawImage(creeper.sprite, creeper.x, creeper.y, creeper.width, creeper.height)
	})
	if(!dead){
		ctx.drawImage(player.sprite, player.x, player.y, player.width, player.height)
	}
	
	ctx.drawImage(terrain.sprite, terrain.x, terrain.y, terrain.width, terrain.height)
}

function update(){

	if(started){creepers.forEach(creeper => {
		creeper.move();
		if (creeper.x === player.x){
			creeper.ignite();
			score++}
		creeper.checkCollision(player)
	})}

	if(player.jumping){
		player.jump()
	}

	player.fall()

	if (player.y + player.height >= canvas.height - 100){
		player.y = canvas.height - 100 - player.height
	}
	if(player.y + player.height === terrain.y && dead === false){
		player.sprite.src = idle_steve;
	}

	scoreCounter.textContent = score;
}

function generateCreeper(creepers, lower = false){
	let newCreeper = new Creeper
	if(!lower){
		lowerProb = Math.random()
		if(lowerProb >= 0.8){lower = true}
	}
	if(lower){
		newCreeper.height = 60;
		newCreeper.width = 60;
		newCreeper.y = terrain.y - newCreeper.height
	}
	creepers.push(newCreeper)
}

function spawnCreepers(){
	if(!started){return}
	creepers = creepers.filter((creeper) => creeper.x > -creeper.width)
	randomNumber = Math.random()
	if(randomNumber >= 0.1){setTimeout(function(){generateCreeper(creepers)}, randomNumber * 100)}	
	if(randomNumber >= 0.825){setTimeout(function(){generateCreeper(creepers)}, 50)}
	if(randomNumber >= 0.95){setTimeout(function(){generateCreeper(creepers, lower = true)}, 90)}
}

function gameLoop(){
	update()
	draw(player)

	if(dead){return}

	requestAnimationFrame(gameLoop)
}

function game(){
	creepers = []
	creeperInterval = setInterval(spawnCreepers, 1250)
	gameLoop()
}

function retry(){
	player.sprite.src = idle_steve;
	dead = false;
	player.move_speed = 5,
	player.jump_strength = 12,
	player.fall_speed = 2,
	player.maxFallSpeed = 10,
	player.acceleration = 0.3,
	score = 0;
	game()
}

function main(){
	game()
}

function handleKeypress(event){
	if(event.key === " "){
		player.jump()
	}
}
document.addEventListener("keydown", handleKeypress)

main()