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
      imgMarkup = `<img src="${data.image}" alt="${data.name}" class="card-img-top info-card-image"></img>`;
    } else {
      imgMarkup = `<img src="${data.image}" alt="${data.name}" class="card-img-top info-card-image"></img>`;
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
      <h1 class="card-title">${data.name}</h1>
      <div class="img-container">
      ${imgMarkup}
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
      <p class="card-text">This Story:Web is made up of objects from the Great North Museum: Hancock, images and sounds shared online, and public contributions from social media and elsewhere. It will grow during the exhibition.</p>
      <p class="card-text">Help us work out where the stories go next on social media using #GrowStoryWeb, and your words, images and sounds could become part of the exhibition.</p>
      <p class="card-text">
        <strong>Tap a picture to start exploring.</strong>
      </p>
      <p class="card-text">
        <strong>Plug in your headphones to hear the sounds in 3D.</strong>
      </p>
    </div>

    




  `;
}
