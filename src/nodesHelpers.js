import nodes from './nodes.json';

export function findByName(name) {
  return `TODO - find ${name}`;
}

export function getName(id) {
  return nodes[id].name;
}

export function getDescription(id) {
  return nodes[id].desc;
}

export function getSeeAlso(id) {
  return nodes[id].seeAlso;
}

export function generateTemplate(id) {
  const data = nodes[id];
  const markup = `
  <div class="title">
    <h2 class="name">
      ${data.name}
    </h2>
    <p class="desc">
      ${data.desc}
    </p>
    <div class="image">
      <img src="${data.image}" />
    </div>
    <p class="seeAlso">
      ${data.seeAlso}
    </p>
  </div>
  `;
  return markup;
}
