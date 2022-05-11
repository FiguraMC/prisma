const path = require('path');
const Canvas = require('canvas');

module.exports = async (avatarURL) => {
    avatarURL = avatarURL ?? '';
    const avatar = await Canvas.loadImage(avatarURL);
    const hexagon = await Canvas.loadImage(path.resolve(__dirname, 'img/hexagon.png'));

    const canvas = Canvas.createCanvas(512, 512);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(avatar, 0, 0);

    // Erase pixels that are not part of the hexagon
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(hexagon, 0, 0);
    // ctx.globalCompositeOperation = 'source-over';

    return Buffer.from(canvas.toBuffer());
};
