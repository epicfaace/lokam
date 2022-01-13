import logo from './logo.svg';
import './App.css';
import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import * as THREE from 'three';
import { TextureLoader } from 'three/src/loaders/TextureLoader'
import { ImprovedNoise } from 'three/examples/jsm/math/ImprovedNoise.js'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import ErrorBoundary from './ErrorBoundary';
import { FlyControls } from './FlyControls';

function generateHeight( width, height ) {

  const data = [], perlin = new ImprovedNoise(),
    size = width * height, z = Math.random() * 100;

  let quality = 2;

  for ( let j = 0; j < 4; j ++ ) {

    if ( j === 0 ) for ( let i = 0; i < size; i ++ ) data[ i ] = 0;

    for ( let i = 0; i < size; i ++ ) {

      const x = i % width, y = ( i / width ) | 0;
      data[ i ] += perlin.noise( x / quality, y / quality, z ) * quality;


    }

    quality *= 4;

  }

  return data;

}

function getY( x, z ) {

  return ( data[ x + z * worldWidth ] * 0.15 ) | 0;

}

const worldWidth = 128, worldDepth = 128;
const worldHalfWidth = worldWidth / 2;
const worldHalfDepth = worldDepth / 2;
const data = generateHeight( worldWidth, worldDepth );

function App() {
  const matrix = new THREE.Matrix4();

  const pxGeometry = new THREE.PlaneGeometry( 100, 100 );
  pxGeometry.attributes.uv.array[ 1 ] = 0.5;
  pxGeometry.attributes.uv.array[ 3 ] = 0.5;
  pxGeometry.rotateY( Math.PI / 2 );
  pxGeometry.translate( 50, 0, 0 );

  const nxGeometry = new THREE.PlaneGeometry( 100, 100 );
  nxGeometry.attributes.uv.array[ 1 ] = 0.5;
  nxGeometry.attributes.uv.array[ 3 ] = 0.5;
  nxGeometry.rotateY( - Math.PI / 2 );
  nxGeometry.translate( - 50, 0, 0 );

  const pyGeometry = new THREE.PlaneGeometry( 100, 100 );
  pyGeometry.attributes.uv.array[ 5 ] = 0.5;
  pyGeometry.attributes.uv.array[ 7 ] = 0.5;
  pyGeometry.rotateX( - Math.PI / 2 );
  pyGeometry.translate( 0, 50, 0 );

  const pzGeometry = new THREE.PlaneGeometry( 100, 100 );
  pzGeometry.attributes.uv.array[ 1 ] = 0.5;
  pzGeometry.attributes.uv.array[ 3 ] = 0.5;
  pzGeometry.translate( 0, 0, 50 );

  const nzGeometry = new THREE.PlaneGeometry( 100, 100 );
  nzGeometry.attributes.uv.array[ 1 ] = 0.5;
  nzGeometry.attributes.uv.array[ 3 ] = 0.5;
  nzGeometry.rotateY( Math.PI );
  nzGeometry.translate( 0, 0, - 50 );

  //

  const geometries = [];

  for ( let z = 0; z < worldDepth; z ++ ) {

    for ( let x = 0; x < worldWidth; x ++ ) {

      const h = getY( x, z );

      matrix.makeTranslation(
        x * 100 - worldHalfWidth * 100,
        h * 100,
        z * 100 - worldHalfDepth * 100
      );

      const px = getY( x + 1, z );
      const nx = getY( x - 1, z );
      const pz = getY( x, z + 1 );
      const nz = getY( x, z - 1 );

      geometries.push( pyGeometry.clone().applyMatrix4( matrix ) );

      if ( ( px !== h && px !== h + 1 ) || x === 0 ) {

        geometries.push( pxGeometry.clone().applyMatrix4( matrix ) );

      }

      if ( ( nx !== h && nx !== h + 1 ) || x === worldWidth - 1 ) {

        geometries.push( nxGeometry.clone().applyMatrix4( matrix ) );

      }

      if ( ( pz !== h && pz !== h + 1 ) || z === worldDepth - 1 ) {

        geometries.push( pzGeometry.clone().applyMatrix4( matrix ) );

      }

      if ( ( nz !== h && nz !== h + 1 ) || z === 0 ) {

        geometries.push( nzGeometry.clone().applyMatrix4( matrix ) );

      }

    }

  }
  const geometry = mergeBufferGeometries( geometries );
  geometry.computeBoundingSphere();
  // const texture = useLoader(TextureLoader, 'textures/atlas.png');
  const texture = new THREE.TextureLoader().load( 'textures/atlas.png' );
  texture.magFilter = THREE.NearestFilter;
  const material = new THREE.MeshLambertMaterial( { map: texture, side: THREE.DoubleSide } );
  return (
    <ErrorBoundary>
      <Canvas>
        {/* <ambientLight color={0xcccccc} /> */}
        <directionalLight color={0xffffff} intensity={.2} /> 
        <mesh
          geometry={geometry}
          material={material}
        />
        <FlyControls autoForward={false} dragToLook={false} movementSpeed={1000} lookSpeed={0.125} lookVertical={true} />
      </Canvas>
    </ErrorBoundary>
  );
}

export default App;
