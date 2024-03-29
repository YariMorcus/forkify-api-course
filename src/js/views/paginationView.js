import View from './View.js';
import icons from '../../img/icons.svg';

class paginationView extends View {
  _parentEl = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentEl.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');

      if (!btn) return;

      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = this._data.totalPages;

    // Page 1 and there are other pages
    if (curPage === 1 && numPages > 1) {
      return `
        ${this._generateMarkupTotalPages()}
        ${this._generateMarkupNextButton()}
      `;
    }

    // Last page
    if (curPage === numPages && numPages > 1) {
      return `
        ${this._generateMarkupPreviousButton()}
        ${this._generateMarkupTotalPages()}
      `;
    }

    // Other page
    if (curPage < numPages) {
      return `
        ${this._generateMarkupPreviousButton()}
        ${this._generateMarkupTotalPages()}
        ${this._generateMarkupNextButton()}
      `;
    }

    // Page 1 and there are NO other pages
    return '';
  }

  _generateMarkupTotalPages() {
    return `
      <div class="pagination__number-container">
        <span class="pagination__page-number">${this._data.totalPages}</span>
      </div>
    `;
  }

  _generateMarkupPreviousButton() {
    return `
        <button data-goto="${
          this._data.page - 1
        }" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${this._data.page - 1}</span>
        </button>
    `;
  }

  _generateMarkupNextButton() {
    return `
        <button data-goto="${
          this._data.page + 1
        }" class="btn--inline pagination__btn--next">
            <span>Page ${this._data.page + 1}</span>
            <svg class="search__icon">
                <use href="${icons}#icon-arrow-right"></use>
            </svg>
        </button>
    `;
  }
}

export default new paginationView();
