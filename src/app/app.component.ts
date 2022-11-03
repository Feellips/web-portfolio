import { Component } from '@angular/core';
import * as THREE from 'three';
import { SAOPass } from "three/examples/jsm/postprocessing/SAOPass";
import { SSAARenderPass } from "three/examples/jsm/postprocessing/SSAARenderPass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";
import { FXAAShader  } from "three/examples/jsm/shaders/FXAAShader";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js';
import { Box2, Mesh, MeshBasicMaterial, Object3D, SphereGeometry, Vector3 } from 'three/src/Three';
import { BokehShaderUniforms } from 'three/examples/jsm/shaders/BokehShader2';

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let raycaster: THREE.Raycaster;
let composer: EffectComposer;
let outlinePass : OutlinePass;

const mouse = new THREE.Vector2();
let selectedObjects: Array<Object3D<THREE.Event>> = new Array<Object3D<THREE.Event>>();
const frustumSize = 5;

init();
animate();

function init() {
  const aspect = window.innerWidth / window.innerHeight;
  //camera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000);
  camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-5, 5, 5);

  scene = new THREE.Scene();
  camera.lookAt(scene.position);

  scene.background = new THREE.Color(0x000000);

  const light = new THREE.PointLight(0x00FFF5, 1, 1, 2);
  const lightHelper = new THREE.PointLightHelper(light);
  light.position.set(0.6, 0.08, 0.2);
 // scene.add(light, lightHelper);

  // light
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  const sun = new THREE.DirectionalLight(0xffffff, 1);

  sun.color.setHSL( 0.1, 1, 0.95 );
  sun.position.multiplyScalar( 30 );


  sun.position.set(0.27, 4.63, -1.4);
  scene.add(sun);

  sun.target.position.set(-1.41, 0, -3.68);
  sun.target.updateMatrixWorld();
  sun.castShadow = true;
  sun.shadow.mapSize.width = 2048;
  sun.shadow.mapSize.height = 2048;

  const d = 50;

  sun.shadow.camera.left = - d;
  sun.shadow.camera.right = d;
  sun.shadow.camera.top = d;
  sun.shadow.camera.bottom = - d;

  sun.shadow.camera.far = 3500;
  sun.shadow.bias = - 0.0001;

  const dirLightHelper = new THREE.DirectionalLightHelper( sun, 10 );
  scene.add( dirLightHelper );

  raycaster = new THREE.Raycaster();

  let w = window.innerWidth || 1
  let h = window.innerHeight || 1
  let ratio = window.devicePixelRatio || 1

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setClearColor( 0x000000 );
  renderer.setPixelRatio( ratio );
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.setSize( w, h );
  document.body.appendChild( renderer.domElement );

  composer = new EffectComposer(renderer);
  composer.setSize( w, h );

  document.body.appendChild(renderer.domElement);

  document.addEventListener('mousemove', onDocumentMouseMove);
  window.addEventListener('resize', onWindowResize);

  const loader = new GLTFLoader();
 

  loader.load('../assets/character/room.gltf', function(boxScene) {
    boxScene.scene.children.forEach(element =>{
      element.castShadow = true;
      element.receiveShadow = true;
  
      scene.add(element);
    });
  });


  let renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
  composer.addPass(outlinePass);


  composer.render();
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event: MouseEvent) {

  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  checkIntersection();
}

function checkIntersection() {

  raycaster.setFromCamera( mouse, camera );

  const intersects = raycaster.intersectObject( scene, true );

  if ( intersects.length > 0 ) {

    const selectedObject = intersects[ 0 ].object;
    addSelectedObject( selectedObject );
    outlinePass.selectedObjects = selectedObjects;

  } else {

    // outlinePass.selectedObjects = [];

  }

}

function addSelectedObject( object : Object3D ) {

  selectedObjects = [];
  selectedObjects.push( object );

}

function animate() {
  requestAnimationFrame(animate);
  render();
}

type Cube = {
  obj: any,
  z: number
}

function render() {

  camera.updateMatrixWorld();
  raycaster.setFromCamera(mouse, camera);
  composer.render();
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'web-portfolio';
}
