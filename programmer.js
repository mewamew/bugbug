class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 100;
        this.vx = 0;
        this.vy = 0;
        this.speed = 5;
        this.jumpStrength = 25; // 增加跳跃强度
        this.isJumping = false;
        this.jumpTime = 0;
        this.maxJumpTime = 600; // 增加最大跳跃时间（毫秒）
        this.maxJumpHeight = 400; // 增加最大跳跃高度
        this.initialY = y; // 记录初始Y坐标
        this.gravity = 0.7; // 稍微减小重力，使跳跃感觉更轻盈
        this.animationFrame = 0;
        this.facingRight = true;
        this.headImage = new Image();
        this.headImage.src = 'head.png';
        this.headSize = 50; // 头部大小，可以根据需要调整
        this.skillReady = [true, true, true, true]; // 添加第四个技能槽位
        this.skillCooldowns = [2000, 5000, 500, 5000]; // 添加第四个技能的冷却时间
        this.lastSkillUses = [0, 0, 0, 0]; // 添加第四个技能的上次使用时间
        this.isInvincible = false; // 新增无敌状态属性
        this.invincibleStartTime = 0; // 新增无敌开始时间
        this.invincibleDuration = 2000; // 无敌持续时间(2秒)
        this.maxHealth = 100;
        this.health = this.maxHealth;
    }

    update(delta, canvas) {
        // 左右移动
        if (window.keys['ArrowLeft'] || window.keys['KeyA']) {
            this.vx = -this.speed;
            this.facingRight = false;
        } else if (window.keys['ArrowRight'] || window.keys['KeyD']) {
            this.vx = this.speed;
            this.facingRight = true;
        } else {
            this.vx = 0;
        }
        this.x += this.vx;

        // 跳跃
        if (this.isJumping) {
            this.jumpTime += delta;
            const jumpProgress = this.jumpTime / this.maxJumpTime;
            
            // 使用二次函数模拟跳跃曲线，增加跳跃高度
            const jumpHeight = -4 * this.maxJumpHeight * (jumpProgress * jumpProgress - jumpProgress);
            this.y = this.initialY - jumpHeight;

            if (this.jumpTime >= this.maxJumpTime) {
                this.isJumping = false;
                this.jumpTime = 0;
            }
        } else {
            // 应用重力
            this.vy += this.gravity;
            this.y += this.vy;
        }

        // 地面检测
        if (this.y + this.height >= canvas.height - 50) {
            this.y = canvas.height - 50 - this.height;
            this.vy = 0;
            this.initialY = this.y; // 更初始Y坐标
        }

        // 限制左右移动范围
        this.x = Math.max(0, Math.min(this.x, canvas.width - this.width));

        // 更新无敌状态
        if (this.isInvincible && performance.now() - this.invincibleStartTime > this.invincibleDuration) {
            this.isInvincible = false;
            console.log("无敌状态结束"); // 添加这行来确认无敌状态结束
        }

        // 更新动画帧
        this.animationFrame = (this.animationFrame + 1) % 60;
    }

    draw(ctx) {
        ctx.save();
        ctx.strokeStyle = 'white';  // 将线条颜色改为白色
        ctx.lineWidth = 2;

        // 翻转角色朝向
        if (!this.facingRight) {
            ctx.scale(-1, 1);
            ctx.translate(-this.x * 2 - this.width, 0);
        }

        // 绘制头部图片
        ctx.drawImage(
            this.headImage, 
            this.x + (this.width - this.headSize) / 2, 
            this.y, 
            this.headSize, 
            this.headSize
        );

        // 绘制身体（白色）
        ctx.beginPath();
        ctx.moveTo(this.x + 25, this.y + 50); // 调整起始点以适应新的头部大小
        ctx.lineTo(this.x + 25, this.y + 80); // 调整结束点
        ctx.stroke();

        // 绘制手臂（带动画，白色）
        const armWave = Math.sin(this.animationFrame * 0.1) * 10;
        ctx.beginPath();
        ctx.moveTo(this.x + 25, this.y + 55); // 调整起始点
        ctx.lineTo(this.x + 10, this.y + 65 + armWave);
        ctx.moveTo(this.x + 25, this.y + 55); // 调整起始点
        ctx.lineTo(this.x + 40, this.y + 65 - armWave);
        ctx.stroke();

        // 绘制腿（带两段关节的动画，白色）
        const legWave = Math.sin(this.animationFrame * 0.1) * 5;
        const kneeWave = Math.cos(this.animationFrame * 0.1) * 3;
        
        // 左腿
        ctx.beginPath();
        ctx.moveTo(this.x + 25, this.y + 80); // 调整起始点
        const leftKneeX = this.x + 20 + legWave;
        const leftKneeY = this.y + 100;
        ctx.lineTo(leftKneeX, leftKneeY);
        ctx.lineTo(leftKneeX - 5 - kneeWave, this.y + 120);
        ctx.stroke();

        // 右腿
        ctx.beginPath();
        ctx.moveTo(this.x + 25, this.y + 80); // 调整起始点
        const rightKneeX = this.x + 30 - legWave;
        const rightKneeY = this.y + 100;
        ctx.lineTo(rightKneeX, rightKneeY);
        ctx.lineTo(rightKneeX + 5 + kneeWave, this.y + 120);
        ctx.stroke();

        // 如果处于无敌状态，绘制防护罩
        if (this.isInvincible) {
            this.drawShield(ctx);
        }

        ctx.restore();
    }

    drawShield(ctx) {
        ctx.save();
        const shieldRadius = Math.max(this.width, this.height) * 0.7;
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, shieldRadius * 0.8,
            this.x + this.width / 2, this.y + this.height / 2, shieldRadius
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
        gradient.addColorStop(0.8, 'rgba(0, 255, 255, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 255, 0.8)');

        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, shieldRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 添加电流效果
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const length = shieldRadius * 0.8 + Math.random() * shieldRadius * 0.2;
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
            ctx.lineTo(
                this.x + this.width / 2 + Math.cos(angle) * length,
                this.y + this.height / 2 + Math.sin(angle) * length
            );
            ctx.strokeStyle = `rgba(0, 255, 255, ${Math.random() * 0.5 + 0.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
        console.log("正在绘制防护罩"); // 添加这行来确认防护罩正在被绘制
    }

    collidesWith(obstacle) {
        return (
            this.x < obstacle.x + obstacle.width &&
            this.x + this.width > obstacle.x &&
            this.y < obstacle.y + obstacle.height &&
            this.y + this.height > obstacle.y
        );
    }

    jump(isHolding) {
        if (!this.isJumping && isHolding && this.y === this.initialY) {
            this.isJumping = true;
            this.jumpTime = 0;
            this.vy = -this.jumpStrength; // 设置初始向上速度
        }
    }

    useSkill(skillIndex) {
        if (this.skillReady[skillIndex]) {
            this.skillReady[skillIndex] = false;
            this.lastSkillUses[skillIndex] = performance.now();
            return true;
        }
        return false;
    }

    updateSkillCooldowns() {
        const now = performance.now();
        for (let i = 0; i < this.skillReady.length; i++) {
            if (!this.skillReady[i] && now - this.lastSkillUses[i] >= this.skillCooldowns[i]) {
                this.skillReady[i] = true;
            }
        }
    }

    takeDamage(damage) {
        this.health -= damage;
        if (this.health < 0) {
            this.health = 0;
        }
        console.log(`玩家受到 ${damage} 点伤害，剩余生命值：${this.health}`);
        if (this.health <= 0) {
            gameOver();
        }
    }

    drawHealth(ctx) {
        const healthBarWidth = 50;
        const healthBarHeight = 5;
        const healthBarX = this.x;
        const healthBarY = this.y - 10;

        ctx.fillStyle = 'red';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);
        ctx.fillStyle = 'green';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (this.health / this.maxHealth), healthBarHeight);
    }

    decreaseHealth(damage) {
        this.takeDamage(damage);
    }

    activateShield() {
        this.isInvincible = true;
        this.invincibleStartTime = performance.now();
        console.log("玩家进入无敌状态，持续2秒"); // 添加这行来确认无敌状态被激活
    }
}

const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});
window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
    if (e.code === 'Space') {
        if (window.player) {
            window.player.jump(false);
        }
    }
});

// 将 Player 类和 keys 对象赋给全局对象
window.Player = Player;
window.keys = keys;