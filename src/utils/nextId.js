let lastId = 0;

function nextId() {
  lastId++;
  return lastId.toString();
}

module.exports = nextId;
