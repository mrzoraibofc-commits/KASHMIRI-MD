/**
 * data/converter.js
 * Audio/Video converter utilities using ffmpeg
 */

const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const { Readable, PassThrough } = require('stream');
const fs = require('fs');
const path = require('path');
const os = require('os');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

/**
 * Convert any audio/video buffer to PTT (WhatsApp voice note) opus/ogg format
 * @param {Buffer} buffer - Input audio/video buffer
 * @param {string} ext - File extension (mp3, mp4, ogg, wav, etc.)
 * @returns {Promise<Buffer>} - Converted OGG opus buffer
 */
async function toPTT(buffer, ext = 'mp4') {
    return new Promise((resolve, reject) => {
        const tmpInput = path.join(os.tmpdir(), `input_${Date.now()}.${ext}`);
        const tmpOutput = path.join(os.tmpdir(), `output_${Date.now()}.ogg`);

        try {
            fs.writeFileSync(tmpInput, buffer);
        } catch (e) {
            return reject(new Error('Failed to write temp input file: ' + e.message));
        }

        ffmpeg(tmpInput)
            .audioCodec('libopus')
            .audioChannels(1)
            .audioFrequency(48000)
            .format('ogg')
            .on('end', () => {
                try {
                    const result = fs.readFileSync(tmpOutput);
                    fs.unlinkSync(tmpInput);
                    fs.unlinkSync(tmpOutput);
                    resolve(result);
                } catch (e) {
                    reject(new Error('Failed to read temp output file: ' + e.message));
                }
            })
            .on('error', (err) => {
                try { fs.unlinkSync(tmpInput); } catch (_) {}
                try { fs.unlinkSync(tmpOutput); } catch (_) {}
                reject(new Error('FFmpeg conversion error: ' + err.message));
            })
            .save(tmpOutput);
    });
}

/**
 * Convert buffer to MP4 video
 * @param {Buffer} buffer - Input buffer
 * @param {string} ext - Input extension
 * @returns {Promise<Buffer>}
 */
async function toMP4(buffer, ext = 'mp4') {
    return new Promise((resolve, reject) => {
        const tmpInput = path.join(os.tmpdir(), `input_${Date.now()}.${ext}`);
        const tmpOutput = path.join(os.tmpdir(), `output_${Date.now()}.mp4`);

        try {
            fs.writeFileSync(tmpInput, buffer);
        } catch (e) {
            return reject(new Error('Failed to write temp input file: ' + e.message));
        }

        ffmpeg(tmpInput)
            .videoCodec('libx264')
            .audioCodec('aac')
            .format('mp4')
            .on('end', () => {
                try {
                    const result = fs.readFileSync(tmpOutput);
                    fs.unlinkSync(tmpInput);
                    fs.unlinkSync(tmpOutput);
                    resolve(result);
                } catch (e) {
                    reject(new Error('Failed to read output: ' + e.message));
                }
            })
            .on('error', (err) => {
                try { fs.unlinkSync(tmpInput); } catch (_) {}
                try { fs.unlinkSync(tmpOutput); } catch (_) {}
                reject(new Error('FFmpeg MP4 error: ' + err.message));
            })
            .save(tmpOutput);
    });
}

/**
 * Convert buffer to MP3
 * @param {Buffer} buffer
 * @param {string} ext
 * @returns {Promise<Buffer>}
 */
async function toMP3(buffer, ext = 'mp4') {
    return new Promise((resolve, reject) => {
        const tmpInput = path.join(os.tmpdir(), `input_${Date.now()}.${ext}`);
        const tmpOutput = path.join(os.tmpdir(), `output_${Date.now()}.mp3`);

        try {
            fs.writeFileSync(tmpInput, buffer);
        } catch (e) {
            return reject(new Error('Failed to write temp input file: ' + e.message));
        }

        ffmpeg(tmpInput)
            .audioCodec('libmp3lame')
            .audioBitrate('128k')
            .format('mp3')
            .on('end', () => {
                try {
                    const result = fs.readFileSync(tmpOutput);
                    fs.unlinkSync(tmpInput);
                    fs.unlinkSync(tmpOutput);
                    resolve(result);
                } catch (e) {
                    reject(new Error('Failed to read output: ' + e.message));
                }
            })
            .on('error', (err) => {
                try { fs.unlinkSync(tmpInput); } catch (_) {}
                try { fs.unlinkSync(tmpOutput); } catch (_) {}
                reject(new Error('FFmpeg MP3 error: ' + err.message));
            })
            .save(tmpOutput);
    });
}

module.exports = {
    toPTT,
    toMP4,
    toMP3
};
