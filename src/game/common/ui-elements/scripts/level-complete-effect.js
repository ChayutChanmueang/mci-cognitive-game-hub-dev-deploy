import { Howl } from 'howler';

const correctSound = new Howl({
    src: ['assets/audio/common/sfx/Correct.mp3'],
    preload: true,
});

export function showLevelCompleteEffect() {
    correctSound.play();
    const container = document.createElement('div');
    Object.assign(container.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: '9999',
        overflow: 'hidden'
    });

    // Premium Text Design
    const text = document.createElement('h1');
    text.innerText = 'เก่งมาก!';
    Object.assign(text.style, {
        fontFamily: '"Kanit", "Inter", sans-serif',
        fontSize: '6rem',
        fontWeight: '900',
        color: '#ffffff',
        textShadow: '0px 10px 20px rgba(0,0,0,0.5), 0 0 30px #FFD700, 0 0 60px #FF8C00',
        transform: 'scale(0) translateY(50px)',
        transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        margin: '0',
        padding: '0',
        textAlign: 'center',
        letterSpacing: '2px'
    });
    
    container.appendChild(text);

    // Confetti particles
    const colors = ['#FFC700', '#FF0055', '#00F0FF', '#00FF66', '#9D00FF'];
    const confettiElements = [];
    
    for (let i = 0; i < 80; i++) {
        const confetti = document.createElement('div');
        Object.assign(confetti.style, {
            position: 'absolute',
            width: `${Math.random() * 10 + 8}px`,
            height: `${Math.random() * 20 + 10}px`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            top: '50%',
            left: '50%',
            borderRadius: Math.random() > 0.5 ? '50%' : '4px',
            opacity: '0',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        });
        
        // Physics variables
        const angle = Math.random() * Math.PI * 2;
        // Explode outward
        const velocity = 15 + Math.random() * 25; 
        
        confetti.dataset.dx = Math.cos(angle) * velocity;
        confetti.dataset.dy = Math.sin(angle) * velocity - 10; // Bias upward
        confetti.dataset.x = 0;
        confetti.dataset.y = 0;
        confetti.dataset.rotation = Math.random() * 360;
        confetti.dataset.rotationSpeed = (Math.random() - 0.5) * 20;

        container.appendChild(confetti);
        confettiElements.push(confetti);
    }

    const gameContainer = document.getElementById('game-container') || document.body;
    gameContainer.appendChild(container);

    // Trigger animations
    requestAnimationFrame(() => {
        text.style.transform = 'scale(1) translateY(0px)';
    });

    let animationFrameId;
    let start = performance.now();

    function animateConfetti(time) {
        const elapsed = time - start;
        const duration = 1500;
        
        if (elapsed > duration) {
            container.remove();
            return;
        }

        const progress = elapsed / duration;

        confettiElements.forEach(c => {
            let x = parseFloat(c.dataset.x);
            let y = parseFloat(c.dataset.y);
            let dy = parseFloat(c.dataset.dy);
            
            x += parseFloat(c.dataset.dx) * Math.max(0, (1 - progress * 2)); // slow down horizontal
            y += dy;
            
            // Gravity effect
            c.dataset.dy = dy + 0.8; 

            c.dataset.x = x;
            c.dataset.y = y;
            
            let rotation = parseFloat(c.dataset.rotation) + parseFloat(c.dataset.rotationSpeed);
            c.dataset.rotation = rotation;

            // Fade out towards the end
            let opacity = 1;
            if (progress < 0.1) opacity = progress * 10;
            if (progress > 0.7) opacity = 1 - ((progress - 0.7) / 0.3);

            c.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${rotation}deg)`;
            c.style.opacity = opacity;
        });

        // Add slight floating effect to text
        const textY = Math.sin(elapsed / 150) * 5;
        if (progress > 0.1 && progress < 0.8) {
            text.style.transform = `scale(1) translateY(${textY}px)`;
        } else if (progress >= 0.8) {
            text.style.opacity = 1 - ((progress - 0.8) / 0.2);
            text.style.transform = `scale(${1 + (progress - 0.8)}) translateY(${textY}px)`;
        }

        animationFrameId = requestAnimationFrame(animateConfetti);
    }

    animationFrameId = requestAnimationFrame(animateConfetti);
}
