export function hexToWebGLColor(hex) {
	const r = ((hex >> 16) & 0xff) / 255;
	const g = ((hex >> 8) & 0xff) / 255;
	const b = (hex & 0xff) / 255;
	return [r, g, b];
}

// export function createShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
// 	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
// 	gl.shaderSource(vertexShader, vertexShaderSource);
// 	gl.compileShader(vertexShader);

// 	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
// 	gl.shaderSource(fragmentShader, fragmentShaderSource);
// 	gl.compileShader(fragmentShader);

// 	const program = gl.createProgram();
// 	gl.attachShader(program, vertexShader);
// 	gl.attachShader(program, fragmentShader);
// 	gl.linkProgram(program);

// 	return program;
// }

export function createShader(gl, type, source) {
	const shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

export function createShaderProgram(gl, vertShaderSource, fragShaderSource) {
	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertShaderSource);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragShaderSource);

	const program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
		return null;
	}
	return program;
}

export function setupBuffer(gl, data) {
	const buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	return buffer;
}
