interface SceneObject {
    draw():void;
    update():void;
    collisionTypes:Array<String>;
}

export default SceneObject;