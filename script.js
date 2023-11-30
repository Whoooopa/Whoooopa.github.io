window.addEventListener('load', function(){
    const canvas = document.getElementById('game-area');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 600;

    ctx.fillStyle = 'white';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'white';
    ctx.font = '30px Helvetica';  

    class Fish {
            constructor(game, canvasWidth, canvasHeight){
                this.game = game;
                this.canvasWidth = canvasWidth;
                this.canvasHeight = canvasHeight;
                this.imageAttack = document.getElementById('jellyfish-attack');
                this.imageDeath = document.getElementById('jellyfish-death');
                this.imageHurt = document.getElementById('jellyfish-hurt');
                this.imageIdle = document.getElementById('jellyfish-idle');
                this.imageWalk = document.getElementById('jellyfish-walk');
                this.image = this.imageWalk;
                this.frame = 0;
                this.frameX = 0;
                this.minFrame = 0;
                this.maxFrameAttack = 3;
                this.maxFrameDeath = 6;
                this.maxFrameHurt = 2;
                this.maxFrameIdle = 3;
                this.maxFrameWalk = 3;
                this.frameToAnimate = 8;
                this.maxFrame = this.maxFrameWalk;
                this.spriteHeight = 48;
                this.spriteWidth = 48;
                this.spriteScaler = 2;
                this.xBuffer = 0;
                this.width = this.spriteScaler * this.spriteWidth;
                this.height = this.spriteScaler * this.spriteHeight;
                this.x;
                this.y;
                this.alignCollisionSpriteX = 0;
                this.alignCollisionSpriteY = 50;

                this.collisionX = Math.floor(Math.random()*100);
                this.collisionY = this.game.topMargin + this.height + Math.random() * (this.game.height - this.height - this.game.topMargin);
                this.speedX = 2;
                this.collisionRadius = 20;

                this.type = "jellyfish";
                this.collisionObjects = this.game.collisionObjects;
                this.isAttacking = 0;
                this.attackingCount = 0;
                this.isSwimming = 1;
                this.isDead = 0;
                this.deadTimer = 0;
                this.deadInterval = 30;

                //stats
                this.health = 50;
                this.attack = 10;
                this.attackTimer = 0;
                this.attackInterval = this.maxFrameAttack * this.frameToAnimate;
                this.score = Math.floor(this.health * 0.5);
                this.regen = Math.floor(this.health * 0.5);
                this.exp = Math.floor(this.health * 0.2);
            }
            draw(context){
                context.drawImage(this.image, this.frameX * this.spriteWidth, 0, this.spriteWidth - this.xBuffer, this.spriteHeight, this.x, this.y, this.width, this.height);
                // context.beginPath();
                // context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                // context.stroke();
            }
            update(){
                // update frame animation
                this.frame = this.frame < this.maxFrame * this.frameToAnimate ? this.frame + 1 : this.minFrame;
                if(this.frame % this.frameToAnimate == 0 ){
                    this.frameX = this.frameX < this.maxFrame? this.frameX + 1 : this.minFrame;
                }

                if(this.health == 0 && this.isDead ==0){
                    this.isDead = 1;
                    this.setAnimation('death');
                }
                
                if(this.isDead == 1){
                    this.deadTimer = this.deadTimer + 1;
                    if(this.deadTimer >= this.deadInterval){
                        this.game.removeGameObject();
                        this.collisionObjects = this.game.collisionObjects;
                        
                    }
                }else{

                    
                    //respawn fish if fish reach x = 0
                    if (this.x + this.width > this.game.width + this.width && !this.game.gameOver){
                        this.collisionX = -1 * Math.floor(Math.random()*100);
                        this.collisionY = this.game.topMargin + this.height + (Math.random() * (this.game.height - this.game.topMargin - this.height));
                    }
                    //collision detection
                    this.attackingCount = 0;
                    this.isSwimming = 1;
                    this.isAttacking = 0;

                    this.collisionObjects.forEach(object =>{
                        if(this.type != object.type && object.health > 0){
                            const collision = this.game.checkCollision(this, object);
                            if(collision){
                                this.attackingCount = this.attackingCount + 1;
                                if(this.attackTimer == 0){
                                    this.frameX = this.minFrame;
                                    this.frame = this.minFrame;
                                    object.takeDamage(this.attack, this.type);
                                }
                                if(this.attackTimer < this.attackInterval){
                                    this.attackTimer = this.attackTimer + 1 ;
                                }else{
                                    this.attackTimer = 0;
                                }
                            }
                        }
                    })
                    if(this.attackingCount > 0){
                        this.isAttacking = 1;
                        this.isSwimming = 0;
                        if(this.frame == this.minFrame){
                            this.setAnimation("attack");
                        }
                    }else{
                        if(this.frame == this.minFrame){
                            this.setAnimation("walk");
                        }
                    }
                
                    // travel to left
                    this.x = this.collisionX - 0.5 * this.width - this.alignCollisionSpriteX;
                    this.y = this.collisionY - this.height + this.alignCollisionSpriteY;
                    if(this.isAttacking == 0 && this.isSwimming == 1) {
                        this.collisionX += this.speedX;
                    }
                
                
                }
            }
            takeDamage(attackValue, attacker){
                this.health = this.health - attackValue;
                if (this.health < 0) this.health = 0;
                if (this.health == 0 && attacker == "player") {
                    this.game.player.takeLoot(this.score, this.exp, this.regen);
                }
            }
            setAnimation(newImage){
                switch(newImage){
                    case "attack":
                        
                        this.frame = this.minFrame;
                        this.frameX = this.frame;
                        this.image = this.imageAttack;
                        this.maxFrame = this.maxFrameAttack;
                        break;
                    case "death":
                        
                        this.frame = this.minFrame;
                        this.frameX = this.frame;
                        this.image = this.imageDeath;
                        this.maxFrame = this.maxFrameDeath;
                        break;
                    case "hurt":
                        
                        this.frame = this.minFrame;
                        this.frameX = this.frame;
                        this.image = this.imageHurt;
                        this.maxFrame = this.maxFrameHurt;
                        break;
                    case "idle":
                        
                        this.frame = this.minFrame;
                        this.frameX = this.frame;
                        this.image = this.imageIdle;
                        this.maxFrame = this.maxFrameIdle;
                        break;
                    case "walk":
                        
                        this.frame = this.minFrame;
                        this.frameX = this.frame;
                        this.image = this.imageWalk;
                        this.maxFrame = this.maxFrameWalk;
                        break;
                }              
            }
    }

    class JellyFish extends Fish{
        constructor(game, canvasWidth, canvasHeight){
            super(game, canvasWidth, canvasHeight);
        }
        draw(context){
            super.draw(context);
        }
        update(){
            super.update();
        }
        takeDamage(attackValue, attacker){
            super.takeDamage(attackValue, attacker);
        }
        setAnimation(newImage){
            super.setAnimation(newImage);
        }
    }

    class Turtle extends Fish{
        constructor(game, canvasWidth, canvasHeight){
            super(game, canvasWidth, canvasHeight);
            this.imageDeath = document.getElementById('turtle-death');
            this.imageHurt = document.getElementById('turtle-hurt');
            this.imageIdle = document.getElementById('turtle-idle');
            this.imageAttackOriginal = document.getElementById('turtle-attack');
            this.imageWalkOriginal = document.getElementById('turtle-walk');
            this.imageAttack = this.imageAttackOriginal;
            this.imageWalk = this.imageWalkOriginal;
            this.imageAttackReversed = document.getElementById('turtle-attack-reversed');
            this.imageWalkReversed = document.getElementById('turtle-walk-reversed');
            this.image = this.imageWalk;
            this.maxFrameAttack = 5;
            this.maxFrameDeath = 5;
            this.maxFrameHurt = 2;
            this.maxFrameIdle = 3;
            this.maxFrameWalk = 5;
            this.maxFrame = this.maxFrameWalk;
            this.spriteScaler = 2;
            this.width = this.spriteScaler * this.spriteWidth;
            this.height = this.spriteScaler * this.spriteHeight;
            this.isAttacking = 0;
            this.startX = this.frameX * this.spriteWidth;

            this.collisionX = this.canvasWidth * 0.5;
            this.collisionY = this.canvasHeight * 0.5;
            this.x = this.collisionX;
            this.y = this.collisionY;
            this.speedX = 0;
            this.speedY = 0;
            this.dx = 0;
            this.dy = 0;
            this.speedModifier = 5;
            this.collisionRadius = 20;
            this.type = "player";
            this.collisionObjects = this.game.collisionObjects;

            //stats
            this.level = 1;
            this.maxHealth = 230 + this.level * 20;
            this.health = this.maxHealth;
            this.attack = 25 + this.level * 5;
            this.attackTimer = 0;
            this.attackInterval = this.maxFrameAttack * this.frameToAnimate;
            this.score = 0;
            this.regen = 0;
            this.exp = 0;

        }
        restart(){
            this.level = 1;
            this.maxHealth = 230 + this.level * 20;
            this.health = this.maxHealth;
            this.attack = 25 + this.level * 5;
            this.score = 0;
            this.regen = 0;
            this.exp = 0;
        }
        draw(context){
            context.drawImage(this.image, this.startX, 0, this.spriteWidth - this.xBuffer, this.spriteHeight, this.x, this.y, this.width, this.height);
                // context.beginPath();
                // context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);
                // context.stroke();
        }
        update(){
            this.collisionObjects = this.game.collisionObjects;
            // update frame
            this.frame = this.frame < this.maxFrame * this.frameToAnimate ? this.frame + 1 : this.minFrame;
            if(this.frame % this.frameToAnimate == 0 ){
                if(this.frameX < this.maxFrame){
                    this.frameX = this.frameX + 1;
                }else{
                    this.frameX = this.minFrame;
                    this.isAttacking = 0;
                }
            }

            
            // follow the mouse
            this.dx = this.game.mouse.x - this.collisionX;
            this.dy = this.game.mouse.y - this.collisionY;
            
            const distance = Math.hypot(this.dy, this.dx);
            
            
            if (distance > this.speedModifier){
                this.speedX = this.dx/distance || 0;
                this.speedY = this.dy/distance || 0;
                
            } else {
                this.speedX = 0;
                this.speedY = 0;
            }
            
            let direction;
            const angle = Math.atan2(this.dy, this.dx);
            if (angle > Math.PI/2 || angle < -1 * Math.PI/2){
                //facing left
                this.imageAttack = this.imageAttackReversed;
                this.imageWalk = this.imageWalkReversed;
                // this.image = this.imageWalk;
                // might wanna change first number to image.clientWidth or naturalWidth
                direction = 288 - (1+this.frameX) * this.spriteWidth;
                this.startX = direction;
                
            } else {
                //facing right
                this.imageAttack = this.imageAttackOriginal;
                this.imageWalk = this.imageWalkOriginal;
                // this.image = this.imageWalk;
                direction = this.frameX * this.spriteWidth;
                this.startX = direction;
            }

            // freeze the fish if game over
            if (!this.game.gameOver){
                this.collisionX += this.speedX * this.speedModifier;
                this.collisionY += this.speedY * this.speedModifier;
            }
            // horizontal boundaries
            if (this.collisionX < 0 + this.collisionRadius){
                this.collisionX = 0 + this.collisionRadius;
            } else if (this.collisionX > this.game.width - this.collisionRadius){
                this.collisionX = this.game.width - this.collisionRadius;
            }
            // vertical boundaries
            if (this.collisionY < this.game.topMargin + this.collisionRadius){
                this.collisionY = this.game.topMargin + this.collisionRadius;
            } else if (this.collisionY > this.game.height - this.collisionRadius){
                this.collisionY = this.game.height - this.collisionRadius;
            }

            this.x = this.collisionX - 0.5 * this.width - this.alignCollisionSpriteX;
            this.y = this.collisionY - this.height + this.alignCollisionSpriteY;

            if(this.frame == this.minFrame){
                this.setAnimation("walk");
            }
        }
        takeDamage(attackValue, attacker){
            super.takeDamage(attackValue, attacker);
        }
        gobble(){
            this.collisionObjects.forEach(object =>{
                if(this.type != object.type && object.health > 0){
                    const collision = this.game.checkCollision(this, object);
                    if(collision){
                        this.frameX = this.minFrame;
                        this.frame = this.minFrame;
                        object.takeDamage(this.attack, this.type);
                    }
                }
            })

            this.setAnimation('attack');
            this.isAttacking = 1;
        }
        takeLoot(score,exp,regen){
            this.score += score;
            this.exp += exp;
            if(this.health + regen > this.maxHealth){
                this.health = this.maxHealth;
            }else{
                this.health += regen;
            }
        }
        setAnimation(newImage){
            super.setAnimation(newImage);
        }

    }

    class Octopus extends Fish{
        constructor(game, canvasWidth, canvasHeight){
            super(game, canvasWidth, canvasHeight);
            this.imageAttack = document.getElementById('octopus-attack');
            this.imageDeath = document.getElementById('octopus-death');
            this.imageHurt = document.getElementById('octopus-hurt');
            this.imageIdle = document.getElementById('octopus-idle');
            this.imageWalk = document.getElementById('octopus-walk');
            this.image = this.imageWalk;
            this.maxFrameAttack = 5;
            this.maxFrameDeath = 5;
            this.maxFrameHurt = 2;
            this.maxFrameIdle = 5;
            this.maxFrameWalk = 5;
            this.maxFrame = this.maxFrameWalk;
            this.xBuffer = 2;
            this.spriteScaler = 3;
            this.width = this.spriteScaler * this.spriteWidth;
            this.height = this.spriteScaler * this.spriteHeight;
            this.alignCollisionSpriteY = 80;
            this.alignCollisionSpriteX = -30;
            this.collisionRadius = 50;
            this.type = "octopus";

            //stats
            this.health = 300;
            this.attack = 40;
            this.speedX = 3;
            this.attackTimer = 0;
            this.attackInterval = this.maxFrameAttack * this.frameToAnimate;
            this.score = Math.floor(this.health * 0.5);
            this.regen = Math.floor(this.health * 0.5);
            this.exp = Math.floor(this.health * 0.2);

        }
        draw(context){
            super.draw(context);
        }
        update(){
            super.update();
        }
        takeDamage(attackValue, attacker){
            super.takeDamage(attackValue, attacker);
        }
        setAnimation(newImage){
            super.setAnimation(newImage);
        }

    }

    class SwordFish extends Fish{
        constructor(game, canvasWidth, canvasHeight){
            super(game, canvasWidth, canvasHeight);
            this.imageAttack = document.getElementById('swordfish-attack');
            this.imageDeath = document.getElementById('swordfish-death');
            this.imageHurt = document.getElementById('swordfish-hurt');
            this.imageIdle = document.getElementById('swordfish-idle');
            this.imageWalk = document.getElementById('swordfish-walk');
            this.image = this.imageWalk;
            this.maxFrameAttack = 5;
            this.maxFrameDeath = 5;
            this.maxFrameHurt = 2;
            this.maxFrameIdle = 3;
            this.maxFrameWalk = 3;
            this.maxFrame = this.maxFrameWalk;
            this.xBuffer = 2;
            this.spriteScaler = 4;
            this.width = this.spriteScaler * this.spriteWidth;
            this.height = this.spriteScaler * this.spriteHeight;
            this.alignCollisionSpriteY = 90;
            this.collisionRadius = 60;
            this.type = "swordfish";

            //stats
            this.health = 150;
            this.attack = 50;
            this.speedX = 4;
            this.attackTimer = 0;
            this.attackInterval = this.maxFrameAttack * this.frameToAnimate;
            this.score = Math.floor(this.health * 0.5);
            this.regen = Math.floor(this.health * 0.5);
            this.exp = Math.floor(this.health * 0.2);

        }
        draw(context){
            super.draw(context);
        }
        update(){
            super.update();
        }
        takeDamage(attackValue, attacker){
            super.takeDamage(attackValue, attacker);
        }
        setAnimation(newImage){
            super.setAnimation(newImage);
        }

    }

    class Eel extends Fish{
        constructor(game, canvasWidth, canvasHeight){
            super(game, canvasWidth, canvasHeight);
            this.imageAttack = document.getElementById('eel-attack');
            this.imageDeath = document.getElementById('eel-death');
            this.imageHurt = document.getElementById('eel-hurt');
            this.imageIdle = document.getElementById('eel-idle');
            this.imageWalk = document.getElementById('eel-walk');
            this.image = this.imageWalk;
            this.maxFrameAttack = 5;
            this.maxFrameDeath = 5;
            this.maxFrameHurt = 2;
            this.maxFrameIdle = 3;
            this.maxFrameWalk = 5;
            this.maxFrame = this.maxFrameWalk;
            this.xBuffer = 0;
            this.collisionRadius = 20;
            this.type = "eel";

            //stats
            this.health = 70;
            this.attack = 25;
            this.speedX = 2;
            this.attackTimer = 0;
            this.attackInterval = this.maxFrameAttack * this.frameToAnimate;
            this.score = Math.floor(this.health * 0.5);
            this.regen = Math.floor(this.health * 0.5);
            this.exp = Math.floor(this.health * 0.2);

        }
        draw(context){
            super.draw(context);
        }
        update(){
            super.update();
        }
        takeDamage(attackValue, attacker){
            super.takeDamage(attackValue, attacker);
        }
        setAnimation(newImage){
            super.setAnimation(newImage);
        }

    }

    class AnglerFish extends Fish{
        constructor(game, canvasWidth, canvasHeight){
            super(game, canvasWidth, canvasHeight);
            this.imageAttack = document.getElementById('anglerfish-attack');
            this.imageDeath = document.getElementById('anglerfish-death');
            this.imageHurt = document.getElementById('anglerfish-hurt');
            this.imageIdle = document.getElementById('anglerfish-idle');
            this.imageWalk = document.getElementById('anglerfish-walk');
            this.image = this.imageWalk;
            this.maxFrameAttack = 5;
            this.maxFrameDeath = 5;
            this.maxFrameHurt = 2;
            this.maxFrameIdle = 3;
            this.maxFrameWalk = 3;
            this.maxFrame = this.maxFrameWalk;
            this.xBuffer = 0;
            this.collisionRadius = 20;
            this.type = "anglerfish";

            //stats
            this.health = 100;
            this.attack = 20;
            this.speedX = 2;
            this.attackTimer = 0;
            this.attackInterval = this.maxFrameAttack * this.frameToAnimate;
            this.score = Math.floor(this.health * 0.5);
            this.regen = Math.floor(this.health * 0.5);
            this.exp = Math.floor(this.health * 0.2);

        }
        draw(context){
            super.draw(context);
        }
        update(){
            super.update();
        }
        takeDamage(attackValue, attacker){
            super.takeDamage(attackValue, attacker);
        }
        setAnimation(newImage){
            super.setAnimation(newImage);
        }

    }

    class Game {
        constructor(canvas){
            this.canvas = canvas;
            this.width = canvas.width;
            this.height = canvas.height;
            this.topMargin = 100;
            this.enemyInterval = 200;
            this.enemyTimer = 0;
            this.maxJellyFish = 5;
            this.maxAnglerFish = 5;
            this.maxEel = 5;
            this.maxSwordFish = 2;
            this.maxOctopus = 2;
            this.jellyfish = [];
            this.anglerfish = [];
            this.eels = [];
            this.swordfish = [];
            this.octopi = [];
            this.player = new Turtle(this, this.width, this.height);
            this.collisionObjects = [this.player, ...this.jellyfish,...this.anglerfish, ...this.eels, ...this.swordfish, ...this.octopi];
            this.gameOver = false;
            this.gameStart = false;
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            };
            canvas.addEventListener('mousemove', e=>{
                this.mouse.x = e.offsetX;
                this.mouse.y = e.offsetY;
            });
            canvas.addEventListener('mousedown', e=>{
                if(e.buttons == 1 && this.player.isAttacking == 0){
                    this.player.gobble();
                }
            })
            canvas.addEventListener('keyboard', e=>{
                if(e.buttons == 1 && this.player.isAttacking == 0){
                    this.player.gobble();
                }
            })
            window.addEventListener('keydown', e =>{
                if (e.key == 'r' && this.gameOver) this.restart();
                if (e.key == 's') this.gameStart = true;
            });
        }
        restart(){
            this.player.restart();
            this.gameOver = false;
            this.gameStart = false;
            this.jellyfish = [];
            this.anglerfish = [];
            this.eels = [];
            this.swordfish = [];
            this.octopi = [];
            this.mouse = {
                x: this.width * 0.5,
                y: this.height * 0.5,
                pressed: false
            };
        }
        render(context){
            context.save();
            context.shadowOffsetX = 2;
            context.shadowOffsetY = 2;
            context.shadowColor = 'black';
            this.enemies = [...this.octopi, ...this.swordfish, ...this.eels, ...this.anglerfish, ...this.jellyfish];
            this.fishes = [...this.enemies, this.player];
            this.fishes.forEach(fish => {
                fish.draw(context);
                fish.update();
            })
            context.restore();

            // header
            context.save();
            context.fillStyle = 'rgba(171,98,48,1.00)';
            context.fillRect(0, 0, this.width, this.topMargin);
            context.fillStyle = 'rgba(255,255,255,1.00)';
            context.fillText('Level', 30, 57);
            context.fillText(this.player.level, 120, 57);
            context.font = '20px Helvetica'; 
            context.fillText('XP', 170, 37);
            context.fillRect(205, 30-(20*0.5), this.player.exp, 20);
            context.fillText(this.player.exp, 480, 37);
            context.fillStyle = 'rgba(255,255,0,1.00)';
            context.fillText('HP', 170, 77);
            context.fillRect(205, 70-(20*0.5), this.player.health, 20);
            context.fillText(this.player.health, 480, 77);
            context.restore();

            //tutorial
            let messageTut1 = "Move your cursor to move the turtle";
            let messageTut2 = "Left click to attack";
            let messageTut3 = "Press 'S' to continue";
            
            if(this.gameStart == false){
                context.save();
                context.shadowOffsetX = 4;
                context.shadowOffsetY = 4;
                context.shadowColor = 'black';
                context.fillStyle = 'rgba(0,0,0,0.5)';
                context.fillRect(0, 0, this.width, this.height);
                context.fillStyle = 'white';
                context.textAlign = 'center';
                context.font = '130px Bangers';
                context.fillText("Instruction", this.width * 0.5, this.height * 0.5 - 20);
                context.font = '40px Bangers';
                context.fillText(messageTut1, this.width * 0.5, this.height * 0.5 + 30);
                context.fillText(messageTut2, this.width * 0.5, this.height * 0.5 + 80);
                context.fillText(messageTut3, this.width * 0.5, this.height * 0.5 + 130);

                context.restore();

            }

            // win / lose message
            let message1;
            let message2;
            // winning condition
            if(this.player.level > 5){
                this.gameOver = true;
                message1 = "Victory";
                message2 = "The turtle's hunger is satiated !";  
            }
            if(this.player.health <= 0){
                this.gameOver = true;
                message1 = "Defeat";
                message2 = "The turtle's gobbled !";  
            }

            if(this.gameOver){
                context.save();
                context.shadowOffsetX = 4;
                context.shadowOffsetY = 4;
                context.shadowColor = 'black';
                context.fillStyle = 'rgba(0,0,0,0.5)';
                context.fillRect(0, 0, this.width, this.height);
                context.fillStyle = 'white';
                context.textAlign = 'center';
                context.font = '130px Bangers';
                context.fillText(message1, this.width * 0.5, this.height * 0.5 - 20);
                context.font = '40px Bangers';
                context.fillText(message2, this.width * 0.5, this.height * 0.5 + 30);
                context.fillText("Final Score: " + this.player.score + ". Press 'R' to restart", this.width * 0.5, this.height * 0.5 + 80);
            
                context.restore();
            }
        }
        update(){
            if(this.gameStart == true){

                if(this.enemyTimer < this.enemyInterval) this.enemyTimer = this.enemyTimer + 1;
                else {
                    this.enemyTimer = 0;
                    this.addEnemy();
                }
            }
        }
        addEnemy(){
            let rng = Math.floor(Math.random() * 5);
            switch(rng){
                case 4:
                    if(this.octopi.length < this.maxOctopus) this.octopi.push(new Octopus(this, this.width, this.height))
                    break;
                case 3:
                    if(this.swordfish.length < this.maxSwordFish) this.swordfish.push(new SwordFish(this, this.width, this.height))
                    break;
                case 2:
                    if(this.eels.length < this.maxEel) this.eels.push(new Eel(this, this.width, this.height))
                    break;
                case 1:
                    if(this.anglerfish.length < this.maxAnglerFish) this.anglerfish.push(new AnglerFish(this, this.width, this.height))
                    break;
                case 0:
                    if(this.jellyfish.length < this.maxJellyFish) this.jellyfish.push(new JellyFish(this, this.width, this.height))
                    break;
            }
            this.collisionObjects = [this.player, ...this.jellyfish,...this.anglerfish, ...this.eels, ...this.swordfish, ...this.octopi];
        }
        checkCollision(a,b){
            const dx = Math.abs(a.collisionX - b.collisionX);
            const dy = Math.abs(a.collisionY - b.collisionY);
            const distance = Math.hypot(dy, dx);
            const sumRadius = a.collisionRadius + b.collisionRadius;
            return distance < sumRadius;
        }
        removeGameObject(){
            this.octopi = this.octopi.filter(object => object.health > 0);
            this.swordfish = this.swordfish.filter(object => object.health > 0);
            this.anglerfish = this.anglerfish.filter(object => object.health > 0);
            this.eels = this.eels.filter(object => object.health > 0);
            this.jellyfish = this.jellyfish.filter(object => object.health > 0);

            this.collisionObjects = [this.player, ...this.jellyfish, ...this.anglerfish, ...this.eels, ...this.swordfish, ...this.octopi];
        }
    }
    
    const game = new Game(canvas);

    function animate(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.render(ctx);
        game.update();
        requestAnimationFrame(animate);
    }
    animate();

})