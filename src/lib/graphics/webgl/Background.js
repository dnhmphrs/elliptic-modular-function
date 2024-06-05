// background.js
import { createShaderProgram, setupBuffer } from './UtilFunctions';
import { bgVertShaderSource, bgFragShaderSource } from './BG_Shaders';

export function setupBackground(gl, latticePoints) {
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
	const latticeUniformLocation = gl.getUniformLocation(program, 'u_lattice');

	// Convert lattice points to a flat Float32Array
	const latticeArray = new Float32Array(latticePoints.length * 2);
	for (let i = 0; i < latticePoints.length; i++) {
		latticeArray[i * 2] = latticePoints[i][0];
		latticeArray[i * 2 + 1] = latticePoints[i][1];
	}

	gl.useProgram(program);

	// Create buffer for lattice points and bind it
	const latticeBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, latticeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, latticeArray, gl.STATIC_DRAW);
	gl.uniform2fv(latticeUniformLocation, latticeArray);

	return {
		program,
		positionBuffer,
		positionAttributeLocation,
		timeUniformLocation,
		aspectRatioUniformLocation,
		heightUniformLocation,
		phaseUniformLocation,
		resolutionUniformLocation,
		latticeBuffer
	};
}

export function drawBackground(gl, bg, time, aspectRatio, height, phase) {
	gl.useProgram(bg.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, bg.positionBuffer);
	gl.vertexAttribPointer(bg.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(bg.positionAttributeLocation);

	// Uniforms
	gl.uniform1f(bg.timeUniformLocation, time);
	gl.uniform1f(bg.aspectRatioUniformLocation, aspectRatio);
	gl.uniform1f(bg.heightUniformLocation, height);
	gl.uniform1f(bg.phaseUniformLocation, phase);
	gl.uniform2f(bg.resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}

export function cleanupBackground(gl, bg) {
	gl.deleteProgram(bg.program);
	gl.deleteBuffer(bg.positionBuffer);
	gl.deleteBuffer(bg.latticeBuffer);
}
