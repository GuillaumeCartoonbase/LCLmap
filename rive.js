const riveCanvas = document.getElementById("rive");
let r;

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
	autoBind: true,
	artboard: "LCL-MAP",
	fitCanvasToArtboardWidth: true,
	fitCanvasToArtboardHeight: true,
	onLoad: () => {
		r.resizeDrawingSurfaceToCanvas();

		// 1. Get MapModel and bind its default instance to the artboard
		const vmMap = r.viewModelByName("MapModel");
		const mapInstance = vmMap.defaultInstance();
		r.bindViewModelInstance(mapInstance);

		// 2. Wire up each button's nested ButtonModel instance
		const buttonInstances = data.buttons
			.map(({ index, label }) => {
				const buttonInstance = mapInstance.viewModel(
					`propertyOfButtonModel${index}`,
				);

				if (!buttonInstance) {
					console.warn(
						`⚠️ Could not find propertyOfButtonModel${index} — check spelling in Rive`,
					);
					return null;
				}

				const clickedTrigger = buttonInstance.trigger("clicked");
				const isHoverBool = buttonInstance.boolean("isHover");

				// ✅ Listen for clicks coming FROM Rive → JS
				clickedTrigger.on(() => {
					console.log(`🖱️ Button ${index} (${label}) was clicked!`);
					handleButtonClick(index, label);
				});

				// Listen for hover state changes FROM Rive → JS
				isHoverBool.on((value) => {
					document.body.style.cursor = value ? "pointer" : "auto";
				});

				return { index, label, clickedTrigger, isHoverBool };
			})
			.filter(Boolean);

		// 3. Your app logic when a button is clicked
		function handleButtonClick(index, label) {
			console.log(`Active button: ${index} — ${label}`);
			// e.g. highlight UI, load content, etc.
		}

		// 4. Optionally fire a click FROM JS → Rive (e.g. for keyboard nav)
		window.fireButtonClick = (index) => {
			const btn = buttonInstances.find((b) => b.index === index);
			if (!btn) return console.warn(`No button found for index ${index}`);
			btn.clickedTrigger.fire(); // use .fire() instead of .value = true
		};

		// 5. Optionally set hover FROM JS → Rive
		window.setButtonHover = (index, value) => {
			const btn = buttonInstances.find((b) => b.index === index);
			if (btn) btn.isHoverBool.value = value;
		};
	},
});

window.addEventListener("resize", () => {
	r.resizeDrawingSurfaceToCanvas();
});
