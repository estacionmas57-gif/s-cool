const fs = require('fs');

// We have frame_0080.webp at 1280x720
// Let's verify coordinates from the image frame_0080.webp:
// Frame 80 has:
// 1) "Colegio": Left box.
//    Roughly x: 80 to 350, y: 230 to 400.
//    In %: left ~ 6.5%, top ~ 32%, width ~ 21%, height ~ 24%
// 2) "Canadá": Center box (to the right of the girl's head).
//    Roughly x: 600 to 860, y: 240 to 390.
//    In %: left ~ 47%, top ~ 33%, width ~ 20%, height ~ 22%
// 3) "Emisora Digital": Right box.
//    Roughly x: 890 to 1170, y: 220 to 400.
//    In %: left ~ 70%, top ~ 31%, width ~ 22%, height ~ 25%

console.log('Coordinates calibrated for www2.mp4:');
console.log('Colegio (Left): left ~ 6.5%, top ~ 32%, width ~ 21%, height ~ 23%');
console.log('Canadá (Center): left ~ 47.5%, top ~ 33%, width ~ 20%, height ~ 22%');
console.log('Emisora (Right): left ~ 70.5%, top ~ 31%, width ~ 22%, height ~ 24%');
