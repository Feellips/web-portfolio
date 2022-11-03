import * as THREE from "three";
import Experience from "../Experience.js";

import Room from "./Room.js";
import Floor from "./Floor.js";
import Controls from "./Controls.js";
import Environment from "./Environment.js";
import { EventEmitter } from "events";
import Sizes from "../Utils/Sizes.js";
import Camera from "../Camera.js";
import Resources from "../Utils/Resources.js";
import Theme from "../Theme.js";

export default class World extends EventEmitter {

    public experience : Experience;
    public sizes : Sizes;
    public scene : THREE.Scene;
    public canvas : HTMLElement | undefined;
    public camera : Camera;
    public renderer : THREE.WebGLRenderer;
    public resources : Resources;
    public theme : Theme;

    public environment : Environment;
    public floor : Floor;
    public room : Room;

    public controls : Controls;

    constructor() {
        super();
        this.experience = new Experience();
        this.sizes = this.experience.sizes;
        this.scene = this.experience.scene;
        this.canvas = this.experience.canvas;
        this.camera = this.experience.camera;
        this.resources = this.experience.resources;
        this.theme = this.experience.theme;

        this.resources.on("ready", () => {
            this.environment = new Environment();
            this.floor = new Floor();
            this.room = new Room();
            // this.controls = new Controls();
            this.emit("worldready");
        });

        this.theme.on("switch", (theme) => {
            this.switchTheme(theme);
        });

        // this.sizes.on("switchdevice", (device) => {
        //     this.switchDevice(device);
        // });
    }

    switchTheme(theme : String) {
        if (this.environment) {
            this.environment.switchTheme(theme);
        }
    }

    // switchDevice(device) {
    //     if (this.controls) {
    //         this.controls.switchDevice(device);
    //     }
    // }

    resize() {}

    update() {
        if (this.room) {
            this.room.update();
        }
        if (this.controls) {
            this.controls.update();
        }
    }
}
