import * as THREE from "three";
import type { Settings, Vec3 } from "../shared/types";
import { meshChunk } from "../world/mesher";
import type { World } from "../world/World";

export class Renderer{
  readonly renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});readonly scene=new THREE.Scene();readonly camera=new THREE.PerspectiveCamera(75,1,.05,180);
  readonly selection=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01,1.01,1.01)),new THREE.LineBasicMaterial({color:0xf0ffbe}));
  private chunks=new Map<string,{opaque:THREE.Mesh;transparent:THREE.Mesh}>();private beam?:THREE.Mesh;private atlas!:THREE.Texture;private opaqueMat?:THREE.MeshLambertMaterial;private transparentMat?:THREE.MeshLambertMaterial;
  constructor(private world:World,private settings:Settings){
    this.renderer.setPixelRatio(Math.min(2,devicePixelRatio));this.renderer.domElement.id='game-canvas';document.querySelector('#viewport')!.append(this.renderer.domElement);this.scene.background=new THREE.Color(0x7197a0);this.scene.fog=new THREE.Fog(0x7197a0,55,settings.renderDistance*22);
    this.camera.rotation.order='YXZ';this.scene.add(new THREE.HemisphereLight(0xbfe4e5,0x534431,1.45));const sun=new THREE.DirectionalLight(0xffe2a7,1.6);sun.position.set(35,60,20);this.scene.add(sun);this.scene.add(this.selection);this.selection.visible=false;this.resize();addEventListener('resize',()=>this.resize());
  }
  async init(){this.atlas=await new THREE.TextureLoader().loadAsync('/blockworks/assets/atlas.png');this.atlas.magFilter=THREE.NearestFilter;this.atlas.minFilter=THREE.NearestMipmapNearestFilter;this.atlas.colorSpace=THREE.SRGBColorSpace;this.opaqueMat=new THREE.MeshLambertMaterial({map:this.atlas,vertexColors:true});this.transparentMat=new THREE.MeshLambertMaterial({map:this.atlas,vertexColors:true,transparent:true,opacity:.74,alphaTest:.15,side:THREE.DoubleSide,depthWrite:false});this.rebuildDirty();}
  resize(){const w=innerWidth,h=innerHeight;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  rebuildDirty(){if(!this.opaqueMat||!this.transparentMat)return;for(const [key,c] of this.world.chunks){if(!c.dirty)continue;const old=this.chunks.get(key);if(old){old.opaque.geometry.dispose();old.transparent.geometry.dispose();this.scene.remove(old.opaque,old.transparent);}const next=meshChunk(this.world,c,this.opaqueMat,this.transparentMat);next.opaque.position.set(c.cx*16,0,c.cz*16);next.transparent.position.copy(next.opaque.position);this.scene.add(next.opaque,next.transparent);this.chunks.set(key,next);c.dirty=false;}}
  setCamera(pos:Vec3,yaw:number,pitch:number,bob=0,landing=0){this.camera.position.set(pos.x,pos.y+1.62+bob-landing,pos.z);this.camera.rotation.set(pitch,yaw,0);const cx=Math.floor(pos.x/16),cz=Math.floor(pos.z/16);for(const [key,pair] of this.chunks){const [x,z]=key.split(',').map(Number);const visible=Math.max(Math.abs((x??0)-cx),Math.abs((z??0)-cz))<=this.settings.renderDistance;pair.opaque.visible=visible;pair.transparent.visible=visible;}}
  setFov(value:number){this.camera.fov=value;this.camera.updateProjectionMatrix();}
  target(block?:Vec3){this.selection.visible=!!block;if(block)this.selection.position.set(block.x+.5,block.y+.5,block.z+.5);}
  addBeacon(pos:Vec3){if(this.beam)this.scene.remove(this.beam);const mat=new THREE.MeshBasicMaterial({color:0x66f5ff,transparent:true,opacity:.55,blending:THREE.AdditiveBlending});this.beam=new THREE.Mesh(new THREE.CylinderGeometry(.12,.55,90,12,1,true),mat);this.beam.position.set(pos.x+.5,pos.y+45,pos.z+.5);this.scene.add(this.beam);}
  render(){this.renderer.render(this.scene,this.camera);}
  triangles(){return this.renderer.info.render.triangles;}
}
