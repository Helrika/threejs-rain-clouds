
import * as THREE from 'three';

import { OrbitControls } from "./build/three/examples/jsm/controls/OrbitControls.js";

import datGui from 'https://cdn.skypack.dev/dat.gui';



class rainClouds {
  constructor() {
      this._Initialize();
      this._InitializeLights();
      this._InitializeCamera();
     // this._InitializeScene(); 
     this._loadLightning();
     this.loadRain();
      

  }

  _Initialize() {
      this.renderer = new THREE.WebGLRenderer({
          antialias: true,
        });
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    
        document.body.appendChild(this.renderer.domElement);
    
        window.addEventListener('resize', () => {
          this._OnWindowResize();
        }, false);

        // SCENE
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x00000);
      //[previous state]
      this.previousRAF = null;
      //animation state
      this.mixers = [];
      this.object = [];

      this.params = {
        MAX_HEIGHT: 100,
        MAX_WIDTH: 100,
    
     }
     this.cloudsArr = [];
     this.rainCount =15000;
     this.drops = 0;
     this.check = false;

     //this.textureLoader = new THREE.TextureLoader();
     //this.textureLoader.load("./textures/Smoke-Transparent.png");
     this.textures = new THREE.TextureLoader().load('textures/Smoke-Transparent.png');
    //  this.textures.anisotropy = 0;
    //  this.textures.magFilter = THREE.NearestFilter;
    //  this.textures.minFilter = THREE.NearestFilter;
     this._loadClouds();
      this._RAF();
      

  }


  //
  _InitializeLights(){
      //lighting
      this.scene.add(new THREE.AmbientLight(0x555555));

      let dirLight = new THREE.DirectionalLight(0xffeedd);
      dirLight.position.set(0, 0, 10);
      dirLight.castShadow = true;
      // dirLight.shadow.camera.top = 50;
      // dirLight.shadow.camera.bottom = - 50;
      // dirLight.shadow.camera.left = - 50;
      // dirLight.shadow.camera.right = 50;
      // dirLight.shadow.camera.near = 0.1;
      // dirLight.shadow.camera.far = 200;
      // dirLight.shadow.mapSize.width = 4096;
      // dirLight.shadow.mapSize.height = 4096;
      this.scene.add(dirLight);

      dirLight = new THREE.AmbientLight(0x555555,0.11);
      this.scene.add(dirLight);


  }

  _InitializeCamera() {
      //camera
      this.camera = new THREE.PerspectiveCamera(95, window.innerWidth / window.innerHeight, 0.1, 1000);
      this.camera.position.set(0, 0, 0);

      const orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
      orbitControls.enableDamping = true
      orbitControls.minDistance = 5
      orbitControls.maxDistance = 70
      orbitControls.enablePan = false
      orbitControls.maxPolarAngle = Math.PI 
      orbitControls.update();
 
  }
  _InitializeScene() {
    
    this.planeGeo = new THREE.PlaneGeometry(10,10,1,1);
    this.planeMat = new THREE.MeshBasicMaterial({color: '#ff0000'});
    this.material_plane = new THREE.ShaderMaterial({
      uniforms: {
      u_time: {value: 0},
      u_texture: {value: this.textures}
      }
    });
    // material_cube.vertexShader=document.getElementById( 'vertexShaderSimple' ).textContent
    // material_cube.fragmentShader=document.getElementById( 'fragmentShaderRandColor' ).textContent
    // var uniform= {delta : {value : 0}};
    // material_cube.uniforms = uniform;
    
    this.material_plane.vertexShader=document.getElementById( 'vertexShaderSimple' ).textContent
    this.material_plane.fragmentShader=document.getElementById( 'fragmentShaderSimple' ).textContent
   
    this.plane = new THREE.Mesh(this.planeGeo,this.material_plane);
    this.plane.rotation.set(0,Math.PI/2,0)
    //this.scene.add(this.plane);
    

    
  }

  loadAll() {
   
  }

  _loadClouds() {
    this.cloudGeo = new THREE.PlaneGeometry(500,500);
    this.cloudMat = new THREE.MeshLambertMaterial({
      map: this.textures,
      transparent: true,
      alphaTest: 0.5,
      // blending: THREE.CustomBlending,
      // blendSrc: THREE.OneFactor,
      // blendDst: THREE.OneMinusSrcAlphaFactor,
    });
    for(let i =0; i<25;i++) {
        this.cloud = new THREE.Mesh(this.cloudGeo, this.cloudMat);
        this.cloud.position.set(
          Math.random()* 800 -400, 
          600,
          Math.random()* 500 -450
        );
        this.cloud.rotation.set(
          1.16,
          -0.12,
          Math.random()*360
        );
        this.cloud.material.opacity = 0.6;
        this.cloudsArr.push(this.cloud);
        this.scene.add(this.cloud);
    }
  }

  _loadLightning() {
    this.flash = new THREE.PointLight(0x062d89,30,500,1.7);
    this.flash.position.set(200,300,100);
    this.scene.add(this.flash);
  }
  loadRain() {
    //this.rainBuff = new THREE.BufferGeometry();
    //this.rainGeo = new THREE.BoxGeometry();
    //console.log(this.rainGeo)
    this.vertices = [];
    for(let i = 0; i <this.rainCount; i++) {
      this.rainDrop = new THREE.Vector3(
        Math.random() * 400 -200,
        Math.random() * 500 -250,
        Math.random() * 400 -200,
      );
      this.rainDrop.velocity = {};
      this.rainDrop.velocity = 0;
      this.vertices.push(this.rainDrop);
      if(i == this.rainCount-1) {
        this.rainGeo = new THREE.BufferGeometry().setFromPoints(this.vertices);
        console.log(this.rainGeo.getAttribute( 'position' ).count);
        
     //this.rainGeo.geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( this.vertices, 3 ) );
      //this.rainGeo.geometry.attributes.position.needsUpdate = true;
      }

    }
    this.drops = this.rainGeo.getAttribute( 'position' );
  
    this.rainMat = new THREE.PointsMaterial({
      color:0xaaaaaa,
      size: 0.1,
      transparent: true
    })
    this.rain = new THREE.Points(this.rainGeo,this.rainMat);
    this.scene.add(this.rain);

  }


  update() {
    
    this.cloudsArr.forEach(element => {
      element.rotation.z +=0.0001;
      //console.log(element.rotation.z)
    });
    //console.log(this.flash.power);
    if(Math.random() >0.93 || this.flash.power >100) {
      if(this.flash.power <10) {
        this.flash.intensity = 1;
       // console.log(true);
        this.flash.position.set(
          Math.random() * 400,
          300 + Math.random() * 200,
          Math.random() * 400 -100,
        );
      } else {
        this.flash.power = 50 +Math.random() *300;
        this.flash.intensity = 0;
      }
      
    }
    if(this.drops) {
      //this.check = true;
      for(let i = 0; i < this.drops.count; i++){
        let y = this.drops.getY( i );  
        let vel = this.vertices[i].velocity;
        vel -=1 + Math.random()*0.1;
        y += vel;
        if(y <-50) {
          y = 200;
          vel = 0;
        }

        this.rainGeo.getAttribute( 'position' ).setY( i, y);

      }

    }
    this.rainGeo.attributes.position.needsUpdate = true;
  }
 
  _OnWindowResize() {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  

  _RAF() {
      requestAnimationFrame((t) => {
          if (this.previousRAF === null) {
            this.previousRAF = t;
          }
          

          this.update();
         // this.plane.material.uniforms.u_time.value =t/1000;
          this._RAF();
    
          this.renderer.render(this.scene, this.camera);
          this._Step(t - this.previousRAF);
          this.previousRAF = t;
        });
  }

  _Step(timeElapsed) {
      const timeElapsedS = timeElapsed * 0.001;
      if (this.mixers) {
        this.mixers.map(m => m.update(timeElapsedS));
      }
  
      if (this.controls) {
        this.controls.Update(timeElapsedS);
      }
  }
  

}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
_APP = new rainClouds();
});