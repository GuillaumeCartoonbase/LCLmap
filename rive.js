const riveCanvas = document.getElementById("rive");

// Declared outside the Rive constructor so the resize handler can reference it
let r;

// Single source of truth for button metadata — index must match Rive ViewModel property names
const data = {
	buttons: [
		{ index: 1, label: "Button 1" },
		{ index: 2, label: "Button 2" },
		{ index: 3, label: "Button 3" },
		{ index: 4, label: "Button 4" },
		{ index: 5, label: "Button 5" },
	],
};

r = new rive.Rive({
	src: "LCLmap.riv",
	canvas: riveCanvas,
	layout: new rive.Layout({ fit: rive.Fit.Cover }),
	stateMachines: ["State Machine 1"],
	autoplay: true,
	// autoBind wires the artboard's default ViewModel automatically on load
	autoBind: true,
	artboard: "LCL-MAP",
	// Both flags needed together so the canvas tracks artboard dimensions
	fitCanvasToArtboardWidth: true,
	fitCanvasToArtboardHeight: true,
	onLoad: () => {
		// Corrects pixel-ratio scaling after the canvas size is known
		r.resizeDrawingSurfaceToCanvas();

		// 1. Get MapModel and bind its default instance to the artboard
		const vmMap = r.viewModelByName("MapModel");
		const mapInstance = vmMap.defaultInstance();
		r.bindViewModelInstance(mapInstance);

		// 2. Wire up each button's nested ButtonModel instance
		const buttonInstances = data.buttons
			.map(({ index, label }) => {
				// Property name must exactly match the nested ViewModel name in Rive
				const buttonInstance = mapInstance.viewModel(
					`propertyOfButtonModel${index}`,
				);

				if (!buttonInstance) {
					console.warn(
						`⚠️ Could not find propertyOfButtonModel${index} — check spelling in Rive`,
					);
					// Return null so filter(Boolean) below can drop missing buttons gracefully
					return null;
				}

				const clickedTrigger = buttonInstance.trigger("clicked");
				const isHoverBool = buttonInstance.boolean("isHover");

				// Listen for clicks coming FROM Rive → JS
				clickedTrigger.on(() => {
					console.log(`🖱️ Button ${index} (${label}) was clicked!`);
					handleButtonClick(index, label);
				});

				// Sync cursor with Rive's hover state so the browser reflects it accurately
				isHoverBool.on((value) => {
					document.body.style.cursor = value ? "pointer" : "auto";
				});

				return { index, label, clickedTrigger, isHoverBool };
			})
			// Drops any buttons that failed to resolve above
			.filter(Boolean);

		// 3. Central handler for button clicks — add routing/UI logic here
		function handleButtonClick(index, label) {
			console.log(`Active button: ${index} — ${label}`);
			// e.g. highlight UI, load content, etc.
		}

		// 4. Exposed so external code (keyboard nav, deep links) can trigger a button click
		// Use .fire() on a trigger — never set .value = true on triggers
		window.fireButtonClick = (index) => {
			const btn = buttonInstances.find((b) => b.index === index);
			if (!btn) return console.warn(`No button found for index ${index}`);
			btn.clickedTrigger.fire();
		};

		// 5. Exposed so external code can push a hover state into Rive (e.g. touch devices)
		window.setButtonHover = (index, value) => {
			const btn = buttonInstances.find((b) => b.index === index);
			if (btn) btn.isHoverBool.value = value;
		};
	},
});

// Re-correct pixel-ratio scaling whenever the viewport changes
window.addEventListener("resize", () => {
	r.resizeDrawingSurfaceToCanvas();
});
