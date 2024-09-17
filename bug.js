class Bug {
    constructor(canvasWidth, canvasHeight) {
        this.types = [
            '死锁', '内存泄露', '越界', '空指针', '异常', '注入',
            '无限循环', '类型错误', '并发冲突', '资源泄露', '堆栈溢出'
        ];
        this.type = this.types[Math.floor(Math.random() * this.types.length)];
        this.initialSize = 60;
        this.width = this.initialSize;
        this.height = this.initialSize;
        this.x = canvasWidth;
        this.initialY = canvasHeight - 50 - this.height - Math.random() * 100;
        this.y = this.initialY;
        this.speed = 2 + Math.random() * 3;
        this.animationFrame = 0;
        this.growthFactor = 1;
        this.wiggle = 0;
    }

    update(delta) {
        this.x -= this.speed;
        this.animationFrame += delta * 0.01;

        // 根据 BUG 类型更新大小和行为
        switch (this.type) {
            case '内存泄露':
                this.growthFactor += 0.001 * delta;
                this.width = this.initialSize * this.growthFactor;
                this.height = this.initialSize * this.growthFactor;
                // 调整 Y 坐标，使 BUG 底部保持不变
                this.y = this.initialY + this.initialSize - this.height;
                break;
            case '无限循环':
                this.rotationAngle = (this.animationFrame * 2) % (Math.PI * 2);
                break;
            case '资源泄露':
                this.dropY = (this.animationFrame * 100) % 60;
                break;
            case '越界':
                this.wiggle = Math.sin(this.animationFrame * 2) * 5;
                break;
            // 可以为其他 BUG 类型添加特殊行为
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);

        // 对于无限循环，我们旋转整个 BUG
        if (this.type === '无限循环') {
            ctx.rotate(this.rotationAngle);
        }

        ctx.translate(-this.width / 2, -this.height / 2);

        switch (this.type) {
            case '死锁': this.drawDeadlock(ctx); break;
            case '内存泄露': this.drawMemoryLeak(ctx); break;
            case '越界': this.drawOutOfBounds(ctx); break;
            case '空指针': this.drawNullPointer(ctx); break;
            case '异常': this.drawException(ctx); break;
            case '注入': this.drawInjection(ctx); break;
            case '无限循环': this.drawInfiniteLoop(ctx); break;
            case '类型错误': this.drawTypeError(ctx); break;
            case '并发冲突': this.drawConcurrencyConflict(ctx); break;
            case '资源泄露': this.drawResourceLeak(ctx); break;
            case '堆栈溢出': this.drawStackOverflow(ctx); break;
        }

        ctx.restore();

        this.drawText(ctx);
    }

    drawText(ctx) {
        ctx.save();
        ctx.font = '12px Arial';
        const textWidth = ctx.measureText(this.type).width;
        const padding = 4;
        const textBackgroundWidth = textWidth + padding * 2;
        const textBackgroundHeight = 16;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(
            this.x + this.width / 2 - textBackgroundWidth / 2,
            this.y + this.height + 5,
            textBackgroundWidth,
            textBackgroundHeight
        );

        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.type, this.x + this.width / 2, this.y + this.height + 13);
        ctx.restore();
    }

    drawDeadlock(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = this.width / 6;

        ctx.beginPath();
        ctx.arc(centerX - this.width / 6, centerY, radius, 0, Math.PI * 2);
        ctx.arc(centerX + this.width / 6, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FF6B6B';
        ctx.fill();
        ctx.strokeStyle = '#FFA07A';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - this.width / 6, centerY - radius);
        ctx.lineTo(centerX - this.width / 6, centerY - radius - 10);
        ctx.moveTo(centerX + this.width / 6, centerY - radius);
        ctx.lineTo(centerX + this.width / 6, centerY - radius - 10);
        ctx.stroke();
    }

    drawMemoryLeak(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const baseRadius = this.initialSize / 3 * this.growthFactor;
        const extraRadius = Math.sin(this.animationFrame) * 5 * this.growthFactor;

        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius + extraRadius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, 128, ${0.5 + 0.3 * Math.sin(this.animationFrame)})`;
        ctx.fill();
        ctx.strokeStyle = '#7FFFD4';
        ctx.stroke();

        ctx.fillStyle = 'white';
        ctx.font = `${this.width / 3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('MB', centerX, centerY);
    }

    drawOutOfBounds(ctx) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(this.wiggle, 0, this.width, this.height);
        ctx.strokeStyle = '#FFA500';
        ctx.strokeRect(this.wiggle, 0, this.width, this.height);

        // 绘制箭头
        ctx.beginPath();
        ctx.moveTo(this.width + 5, this.height / 2);
        ctx.lineTo(this.width + 15, this.height / 2);
        ctx.lineTo(this.width + 10, this.height / 2 - 5);
        ctx.moveTo(this.width + 15, this.height / 2);
        ctx.lineTo(this.width + 10, this.height / 2 + 5);
        ctx.stroke();
    }

    drawNullPointer(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const time = this.animationFrame * 0.1;

        // 绘制闪烁的问号
        ctx.fillStyle = `rgba(138, 43, 226, ${0.5 + 0.5 * Math.sin(time * 2)})`;
        ctx.font = `bold ${this.width / 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('?', centerX, centerY);

        // 绘制断开的指针
        ctx.strokeStyle = '#DA70D6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX - this.width / 3, centerY + this.height / 3);
        ctx.lineTo(centerX, centerY - this.height / 6 + Math.sin(time) * 5);
        ctx.moveTo(centerX + this.width / 6, centerY + Math.cos(time) * 5);
        ctx.lineTo(centerX + this.width / 3, centerY + this.height / 3);
        ctx.stroke();

        // 绘制闪烁的圆圈
        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 3, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(138, 43, 226, ${0.3 + 0.3 * Math.sin(time * 3)})`;
        ctx.stroke();

        // 绘制小粒子
        const particleCount = 5;
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + time;
            const x = centerX + Math.cos(angle) * this.width / 4;
            const y = centerY + Math.sin(angle) * this.height / 4;
            ctx.fillStyle = `rgba(138, 43, 226, ${0.7 + 0.3 * Math.sin(time + i)})`;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawException(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - this.height / 3);
        ctx.lineTo(centerX - this.width / 3, centerY + this.height / 3);
        ctx.lineTo(centerX + this.width / 3, centerY + this.height / 3);
        ctx.closePath();
        ctx.fillStyle = this.animationFrame % 1 > 0.5 ? '#FFFF00' : '#FF4500';
        ctx.fill();
        ctx.strokeStyle = '#FFD700';
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', centerX, centerY + this.height / 6);
    }

    drawInjection(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const injectProgress = Math.abs(Math.sin(this.animationFrame));

        ctx.beginPath();
        ctx.moveTo(centerX - this.width / 3, centerY - this.height / 3);
        ctx.lineTo(centerX + this.width / 3, centerY + this.height / 3);
        ctx.lineTo(centerX + this.width / 3 + 5, centerY + this.height / 3 - 5);
        ctx.lineTo(centerX - this.width / 3 - 5, centerY - this.height / 3 + 5);
        ctx.closePath();
        ctx.fillStyle = '#00FFFF';
        ctx.fill();
        ctx.strokeStyle = '#1E90FF';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - this.width / 3, centerY - this.height / 3);
        ctx.lineTo(centerX - this.width / 3 + injectProgress * this.width / 2, centerY - this.height / 3 + injectProgress * this.height / 2);
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#1E90FF';
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX + this.width / 3, centerY + this.height / 3);
        ctx.lineTo(centerX + this.width / 3 + injectProgress * 10, centerY + this.height / 3 + injectProgress * 10);
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    drawInfiniteLoop(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = this.width / 3;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#4169E1';
        ctx.lineWidth = 3;
        ctx.stroke();

        const arrowAngle = this.animationFrame % (Math.PI * 2);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, arrowAngle, arrowAngle + Math.PI * 1.5);
        ctx.lineTo(centerX + radius * Math.cos(arrowAngle), centerY + radius * Math.sin(arrowAngle));
        ctx.fillStyle = '#6495ED';
        ctx.fill();
    }

    drawTypeError(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        ctx.fillStyle = '#FF69B4';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Type', centerX, centerY - this.height / 6);
        ctx.fillText('Error', centerX, centerY + this.height / 6);

        ctx.strokeStyle = '#FF1493';
        ctx.strokeRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
    }

    drawConcurrencyConflict(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        ctx.beginPath();
        ctx.moveTo(centerX - this.width / 3, centerY - this.height / 3);
        ctx.lineTo(centerX + this.width / 3, centerY + this.height / 3);
        ctx.moveTo(centerX + this.width / 3, centerY - this.height / 3);
        ctx.lineTo(centerX - this.width / 3, centerY + this.height / 3);
        ctx.strokeStyle = '#9370DB';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY, this.width / 3, 0, Math.PI * 2);
        ctx.stroke();
    }

    drawResourceLeak(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY - this.height / 3);
        ctx.bezierCurveTo(
            centerX + this.width / 3, centerY - this.height / 3,
            centerX + this.width / 3, centerY + this.height / 3,
            centerX, centerY + this.height / 3
        );
        ctx.bezierCurveTo(
            centerX - this.width / 3, centerY + this.height / 3,
            centerX - this.width / 3, centerY - this.height / 3,
            centerX, centerY - this.height / 3
        );
        ctx.fillStyle = `rgba(32, 178, 170, ${0.5 + 0.3 * Math.sin(this.animationFrame)})`;
        ctx.fill();
        ctx.strokeStyle = '#40E0D0';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(centerX, centerY + this.height / 2 + this.dropY, this.width / 10, 0, Math.PI * 2);
        ctx.fill();
    }

    drawStackOverflow(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;

        for (let i = 0; i < 5; i++) {
            ctx.fillStyle = i === 4 ? '#FF4500' : '#A9A9A9';
            ctx.fillRect(centerX - this.width / 6, centerY - this.height / 3 + i * this.height / 12, this.width / 3, this.height / 6);
            ctx.strokeStyle = '#DCDCDC';
            ctx.strokeRect(centerX - this.width / 6, centerY - this.height / 3 + i * this.height / 12, this.width / 3, this.height / 6);
        }

        ctx.beginPath();
        ctx.moveTo(centerX, centerY + this.height / 3);
        ctx.lineTo(centerX, centerY + this.height / 2);
        ctx.lineTo(centerX + this.width / 12, centerY + this.height / 3 + this.height / 12);
        ctx.moveTo(centerX, centerY + this.height / 2);
        ctx.lineTo(centerX - this.width / 12, centerY + this.height / 3 + this.height / 12);
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

window.Bug = Bug;