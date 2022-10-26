import { Component } from '@angular/core';
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CinematicCamera } from 'three/examples/jsm/cameras/CinematicCamera.js';
import { Object3D } from 'three/src/Three';
import { BokehShaderUniforms } from 'three/examples/jsm/shaders/BokehShader2';

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: CinematicCamera;
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
  camera = new CinematicCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.setLens( 5 );
  camera.position.set( 20, 15, 40 );

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

  const effectController : BokehShaderUniforms | any = {

    focalLength: 15,
    jsDepthCalculation: true,
    shaderFocus: false,
    //
    fstop: 2.8,
    // maxblur: 1.0,
    //
    showFocus: false,
    focalDepth: 3,
     manualdof: false,
     vignetting: true,
     depthblur: true,
    //
     threshold: 0.5,
     gain: 2.0,
     bias: 0.5,
     fringe: 0.7,
    //

     noise: true,
     pentagon: true,
    //
     dithering: 0.001

  };

  const matChanger = function ( ) {

    for ( const e in effectController ) {

      if ( e in camera.postprocessing.bokeh_uniforms ) {

        camera.postprocessing.bokeh_uniforms[ e as keyof typeof camera.postprocessing.bokeh_uniforms ].value = effectController[ e ];

      }

    }

    camera.postprocessing.bokeh_uniforms[ 'znear' ].value = camera.near;
    camera.postprocessing.bokeh_uniforms[ 'zfar' ].value = camera.far;
    camera.setLens( effectController.focalLength, camera.getFilmHeight(), effectController.fstop, camera.coc );
    effectController[ 'focalDepth' ] = camera.postprocessing.bokeh_uniforms[ 'focalDepth' ].value;

  };

  matChanger();

  const loader = new GLTFLoader();
  loader.load('../assets/character/place.gltf', function (gltf) {
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

  var cube : Cube = { obj : object, z : -1000};
    array.push(cube);
    scene.add( object );
}, 300);

function render() {

  theta += 1;

array.forEach(element => {

  element.z += 1;

  element.obj.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta + element.z ) );
  element.obj.position.y = radius * Math.cos( THREE.MathUtils.degToRad( theta + element.z ) );
  element.obj.position.z = element.z;
});

//camera.position.z -= theta * 0.001;

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
