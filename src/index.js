import axios from 'axios';
import Notiflix, { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const lightbox = new SimpleLightbox('.gallery a');

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadBtn = document.querySelector('.load-more');
const input = document.querySelector('input');

let page = 1;
let pageCount = 1;

loadBtn.style.display = 'none';

form.addEventListener('submit', evt => {
  evt.preventDefault();
  page = 1;
  gallery.innerHTML = '';
  loadBtn.style.display = 'none';

  runSearch()
    .then(data => {
      console.log('data otyt:', data);

      pageCount = Math.floor(data / 40);
      if (page > pageCount) {
        loadBtn.style.display = 'none';
      }
      if (data > 0) {
        Notify.success(`Hooray! We found ${data} images.`);
      }
      if (data.totalHits > 40) {
        loadBtn.style.display = 'block';
      }
    })
    .catch(error => console.log(error.message));
});

// //
// //
async function runSearch() {
  return await getImages(input.value).then(data => {
    const imgArray = data.hits;
    galleryMarkup(imgArray);
    return data.totalHits;
  });
}
// //
// //

loadBtn.addEventListener('click', () => {
  page += 1;
  if (page > pageCount) {
    loadBtn.style.display = 'none';
    Notiflix.Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
  runSearch();
});

// //
// //
// //
// //

async function getImages() {
  const response = await axios.get(
    `https://pixabay.com/api/?key=33195419-6a100955ee108d54dc0f94ed7&q=${input.value}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
  );

  const data = response.data;
  console.log('запит повертає:', data);

  return data;
}

function galleryMarkup(imgArray) {
  if (imgArray.length > 0) {
    const markup = imgArray
      .map(image => {
        return `<a href="${image.largeImageURL}"><div class="photo-card">
  <img  src="${image.webformatURL}" alt="${image.tags}" loading="lazy " />
  <div class="info">
    <p class="info-item">
      <b>Likes</b>${image.likes}
    </p>
    <p class="info-item">
      <b>Views</b>${image.views}
    </p>
    <p class="info-item">
      <b>Comments</b>${image.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b>${image.downloads}
    </p>
  </div>
</div></a>`;
      })
      .join('');
    gallery.insertAdjacentHTML('beforeend', markup);
    loadBtn.style.display = 'block';
    lightbox.refresh();
  } else {
    loadBtn.style.display = 'none';
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    return imgArray;
  }
}
