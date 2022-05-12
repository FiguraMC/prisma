const path = require('path');
const Canvas = require('canvas');

module.exports = async (avatarURL) => {
    avatarURL = avatarURL ?? '';
    const avatar = await Canvas.loadImage(avatarURL);
    const hexagon = await Canvas.loadImage(path.resolve(__dirname, 'img/hexagon.png'));

    const canvas = Canvas.createCanvas(avatar.width, avatar.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(avatar, 0, 0);

    // Erase pixels that are not part of the hexagon
    ctx.globalCompositeOperation = 'destination-out';
    ctx.drawImage(hexagon, 0, 0, avatar.width, avatar.height);
    // ctx.globalCompositeOperation = 'source-over';

    return Buffer.from(canvas.toBuffer());
};
