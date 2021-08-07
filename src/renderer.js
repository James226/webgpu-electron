import './index.css';
import VertexShader from './vertex.wgsl';
import FragmentShader from './fragment.wgsl';

(async () => {
    if (!navigator.gpu) {
        alert('Your browser does not support WebGPU or it is not enabled. More info: https://webgpu.io');
        return;
    }
 
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
 
    const canvas = document.getElementById('canvas')
    const context = canvas.getContext('gpupresent');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize, false);
 
    const swapChainFormat = 'bgra8unorm';
 
    const swapChain = context.configureSwapChain({
        device,
        format: swapChainFormat
    });
  
    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: VertexShader
            }),
            entryPoint: 'main'
        },
        fragment: {
            module: device.createShaderModule({
                code: FragmentShader
            }),
            entryPoint: 'main',
            targets: [{
                format: swapChainFormat,
            }]
        },
        primitive: {
            topology: 'triangle-list',
        }
    });
 
    const commandEncoder = device.createCommandEncoder();
    const textureView = swapChain.getCurrentTexture().createView();
 
    const renderPassDescriptor = {
        colorAttachments: [{
            attachment: textureView,
            loadValue: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
        }]
    };
 
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.endPass();
 
    device.queue.submit([commandEncoder.finish()]);
})();