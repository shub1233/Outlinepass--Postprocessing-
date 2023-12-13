import {
  Vector3,
  Matrix,
  Color4,
  Color3,
  Engine,
  Scene,
  SceneLoader,
  ArcRotateCamera,
  HemisphericLight,
  StandardMaterial,
  CreateSphere,
  RenderTargetTexture,
  PostProcess,
  Texture,
} from "@babylonjs/core";
import { NormalMaterial } from "@babylonjs/materials";
import {
  AdvancedDynamicTexture,
  StackPanel,
  Control,
  ColorPicker,
  Slider,
} from "@babylonjs/gui";
import "@babylonjs/loaders";

function loadModal(
  root,
  filename,
  currentScene,
  pos = [0, 0, 0],
  scaling = 1.0
) {
  SceneLoader.ShowLoadingScreen = false;
  SceneLoader.ImportMesh("", root, filename, currentScene, (meshes) => {
    const meshMaterial = new NormalMaterial("normalMat", currentScene);
    meshes.forEach((obj) => {
      if (obj._isMesh) {
        obj.position = new Vector3(pos[0], pos[1], pos[2]);
        obj.scaling = new Vector3(scaling, scaling, scaling);
        obj.material = meshMaterial;
      }
    });
  });
}

function createRandomGeometries(currentScene) {
  for (let i = 0; i < 20; i++) {
    const sphere = CreateSphere("sphere" + i, {}, currentScene);
    const mat = new StandardMaterial("sim" + i, currentScene);
    mat.diffuseColor = new Color3(Math.random(), Math.random(), Math.random());
    sphere.material = mat;

    sphere.position.x = Math.random() * 4 - 2;
    sphere.position.y = Math.random() * 4 - 2;
    sphere.position.z = Math.random() * 4 - 2;

    sphere.scaling = new Vector3(1.5, 1.5, 1.5);
  }
}

function createOutlinePass(cam, engine) {
  return new PostProcess(
    "depth_display",
    "./Shaders/Outline/outlinepass",
    {
      width: 1.0,
      height: 1.0,
      uniforms: ["u_borderThickness", "u_borderColor"],
      samplers: ["depthTexture"],
      camera: cam,
      samplingMode: Texture.BILINEAR_SAMPLINGMODE,
      engine: engine,
      reusable: true
    }
  );
}

function computeWhichMeshToOutline(hit, renderTarget) {
  if (hit.hit) {
    if (
      renderTarget.renderList.length &&
      renderTarget.renderList[0]?.id === hit.pickedMesh.id
    )
      return;

    clearRenderList(renderTarget);
    renderTarget.renderList.push(hit.pickedMesh);
    // renderTarget.renderList.push(hit.pickedMesh);
  } else if (renderTarget.renderList.length) {
    clearRenderList(renderTarget);
  }
}

function clearRenderList(renderTarget) {
  while (renderTarget.renderList.length > 0) {
    renderTarget.renderList.pop();
  }
}


// Entry Point Main
(function () {
  // Setup
  const canvas = document.querySelector("canvas.babylon-canvas");
  const engine = new Engine(canvas);
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0, 0, 0, 1);

  // Uniform Values
  let borderColor = new Color3(1, 0, 0);
  let borderThickness = 1.0;

  // Camera
  const camera = new ArcRotateCamera(
    "camera",
    0,
    0,
    10,
    new Vector3(0, 0, 0),
    scene
  );
  camera.setPosition(new Vector3(0, 1, 15));
  camera.attachControl(canvas, true);

  // Light
  const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

  // Load Models
  loadModal("models/", "FinalBaseMesh.obj", scene, [0, -5.0, 0], 0.5);
  loadModal("models/", "tree.obj", scene, [0, 0, 0], 8.0);

  // Geometry
  createRandomGeometries(scene);

  // Create a renderTarget texture, where only the mesh to ouline is drawn
  const renderTarget = new RenderTargetTexture(
    "outline texture",
    2048 /* purposly set to high for more detail */,
    scene,
    { generateDepthBuffer: true, generateStencilBuffer: true }
  );
  scene.customRenderTargets.push(renderTarget);

  // Create depth texture of "mesh to outline" for edge detection
  renderTarget.createDepthStencilTexture();

  // Calculate edge and combine original scene and edge drawn scene
  const post_process1 = createOutlinePass(camera, engine);
  post_process1.onApply = function (effect) {
    effect._bindTexture("depthTexture", renderTarget.depthStencilTexture);
    effect.setFloat("u_borderThickness", borderThickness);
    effect.setColor3("u_borderColor", borderColor);
  };

  // Picking, compute on which mesh user is hovering
  // and add the detected mesh to renderTarget to draw outline
  // Also remove the previous pushed mesh
  scene.onPointerMove = () => {
    const ray = scene.createPickingRay(
      scene.pointerX,
      scene.pointerY,
      Matrix.Identity(),
      camera,
      false
    );

    const hit = scene.pickWithRay(ray);

    computeWhichMeshToOutline(hit, renderTarget);
  };

  // Debug UI
  var advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI(
    "UI",
    true,
    scene
  );

  const panel = new StackPanel();
  panel.width = "200px";
  panel.isVertical = true;
  panel.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
  panel.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
  advancedTexture.addControl(panel);

  const outlineColorPicker = new ColorPicker();
  outlineColorPicker.value = borderColor;
  outlineColorPicker.onValueChangedObservable.add((value) => {
    borderColor = value;
  });
  panel.addControl(outlineColorPicker);

  const outlineThicknessSlider = new Slider();
  outlineThicknessSlider.minimum = 1.0;
  outlineThicknessSlider.maximum = 3.0;
  outlineThicknessSlider.value = borderThickness;
  outlineThicknessSlider.height = "20px";
  outlineThicknessSlider.width = "150px";
  outlineThicknessSlider.color = "#003399";
  outlineThicknessSlider.background = "grey";
  outlineThicknessSlider.onValueChangedObservable.add(function (value) {
    borderThickness = value;
  });
  panel.addControl(outlineThicknessSlider);

  // Handle Canvas Resize
  window.addEventListener("resize", () => {
    engine.resize();
  });

  // Game Loop
  engine.runRenderLoop(() => {
    scene.render();
  });
})();
