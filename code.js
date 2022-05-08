
import { EventEmitter } from './EventEmitter.js';

EventEmitter.on('event:button-click', removeEntry, false);
//console.log(EventEmitter.events);

let repos = null;
const page_repos = document.querySelector('.page__repos'),
	page_input = document.querySelector('.page__form input'),
	datalist = document.querySelector('#suggestions');

// прослушиватель событий для родительского элемента
page_repos.addEventListener('click', (event) => EventEmitter.emit('event:button-click', event.target));
// прослушиватели событий для элемента текстового ввода
let keypress = false;
page_input.addEventListener('keydown', (event) => { if (event.key) keypress = true; });
page_input.addEventListener('input', (event) => {
	if (keypress)
		createSuggest(event.target.value);
	else
		createEntry(event.target.value);

	keypress = false;
	/* if (!(event instanceof InputEvent) || event.inputType == 'insertReplacementText') createEntry(); */
});


async function createSuggest(query) {
	clearSuggest();
	if (!query.length) return;
	const data = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=5`).then(data => data.json());
	//return console.log(repos.items); // -> [{}, ...]
	repos = data.items;

	for (const repo of repos) {
		const option = document.createElement('option');
		option.value = repo.name;
		console.warn(repo.name, repo.owner.login, repo.stargazers_count);
		datalist.append(option);
	}
}

createSuggest = debounce(createSuggest, 1000);


function createEntry(name) {
	const fragment = document.createDocumentFragment();
	const entry = document.createElement('div');
	entry.className = 'flex-row';

	const repo = repos[repos.findIndex(elem => elem.name == name)];

	const row = document.createElement('div'),
		texts = [`Name: ${repo.name}`, `Owner: ${repo.owner.login}`, `Stars: ${repo.stargazers_count}`];
	for (let i = 0; i <= 3; i++) {
		const p = document.createElement('p');
		p.textContent = texts[i];
		row.append(p);
	}
	const btn = document.createElement('button');

	entry.append(row);
	entry.append(btn);
	fragment.append(entry);
	page_repos.append(fragment);

	page_input.value = '';
}


function removeEntry(elem) {
	if (elem.closest('.flex-row > button')) elem.parentElement.remove();
}


function clearSuggest() {
	if (!datalist.children.length) return;
	while (datalist.lastElementChild) datalist.lastElementChild.remove();
}


// of utility use
function debounce(fn, delay, immediate = false, context = this) {
	/* Функция выполняется в указанном контексте 'context'; режим работы определяется значением 'immediate':
		'false' — реальный вызов происходит только после 'delay' с момента последней попытки;
		'true' — реальный вызов происходит сразу; последующие попытки вызова игнорируются в течение 'delay', отсчитанной с момента последней попытки. */
	let timer;
	return function(...args) {
		if (immediate && !timer) fn.apply(context, args);
		clearTimeout(timer);
		timer = setTimeout(() => {
			fn.apply(context, args);
			timer = null;
		}, delay);
	};
}