import { Component } from '@angular/core';
import * as THREE from 'three';

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let raycaster : THREE.Raycaster;

const mouse = new THREE.Vector2();
let INTERSECTED : any;
const radius = 100;
let theta = 0;

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

  const geometry = new THREE.BoxGeometry( 20, 20, 20 );

  for ( let i = 0; i < 1500; i ++ ) {

    const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

    object.position.x = Math.random() * 800 - 400;
    object.position.y = Math.random() * 800 - 400;
    object.position.z = Math.random() * 800 - 400;

    scene.add( object );

  }

  raycaster = new THREE.Raycaster();

  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );

  document.body.appendChild( renderer.domElement );

  document.addEventListener( 'mousemove', onDocumentMouseMove );
  window.addEventListener( 'resize', onWindowResize );
  window.addEventListener( 'resize', onWindowResize );

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
}


function render() {

  theta += 0.1;

  camera.position.x = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
  camera.position.y = radius * Math.sin( THREE.MathUtils.degToRad( theta ) );
  camera.position.z = radius * Math.cos( THREE.MathUtils.degToRad( theta ) );
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
