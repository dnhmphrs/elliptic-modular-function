<script>
  import { onMount } from 'svelte';

  // import { hexToWebGLColor } from './webgl/UtilFunctions.js';
  import { setupBackground, drawBackground,  cleanupBackground } from './webgl/Background.js';
  // import { setupBox, drawBox, cleanupBox } from "./webgl/Aura";

  let canvas;
  let aspectRatio;
  let mouseX = 0;
  let mouseY = 0;

  // Load the CSV data
  // async function loadJthetaData() {
  //   const response = await fetch('/jtheta_series.csv');
  //   const data = await response.text();
  //   // console.log(data);
  //   const rows = data.split('\n').slice(1);  // Skip the header row
  //   for (const row of rows) {
  //     const [q, jtheta2, jtheta3, jtheta4] = row.split(',').map(parseFloat);
  //     jthetaData.push({ q, jtheta2, jtheta3, jtheta4 });
  //   }
  // }

  // make data
  function generateLattice(omega1, omega2, terms) {
    let lattice = [];
    for (let n = -terms; n <= terms; n++) {
        for (let m = -terms; m <= terms; m++) {
            if (n !== 0 || m !== 0) {
                let lam = [n * omega1[0] + m * omega2[0], n * omega1[1] + m * omega2[1]];
                lattice.push(lam);
            }
        }
    }
    return lattice;
  }

  // Example usage
  const omega1 = [1.0, 0.0];
  const omega2 = [Math.cos(2 * Math.PI / 3), Math.sin(2 * Math.PI / 3)];
  const terms = 6;
  const latticePoints = generateLattice(omega1, omega2, terms);


  onMount(async () => {
    // -------------------------------------------------------------------------
    // SETUP CONTEXT
    // -------------------------------------------------------------------------

    // await loadJthetaData();  // Load the data before setting up WebGL

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('Unable to initialize WebGL.');
      return;
    }

    // -------------------------------------------------------------------------
    // INITIALIZATION
    // -------------------------------------------------------------------------

    function resizeCanvasToDisplaySize(canvas, multiplier = 1) {
        // const width  = canvas.clientWidth * multiplier | 0;
        // const height = canvas.clientHeight * multiplier | 0;

        const width  = window.innerWidth * multiplier | 0;
        const height = window.innerHeight * multiplier | 0;

        if (canvas.width !== width || canvas.height !== height) {
            canvas.width = width;
            canvas.height = height;
            return true; // Indicates the canvas was resized
        }

        return false; // Indicates the canvas size was not changed
    }

    function resizeCanvas() {
        if (resizeCanvasToDisplaySize(canvas, window.devicePixelRatio)) {
            aspectRatio = canvas.width / canvas.height;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
    }

    // Mouse move event listener to update uniforms
    function handleMouseMove(event) {
      //normalize mouseX and mouseY
      console.log(event.clientX, event.clientY);
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = (event.clientY / window.innerHeight) * 2 - 1;
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas(); // Initial resize

		const bg = setupBackground(gl, latticePoints);


    // const box = setupBox(gl);

		// const white = hexToWebGLColor(0xf0f0f0);
		// const black = hexToWebGLColor(0x232323);

    // -------------------------------------------------------------------------
    // RENDER LOOP
    // -------------------------------------------------------------------------

    function render() {
			// gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT);

      // console.log(mouseX, mouseY);
			drawBackground(gl, bg, performance.now() * 0.001, aspectRatio, mouseX, mouseY);
      // drawBox(gl, box, black, performance.now(), aspectRatio);

			requestAnimationFrame(render);
    }

    requestAnimationFrame(render);

    // if (gl) {
    //     canvas.style.opacity = 1;
    // }

    canvas.style.opacity = 1;

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cleanupBackground(gl, bg);
      // cleanupBox(gl, box);
    };
  });
</script>

<canvas bind:this={canvas} class:geometry={true}></canvas>

<style>
.geometry {
  position: absolute;
  top: 0;
  left:0;
  width: 100%;
  height: 100%;
  display: block; /* Removes potential extra space below the canvas */
  padding: 0;
  margin: 0;
  border: none;
  z-index: -1;

  /* animations */
  opacity: 0; /* start invisible */
  transition: opacity 0.5s ease-in-out;
}
</style>
