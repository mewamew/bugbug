const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let gameRunning = false;
let gamePaused = false;
let lastTime = 0;
let obstacles = [];
let player;
let spawnInterval = 2000; // 毫秒
let lastSpawn = 0;
let lastSkillUse = [0, 0]; // 分别对应两个技能的上次使用时间
const skillCooldown = [2000, 5000]; // 分别对应两个技能的冷却时间（毫秒）

// 在文件顶部添加这些新的变量
const codeSnippets = [
    'if (bug) { fix(); }',
    'while (!solved) { code(); }',
    'try { program(); } catch (bug) {}',
    'function debug() { /* TODO */ }',
    'const solution = 42;',
    'for (let i = 0; i < Infinity; i++) {}',
    '// This code works, don\'t touch it!',
    'import coffee from "programmer";'
];

let floatingSnippets = [];

// 添加这个新函数来创建浮动代码片段
function createFloatingSnippet() {
    return {
        text: codeSnippets[Math.floor(Math.random() * codeSnippets.length)],
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.5 + Math.random() * 1.5,
        opacity: Math.random() * 0.3 + 0.1
    };
}

// 添加这个新函数来更新浮动代码片段
function updateFloatingSnippets() {
    if (floatingSnippets.length < 20 && Math.random() < 0.05) {
        floatingSnippets.push(createFloatingSnippet());
    }

    floatingSnippets = floatingSnippets.filter(snippet => {
        snippet.y -= snippet.speed;
        snippet.opacity -= 0.0005;
        return snippet.y + 20 > 0 && snippet.opacity > 0;
    });
}

let currentLevel = 1;

// 在文件顶部添加这些变量
let productManager;
let bombs = [];
let requirementBombs = []; // 添加这行

// 在文件顶部添加新的变
let garbageCodeBullets = [];

// 添加新的垃圾代码子弹类
class GarbageCodeBullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.speed = 6; // 稍微降低速度，让玩家更容易看清
        this.angle = angle;
        this.size = 20; // 增大字体大小
        this.lifespan = 300; // 增加生命周期
        this.code = this.getRandomCode(); // 获取随机代码片段
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.lifespan--;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.font = `${this.size}px Courier`;
        ctx.fillStyle = '#00FF00'; // 荧光绿色
        ctx.fillText(this.code, 0, 0);
        ctx.restore();
    }

    getRandomCode() {
        const codeSamples = [
            'if(money<0){panic();}',
            'while(true){code();}',
            'try{work();}catch(e){}',
            'for(;;){coffee.drink();}',
            'function sleep(){return;}',
            'if(bug){ignore();continue;}',
            'do{refactor();}while(false);',
            'switch(mood){case"happy":break;}'
        ];
        return codeSamples[Math.floor(Math.random() * codeSamples.length)];
    }
}

let boss; // 添加这行来声明 boss 变量
let dollarSigns = [];
let overtimeLaser = null;
let layoffExplosion = null;

// 在文件开头添加这个新的类
class SalaryCutParticle {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.speed = Math.random() * 3 + 2; // 增加速度
        this.angle = Math.random() * Math.PI * 2; // 全方位散开
        this.size = Math.random() * 10 + 15; // 稍微增大字体
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
    }

    draw(ctx) {
        ctx.save();
        ctx.font = `${this.size}px Arial`;
        ctx.fillStyle = 'red';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

function initLevel(level) {
    currentLevel = level;
    player = new Player(canvas.width / 4, canvas.height - 150);
    obstacles = [];
    bombs = [];
    requirementBombs = [];
    lastTime = performance.now();
    spawnInterval = 2000;
    gameRunning = true;
    lastSkillUse = [0, 0, 0];

    if (level === 1) {
        // 第一关的初始化逻辑
        floatingSnippets = [];
        for (let i = 0; i < 10; i++) {
            floatingSnippets.push(createFloatingSnippet());
        }
    } else if (level === 2) {
        // 第二关的初始化逻辑
        productManager = new ProductManager(canvas.width, canvas.height);
    } else if (level === 3) {
        // 第三关的初始化逻辑
        boss = new Boss(canvas);
        dollarSigns = [];
        overtimeLaser = null;
        layoffExplosion = null;
    }

    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    if (!gameRunning) return;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    if (!gamePaused) {
        update(delta);
        render();
    }

    requestAnimationFrame(gameLoop);
}

function update(delta) {
    if (currentLevel === 1) {
        // 第一关的更新逻辑
        player.update(delta, canvas);
        obstacles.forEach(obstacle => obstacle.update(delta));
        updateFloatingSnippets();
        // 生成障碍物
        if (performance.now() - lastSpawn > spawnInterval) {
            obstacles.push(new Bug(canvas.width, canvas.height));
            lastSpawn = performance.now();
        }
        // 检测碰撞
        if (!player.isInvincible) {
            obstacles.forEach(obstacle => {
                if (player.collidesWith(obstacle)) {
                    gameOver();
                }
            });
        }
        // 移除离开屏幕的障碍物
        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
        
        // 更新技能冷却
        const now = performance.now();
        for (let i = 0; i < player.skillReady.length; i++) {
            if (now - lastSkillUse[i] >= player.skillCooldowns[i]) {
                player.skillReady[i] = true;
            }
        }
    } else if (currentLevel === 2) {
        // 第二关的更新逻辑
        player.update(delta, canvas);
        productManager.update(delta);
        
        // 产品经理发射炸弹
        const newBomb = productManager.shootBomb(performance.now(), player.x, player.y);
        if (newBomb) bombs.push(newBomb);
        
        // 产品经理动需求轰炸
        const newRequirementBombs = productManager.launchRequirementBomb(performance.now());
        if (newRequirementBombs) {
            requirementBombs = requirementBombs.concat(newRequirementBombs);
        }

        // 更新需求炸
        requirementBombs.forEach(bomb => bomb.update(player.x, player.y));
        requirementBombs = requirementBombs.filter(bomb => bomb.lifespan > 0);

        // 检测玩家与需求轰炸的碰撞
        requirementBombs.forEach(bomb => {
            if (isColliding(player, bomb)) {
                player.takeDamage(5);
                player.speed *= 0.9; // 减慢玩家速度
                bomb.lifespan = 0;
            }
        });

        // 需求炸弹自动消失，不再造成伤害
        requirementBombs = requirementBombs.filter(bomb => bomb.lifespan > 0);
        
        // 更新炸弹
        bombs.forEach(bomb => bomb.update());
        bombs = bombs.filter(bomb => {
            return bomb.x > 0 && bomb.x < canvas.width && bomb.y > 0 && bomb.y < canvas.height;
        });
        
        // 检测玩家与炸弹的碰撞
        if (!player.isInvincible) {
            bombs.forEach(bomb => {
                if (isPlayerCollidingWithBomb(player, bomb)) {
                    gameOver();
                }
            });
        }
        
        // 检测技能是否击产理
        if (player.skillReady[0] === false) { // 技能0是攻击技能
            if (isColliding(player, productManager)) {
                productManager.takeDamage(50); // 降低伤害
                if (productManager.health <= 0) {
                    gameWin();
                }
            }
        }
        
        // 更新垃圾代码子弹
        garbageCodeBullets.forEach(bullet => bullet.update());
        garbageCodeBullets = garbageCodeBullets.filter(bullet => bullet.lifespan > 0);
        
        // 检测子弹是否击中产品经理
        garbageCodeBullets.forEach(bullet => {
            if (isColliding({x: bullet.x, y: bullet.y, width: 10, height: 10}, productManager)) {
                productManager.takeDamage(5);
                bullet.lifespan = 0;
                if (productManager.health <= 0) {
                    gameWin();
                }
            }
        });
    } else if (currentLevel === 3) {
        // 第三关的更新逻辑
        player.update(delta, canvas);
        boss.update();

        // 实现 Boss 的技能
        if (Math.random() < 0.01) {
            dollarSigns = dollarSigns.concat(boss.salaryCut());
        }

        if (Math.random() < 0.005 && !overtimeLaser) {
            overtimeLaser = boss.overtime(player.x + player.width / 2, player.y);
        }

        // 更新降薪打击
        dollarSigns = dollarSigns.filter((particle) => {
            particle.update();
            if (!player.isInvincible && isColliding(player, {x: particle.x, y: particle.y, width: 20, height: 20})) {
                player.decreaseHealth(10);
                console.log(`玩家受到降薪打击，剩余血量：${player.health}`);
                return false; // 移除击中玩家的粒子
            }
            // 检查粒子是否离开画布
            return particle.x >= 0 && particle.x <= canvas.width && particle.y >= 0 && particle.y <= canvas.height;
        });

        // 更新加班令
        if (overtimeLaser) {
            overtimeLaser.animationProgress += delta / 2000; // 动画持续2秒

            if (overtimeLaser.animationProgress <= 1) {
                // 时钟渐现阶段
                overtimeLaser.opacity = overtimeLaser.animationProgress;
            } else if (overtimeLaser.animationProgress <= 2) {
                // 激光伸长阶段
                overtimeLaser.laserLength = (overtimeLaser.animationProgress - 1) * overtimeLaser.maxLaserLength;
            } else {
                // 检测碰撞
                if (!player.isInvincible && isColliding(player, {
                    x: overtimeLaser.x - overtimeLaser.laserWidth / 2,
                    y: overtimeLaser.y,
                    width: overtimeLaser.laserWidth,
                    height: overtimeLaser.laserLength
                })) {
                    player.decreaseHealth(20);
                    console.log(`玩家受到加班令攻击，剩余血量：${player.health}`);
                    overtimeLaser = null;
                }
            }

            if (overtimeLaser && overtimeLaser.animationProgress > 3) {
                overtimeLaser = null;
            }
        }

        // 裁员优化爆炸技能
        if (Math.random() < 0.001 && !layoffExplosion) {
            layoffExplosion = boss.layoffOptimization();
        }

        if (layoffExplosion) {
            const elapsedTime = performance.now() - layoffExplosion.startTime;
            layoffExplosion.radius = (elapsedTime / layoffExplosion.duration) * layoffExplosion.maxRadius;

            // 检测玩家是否在爆炸范围内
            const dx = player.x + player.width / 2 - layoffExplosion.x;
            const dy = player.y + player.height / 2 - layoffExplosion.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance <= layoffExplosion.radius) {
                player.decreaseHealth(0.1); // 持续伤害
                player.speed = Math.max(player.speed * 0.99, player.speed * 0.5); // 减速效果
            }

            if (elapsedTime >= layoffExplosion.duration) {
                layoffExplosion = null;
                player.speed = 5; // 恢复正常速度
            }
        }

        // 检测玩家是否击中 Boss
        if (player.isShooting && checkCollision(boss, player.bullet)) {
            boss.decreaseHealth(player.bulletDamage);
            player.bullet = null;
        }

        // 检查游戏是否结束
        if (boss.health <= 0) {
            gameWin();
        }
        if (player.health <= 0) {
            gameOver();
        }

        // 更新垃圾代码子弹
        garbageCodeBullets.forEach(bullet => bullet.update());
        garbageCodeBullets = garbageCodeBullets.filter(bullet => bullet.lifespan > 0);
        
        // 检测子弹是否击中 Boss
        garbageCodeBullets.forEach(bullet => {
            if (isColliding({x: bullet.x, y: bullet.y, width: 10, height: 10}, boss)) {
                boss.decreaseHealth(5);
                bullet.lifespan = 0;
                if (boss.health <= 0) {
                    gameWin();
                }
            }
        });
    }

    // 更新技能冷却
    const now = performance.now();
    for (let i = 0; i < player.skillReady.length; i++) {
        if (now - lastSkillUse[i] >= player.skillCooldowns[i]) {
            player.skillReady[i] = true;
        }
    }
}

function render() {
    ctx.fillStyle = '#171717';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (currentLevel === 1) {
        // 第一关的渲染逻辑
        // 绘制浮动代码片段
        ctx.font = '14px Courier New';
        floatingSnippets.forEach(snippet => {
            ctx.fillStyle = `rgba(0, 255, 0, ${snippet.opacity})`;
            ctx.fillText(snippet.text, snippet.x, snippet.y);
        });

        player.draw(ctx);
        obstacles.forEach(obstacle => obstacle.draw(ctx));
        
        // 绘制技能UI
        drawSkillUI(ctx);
    } else if (currentLevel === 2) {
        // 第二关的渲染逻辑
        player.draw(ctx);
        productManager.draw(ctx);
        bombs.forEach(bomb => bomb.draw(ctx));
        garbageCodeBullets.forEach(bullet => bullet.draw(ctx));
        requirementBombs.forEach(bomb => bomb.draw(ctx));
    } else if (currentLevel === 3) {
        // 第三关的渲染逻辑
        player.draw(ctx);
        boss.draw(ctx);

        // 绘制降薪打击
        dollarSigns.forEach(particle => {
            particle.draw(ctx);
        });

        // 绘制加班令
        if (overtimeLaser) {
            ctx.save();
            ctx.translate(overtimeLaser.x, overtimeLaser.y);
            ctx.rotate(overtimeLaser.angle);
            
            // 绘制时钟
            ctx.beginPath();
            ctx.arc(0, 0, overtimeLaser.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 165, 0, ${overtimeLaser.opacity})`;
            ctx.fill();
            ctx.strokeStyle = `rgba(0, 0, 0, ${overtimeLaser.opacity})`;
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // 绘制时针
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(overtimeLaser.animationProgress * Math.PI * 2) * overtimeLaser.radius * 0.6,
                Math.sin(overtimeLaser.animationProgress * Math.PI * 2) * overtimeLaser.radius * 0.6
            );
            ctx.strokeStyle = `rgba(0, 0, 0, ${overtimeLaser.opacity})`;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // 绘制激光
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, overtimeLaser.laserLength);
            ctx.strokeStyle = 'red';
            ctx.lineWidth = overtimeLaser.laserWidth;
            ctx.stroke();
            
            ctx.restore();
        }

        // 渲染裁员优化爆炸
        if (layoffExplosion) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(layoffExplosion.x, layoffExplosion.y, layoffExplosion.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fill();

            // 渲染飘散的文字
            ctx.font = '20px Arial';
            ctx.fillStyle = 'white';
            layoffExplosion.words.forEach((word, index) => {
                const angle = (index / layoffExplosion.words.length) * Math.PI * 2;
                const x = layoffExplosion.x + Math.cos(angle) * layoffExplosion.radius * 0.8;
                const y = layoffExplosion.y + Math.sin(angle) * layoffExplosion.radius * 0.8;
                ctx.fillText(word, x, y);
            });

            ctx.restore();
        }

        // 绘制垃圾代码子弹
        garbageCodeBullets.forEach(bullet => bullet.draw(ctx));
    }
    
    drawSkillUI(ctx);
    player.drawHealth(ctx); // 添加这行来绘制玩家的生命值
}

function drawSkillUI(ctx) {
    ctx.save();
    
    const skillUIWidth = 220;
    const skillUIHeight = 60;
    const skillUIMargin = 10;
    const skillUISpacing = 70;
    
    const skillCount = currentLevel === 1 ? 2 : 3; // 根据关卡决定技能数量
    
    for (let i = 0; i < skillCount; i++) {
        // 背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(skillUIMargin, skillUIMargin + i * skillUISpacing, skillUIWidth, skillUIHeight);
        
        // 技能名称和按键提示
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = i === 2 ? '#ff00ff' : '#00ffff';
        let skillName = '';
        switch(i) {
            case 0: skillName = 'Ctrl+C/V大法 [按1]'; break;
            case 1: skillName = '代码重构 [按2]'; break;
            case 2: skillName = '垃圾代码散射 [按3]'; break;
        }
        ctx.fillText(skillName, skillUIMargin + 75, skillUIMargin + 25 + i * skillUISpacing);
        
        // 技能状态
        ctx.font = '14px Arial';
        ctx.fillStyle = player.skillReady[i] ? '#00ff00' : '#ff0000';
        ctx.fillText(player.skillReady[i] ? '就绪' : '冷却中', skillUIMargin + 35, skillUIMargin + 50 + i * skillUISpacing);
        
        // 冷却倒计时动画
        if (!player.skillReady[i]) {
            const cooldownProgress = (performance.now() - lastSkillUse[i]) / player.skillCooldowns[i];
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fillRect(skillUIMargin + 100, skillUIMargin + 35 + i * skillUISpacing, 100, 15);
            ctx.fillStyle = i === 2 ? '#ff00ff' : '#00ffff';
            ctx.fillRect(skillUIMargin + 100, skillUIMargin + 35 + i * skillUISpacing, 100 * cooldownProgress, 15);
        }
        
        // 添加酷炫的边框
        ctx.strokeStyle = i === 2 ? '#ff00ff' : '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(skillUIMargin, skillUIMargin + i * skillUISpacing, skillUIWidth, skillUIHeight);
        
        // 如果技能就绪，添加烁效果
        if (player.skillReady[i]) {
            ctx.globalAlpha = 0.5 + Math.sin(performance.now() * 0.01) * 0.5;
            ctx.strokeStyle = i === 2 ? '#ff00ff' : '#00ffff';
            ctx.strokeRect(skillUIMargin + 2, skillUIMargin + 2 + i * skillUISpacing, skillUIWidth - 4, skillUIHeight - 4);
            ctx.globalAlpha = 1;
        }
    }
    
    ctx.restore();
}

function gameOver() {
    gameRunning = false;
    let opacity = 0;
    let textSize = 0;
    const maxTextSize = 200;

    function animateGameOver() {
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `${textSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 添加光晕效果
        const glowSize = 20;
        const glowColor = `rgba(255, 0, 0, ${opacity * 0.5})`;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = glowSize;

        // 绘制多层光晕
        for (let i = glowSize; i > 0; i -= 2) {
            ctx.shadowBlur = i;
            ctx.fillStyle = `rgba(255, ${i * 5}, ${i * 5}, ${opacity})`;
            ctx.fillText('死', canvas.width / 2, canvas.height / 2);
        }

        // 绘制主要文字
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fillText('死', canvas.width / 2, canvas.height / 2);

        opacity += 0.02;
        textSize = Math.min(textSize + 2, maxTextSize);

        if (opacity < 1 || textSize < maxTextSize) {
            requestAnimationFrame(animateGameOver);
        }
    }

    animateGameOver();
}

// 添加 gameWin 函数
function gameWin() {
    gameRunning = false;
    
    // 创建爆炸效果
    const explosionParticles = [];
    const particleCount = 200;
    for (let i = 0; i < particleCount; i++) {
        explosionParticles.push({
            x: boss.x + boss.width / 2,
            y: boss.y + boss.height / 2,
            radius: Math.random() * 3 + 1,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            velocity: {
                x: (Math.random() - 0.5) * 10,
                y: (Math.random() - 0.5) * 10
            },
            opacity: 1
        });
    }

    let bossOpacity = 1;
    let explosionRadius = 0;

    function animateExplosion() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制背景
        ctx.fillStyle = '#171717';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制爆炸效果
        explosionParticles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = particle.opacity;
            ctx.fill();

            particle.x += particle.velocity.x;
            particle.y += particle.velocity.y;
            particle.opacity -= 0.01;
        });

        // 绘制消失中的老板
        ctx.globalAlpha = bossOpacity;
        boss.draw(ctx);
        ctx.globalAlpha = 1;

        // 绘制扩散的光圈
        ctx.beginPath();
        ctx.arc(boss.x + boss.width / 2, boss.y + boss.height / 2, explosionRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();

        bossOpacity -= 0.01;
        explosionRadius += 5;

        if (bossOpacity > 0) {
            requestAnimationFrame(animateExplosion);
        } else {
            showVictoryScreen();
        }
    }

    animateExplosion();
}

function showVictoryScreen() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = 'bold 48px Arial';
    ctx.fillStyle = '#00FF00';
    ctx.textAlign = 'center';
    ctx.fillText('恭喜你战胜了老板！', canvas.width / 2, canvas.height / 2 - 50);

    ctx.font = '24px Arial';
    ctx.fillText('你已成功从入门到跑路！', canvas.width / 2, canvas.height / 2 + 50);

    // 添加一个重新开始按钮
    const restartButton = {
        x: canvas.width / 2 - 100,
        y: canvas.height / 2 + 100,
        width: 200,
        height: 50
    };

    ctx.fillStyle = '#00FF00';
    ctx.fillRect(restartButton.x, restartButton.y, restartButton.width, restartButton.height);

    ctx.fillStyle = 'black';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('重新开始', canvas.width / 2, restartButton.y + 35);

    // 添加点击事件监听器
    canvas.addEventListener('click', handleRestartClick);

    function handleRestartClick(event) {
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;

        if (clickX >= restartButton.x && clickX <= restartButton.x + restartButton.width &&
            clickY >= restartButton.y && clickY <= restartButton.y + restartButton.height) {
            canvas.removeEventListener('click', handleRestartClick);
            document.getElementById('startScreen').style.display = 'flex';
            // 重置游戏状态
            currentLevel = 1;
            player = null;
            boss = null;
            obstacles = [];
            bombs = [];
            requirementBombs = [];
            garbageCodeBullets = [];
        }
    }
}

// 确保 isColliding 函数存在
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// 添加这个新函数来检测玩家与炸弹的碰撞
function isPlayerCollidingWithBomb(player, bomb) {
    // 计算玩家中心点
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;

    // 计算炸弹的四个角的坐标
    const bombCorners = [
        {x: bomb.x - bomb.width / 2, y: bomb.y - bomb.height / 2},
        {x: bomb.x + bomb.width / 2, y: bomb.y - bomb.height / 2},
        {x: bomb.x - bomb.width / 2, y: bomb.y + bomb.height / 2},
        {x: bomb.x + bomb.width / 2, y: bomb.y + bomb.height / 2}
    ];

    // 旋转炸弹的角点
    const rotatedCorners = bombCorners.map(corner => {
        const dx = corner.x - bomb.x;
        const dy = corner.y - bomb.y;
        return {
            x: bomb.x + dx * Math.cos(bomb.angle) - dy * Math.sin(bomb.angle),
            y: bomb.y + dx * Math.sin(bomb.angle) + dy * Math.cos(bomb.angle)
        };
    });

    // 检查玩家是否与旋转后的炸弹碰撞
    return rotatedCorners.some(corner => 
        corner.x >= player.x && corner.x <= player.x + player.width &&
        corner.y >= player.y && corner.y <= player.y + player.height
    );
}

// 修改键盘事件监听器
window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyP') {
        gamePaused = !gamePaused;
    }
    if (gameRunning) {
        if (e.code === 'Digit1' && player.skillReady[0]) {
            useSkill(0);
        }
        if (e.code === 'Digit2' && player.skillReady[1]) {
            useSkill(1);
        }
        if (e.code === 'Digit3' && player.skillReady[2]) {
            useSkill(2);
        }
        if (e.code === 'KeyR' && player.skillReady[3]) { // 改为 'KeyR'
            useSkill(3);
        }
        if (e.code === 'Space') {
            player.jump(true);
        }
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        player.jump(false);
    }
});
function useDefenseShieldSkill() {
    player.activateShield();
    console.log("防御盾已激活！"); // 添加这行来确认技能被触发
}

// 修改 useSkill 函数
function useSkill(skillIndex) {
    lastSkillUse[skillIndex] = performance.now();
    player.skillReady[skillIndex] = false;
    
    let skillName = '';
    if (skillIndex === 0) {
        skillName = 'Ctrl+C/V大法';
        useCtrlCVSkill();
    } else if (skillIndex === 1) {
        skillName = '代码重构';
        useCodeRefactorSkill();
    } else if (skillIndex === 2) {
        skillName = '垃圾代码散射';
        useGarbageCodeSkill();
    } else if (skillIndex === 3) {
        skillName = '防御盾';
        useDefenseShieldSkill();
    }
    
    // 显示技能名称
    showSkillName(skillName);
}

function showSkillName(skillName) {
    const skillText = {
        text: skillName,
        x: player.x + player.width / 2,
        y: player.y - 20,
        opacity: 1,
        fontSize: 20
    };

    function animateSkillName() {
        ctx.save();
        ctx.font = `bold ${skillText.fontSize}px Arial`;
        ctx.fillStyle = `rgba(255, 255, 255, ${skillText.opacity})`;
        ctx.textAlign = 'center';
        ctx.fillText(skillText.text, skillText.x, skillText.y);
        ctx.restore();

        skillText.y -= 1;
        skillText.opacity -= 0.02;
        skillText.fontSize += 0.5;

        if (skillText.opacity > 0) {
            requestAnimationFrame(animateSkillName);
        }
    }

    animateSkillName();
}

function useCtrlCVSkill() {
    // 创建水平激光
    const laser = {
        x: player.x + player.width,
        y: player.y + player.height / 2 - 5,
        width: canvas.width - player.x - player.width,
        height: 10 // 增加激光高度
    };
    
    if (currentLevel === 1) {
        // 第一关：移除被激光击中的 BUG
        obstacles = obstacles.filter(obstacle => !isColliding(laser, obstacle));
    } else if (currentLevel === 2) {
        // 第二关：检测是否击中产品经理
        if (isColliding(laser, productManager)) {
            productManager.takeDamage(50);
            if (productManager.health <= 0) {
                gameWin();
            }
        }
    }
    
    // 绘制激光动画
    drawLaser(laser);
}

function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function drawLaser(laser) {
    const duration = 500; // 激光持续时间（毫秒）
    const startTime = performance.now();

    function animateLaser(currentTime) {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
            ctx.save();

            // 清除上一帧的激光
            ctx.clearRect(laser.x, laser.y - 5, laser.width, laser.height + 10);

            // 绘制激光主体
            const gradient = ctx.createLinearGradient(laser.x, laser.y, laser.x + laser.width, laser.y);
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0.7)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
            gradient.addColorStop(1, 'rgba(255, 0, 0, 0.7)');
            ctx.fillStyle = gradient;
            ctx.fillRect(laser.x, laser.y, laser.width, laser.height);

            // 添加闪光效果
            ctx.globalAlpha = 0.5 + Math.random() * 0.5;
            ctx.fillStyle = 'white';
            ctx.fillRect(laser.x, laser.y, laser.width, laser.height);

            // 添加边缘效果
            ctx.globalAlpha = 1;
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(laser.x, laser.y);
            ctx.lineTo(laser.x + laser.width, laser.y);
            ctx.moveTo(laser.x, laser.y + laser.height);
            ctx.lineTo(laser.x + laser.width, laser.y + laser.height);
            ctx.stroke();

            ctx.restore();

            requestAnimationFrame(animateLaser);
        } else {
            // 清除最后一帧激光
            ctx.clearRect(laser.x, laser.y - 5, laser.width, laser.height + 10);
        }
    }

    requestAnimationFrame(animateLaser);
}

function useCodeRefactorSkill() {
    const duration = 1000; // 动画持续时间（毫秒）
    const maxRadius = Math.max(canvas.width, canvas.height);
    const startTime = performance.now();

    function animateCodeRefactor(currentTime) {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < duration) {
            const progress = elapsedTime / duration;
            const radius = progress * maxRadius;

            ctx.save();
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + player.height / 2, Math.max(radius, 0), 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(0, 255, 255, ${Math.max(1 - progress, 0)})`;
            ctx.lineWidth = Math.max(10 * (1 - progress), 0);
            ctx.stroke();
            ctx.restore();

            if (currentLevel === 1) {
                // 第一关：移除被圆圈触及的 BUG
                obstacles = obstacles.filter(obstacle => {
                    const dx = obstacle.x + obstacle.width / 2 - (player.x + player.width / 2);
                    const dy = obstacle.y + obstacle.height / 2 - (player.y + player.height / 2);
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    return distance > radius;
                });
            } else if (currentLevel === 2) {
                // 第二关：检测是否击中产品经理
                const dx = productManager.x + productManager.width / 2 - (player.x + player.width / 2);
                const dy = productManager.y + productManager.height / 2 - (player.y + player.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    productManager.takeDamage(75);
                    if (productManager.health <= 0) {
                        gameWin();
                    }
                }
            } else if (currentLevel === 3) {
                // 第三关：检测是否击中 Boss
                const dx = boss.x + boss.width / 2 - (player.x + player.width / 2);
                const dy = boss.y + boss.height / 2 - (player.y + player.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    boss.decreaseHealth(100);
                    if (boss.health <= 0) {
                        gameWin();
                    }
                }
            }

            requestAnimationFrame(animateCodeRefactor);
        }
    }

    requestAnimationFrame(animateCodeRefactor);
}

// 添加新的垃圾代码技能函数
function useGarbageCodeSkill() {
    const bulletCount = 12; // 增加子弹数量
    const spreadAngle = Math.PI * 2; // 全方位散射

    for (let i = 0; i < bulletCount; i++) {
        const angle = (i / (bulletCount - 1)) * spreadAngle;
        const bulletX = player.x + player.width / 2;
        const bulletY = player.y + player.height / 2;
        garbageCodeBullets.push(new GarbageCodeBullet(bulletX, bulletY, angle));
    }

    // 添加特效
    createGarbageCodeEffect();

    // 如果是第三关，直接对 Boss 造成伤害
    if (currentLevel === 3) {
        boss.decreaseHealth(50);
        if (boss.health <= 0) {
            gameWin();
        }
    }
}

// 添加垃圾代码
function createGarbageCodeEffect() {
    const effectDuration = 2000; // 增加特效持续时间
    const startTime = performance.now();

    function animateEffect(currentTime) {
        const elapsedTime = currentTime - startTime;
        if (elapsedTime < effectDuration) {
            ctx.save();
            ctx.font = '30px Courier'; // 增加字体大小
            ctx.fillStyle = '#00FF00'; // 荧光绿色
            for (let i = 0; i < 20; i++) { // 增加特效数量
                const x = player.x + Math.random() * player.width * 2 - player.width / 2;
                const y = player.y + Math.random() * player.height * 2 - player.height / 2;
                const code = new GarbageCodeBullet(0, 0, 0).getRandomCode(); // 获取随机代码片段
                ctx.fillText(code, x, y);
            }
            ctx.restore();
            requestAnimationFrame(animateEffect);
        }
    }

    requestAnimationFrame(animateEffect);
}

// 添加关卡选择按钮的事件监听器
document.getElementById('level1Button').addEventListener('click', () => {
    initLevel(1);
    document.getElementById('startScreen').style.display = 'none';
});

document.getElementById('level2Button').addEventListener('click', () => {
    initLevel(2);
    document.getElementById('startScreen').style.display = 'none';
});

document.getElementById('level3Button').addEventListener('click', () => {
    initLevel(3);
    document.getElementById('startScreen').style.display = 'none';
});

// 移除原有的开始游戏按钮事件监听器