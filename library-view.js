// Append imported records so saved recipe indices from previous releases stay valid.
const importedStart = recipes.length;
for (const [id, item] of Object.entries(recipeLibrary)) {
  recipes.push([id, item.title, item.minutes || null, item.category || '', item.meal || '',
    item.cuisine || '', item.diet || '', 'Air fryer']);
}

function recipeDuration(row) {
  return row[2] ? icon('clock') + ' ' + row[2] + ' min' : '';
}

function libraryPhotos(step, title, number, cls) {
  return step.photos.map(id => img(id, title + ', step ' + number, cls)).join('');
}

function libraryIngredients(item, checkable) {
  return item.ingredients.map((line, index) => {
    if (line.endsWith(':')) return '<h4>' + esc(line) + '</h4>';
    const parts = line.split(/\s+[–—]\s+/);
    const name = esc(parts.shift());
    const quantity = esc(parts.join(' – '));
    const text = '<span>' + name + '</span>' + (quantity ? '<strong>' + quantity + '</strong>' : '');
    if (!checkable) return '<div class="library-ingredient">' + text + '</div>';
    return '<label class="library-ingredient">' + text + '<input type="checkbox" data-check="' +
      index + '" ' + (appState.checked?.[index] ? 'checked' : '') + '></label>';
  }).join('');
}

function libraryDetails(row, item) {
  const hasSteps = item.steps.length > 0;
  const sections = [];
  sections.push(img(row[0], item.title, 'recipe-hero'));
  sections.push('<div class="detail-title"><h2>' + esc(item.title) + '</h2><small>' + recipeDuration(row) + '</small></div>');
  sections.push('<div class="app-card">' + bt('favorite', icon('bookmark') +
    (saved['recipe' + appState.recipeIndex] ? ' Saved to favorites' : ' Add to favorites'), 'red-btn') + '</div>');
  if (hasSteps) {
    sections.push('<div class="app-card"><p>' + esc(item.description) + '</p>' +
      item.metadata.map(line => '<div>' + esc(line) + '</div>').join('') + '</div>');
    sections.push('<section class="app-card"><h3>Ingredients</h3>' + libraryIngredients(item, true) +
      bt('shoppingList', 'Share shopping list ' + icon('share'), 'white-btn') + '</section>');
    item.steps.forEach((step, i) => {
      sections.push('<article class="step-card">' + libraryPhotos(step, item.title, i + 1, 'library-step-photo') +
        '<div><b>Step ' + (i + 1) + '</b><p class="library-copy">' + esc(step.text) + '</p></div></article>');
    });
    if (item.notes.length) sections.push('<section class="app-card library-copy">' +
      item.notes.map(line => '<p>' + esc(line) + '</p>').join('') + '</section>');
  }
  sections.push(recipePlayer(row));
  const controls = (hasSteps ? bt('cook', icon('cooking')+' Cooking mode') : '') + bt('recipeVideo', icon('play') + ' Video');
  return '<div class="over-controls">' + ib('back','left','Back') + ib('shareRecipe','share','Share recipe') +
    '</div>' + pane(sections.join(''), 'detail-scroll') + '<div class="detail-actions">' + controls + '</div>';
}
