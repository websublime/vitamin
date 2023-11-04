import './style.css';

function setup() {
  const htmlElement = document.querySelectorAll('html').item(0);
  const bodyElement = document.querySelectorAll('body').item(0);
  const themeButton = document.querySelectorAll('.ui-theme-button').item(0);

  for (const button of document.querySelectorAll<HTMLButtonElement>('.ui-nav-button')) {
    button.addEventListener('click', function () {
      for (const button of document.querySelectorAll('.ui-nav-button')) {
        button.classList.remove('ui-nav-button-active');
      }

      this.classList.add('ui-nav-button-active');
      const { theme } = this.dataset;
      bodyElement.classList.value = `${theme}`;
    });
  }

  themeButton?.addEventListener('click', function () {
    const isDark = htmlElement?.classList.contains('dark');

    if (isDark) {
      htmlElement?.classList.remove('dark');
      htmlElement?.classList.add('light');
    } else {
      htmlElement?.classList.remove('light');
      htmlElement?.classList.add('dark');
    }

    //themeButton.innerHTML = htmlElement?.classList.contains('dark') ? iconSun : iconMoon;
  });
}

setup();
