import { IconsMap } from 'icons';

function uiNav() {
  const htmlElement = document.querySelectorAll('html').item(0);
  const bodyElement = document.querySelectorAll('body').item(0);
  const themeButton = document.querySelectorAll('.ui-theme-button').item(0);

  const iconMoon = IconsMap.get('moon').render('class="flex h-6 w-6 items-center justify-center rounded-full"');
  const iconSun = IconsMap.get('sun').render('class="flex h-6 w-6 items-center justify-center rounded-full"');

  themeButton.innerHTML = htmlElement?.classList.contains('dark') ? iconSun : iconMoon;

  for (const button of document.querySelectorAll<HTMLButtonElement>('.ui-nav-button')) {
    button.addEventListener('click', function () {
      for (const button of document.querySelectorAll('.ui-nav-button')) {
        button.classList.remove('border-2');
      }

      this.classList.add('border-2');
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

    themeButton.innerHTML = htmlElement?.classList.contains('dark') ? iconSun : iconMoon;
  });
}

uiNav();
