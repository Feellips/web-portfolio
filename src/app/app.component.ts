import { Component } from '@angular/core';
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js';
import { Mesh, Object3D, Vector3 } from 'three/src/Three';
import { BokehShaderUniforms } from 'three/examples/jsm/shaders/BokehShader2';

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: THREE.OrthographicCamera;
let raycaster : THREE.Raycaster;
let composer : EffectComposer;

const mouse = new THREE.Vector2();
let INTERSECTED : any;
const radius = 100;
let theta = 0;
let array : Array<Cube> = new Array<Cube>();
const frustumSize = 5;

init();
animate();

function init() {
  const aspect = window.innerWidth / window.innerHeight;
	camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000 );
  camera.position.set( - 200, 200, 200 );

  scene = new THREE.Scene();
  camera.lookAt( scene.position );

  scene.background = new THREE.Color( 0xf0f0f0 );

  scene.add( new THREE.AmbientLight( 0xffffff, 0.3 ) );
  var lampLight = new THREE.PointLight( 0xeedd82 , 1, 100 );
  var notebookLight = new THREE.PointLight( 0xfffffff , 10, 0.1 );

  notebookLight.position.set( 0.8, -0.1, 0.3 );
  lampLight.position.set( -1.30, 0.25, -0.85 );
  
  const geometry = new THREE.SphereGeometry( 0.09, 32, 16 );
  const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );

  lampLight.add(new Mesh(geometry, material));
  //notebookLight.add(new Mesh(geometry, material));

  let lightProbe = new THREE.LightProbe();

  scene.add( lampLight );
  scene.add( lightProbe );
  scene.add( notebookLight );

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


  // const matChanger = function ( ) {

  //   for ( const e in effectController ) {

  //     if ( e in camera.postprocessing.bokeh_uniforms ) {

  //       camera.postprocessing.bokeh_uniforms[ e as keyof typeof camera.postprocessing.bokeh_uniforms ].value = effectController[ e ];

  //     }

  //   }

  //   camera.postprocessing.bokeh_uniforms[ 'znear' ].value = camera.near;
  //   camera.postprocessing.bokeh_uniforms[ 'zfar' ].value = camera.far;
  //   camera.setLens( effectController.focalLength, camera.getFilmHeight(), effectController.fstop, camera.coc );
  //   effectController[ 'focalDepth' ] = camera.postprocessing.bokeh_uniforms[ 'focalDepth' ].value;

  // };

  // matChanger();

  const loader = new GLTFLoader();
  loader.load('../assets/character/room.gltf', function (gltf) {
    scene.add(gltf.scene);
  });
}

function onWindowResize() {

  //camera.aspect = window.innerWidth / window.innerHeight;

	const aspect = window.innerWidth / window.innerHeight;

				camera.left = - frustumSize * aspect / 2;
				camera.right = frustumSize * aspect / 2;
				camera.top = frustumSize / 2;
				camera.bottom = - frustumSize / 2;

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
 // composer.render();
}

type Cube = {
  obj : any,
  z : number
}

// setInterval(()=>{
//   const geometry = new THREE.BoxGeometry( 20, 20, 20 );
//   const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

//   var cube : Cube = { obj : object, z : -1000};
//     array.push(cube);
//     scene.add( object );
// }, 300);

function render() {

  theta += 1;

array.forEach(element => {

  element.z += 1;

  element.obj.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta + element.z ) );
  element.obj.position.y = radius * Math.cos( THREE.MathUtils.degToRad( theta + element.z ) );
  element.obj.position.z = element.z;
});

//camera.position.z -= theta * 0.001;
  camera.updateMatrixWorld();

  // find intersections

  raycaster.setFromCamera( mouse, camera );

  const intersects = raycaster.intersectObjects( scene.children, true );

  // if ( intersects.length > 0 ) {

  //   const targetDistance = intersects[ 0 ].distance;

  //   //camera.focusAt( targetDistance ); // using Cinematic camera focusAt method

  //   if ( INTERSECTED != intersects[ 0 ].object ) {

  //     if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

  //     INTERSECTED = intersects[ 0 ].object;
  //     INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
  //     INTERSECTED.material.emissive.setHex( 0xff0000 );

  //   }

  // } else {

  //   if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

  //   INTERSECTED = null;

  // }
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
