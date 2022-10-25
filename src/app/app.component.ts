import { Component } from '@angular/core';
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Object3D } from 'three/src/Three';

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let raycaster : THREE.Raycaster;
let composer : EffectComposer;

const mouse = new THREE.Vector2();
let INTERSECTED : any;
const radius = 100;
let theta = 0;
let array : Array<Cube> = new Array<Cube>();

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.position.set( 2, 1, 500 );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xf0f0f0 );

  scene.add( new THREE.AmbientLight( 0xffffff, 0.3 ) );

  const light = new THREE.DirectionalLight( 0xffffff, 0.35 );
  light.position.set( 1, 1, 1 ).normalize();
  scene.add( light );
  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new EffectPass(camera, new BloomEffect()));

  document.body.appendChild( renderer.domElement );

  document.addEventListener( 'mousemove', onDocumentMouseMove );
  window.addEventListener( 'resize', onWindowResize );
  window.addEventListener( 'resize', onWindowResize );

  const loader = new GLTFLoader();
  loader.load('../assets/character/scene.gltf', function (gltf) {
    scene.add(gltf.scene);
  });
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function onDocumentMouseMove( event : MouseEvent ) {

  event.preventDefault();

  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}

function animate() {
  requestAnimationFrame( animate );
  render();
  composer.render();
}

type Cube = {
  obj : any,
  z : number
}

setInterval(()=>{
  const geometry = new THREE.BoxGeometry( 20, 20, 20 );
  const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

  var cube : Cube = { obj : object, z : 0};
    array.push(cube);
    scene.add( object );
}, 500);

function render() {

  theta += 1;

array.forEach(element => {

  element.z += 1;

  element.obj.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta + element.z ) );
  element.obj.position.y = radius * Math.cos( THREE.MathUtils.degToRad( theta + element.z ) );
  element.obj.position.z = element.z;
});

  //camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );

  
  camera.lookAt( scene.position );

  camera.updateMatrixWorld();

  // find intersections

  raycaster.setFromCamera( mouse, camera );

  const intersects = raycaster.intersectObjects( scene.children, false );

  if ( intersects.length > 0 ) {

    const targetDistance = intersects[ 0 ].distance;

    //camera.focusAt( targetDistance ); // using Cinematic camera focusAt method

    if ( INTERSECTED != intersects[ 0 ].object ) {

      if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

      INTERSECTED = intersects[ 0 ].object;
      INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
      INTERSECTED.material.emissive.setHex( 0xff0000 );

    }

  } else {

    if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

    INTERSECTED = null;

  }
    scene.overrideMaterial = null;

    renderer.clear();
    renderer.render( scene, camera );

}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'web-portfolio';
}
