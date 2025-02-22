import getFilmCard from './film-card.js';
import TMDBApiService from './tmdb-api.js';
import dataFormApi from '../testcatalog.json';
const { results } = dataFormApi;
import Notiflix from 'notiflix';
import Pagination from 'tui-pagination';
import getFiveStar from './fivezerostar.js';
import { openModalCard } from './modal-poster.js';
// import 'tui-pagination/dist/tui-pagination.css';

const ref = {
  form: document.querySelector('.cataloge-search-form'),
  input: document.querySelector('.cataloge-search-input'),
  selectYear: document.getElementById('selectYear'),
  deleteBtnInput: document.querySelector('.cataloge-btn-delete'),
  searchBtn: document.getElementById('searchBtn'),
  // oopsNotFind: document.querySelector('.oops-not-find'),
  // choseMovie: document.querySelector('.choose-movie'),
};

const newElement = document.querySelector('.catalog-list-gallery');
const myService = new TMDBApiService();

//    слухач на блок з картинками
newElement.addEventListener('click', handleFilmCardClick);

function handleFilmCardClick(event) {
  const el = event.target.closest('[film-id]');
  if (el) {
    openModalCard(el.getAttribute('film-id'));
  }
}

//Фільми тижня
function showTrendingMovies() {
  myService
    .fetchTrendingWeekMovies()
    .then(response => {
      const trendingMovies = response.data.results;
      displayMovies(trendingMovies);
    })
    .catch(error => {
      console.error(error);
    });
}
showTrendingMovies();

function displayMovies(movies) {
  if (movies.length === 0) {
    Notiflix.Notify.info('No trending movies found');
  } else {
    newElement.innerHTML = movies
      .map(a => getFilmCard(a, getFiveStar))
      .join('');
  }
}

ref.input.addEventListener('input', onInput);

function onInput(element) {
  ref.deleteBtnInput.classList.remove('btn-hide');
  const valueInp = element.target.value.trim();

  if (valueInp === '') {
    showTrendingMovies();
    ref.deleteBtnInput.classList.add('btn-hide');
    refs.paginationElem.classList.add('tui-pagination');
    newElement.innerHTML = '';
  }
}

ref.form.addEventListener('submit', onSubmit);

let searchInput = '';
let searchYear = '';
let currentPage = 1;

function onSubmit(e) {
  e.preventDefault();

  searchInput = e.target.elements.SearchQuery.value.trim();
  searchYear = e.target.elements.selectYear.value;
  if (searchInput === '') {
    Notiflix.Notify.info('Введіть ключове слово для пошуку фільму');
    return;
  }
  if (searchYear === '') {
    myService.releaseYear = null;
  } else {
    myService.releaseYear = searchYear;
  }
  myService.searchQuery = searchInput;
  myService
    .fetchSearchMovies()
    .then(res => {
      const movies = res.data.results;
      if (movies.length === 0) {
        Notiflix.Notify.failure('Фільми не знайдені');
        ref.deleteBtnInput.classList.add('btn-hide');
      } else {
        displayMovies(movies);
        const {
          page: currentPage,
          total_results: totalResults,
          total_pages: totalPages,
        } = res.data;

        pagination.myReset(totalResults);

        // console.log(`Total pages: ${totalPages}`);
      }
    })
    .catch(error => {
      console.error(error);
    });
}

ref.deleteBtnInput.addEventListener('click', deleteValueInput);

async function deleteValueInput(el) {
  el.preventDefault();
  ref.form.reset();
  ref.deleteBtnInput.classList.add('btn-hide');

  try {
    const response = await myService.fetchTrendingWeekMovies();
    const trendingMovies = response.data.results;
    displayMovies(trendingMovies);
  } catch (error) {
    console.error(error);
  }
}
// ПАГІНАЦІЯ
const refs = {
  paginationElem: document.querySelector('.tui-pagination'),
};

const options = {
  totalItems: 20,
  itemsPerPage: 20,
  visiblePages: 3,
  centerAlign: true,
  firstItemClassName: 'tui-first-child',
  lastItemClassName: 'tui-last-child',
  //
  template: {
    page: '<a href="#" class="tui-page-btn">{{page}}</a>',
    currentPage:
      '<strong class="tui-page-btn tui-is-selected">{{page}}</strong>',
    moveButton:
      '<a href="#" class="tui-page-btn tui-{{type}} custom-class-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</a>',
    disabledMoveButton:
      '<span class="tui-page-btn tui-is-disabled tui-{{type}} custom-class-{{type}}">' +
      '<span class="tui-ico-{{type}}">{{type}}</span>' +
      '</span>',
    moreButton:
      '<a href="#" class="tui-page-btn tui-{{type}}-is-ellip custom-class-{{type}}">' +
      '<span class="tui-ico-ellip">...</span>' +
      '</a>',
  },
};

const pagination = new Pagination(refs.paginationElem, options);
pagination.tuiRefs = {
  first: refs.paginationElem.querySelector('.tui-first'),
  last: refs.paginationElem.querySelector('.tui-last'),
  next: refs.paginationElem.querySelector('.tui-next'),
  prev: refs.paginationElem.querySelector('.tui-prev'),
  start: refs.paginationElem.querySelector('.tui-first-child'),
  end: refs.paginationElem.querySelector('.tui-last-child'),
};
pagination.myReset = async function (totalItems) {
  this.reset(totalItems);
  console.log(totalItems, this);
};

let pageForPagination = 0;

pagination.on('afterMove', async event => {
  const currentPage = event.page;
  pageForPagination = currentPage;
  try {
    const res = await myService.fetchSearchMovies(pageForPagination);
    const movies = res.data.results;
    displayMovies(movies);
  } catch (error) {
    console.log(error);
  }
});
