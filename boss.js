class Boss {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // 保持原始图片的宽高比
        const originalWidth = 394;
        const originalHeight = 268;
        const scaleFactor = 1.2; // 增大 Boss 的比例，可以根据需要调整

        this.width = originalWidth * scaleFactor;
        this.height = originalHeight * scaleFactor;
        
        this.x = canvas.width / 2 - this.width / 2;
        this.y = 50; // 稍微调高一点，让 Boss 更靠近屏幕顶部

        this.health = 20000;
        this.maxHealth = 20000;
        this.moveSpeed = 1;
        this.moveDirection = 1;

        // 加载 Boss 图片
        this.image = new Image();
        this.image.src = 'images/boss.png';
        this.imageLoaded = false;
        this.image.onload = () => {
            this.imageLoaded = true;
        };
    }

    draw() {
        if (this.imageLoaded) {
            // 绘制 Boss 图片
            this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // 如果图片未加载完成，绘制紫色矩形作为占位符
            this.ctx.fillStyle = 'purple';
            this.ctx.fillRect(this.x, this.y, this.width, this.height);
        }
        
        // 绘制血条
        this.ctx.fillStyle = 'red';
        this.ctx.fillRect(this.x, this.y - 20, this.width * (this.health / this.maxHealth), 10);
    }

    update() {
        // Boss 在上方随机漂浮
        this.x += this.moveSpeed * this.moveDirection;
        if (this.x <= 0 || this.x + this.width >= this.canvas.width) {
            this.moveDirection *= -1;
        }
    }

    decreaseHealth(damage) {
        this.health -= damage;
        console.log(`Boss 受到 ${damage} 点伤害，剩余血量：${this.health}`);
    }

    salaryCut() {
        const particles = [];
        for (let i = 0; i < 20; i++) { // 增加粒子数量
            const text = '降薪' + Math.floor(Math.random() * 1000);
            particles.push(new SalaryCutParticle(this.x + this.width / 2, this.y + this.height, text));
        }
        return particles;
    }

    overtime(playerX, playerY) {
        return {
            x: playerX,
            y: playerY - 100, // 在玩家上方100像素处
            radius: 25,
            opacity: 0,
            laserWidth: 4,
            laserLength: 0,
            maxLaserLength: this.canvas.height - playerY + 100, // 调整激光长度
            animationProgress: 0
        };
    }

    layoffOptimization() {
        return {
            x: this.x + this.width / 2,
            y: this.y + this.height / 2,
            radius: 0,
            maxRadius: Math.max(canvas.width, canvas.height),
            duration: 3000, // 爆炸持续时间（毫秒）
            startTime: performance.now(),
            words: ['优化', '裁员', '重组', '降本增效', '精简人员']
        };
    }
}