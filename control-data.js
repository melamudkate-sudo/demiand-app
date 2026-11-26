// Presets and catalog order used by the local appliance preview.
const controlModels = devNames.concat([
  'Sanders DK-2200 Black', 'Sanders Max DK2400 White', 'Sanders Max DK2400 Metal',
  'Sanders Max DK2400 Black', 'Leo DK-2500 White', 'Leo DK-2500 Black',
  'Luneo DK-2700 White', 'Luneo DK-2700 Black', 'Harrington DK-5100 Black',
  'Tarvin DK-5200 Beige', 'Tarvin DK-5200 White', 'Tarvin DK-5200 Black'
]);
const presetRows = [
  ['Custom mode',195,10],['Fish',210,13],['French fries',200,20],['Yogurt',40,480],
  ['Muffins',160,22],['Defrost',50,15],['Dehydrate',65,120],['Cheese pancakes',175,15],
  ['Chicken wings',180,30],['Patties',185,20],['Reheat',150,8],['Steak',200,14],
  ['Soft-boiled eggs',135,9,400],['Hard-boiled eggs',135,15,400],['Omelet',165,16,400],['Shrimp',180,9,300],
  ['Salmon steak',185,15,500],['Fish fillet',170,15,600],['Frozen shrimp',185,12],['Calamari rings',185,10],
  ['Shelled mussels',175,9],['Chicken skewers',190,18],['Nuggets',190,15],['Chicken breast',185,22],
  ['Chicken thighs',185,28],['Chicken drumsticks',190,26],['Frozen chicken nuggets',195,16],['Soft vegetables',170,12],
  ['Cauliflower & broccoli',180,15],['Whole potatoes',195,45],['Mushrooms',175,12],['Firm vegetables',190,20],
  ['French fries',200,20,400],['Potato wedges',190,25,500],['Ready-crust pizza',180,12,300],['Potato balls',185,17,540],
  ['Frozen hash browns',195,18,850],['Baked apples',170,20,1200],['Dried bananas',65,180,400],['Sausages',180,12,400],
  ['Frozen patties',190,24,800],['Bacon',180,10,150],['Pork chops',190,18,400],['Meatballs',185,16],
  ['Cookies',160,12],['Toast',180,5],['Croissants & puff pastries',170,17],['Filled pancakes',175,12],
  ['Frozen pizza',185,15],['Frozen cheese pancakes',180,16],['Frozen fish fingers',190,12],['Frozen white fish fillet',180,20]
];
const smartRows = [
  ['Apple puff pastry pie','apple-puff-pie',560,35,2],['Keto bread','keto-bread',400,35,2],
  ['Classic apple charlotte','apple-charlotte',740,50,2],['Small whole potatoes','whole-potatoes-small',900,45,2],
  ['Medium whole potatoes','whole-potatoes-medium',1000,55,2],['Wholegrain bread','wholegrain-bread',400,35,2],
  ['Cabbage puff pastry pie','cabbage-puff-pie',620,35,2],['Baked apples','baked-apples',800,25,2],
  ['Potato bread','potato-bread',400,40,2],['Chicken thighs','chicken-thighs',1000,43,3],
  ['Whole chicken','whole-chicken',600,40,3],['Chicken wings','chicken-wings',600,25,3],
  ['French fries','fries',300,25,2],['Country potatoes','country-potatoes',500,30,2]
];
const chickenStages = {600:[20,10,10],1000:[25,15,5],1500:[45,20,5],2000:[60,30,5]};
const presetDescriptions = [
  'Choose your own temperature and cooking time.', 'For fish, seafood and tender white fillets.', 'For fries, nuggets and other crisp snacks.',
  'For making homemade yogurt.', 'For muffins and small baked desserts.', 'For gently defrosting food.', 'For drying fruit, herbs, vegetables and mushrooms.',
  'For cottage cheese pancakes and fritters.', 'For chicken wings and small pieces of chicken.', 'For patties, meatballs and minced meat.',
  'For quickly warming prepared dishes.', 'For steaks, chops and cuts of meat.'
];
const connectChecks = ['Device found','Searching for Wi-Fi networks','Wi-Fi details sent to device','Router connected','Device activated','Device online'];
const featureNames = ['Light','Lower heater','Sound','Steam'];
function remoteIcon(i) {
  return '<i aria-hidden="true" class="remote-icon"><img alt="" src="assets/program-icons.webp" style="left:-'+(i%8)*100+'%;top:-'+Math.floor(i/8)*100+'%"></i>';
}
