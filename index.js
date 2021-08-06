(async function() {
    const adapter = await navigator.gpu.requestAdapter();

    if (!adapter) {
        const error = document.createElement('div');
        error.innerText = 'Unable to load WebGPU';
        document.body.append(error);
    };
    console.log(adapter);

    const device = adapter.requestDevice();

    console.log(device);
})();