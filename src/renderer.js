/**
 * This file will automatically be loaded by webpack and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.js` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';

console.log('👋 This message is being logged by "renderer.js", included via webpack');

(async () => {
    if (!navigator.gpu) {
        alert('Your browser does not support WebGPU or it is not enabled. More info: https://webgpu.io');
        return;
    }
 
    const adapter = await navigator.gpu.requestAdapter();
    const device = await adapter.requestDevice();
 
    const canvas = document.getElementById('canvas')
    const context = canvas.getContext('gpupresent');
 
    const swapChainFormat = 'bgra8unorm';
 
    const swapChain = context.configureSwapChain({
        device,
        format: swapChainFormat
    });
 
    const vertexShaderWgslCode =
        `
        [[stage(vertex)]]
        fn main([[builtin(vertex_index)]] VertexIndex : u32)
             -> [[builtin(position)]] vec4<f32> {
          var pos = array<vec2<f32>, 3>(
              vec2<f32>(0.0, 0.5),
              vec2<f32>(-0.5, -0.5),
              vec2<f32>(0.5, -0.5));
        
          return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
        }
    `;
 
    const fragmentShaderWgslCode =
        `
        [[stage(fragment)]]
        fn main() -> [[location(0)]] vec4<f32> {
          return vec4<f32>(1.0, 0.0, 0.0, 1.0);
        }
    `;
 
    const pipeline = device.createRenderPipeline({
        vertex: {
            module: device.createShaderModule({
                code: vertexShaderWgslCode
            }),
            entryPoint: 'main'
        },
        fragment: {
            module: device.createShaderModule({
                code: fragmentShaderWgslCode
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
            loadValue: { r: 0.5, g: 0.5, b: 0.5, a: 1.0 },
        }]
    };
 
    const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor);
    passEncoder.setPipeline(pipeline);
    passEncoder.draw(3, 1, 0, 0);
    passEncoder.endPass();
 
    device.queue.submit([commandEncoder.finish()]);
})();