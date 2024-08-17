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
            c.drawImage(this.image, this.posX + this.xOffset, this.posY + this.yOffset);
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

// This function returns a boolean value for if two Sprites are colliding
function rectangularCollision(posX1, posX2, posY1, posY2, width1, width2, height1, height2)
{
    return (posX1 + width1 >= posX2 &&
        posX1 <= posX2 + width2 &&
        posY1 + height1 >= posY2 &&
        posY1 <= posY2 + height2);
}

let bullets = [];
let lastDirectionX = 0;
let lastDirectionY = 0;

// This function shoots a bullet from the player
function shoot()
{
    let bullet = new Sprite(player.posX, player.posY, 20, 20, lastDirectionX * 2, lastDirectionY * 2);
    bullets.push(bullet);
}

let player = new Sprite(0, 0, 35, 35, 0, 0);

let enemy = new Enemy(0, 90, 35, 35, 2, 2);

let enemies = [enemy];

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

    // UPDATE ENEMIES
    for(let i = 0; i < enemies.length; i++)
    {
        enemies[i].update();

        let theEnemy = enemies[i].sprite;

        // Calculate enemy movement
        let xDist = player.posX - theEnemy.posX;
        let yDist = player.posY - theEnemy.posY;
        let total = Math.abs(yDist) + Math.abs(xDist);
        
        // Execute enemy movement
        theEnemy.xSpeed = (xDist/Math.abs(total)) * 2.8;
        theEnemy.ySpeed = (yDist/Math.abs(total)) * 2.8;

        if(rectangularCollision(player.posX, theEnemy.posX, player.posY, theEnemy.posY, player.width, theEnemy.width, player.height, theEnemy.height))
        {
            // Code to be triggered when the enemy hits the player
        }
    }

    // Render bullets
    for(let i = 0; i < bullets.length; i++)
    {
        bullets[i].update();
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
            shoot();
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
        }
    }
);