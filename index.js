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

let player = new Sprite(0, 0, 35, 35, 0, 0);

let enemy = new Enemy(0, 90, 35, 35, 2, 2);

let enemies = [enemy];

function mainLoop()
{
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.fillStyle = 'black';
    c.fillRect(0, 0, canvas.width, canvas.height);

    player.update();

    for(let i = 0; i < enemies.length; i++)
    {
        enemies[i].update();
    }

    window.requestAnimationFrame(mainLoop);
}

mainLoop();

window.addEventListener('keydown', (event) =>
{
    switch(event.key)
    {
        case 'w':
            player.ySpeed = -4;
            break;

        case 's':
            player.ySpeed = 4;
            break;

        case 'a':
            player.xSpeed = -4;
            break;
        
        case 'd':
            player.xSpeed = 4;
            break;
    }
}
);

window.addEventListener('keyup', (event) =>
    {
        switch(event.key)
        {
            case 'w':
                player.ySpeed = 0;
                break;
    
            case 's':
                player.ySpeed = 0;
                break;
    
            case 'a':
                player.xSpeed = 0;
                break;
            
            case 'd':
                player.xSpeed = 0;
                break;
        }
    }
);