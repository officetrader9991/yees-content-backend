// n8n Code Node: Replace newlines with literal \n
const items = $input.all();

for (let item of items) {
  if (item.json) {
    // Process all string fields in the item
    for (let key in item.json) {
      if (typeof item.json[key] === 'string') {
        // Replace actual newlines with literal \n
        item.json[key] = item.json[key].replace(/\n/g, '\\n');
      }
    }
  }
}

return items;
