class ProductManager {
    constructor(canvasWidth, canvasHeight) {
        this.image1 = new Image();
        this.image1.src = 'images/pm1.png';
        this.image2 = new Image();
        this.image2.src = 'images/pm2.png';
        this.image3 = new Image();
        this.image3.src = 'images/pm3.png';
        this.currentImage = this.image1;
        this.aspectRatio = 400 / 543; // 原始图片的宽高比
        this.height = 300; // 增加高度到300
        this.width = this.height * this.aspectRatio; // 根据高度和宽高比计算宽度
        this.x = canvasWidth - this.width - 50;
        this.y = canvasHeight / 2 - this.height / 2;
        this.maxHealth = 100000;
        this.health = this.maxHealth;
        this.bombInterval = 2000;
        this.lastBombTime = 0;
        this.attacks = [
            "这个功能应该很容易实现吧？",
            "不就是改几行代码的事吗?",
            "我们临时加个小功能",
            "你们进度有点慢"
        ];
        this.requirementBombInterval = 5000;
        this.lastRequirementBombTime = 0;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.isAttacking = false;
        this.attackDuration = 500; // 攻击动作持续500毫秒
        this.attackStartTime = 0;
        this.isHurt = false;
        this.hurtDuration = 300; // 受伤动作持续300毫秒
        this.hurtStartTime = 0;
    }

    update(delta) {
        // 产品经理可以上下移动
        this.y += Math.sin(Date.now() / 1000) * 2;

        // 检查是否需要结束攻击动作
        if (this.isAttacking && performance.now() - this.attackStartTime > this.attackDuration) {
            this.isAttacking = false;
            this.currentImage = this.image1;
        }

        // 检查是否需要结束受伤动作
        if (this.isHurt && performance.now() - this.hurtStartTime > this.hurtDuration) {
            this.isHurt = false;
            this.currentImage = this.image1;
        }
    }

    draw(ctx) {
        // 绘制产品经理图片
        ctx.drawImage(this.currentImage, this.x, this.y, this.width, this.height);
        
        // 绘制生命值条
        const healthBarWidth = this.width;
        const healthBarHeight = 15; // 增加生命值条高度
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y - 30, healthBarWidth, healthBarHeight);
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y - 30, healthBarWidth * (this.health / this.maxHealth), healthBarHeight);
        
        // 绘制生命值文字
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial'; // 增大字体
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(this.health)}/${this.maxHealth}`, this.x + healthBarWidth / 2, this.y - 35);
    }

    shootBomb(currentTime, playerX, playerY) {
        if (currentTime - this.lastBombTime > this.bombInterval) {
            this.lastBombTime = currentTime;
            this.startAttackAnimation();
            const attack = this.attacks[Math.floor(Math.random() * this.attacks.length)];
            return new Bomb(this.x, this.y + this.height / 2, playerX, playerY, attack);
        }
        return null;
    }

    launchRequirementBomb(currentTime) {
        if (currentTime - this.lastRequirementBombTime > this.requirementBombInterval) {
            this.lastRequirementBombTime = currentTime;
            this.startAttackAnimation();
            const bombCount = 5 + Math.floor(Math.random() * 3); // 5-7个需求文档
            const bombs = [];
            for (let i = 0; i < bombCount; i++) {
                bombs.push(new RequirementBomb(this.canvasWidth, this.canvasHeight));
            }
            return bombs;
        }
        return null;
    }

    startAttackAnimation() {
        this.isAttacking = true;
        this.currentImage = this.image2;
        this.attackStartTime = performance.now();
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health < 0) this.health = 0;
        console.log(`产品经理受到 ${damage} 点伤害，剩余生命值：${this.health}`);
        this.startHurtAnimation();
    }

    startHurtAnimation() {
        this.isHurt = true;
        this.currentImage = this.image3;
        this.hurtStartTime = performance.now();
    }
}

class Bomb {
    constructor(x, y, targetX, targetY, text) {
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.text = text;
        this.speed = 5;
        this.angle = Math.atan2(targetY - y, targetX - x);
        this.width = 200;
        this.height = 40;
        this.glowIntensity = 0;
        this.glowDirection = 1;
    }

    update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);

        // 更新发光效果
        this.glowIntensity += 0.05 * this.glowDirection;
        if (this.glowIntensity >= 1 || this.glowIntensity <= 0) {
            this.glowDirection *= -1;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        // 绘制发光效果
        const gradient = ctx.createLinearGradient(0, -this.height/2, 0, this.height/2);
        gradient.addColorStop(0, `rgba(255, 255, 0, ${0.3 + this.glowIntensity * 0.2})`);
        gradient.addColorStop(0.5, `rgba(255, 165, 0, ${0.5 + this.glowIntensity * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 255, 0, ${0.3 + this.glowIntensity * 0.2})`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);

        // 绘制边框
        ctx.strokeStyle = `rgba(255, 165, 0, ${0.7 + this.glowIntensity * 0.3})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width/2, -this.height/2, this.width, this.height);

        // 绘制尾部效果
        this.drawTrail(ctx);

        // 绘制文字
        ctx.fillStyle = 'black';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 保存当前上下文状态
        ctx.save();
        
        // 如果炸弹向左飞行，翻转文字
        if (Math.abs(this.angle) > Math.PI / 2) {
            ctx.rotate(Math.PI);
        }
        
        ctx.fillText(this.text, 0, 0);
        
        // 恢复上下文状态
        ctx.restore();

        ctx.restore();
    }

    drawTrail(ctx) {
        const trailLength = 5;
        for (let i = 0; i < trailLength; i++) {
            const trailX = -this.width/2 - (i * 10);
            const trailOpacity = (trailLength - i) / trailLength;
            const trailWidth = this.width * (trailLength - i) / trailLength;
            const trailHeight = this.height * (trailLength - i) / trailLength;

            ctx.fillStyle = `rgba(255, 165, 0, ${trailOpacity * 0.3})`;
            ctx.fillRect(trailX, -trailHeight/2, trailWidth, trailHeight);
        }
    }

    isFinished() {
        return false; // 这个方法现在总是返回 false，因为我们不再使用粒子系统
    }
}

class RequirementBomb {
    constructor(canvasWidth, canvasHeight) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.width = 120;
        this.height = 80;
        this.speed = 0.5 + Math.random() * 0.5;
        this.angle = Math.random() * Math.PI * 2;
        this.lifespan = 180; // 改为3秒（60帧/秒 * 3秒）
        this.blinkRate = 0.05;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
    }

    update(playerX, playerY) {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            this.x += (dx / distance) * this.speed;
            this.y += (dy / distance) * this.speed;
        }

        this.angle += 0.02;
        this.lifespan--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        if (Math.random() < this.blinkRate) {
            ctx.globalAlpha = 0.7 + Math.random() * 0.3;
        }

        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('紧急需求', 0, -10);
        ctx.fillText('立即处理', 0, 10);
        ctx.fillText(`${Math.ceil(this.lifespan / 60)}s`, 0, 30); // 添加倒计时显示

        // 添加闪光效果
        ctx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.01) * 0.5;
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);

        ctx.restore();
    }
}

window.ProductManager = ProductManager;
window.Bomb = Bomb;
window.RequirementBomb = RequirementBomb;