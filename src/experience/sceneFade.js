// Keep authored values intact between frames so local animation can update them.
// Nested gates own their own objects; a shared panel must not fade rubble twice.
export function createSceneFade(root) {
  const materials = new Map();
  const lights = [];
  function visit(object) {
    if (object !== root && object.userData.timelineGate) return;
    if (object.isLight) lights.push({ object, intensity: object.intensity });
    const list = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
    for (const material of list) {
      if (materials.has(material)) continue;
      materials.set(material, {
        opacity: material.opacity, transparent: material.transparent,
        depthWrite: material.depthWrite,
        uniformOpacity: material.uniforms?.opacity?.value,
      });
    }
    object.children.forEach(visit);
  }
  visit(root);
  function restore() {
    materials.forEach((base, material) => {
      material.opacity = base.opacity;
      material.transparent = base.transparent;
      material.depthWrite = base.depthWrite;
      if (typeof base.uniformOpacity === 'number') material.uniforms.opacity.value = base.uniformOpacity;
    });
    lights.forEach(record => { record.object.intensity = record.intensity; });
  }
  function apply(weight) {
    materials.forEach((base, material) => {
      base.opacity = material.opacity;
      base.uniformOpacity = material.uniforms?.opacity?.value;
      material.opacity = base.opacity * weight;
      material.transparent = base.transparent || weight < 1;
      material.depthWrite = base.depthWrite && weight === 1;
      if (typeof base.uniformOpacity === 'number') material.uniforms.opacity.value = base.uniformOpacity * weight;
    });
    lights.forEach(record => {
      record.intensity = record.object.intensity;
      record.object.intensity *= weight;
    });
  }
  return { restore, apply };
}
