import nodes from './nodes.json';
import { grid } from './defaults';

let edges = [];

function mapConnection(id0, id1) {
  console.log(`comparing ${id0} and ${id1}`)
  const checkIds = edges.filter(arr => {
    if (arr.id0 === id0 && arr.id1 === id1) {
      console.log(`matching both in correct positions`);
      return arr;
    }
    if (arr.id0 === id1 && arr.id1 === id0) {
      console.log(`matching both in opposite positions`);
      return arr;
    }
  });
  if (checkIds.length === 0) {
    console.log('Didnt match anything, adding edge');
    // If we don't find anything in the array
    edges.push({id0, id1});
  } else {
    console.log("Did find this pair, ignoring");
    console.log(checkIds);
  }
}

function calculateConnections() {
  nodes.forEach(el => {
    // Examine each connections array
    const id0 = el.id;
    el.connections.forEach( id1 => {
      mapConnection(id0, id1);
    });
  });


}

function calculateGrid() {
  calculateConnections();
  console.log("logging edges");
  console.log(edges);
  // grid.empty.forEach(el => console.log(el));
  // console.log(grid.empty);
}

export default calculateGrid;