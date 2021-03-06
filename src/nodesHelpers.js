import nodes from './nodes.json';

// Import all files
function importAll(r) {
  const files = {};
  r.keys().map((item) => { files[item.replace('./', '')] = r(item); });
  return files;
}

const imageFiles = importAll(require.context('./assets/images', false, /\.(png|jpe?g|svg)$/));

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

export function getSoundName(id) {
  return nodes[id].sound;
}

export function getIdbySoundName(soundName) {
  // console.log(`searching for ${soundName}`);
  const result = nodes.find((node) => node.sound === soundName);
  // console.log(`result is:`);
  // console.log(result);
  if (result) return result.id;
  return false;
}

// (state) => (name) => {
//   let result = state.personas.find(persona => persona.name === name)
//   return result
// },

export function generateTemplate(id) {
  const data = nodes[id];
  let imgMarkup = '';
  let imgCreditMarkup = '';
  let sndCreditMarkup = '';

  if (data.image) {
    if (data.name === 'St Cuthbert the Conservationist') {
      imgMarkup = `<img src="${imageFiles[data.image]}" alt="${data.name}" class="info-card-image-portrait"></img>`;
    } else {
      imgMarkup = `<img src="${imageFiles[data.image]}" alt="${data.name}" class="card-img-top info-card-image"></img>`;
    }
  }

  if (data.imgCredit) {
    imgCreditMarkup = `<p class="card-text"><strong>Image credit:</strong> ${data.imgCredit}</p>`;
  }

  if (data.sndCredit) {
    sndCreditMarkup = `<p class="card-text"><strong>Sound credit:</strong> ${data.sndCredit}</p>`;
  }

  const cardMarkup = `
    <div class="card-body">
      <h5 class="card-title">${data.name}</h5>
      <div class="row">
        <div class="col text-center">
          ${imgMarkup}
        </div>
      </div>
      <p class="card-text">${data.desc}</p>
      ${imgCreditMarkup}
      ${sndCreditMarkup}
    </div>
  `;

  return cardMarkup;
}

export function defaultTemplate() {
  return `
    <div class="card-body">
      <h3 class="card-title">Story:Web</h3>
      <p class="card-text">
      Listen through your headphones to hear sounds in 3D
      </p>
    </div>
  `;
}
