import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('#search-form');
const input = document.querySelector('input[name=searchQuery]');
const galleryContainer = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');

const lightbox = new SimpleLightbox('.gallery a');

const IMAGES_PER_PAGE = 40;

let inputValue = '';
let currentPage = 1;

const getImages = async (q, page) => {
  const params = {
    key: '33750532-9281d62f6594077aa9475470d',
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    per_page: IMAGES_PER_PAGE,
    q,
    page,
  };

  const { data } = await axios.get('https://pixabay.com/api/', { params });

  return data;
};

const parseImagesToHtmlStringArr = images =>
  images.map(
    image =>
      `<a href="${image.largeImageURL}">
      <img class="image" src=${image.previewURL} alt=${image.type} loading="lazy" />
      <div class="photo-card">
  <div class="info">
    <p class="info-item">
      <b>Likes: ${image.likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${image.views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${image.comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${image.downloads}</b>
    </p>
  </div>
  </div>
  </a>
`
  );

const showEmptyInputError = () =>
  Notiflix.Notify.failure(
    'Sorry, input value must be not empty. Please try again.'
  );

const showNoImagesError = () =>
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.'
  );

const showNoMoreImagesInfo = () =>
  Notiflix.Notify.info(
    "We're sorry, but you've reached the end of search results."
  );

const showTotalHitsAmountInfo = totalHits =>
  Notiflix.Notify.info(`Hooray! We found ${totalHits} images.`);

const insertImagesArrIntoHtml = images =>
  galleryContainer.insertAdjacentHTML('beforeend', images.join(''));

const handleSearch = async e => {
  e.preventDefault();

  if (!input.value.trim()) {
    loadMoreButton.hidden = true;

    return showEmptyInputError();
  }

  inputValue = input.value.trim();
  currentPage = 1;

  const data = await getImages(inputValue, currentPage);

  if (!data.totalHits) {
    loadMoreButton.hidden = true;

    return showNoImagesError();
  }

  showTotalHitsAmountInfo(data.totalHits);

  galleryContainer.innerHTML = parseImagesToHtmlStringArr(data.hits).join('');

  lightbox.refresh();

  loadMoreButton.hidden = data.totalHits < IMAGES_PER_PAGE;

  if (data.totalHits < IMAGES_PER_PAGE) showNoMoreImagesInfo();
};

const loadMoreImages = async () => {
  currentPage++;

  const { hits, totalHits } = await getImages(inputValue, currentPage);

  if (totalHits < IMAGES_PER_PAGE * currentPage) {
    loadMoreButton.hidden = true;

    return showNoMoreImagesInfo();
  }

  insertImagesArrIntoHtml(parseImagesToHtmlStringArr(hits));
};

form.addEventListener('submit', handleSearch);

loadMoreButton.addEventListener('click', loadMoreImages);
