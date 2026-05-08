const riveCanvas = document.getElementById("rive");
let r;

r = new rive.Rive({
	src: "LCLmap.riv",
	canvas: riveCanvas,
	layout: new rive.Layout({ fit: rive.Fit.Cover }),
	stateMachines: ["State Machine 1"],
	autoplay: true,
	autobind: false,
	artboard: "LCL-MAP",
	fitCanvasToArtboardWidth: true,
	fitCanvasToArtboardHeight: true,
	onLoad: () => {
		r.resizeDrawingSurfaceToCanvas();
		window.riveInputs = r.stateMachineInputs("State Machine 1");
	},
});

window.addEventListener("resize", () => {
	r.resizeDrawingSurfaceToCanvas();
});
