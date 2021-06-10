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
  let imgMarkup = '';
  let imgCreditMarkup = '';
  let sndCreditMarkup = '';

  if (data.image) {
    imgMarkup = `<img src="${data.image}" alt="${data.name}" class="card-img-top"></img>`;
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
      ${imgMarkup}
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
      <h5>Tap a picture to start exploring the story web</h5>
      <p class="card-text">Tapping a picture moves it to the middle of your view and shows that snippet of a story.</p>
      <p class="card-text">Tapping a picture again plays only the sounds from that snippet of a story.</p>
    </div>
  `;
}
