// The theme for this game is 'Built to Scale', so we have to make something that fits that theme.
// My plan is to make a game where the player is armed with a reverse shrink ray.
// The player has to evade monsters and reach goals by enlargening nearby objects.
// I'm planning to add traps that can kill the enemies if they touch them and can be enlarged.
// Other than the shrink ray, the player shouldn't have any other method of defense.

let canvas = document.getElementById('canvas');
let c = canvas. getContext('2d');

canvas.width = 650;
canvas.height = 576;

c.fillStyle = 'black';
c.fillRect(0, 0, canvas.width, canvas.height);

class Sprite
{
    constructor(posX, posY, width, height, xSpeed, ySpeed, image = null, name = '', type = '')
    {
        this.posX = posX;
        this.posY = posY;

        // Used for resetting the sprite's position
        this.originX = posX;
        this.originY = posY;

        this.originWidth = width;
        this.originHeight = height;

        this.width = width;
        this.height = height;

        this.xSpeed = xSpeed;
        this.ySpeed = ySpeed;

        this.hasImage = image != null;
        this.image = null;

        this.name = name;

        this.type = type;

        this.state = 'ready';

        this.xOffset = 0;
        this.yOffset = 0;

        if(this.hasImage)
        {
            this.image = new Image();
            this.image.src = image;
            this.image.width = this.width;
            this.image.height = this.height;
        }
    }

    animate(frames, interval)
    {
        this.image.src = frames[0].image;
        this.yOffset = frames[0].y;
        this.xOffset = frames[0].x;
        this.image.width = frames[0].width;
        this.image.height = frames[0].height;
        frames.splice(0, 1);

        if(frames.length > 0)
        {
            window.setTimeout(() => {this.animate(frames, interval);}, interval);
        }
        else
        {
            this.state = 'ready';
        }

    }

    draw()
    {
        if(this.hasImage)
        {
            c.drawImage(this.image, this.posX + this.xOffset, this.posY + this.yOffset, this.image.width, this.image.height);
        }
        else
        {
            c.fillStyle = 'green';
            c.fillRect(this.posX, this.posY, this.width, this.height);
        }
        
    }

    update()
    {
        this.draw();

        this.posX += this.xSpeed;
        this.posY += this.ySpeed;
    }

    resetSprite()
    {
        this.posX = this.originX;
        this.posY = this.originY;
        this.height = this.originHeight;
        this.width = this.originWidth;

        if(this.image != null)
        {
            this.image.width = this.originWidth;
            this.image.height = this.originHeight;
        }
        this.xSpeed = 0;
        this.ySpeed = 0;
    }
}

class Enemy
{
    constructor(posX, posY, width, height, xSpeed, ySpeed, image = null, name = '', type = '')
    {
        // This allows an enemy to function as a sprite and still have addition stuff if needed
        this.sprite = new Sprite(posX, posY, width, height, xSpeed, ySpeed, image, name, type);
        this.name = name;
        this.maxSpeed = 3;
        this.slow = .2;
        this.active = false;
        this.alive = true;
        this.image = 'null';
    }

    draw()
    {
        this.sprite.draw();
    }

    update()
    {
        this.sprite.update();
    }
}

// TEXT CLASS
class TextSprite
{
    constructor(text, size, posX, posY)
    {
        this.text = text;
        this.size = size;
        this.posX = posX;
        this.posY = posY;

        // Used for reseting position
        this.originX = posX;
        this.originY = posY;
    }
    
    draw()
    {
        c.fillStyle = 'white';
        c.font = this.size + ' Arial';
        c.fillText(this.text, this.posX, this.posY);
    }

    resetText()
    {
        this.posX = this.originX;
        this.posY = this.originY;
    }
}

// Removes an object with a given name from an array
function destroyObject(array, objectName)
{
    for(let i = 0; i < array.length; i++)
    {
        if(array[i].name == objectName)
        {
            array.splice(i, 1);
            i--;
        }
    }
}

function isDistance(sprite1, sprite2, x, y)
{
    return Math.abs((sprite1.posX + sprite1.width/2) - (sprite2.posX + sprite2.width/2)) <= x && Math.abs((sprite1.posY + sprite1.height) - (sprite2.posY + sprite2.height)) <= y;
}

// This function returns a boolean value for if two Sprites are colliding
function rectangularCollision(posX1, posX2, posY1, posY2, width1, width2, height1, height2)
{
    return (posX1 + width1 >= posX2 &&
        posX1 <= posX2 + width2 &&
        posY1 + height1 >= posY2 &&
        posY1 <= posY2 + height2);
}

let bullets = [];
let canShootBack = true;
let canShootFront = true;
let lastDirectionX = 0;
let lastDirectionY = 0;
let bulletCount = 0;

// This function shoots a bullet from the player
function shoot(modifier = 1)
{
    bulletCount++;
    let bullet = new Sprite(player.posX + player.width/2 - 10, player.posY + player.height/2 - 10, 20, 20, lastDirectionX * 2 * modifier, lastDirectionY * 2 * modifier, null, 'bullet' + bulletCount);
    bullets.push(bullet);

    // Destroy the bullet after .5 seconds so it doesn't lag the game
    window.setTimeout(() => {destroyObject(bullets, bullet.name);}, 800);
}

function scroll(distanceX, distanceY)
{
    for(let i = 0; i < enemies.length; i++)
    {
        enemies[i].sprite.posX += distanceX;
        enemies[i].sprite.posY += distanceY;
    }

    for(let i = 0; i < walls.length; i++)
    {
        walls[i].posX += distanceX;
        walls[i].posY += distanceY;
    }

    for(let i = 0; i < traps.length; i++)
    {
        traps[i].posX += distanceX;
        traps[i].posY += distanceY;
    }

    for(let i = 0; i < bullets.length; i++)
    {
        bullets[i].posX += distanceX;
        bullets[i].posY += distanceY;
    }

    for(let i = 0; i < text.length; i++)
    {
        text[i].posX += distanceX;
        text[i].posY += distanceY;
    }

    player.posX += distanceX;
    player.posY += distanceY;

    goal.posX += distanceX;
    goal.posY += distanceY;
}

let player = new Sprite(250, 200, 35, 35, 0, 0);

let goal = new Sprite(200, 0, 80, 80, 0, 0);

let enemy201 = new Enemy(90, -400, 35, 35, 2, 2, null, 'enemy201');

let enemy301 = new Enemy(90, -400, 35, 35, 2, 2, null, 'enemy301');
let enemy302 = new Enemy(470, -400, 35, 35, 2, 2, null, 'enemy302');

let wall101 = new Sprite(400, 0, 250, 40, 0, 0, 'wallSideways.png');
let wall102 = new Sprite(610, 0, 40, 250, 0, 0, 'wallVertical.png');
let wall103 = new Sprite(610, 250, 40, 250, 0, 0, 'wallVertical.png');
let wall104 = new Sprite(0, 0, 250, 40, 0, 0, 'wallSideways.png');
let wall105 = new Sprite(0, 0, 40, 250, 0, 0, 'wallVertical.png');
let wall106 = new Sprite(0, 250, 40, 250, 0, 0, 'wallVertical.png');
let wall107 = new Sprite(400, -500, 250, 40, 0, 0, 'wallSideways.png');
let wall108 = new Sprite(610, -500, 40, 250, 0, 0, 'wallVertical.png');
let wall109 = new Sprite(610, -250, 40, 250, 0, 0, 'wallVertical.png');
let wall1010 = new Sprite(0, -500, 250, 40, 0, 0, 'wallSideways.png');
let wall1011 = new Sprite(0, -500, 40, 250, 0, 0, 'wallVertical.png');
let wall1012 = new Sprite(0, -250, 40, 250, 0, 0, 'wallVertical.png');
let wall1013 = new Sprite(0, 460, 250, 40, 0, 0, 'wallSideways.png');
let wall1014 = new Sprite(400, 460, 250, 40, 0, 0, 'wallSideways.png');
let wall1015 = new Sprite(250, 460, 250, 40, 0, 0, 'wallSideways.png');

let wall201 = new Sprite(610, 0, 40, 250, 0, 0, 'wallVertical.png');
let wall202 = new Sprite(610, 250, 40, 250, 0, 0);
let wall203 = new Sprite(0, 0, 40, 250, 0, 0, 'wallVertical.png');
let wall204 = new Sprite(0, 250, 40, 250, 0, 0, 'wallVertical.png');
let wall205 = new Sprite(400, -500, 250, 40, 0, 0);
let wall206 = new Sprite(610, -500, 40, 250, 0, 0, 'wallVertical.png');
let wall207 = new Sprite(610, -250, 40, 250, 0, 0, 'wallVertical.png');
let wall208 = new Sprite(0, -500, 250, 40, 0, 0);
let wall209 = new Sprite(0, -500, 40, 250, 0, 0, 'wallVertical.png');
let wall2010 = new Sprite(0, -250, 40, 250, 0, 0, 'wallVertical.png');
let wall2011 = new Sprite(400, -1000, 250, 40, 0, 0);
let wall2012 = new Sprite(610, -1000, 40, 250, 0, 0, 'wallVertical.png');
let wall2013 = new Sprite(610, -750, 40, 250, 0, 0, 'wallVertical.png');
let wall2014 = new Sprite(0, -1000, 250, 40, 0, 0);
let wall2015 = new Sprite(0, -1000, 40, 250, 0, 0, 'wallVertical.png');
let wall2016 = new Sprite(0, -750, 40, 250, 0, 0, 'wallVertical.png');

let trap301 = new Sprite(270, -50, 35, 35, 0, 0);

let wall301 = new Sprite(610, 0, 40, 250, 0, 0);
let wall302 = new Sprite(610, 250, 40, 250, 0, 0);
let wall303 = new Sprite(0, 0, 40, 250, 0, 0);
let wall304 = new Sprite(0, 250, 40, 250, 0, 0);
let wall305 = new Sprite(0, -250, 40, 250, 0, 0);
let wall306 = new Sprite(610, -250, 40, 250, 0, 0);

let text101 = new TextSprite('WASD to move.', '30px', 220, 100);
let text102 = new TextSprite('J: shoot forwards. K: shoot backwards.', '30px', 60, -100);
let text103 = new TextSprite('Climb those stairs.', '30px', 195, -380);

let text201 = new TextSprite('Enemy ahead! Shoot it (J & K) to enlarge', '30px', 60, 100);
let text202 = new TextSprite('it and slow it down.', '30px', 60, 140);

let text301 = new TextSprite('Almost anything can be enlarged...', '30px', 60, 300);
let text302 = new TextSprite('Enlarge spikes to more easily trap', '30px', 60, 340);
let text303 = new TextSprite('enemies, but don\'t step on them!', '30px', 60, 380);

let enemies = [];
let traps = [];
let walls = [wall101];
let text = [text101];

let deadEnemies = [];

class Level
{
    constructor(name, enemyArray , trapArray, wallArray, textArray, playerPosition, goalPosition)
    {
        this.name = name;

        this.wallArray = wallArray;
        this.enemyArray = enemyArray;
        this.textArray = textArray;
        this.trapArray = trapArray;

        this.playerPosition = playerPosition;
        this.goalPosition = goalPosition;
    }

    load()
    {
        walls = this.wallArray;
        enemies = this.enemyArray;
        text = this.textArray;
        traps = this.trapArray;

        for(let i = 0; i < traps.length; i++)
        {
            traps[i].resetSprite();
        }

        for(let i = 0; i < walls.length; i++)
        {
            walls[i].resetSprite();
        }

        for(let i = 0; i < enemies.length; i++)
        {
            enemies[i].sprite.resetSprite();
            enemies[i].active = false;
            enemies[i].alive = true;
        }

        for(let i = 0; i < text.length; i++)
        {
            text[i].resetText();
        }

        player.posX = this.playerPosition.x;
        player.posY = this.playerPosition.y;
        
        goal.posX = this.goalPosition.x;
        goal.posY = this.goalPosition.y;
    }
}

// LEVELS
let level = 0;

let level1 = new Level('level 1', [], [], [wall101, wall102, wall103, wall104, wall105, wall106, wall107, wall108, wall109, wall1010, wall1011, wall1012, wall1013, wall1014, wall1015], [text101, text102, text103], {x: 290, y: 200}, {x: 290, y: -500});
let level2 = new Level('level 2', [enemy201], [], [wall201, wall202, wall203, wall204, wall205, wall206, wall207, wall208, wall209, wall2010, wall2011, wall2012, wall2013, wall2014, wall2015, wall2016, wall1013, wall1014, wall1015], [text201, text202], {x: 290, y: 200}, {x: 290, y: -1000});
let level3 = new Level('level 3', [enemy301, enemy302], [trap301], [wall301, wall302, wall303, wall304, wall305, wall306, wall1013, wall1014, wall1015], [text301, text302, text303], {x: 290, y: 200}, {x: 290, y: -1000});

let levels = [level1, level2, level3];

levels[level].load();

// Variable/object to track key usage
let keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// This function is the function in which the game runs.
function mainLoop()
{
    // Create the background
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();

    goal.update();

    if(rectangularCollision(player.posX, goal.posX, player.posY, goal.posY, player.width, goal.width, player.height, goal.height))
    {
        if(level + 1 < levels.length)
        {
            level++;
            levels[level].load();
        }
    }

    // UPDATE TRAPS
    for(let i = 0; i < traps.length; i++)
    {
        traps[i].update();

        if(rectangularCollision(player.posX, traps[i].posX, player.posY, traps[i].posY, player.width, traps[i].width, player.height, traps[i].height))
        {
            // Code to be triggered when the trap hits the player
            levels[level].load();
        }

        for(let j = 0; j < enemies.length; j++)
        {
            let theEnemy = enemies[j].sprite;

            if(rectangularCollision(theEnemy.posX, traps[i].posX, theEnemy.posY, traps[i].posY, theEnemy.width, traps[i].width, theEnemy.height, traps[i].height))
            {
                // Code to be triggered when the trap hits the player
                enemies[j].active = false;
                enemies[j].alive = false;
            }
        }
    }

    // UPDATE ENEMIES
    for(let i = 0; i < enemies.length; i++)
    {
        if(enemies[i].alive)
        {
            enemies[i].update();
        }

        let theEnemy = enemies[i].sprite;

        if(enemies[i].active)
        {
            // Calculate enemy movement
            let xDist = (player.posX + player.width/2)  - (theEnemy.posX + theEnemy.width/2);
            let yDist = (player.posY + player.height/2) - (theEnemy.posY + theEnemy.height/2);
            let total = Math.abs(yDist) + Math.abs(xDist);
        
            // Execute enemy movement
            theEnemy.xSpeed = (xDist/Math.abs(total)) * (2.8 - enemies[i].slow);
            theEnemy.ySpeed = (yDist/Math.abs(total)) * (2.8 - enemies[i].slow);
        }

        if(isDistance(player, theEnemy, 350, 350))
        {
            enemies[i].active = true;
        }

        if(rectangularCollision(player.posX, theEnemy.posX, player.posY, theEnemy.posY, player.width, theEnemy.width, player.height, theEnemy.height))
        {
            // Code to be triggered when the enemy hits the player
            levels[level].load();
        }
    }

    // Render bullets
    for(let i = 0; i < bullets.length; i++)
    {
        bullets[i].update();

        for(let j = 0; j < enemies.length; j++)
        {
            let theEnemy = enemies[j].sprite;

            // If the enemy collides with a bullet...
            if(/* DON'T TOUCH THIS PART, YOU MAY DESTROY THE GAME*/i >= 0 && rectangularCollision(bullets[i].posX, theEnemy.posX, bullets[i].posY, theEnemy.posY, bullets[i].width, theEnemy.width, bullets[i].height, theEnemy.height))
            {
                // Increase the enemies size
                theEnemy.width += 10;
                theEnemy.height += 10;
                theEnemy.posX -= 5;
                theEnemy.posY -= 5;

                // Decrease the enemies speed
                if(enemies[j].slow + .4 <= 1.8)
                {
                    enemies[j].slow += .4;
                }
                
                // Destroy the bullet
                destroyObject(bullets, bullets[i].name);
                i--;
            }
        }

        for(let j = 0; j < walls.length; j++)
        {
            // If the wall collides with a bullet...
            if(/* DON'T TOUCH THIS PART, YOU MAY DESTROY THE GAME*/i >= 0 && rectangularCollision(bullets[i].posX, walls[j].posX, bullets[i].posY, walls[j].posY, bullets[i].width, walls[j].width, bullets[i].height, walls[j].height))
            {
                // Increase the wall's size
                walls[j].width += 10;
                walls[j].height += 10;

                if(walls[j].image != null)
                {
                    walls[j].image.width += 10;
                    walls[j].image.height += 10;
                }
                walls[j].posX -= 5;
                walls[j].posY -= 5;

                destroyObject(bullets, bullets[i].name);
                i--;
            }
        }

        for(let j = 0; j < traps.length; j++)
        {
            // If the wall collides with a trap...
            if(/* DON'T TOUCH THIS PART, YOU MAY DESTROY THE GAME*/i >= 0 && rectangularCollision(bullets[i].posX, traps[j].posX, bullets[i].posY, traps[j].posY, bullets[i].width, traps[j].width, bullets[i].height, traps[j].height))
            {
                // Increase the trap's size
                traps[j].width += 10;
                traps[j].height += 10;
                traps[j].posX -= 5;
                traps[j].posY -= 5;
    
                destroyObject(bullets, bullets[i].name);
                i--;
            }
        }
    }

    // CONTROLLS
    // Left and right
    if(keys.a)
    {
        player.xSpeed = -4;
        lastDirectionX = -4;

        if(!keys.w || !keys.s)
        {
            lastDirectionY = 0;
        }
    }
    else if(keys.d)
    {
        player.xSpeed = 4;
        lastDirectionX = 4;

        if(!keys.w || !keys.s)
        {
            lastDirectionY = 0;
        }
    }

    // Up and down
    if(keys.w)
    {
        player.ySpeed = -4;
        lastDirectionY = -4

        if(!keys.a || !keys.d)
        {
            lastDirectionX = 0;
        }
    }
    else if(keys.s)
    {
        player.ySpeed = 4;
        lastDirectionY = 4;

        if(!keys.a || !keys.d)
        {
            lastDirectionX = 0;
        }
    }

    // RENDER WALLS
    for(let i = 0; i < walls.length; i++)
    {
        walls[i].update();
    
        if(rectangularCollision(player.posX + player.xSpeed, walls[i].posX, player.posY + player.ySpeed, walls[i].posY, player.width, walls[i].width, player.height, walls[i].height))
        {
            player.xSpeed = 0;
            player.ySpeed = 0;
        }

        for(let j = 0; j < enemies.length; j++)
        {
            let theEnemy = enemies[j].sprite;

            if(rectangularCollision(theEnemy.posX + theEnemy.xSpeed, walls[i].posX, theEnemy.posY + theEnemy.ySpeed, walls[i].posY, theEnemy.width, walls[i].width, theEnemy.height, walls[i].height))
            {
                theEnemy.xSpeed = 0;
                theEnemy.ySpeed = 0;
            }
        }
    }

    for(let i = 0; i < text.length; i++)
    {
        text[i].draw();
    }

    if(player.posX < 225 + 17)
    {
        scroll(3, 0);   
    }
    else if(player.posX > 425 - 17)
    {
        scroll(-3, 0);
    }

    if(player.posY < 188 + 17)
    {
        scroll(0, 3);   
    }
    else if(player.posY > 388 - 17)
    {
        scroll(0, -3);
    }

    window.requestAnimationFrame(mainLoop);
}

mainLoop();

// CONTROLLS
window.addEventListener('keydown', (event) =>
{
    // Record what keys are being pressed
    switch(event.key)
    {
        case 'w':
            keys.w = true;
            break;

        case 's':
            keys.s = true;
            break;

        case 'a':
            keys.a = true;
            break;
        
        case 'd':
            keys.d = true;
            break;
        
        case 'j':
            if(canShootFront)
            {
                canShootFront = false;
                shoot();
            }
            break;
        
        case 'k':
            if(canShootBack)
            {
                canShootBack = false;
                shoot(-1);
            }
            break;
        
        case 'r':
            levels[level].load();
            break;
    }
}
);

window.addEventListener('keyup', (event) =>
    {
        // Record what keys are NOT being pressed
        switch(event.key)
        {
            case 'w':
                player.ySpeed = 0;
                keys.w = false;
                break;
    
            case 's':
                player.ySpeed = 0;
                keys.s = false;
                break;
    
            case 'a':
                player.xSpeed = 0;
                keys.a = false;
                break;
            
            case 'd':
                player.xSpeed = 0;
                keys.d = false;
                break;
            
            case 'j':
                canShootFront = true;
                break;
            
            case 'k':
                canShootBack = true;
                break;
        }
    }
);