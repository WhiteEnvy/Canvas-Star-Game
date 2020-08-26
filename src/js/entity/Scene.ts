class Scene {
  public children;

  constructor() {
    this.children = [];
  }

  draw() {
    this.children.forEach((child) => {
      child.update();
      child.draw();
    });
  }

  add(child) {
    this.children = [...this.children, child];
  }

  remove(child) {
    this.children = this.children.filter((c) => c != child);
  }
}

export default Scene;
