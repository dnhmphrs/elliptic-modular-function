import { createShaderProgram, setupBuffer } from './UtilFunctions';
import { bgVertShaderSource, bgFragShaderSource } from './BG_Shaders';

export function setupBackground(gl, jthetaData) {
	const program = createShaderProgram(gl, bgVertShaderSource, bgFragShaderSource);
	if (!program) {
		return null; // Early exit if the program failed to link
	}

	const positionBuffer = setupBuffer(gl, [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
	const positionAttributeLocation = gl.getAttribLocation(program, 'position');
	const timeUniformLocation = gl.getUniformLocation(program, 'time');
	const aspectRatioUniformLocation = gl.getUniformLocation(program, 'aspectRatio');
	const heightUniformLocation = gl.getUniformLocation(program, 'u_height');
	const phaseUniformLocation = gl.getUniformLocation(program, 'u_phase');
	const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
	const jthetaUniformLocation = gl.getUniformLocation(program, 'u_jthetaTexture');

	// Convert jtheta data to a flat Float32Array
	const jthetaArray = new Float32Array(jthetaData.length * 4);
	for (let i = 0; i < jthetaData.length; i++) {
		jthetaArray[i * 4] = jthetaData[i].q;
		jthetaArray[i * 4 + 1] = jthetaData[i].jtheta2;
		jthetaArray[i * 4 + 2] = jthetaData[i].jtheta3;
		jthetaArray[i * 4 + 3] = jthetaData[i].jtheta4;
	}

	// Create a texture to hold the jtheta data
	const jthetaTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, jthetaTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, jthetaData.length, 1, 0, gl.RGBA, gl.FLOAT, jthetaArray);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	gl.useProgram(program);
	gl.uniform1i(jthetaUniformLocation, 0); // Texture unit 0

	return {
		program,
		positionBuffer,
		positionAttributeLocation,
		timeUniformLocation,
		aspectRatioUniformLocation,
		heightUniformLocation,
		phaseUniformLocation,
		resolutionUniformLocation,
		jthetaTexture
	};
}

export function drawBackground(gl, bg, time, aspectRatio, height, phase) {
	gl.useProgram(bg.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, bg.positionBuffer);
	gl.vertexAttribPointer(bg.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(bg.positionAttributeLocation);
	// uniforms
	gl.uniform1f(bg.timeUniformLocation, time);
	gl.uniform1f(bg.aspectRatioUniformLocation, aspectRatio);
	gl.uniform1f(bg.heightUniformLocation, height);
	gl.uniform1f(bg.phaseUniformLocation, phase);
	gl.uniform2f(bg.resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

	// Bind the jtheta texture
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, bg.jthetaTexture);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function cleanupBackground(gl, bg) {
	gl.deleteProgram(bg.program);
	gl.deleteBuffer(bg.positionBuffer);
	gl.deleteTexture(bg.jthetaTexture);
}
