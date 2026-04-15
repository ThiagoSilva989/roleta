let names=[], used=new Set();
let spinning=false;

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTick(){
const osc=audioCtx.createOscillator();
const gain=audioCtx.createGain();
osc.type="square";
osc.frequency.value=1200;
gain.gain.setValueAtTime(0.1,audioCtx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.04);
osc.connect(gain);
gain.connect(audioCtx.destination);
osc.start();
osc.stop(audioCtx.currentTime+0.04);
}

function playClack(){
const osc=audioCtx.createOscillator();
const gain=audioCtx.createGain();
osc.type="triangle";
osc.frequency.value=200;
gain.gain.setValueAtTime(0.4,audioCtx.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+0.2);
osc.connect(gain);
gain.connect(audioCtx.destination);
osc.start();
osc.stop(audioCtx.currentTime+0.2);
}

function launchConfetti(){
for(let i=0;i<80;i++){
const c=document.createElement("div");
c.className="confetti";
c.style.left=Math.random()*100+"vw";
c.style.background=`hsl(${Math.random()*360},100%,50%)`;
c.style.animationDuration=(Math.random()*2+2)+"s";
document.body.appendChild(c);
setTimeout(()=>c.remove(),4000);
}
}

function render(){
const el=document.getElementById('roulette');
names=document.getElementById('names').value.split('\n').map(n=>n.trim()).filter(Boolean);
el.innerHTML='';
const colors=["#ff6b6b","#4ecdc4","#feca57","#54a0ff","#5f27cd","#00d2d3"];
const angle=360/names.length;

names.forEach((name,i)=>{
const slice=document.createElement('div');
slice.className='slice';

if(used.has(name)){
slice.style.opacity=.35;
slice.style.filter='grayscale(1)';
}

slice.style.background=`conic-gradient(${colors[i%colors.length]} 0deg ${angle}deg, transparent ${angle}deg)`;
slice.style.transform=`rotate(${i*angle}deg)`;
slice.style.setProperty('--angle', angle+'deg');

const span=document.createElement('span');
span.textContent=name;

slice.appendChild(span);
el.appendChild(slice);
});
}

function spin(){
if(spinning||names.length===0) return;

audioCtx.resume();

let available=names;
if(document.getElementById('noRepeat').checked){
available=names.filter(n=>!used.has(n));
if(!available.length){alert('Todos já foram!');return;}
}

const targetName=available[Math.floor(Math.random()*available.length)];
const index=names.indexOf(targetName);
const angle=360/names.length;
const targetRotation=360-(index*angle+angle/2);
const spins=6;
const totalRotation=spins*360+targetRotation;

animateSpin(totalRotation,targetName);
}

function animateSpin(targetRotation,targetName){
const el=document.getElementById('roulette');
const duration=5000;
const startTime=performance.now();
let lastTick=-1;

function easeOut(t){
return 1-Math.pow(1-t,4);
}

function frame(now){
const t=Math.min((now-startTime)/duration,1);
const eased=easeOut(t);
const rotation=targetRotation*eased;
el.style.transform=`rotate(${rotation}deg)`;

const angle=360/names.length;
const currentTick=Math.floor((rotation%360)/angle);

if(currentTick!==lastTick&&t<0.98){
playTick();
lastTick=currentTick;
}

if(t<1){
requestAnimationFrame(frame);
}else{
el.style.transition="transform 0.3s ease-out";
el.style.transform+=" rotate(6deg)";
setTimeout(()=>{
el.style.transform=`rotate(${targetRotation}deg)`;
finishSpin(targetName);
},150);
}
}

spinning=true;
requestAnimationFrame(frame);
}

function finishSpin(winner){
document.getElementById('result').innerText='🎉 '+winner;

const slices=document.querySelectorAll('.slice');
slices.forEach(s=>s.classList.remove('winner'));

const winnerIndex=names.indexOf(winner);
if(slices[winnerIndex]){
slices[winnerIndex].classList.add('winner');
}

if(document.getElementById('noRepeat').checked){
used.add(winner);
render();
}

addHistory(winner);

playClack();
launchConfetti();

spinning=false;

if(navigator.vibrate) navigator.vibrate([200,100,200]);
}

function addHistory(name){
const d=document.createElement('div');
d.textContent=name;
document.getElementById('history').appendChild(d);
}

function resetAll(){
used.clear();
document.getElementById('history').innerHTML='<b>Histórico:</b>';
document.getElementById('result').innerText='';
render();
}

document.getElementById('names').addEventListener('input',render);
render();