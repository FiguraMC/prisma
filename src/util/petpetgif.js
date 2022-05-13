// Inspired by https://github.com/aDu/pet-pet-gif

const path = require('path');

const GIFEncoder = require('gif-encoder');
const Canvas = require('canvas');

const FRAMES = 5;

module.exports = (avatarURL, options = {}) => {
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {

        avatarURL = avatarURL ?? '';

        options.resolution = options.resolution ?? 128;
        options.framerate = options.framerate ?? 18;
        options.backgroundColor = options.backgroundColor ?? 'rgba(0,0,0,0)';

        const encoder = new GIFEncoder(options.resolution, options.resolution);

        const bufs = [];
        encoder.on('data', data => bufs.push(data));
        encoder.on('end', () => resolve(Buffer.concat(bufs)));
        encoder.on('error', reject);

        encoder.setRepeat(0);
        encoder.setFrameRate(options.framerate);
        encoder.setTransparent();
        encoder.writeHeader();

        const canvas = Canvas.createCanvas(options.resolution, options.resolution);
        const ctx = canvas.getContext('2d');


        Canvas.loadImage(avatarURL).then(async avatar => {
            for (let i = 0; i < FRAMES; i++) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (options.backgroundColor) {
                    ctx.fillStyle = options.backgroundColor;
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }

                // const j = i < FRAMES / 2 ? i : FRAMES - i;
                const j = i < FRAMES / 2 ? i * 2 : (FRAMES - i) * 2;

                const width = 0.8 + j * 0.02;
                const height = 0.8 - j * 0.05;
                const offsetX = (1 - width) * 0.5 + 0.1;
                const offsetY = (1 - height) - 0.08;

                ctx.drawImage(avatar, options.resolution * offsetX, options.resolution * offsetY, options.resolution * width, options.resolution * height);
                ctx.drawImage(await Canvas.loadImage(path.resolve(__dirname, `img/pet${i}.gif`)), 0, 0, options.resolution, options.resolution);

                encoder.addFrame(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
            }
            encoder.finish();

        }).catch(() => reject(new Error('Please provide a user or image.')));
    });
};
