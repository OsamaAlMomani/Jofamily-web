const defaultConstraints: MediaStreamConstraints = {
    audio: true,
    video: true,
};

async function GetUserMedia(constraints: MediaStreamConstraints = defaultConstraints) {
    try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('I was here GetUserMedia');
        return stream;
    } catch (err) {
        console.error('Error accessing media devices.', err);
        throw err;
    }
}

export { GetUserMedia };

